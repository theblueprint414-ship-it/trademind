import { db } from "@/lib/db";
import { fetchTodayTrades } from "@/lib/brokers";
import { safeDecrypt } from "@/lib/crypto";
import { sendPushToUser } from "@/lib/push";
import { NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

// GET /api/circuit-breaker/status?token=<extensionToken>
// Public — auth by extensionToken only. Polled by Chrome extension + MT4/MT5 EA every 5 min.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400, headers: CORS });

  const cb = await db.circuitBreaker.findUnique({
    where: { extensionToken: token },
    select: { userId: true, isActive: true, dailyLimit: true, scoreAdaptive: true, blockedNotifiedDate: true },
  });

  if (!cb) return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS });

  if (!cb.isActive) {
    return NextResponse.json({ blocked: false, reason: "inactive" }, { headers: CORS });
  }

  const today = new Date().toISOString().split("T")[0];

  // ── 1. Get real trade count ───────────────────────────────────────────────
  // Priority: live broker API → EA-reported Trade records → manual TradeEntry journal
  let tradeCount = 0;
  let countSource: "broker" | "ea_report" | "journal" = "journal";

  const brokerConn = await db.brokerConnection.findUnique({
    where: { userId: cb.userId },
    select: { broker: true, apiKey: true, apiSecret: true, environment: true, status: true },
  });

  if (brokerConn && brokerConn.status === "active") {
    // Live count from broker API
    try {
      const liveCount = await fetchTodayTrades({
        broker: brokerConn.broker,
        apiKey: safeDecrypt(brokerConn.apiKey),
        apiSecret: brokerConn.apiSecret ? safeDecrypt(brokerConn.apiSecret) : undefined,
        environment: brokerConn.environment,
      });
      if (liveCount !== null) {
        tradeCount = liveCount;
        countSource = "broker";
        // Keep Trade table in sync as a side effect (fire-and-forget)
        (async () => {
          try {
            await db.trade.deleteMany({ where: { userId: cb.userId, date: today } });
            if (liveCount > 0) {
              await db.trade.createMany({ data: Array.from({ length: liveCount }).map(() => ({ userId: cb.userId, date: today })) });
            }
          } catch { /* non-critical */ }
        })();
      }
    } catch {
      // Broker API failed — fall through to cached count
    }
  }

  if (countSource === "journal") {
    // EA-reported trades (MT4/MT5 without MetaAPI, or any direct report)
    const eaCount = await db.trade.count({ where: { userId: cb.userId, date: today } });
    if (eaCount > 0) {
      tradeCount = eaCount;
      countSource = "ea_report";
    } else {
      // Last resort: manual journal entries
      tradeCount = await db.tradeEntry.count({ where: { userId: cb.userId, date: today } });
    }
  }

  // ── 2. Score-adaptive limit ───────────────────────────────────────────────
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
  const remaining = Math.max(0, effectiveLimit - tradeCount);

  // Send push once when the limit is first hit today (broker-polled path)
  if (blocked && cb.blockedNotifiedDate !== today) {
    db.circuitBreaker.update({
      where: { extensionToken: token },
      data: { blockedNotifiedDate: today, blockedAt: new Date() },
    }).catch(() => {});

    const verdictLine = verdict !== "GO" ? ` Mental state: ${verdict}.` : "";
    sendPushToUser(cb.userId, {
      title: "TradeMind — Trade Limit Reached",
      body: `You've hit your daily limit of ${effectiveLimit} trade${effectiveLimit === 1 ? "" : "s"} (${tradeCount} done).${verdictLine} Circuit breaker is now active.`,
      url: "/dashboard",
    }).catch(() => {});
  }

  return NextResponse.json(
    { blocked, tradeCount, effectiveLimit, dailyLimit: cb.dailyLimit, scoreAdaptive: cb.scoreAdaptive, verdict, remaining, date: today, source: countSource },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}