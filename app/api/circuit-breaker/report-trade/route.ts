import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { lockBroker } from "@/lib/circuitBreakerLock";
import { NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

// POST /api/circuit-breaker/report-trade?token=<extensionToken>
// Called by MT4/MT5 EA immediately after a successful OrderSend.
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400, headers: CORS });

  const cb = await db.circuitBreaker.findUnique({
    where: { extensionToken: token },
    select: { userId: true, isActive: true, dailyLimit: true, scoreAdaptive: true, blockedNotifiedDate: true },
  });

  if (!cb) return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS });

  let symbol: string | undefined;
  let side: string | undefined;
  try {
    const body = await req.json();
    symbol = body.symbol;
    side = body.side;
  } catch { /* body is optional */ }

  const today = new Date().toISOString().split("T")[0];

  await db.trade.create({ data: { userId: cb.userId, date: today } });

  if (symbol) {
    await db.tradeEntry.create({
      data: { userId: cb.userId, date: today, symbol: symbol.slice(0, 20), side: side ?? null },
    }).catch(() => {});
  }

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

  // First time hitting the limit today — lock broker + send push
  if (blocked && cb.blockedNotifiedDate !== today) {
    await db.circuitBreaker.update({
      where: { extensionToken: token },
      data: { blockedNotifiedDate: today, blockedAt: new Date() },
    });

    // Layer 2+3: suspend trading at broker level (Alpaca, MetaAPI, Binance, Bybit)
    lockBroker(cb.userId).catch(() => {});

    const verdictLine = verdict !== "GO" ? ` Mental state: ${verdict}.` : "";
    sendPushToUser(cb.userId, {
      title: "TradeMind — Trade Limit Reached",
      body: `You've hit your daily limit of ${effectiveLimit} trade${effectiveLimit === 1 ? "" : "s"} (${tradeCount} done).${verdictLine} Circuit breaker is now active.`,
      url: "/dashboard",
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, tradeCount, effectiveLimit, blocked, verdict }, { headers: CORS });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}