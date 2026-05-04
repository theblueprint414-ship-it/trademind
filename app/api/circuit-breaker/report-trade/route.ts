import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

// POST /api/circuit-breaker/report-trade?token=<extensionToken>
// Called by MT4/MT5 EA (via WebRequest) immediately after a successful OrderSend.
// Increments the Trade count so the circuit breaker stays accurate without broker API polling.
// Body: { symbol?: string, side?: string } — both optional
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400, headers: CORS });

  const cb = await db.circuitBreaker.findUnique({
    where: { extensionToken: token },
    select: { userId: true, isActive: true, dailyLimit: true, scoreAdaptive: true },
  });

  if (!cb) return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS });

  // Parse optional body (EA sends JSON, but body may be empty — be resilient)
  let symbol: string | undefined;
  let side: string | undefined;
  try {
    const body = await req.json();
    symbol = body.symbol;
    side = body.side;
  } catch { /* body is optional */ }

  const today = new Date().toISOString().split("T")[0];

  // Record the trade
  await db.trade.create({
    data: { userId: cb.userId, date: today },
  });

  // Also create a minimal TradeEntry so journal is populated
  if (symbol) {
    await db.tradeEntry.create({
      data: {
        userId: cb.userId,
        date: today,
        symbol: symbol.slice(0, 20),
        side: side ?? null,
      },
    }).catch(() => {}); // non-critical
  }

  // Return updated status so EA can act immediately without a separate GET
  const tradeCount = await db.trade.count({ where: { userId: cb.userId, date: today } });

  let effectiveLimit = cb.dailyLimit;
  let verdict = "GO";
  if (cb.scoreAdaptive) {
    const checkin = await db.checkin.findUnique({
      where: { userId_date: { userId: cb.userId, date: today } },
      select: { verdict: true },
    });
    if (checkin) {
      verdict = checkin.verdict;
      if (checkin.verdict === "NO-TRADE") effectiveLimit = 0;
      else if (checkin.verdict === "CAUTION") effectiveLimit = Math.ceil(cb.dailyLimit * 0.5);
    }
  }

  const blocked = tradeCount >= effectiveLimit;

  return NextResponse.json(
    { ok: true, tradeCount, effectiveLimit, blocked, verdict },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}