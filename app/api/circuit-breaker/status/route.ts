import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/circuit-breaker/status?token=<extensionToken>
// Public — authenticated only by extensionToken. Used by Chrome extension + MT4/MT5 EA.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const cb = await db.circuitBreaker.findUnique({
    where: { extensionToken: token },
    include: { user: { select: { id: true, tradeLimit: true } } },
  });

  if (!cb) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  if (!cb.isActive) {
    return NextResponse.json({ blocked: false, reason: "inactive" });
  }

  // Count today's trades
  const today = new Date().toISOString().split("T")[0];
  const tradeCount = await db.tradeEntry.count({
    where: { userId: cb.userId, date: today },
  });

  // Get today's mental score (if scoreAdaptive)
  let effectiveLimit = cb.dailyLimit;
  let verdict = "GO";

  if (cb.scoreAdaptive) {
    const checkin = await db.checkin.findUnique({
      where: { userId_date: { userId: cb.userId, date: today } },
      select: { score: true, verdict: true },
    });
    if (checkin) {
      verdict = checkin.verdict;
      if (checkin.verdict === "NO-TRADE") {
        effectiveLimit = 0;
      } else if (checkin.verdict === "CAUTION") {
        effectiveLimit = Math.ceil(cb.dailyLimit * 0.5);
      }
      // GO keeps full limit
    }
  }

  const blocked = tradeCount >= effectiveLimit;
  const remaining = Math.max(0, effectiveLimit - tradeCount);

  return NextResponse.json(
    {
      blocked,
      tradeCount,
      effectiveLimit,
      dailyLimit: cb.dailyLimit,
      scoreAdaptive: cb.scoreAdaptive,
      verdict,
      remaining,
      date: today,
    },
    {
      headers: {
        // Allow polling from extension / EA
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}