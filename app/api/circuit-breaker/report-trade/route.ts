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
    select: { userId: true, isActive: true, dailyLimit: true, scoreAdaptive: true, resetHour: true, blockedNotifiedDate: true, warningNotifiedDate: true },
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

  // Window start: most recent resetHour UTC before now
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setUTCHours(cb.resetHour, 0, 0, 0);
  if (now.getUTCHours() < cb.resetHour) {
    windowStart.setUTCDate(windowStart.getUTCDate() - 1);
  }

  await db.trade.create({ data: { userId: cb.userId, date: today } });

  if (symbol) {
    await db.tradeEntry.create({
      data: { userId: cb.userId, date: today, symbol: symbol.slice(0, 20), side: side ?? null },
    }).catch(() => {});
  }

  const tradeCount = await db.trade.count({ where: { userId: cb.userId, loggedAt: { gte: windowStart } } });

  let effectiveLimit = cb.dailyLimit;
  let verdict = "GO";
  const checkin = await db.checkin.findUnique({
    where: { userId_date: { userId: cb.userId, date: today } },
    select: { verdict: true },
  });
  if (checkin) {
    verdict = checkin.verdict;
    if (cb.scoreAdaptive) {
      if (checkin.verdict === "NO-TRADE") effectiveLimit = 0;
      else if (checkin.verdict === "CAUTION") effectiveLimit = Math.ceil(cb.dailyLimit * 0.5);
    }
  } else {
    // No check-in — 75% limit penalty
    effectiveLimit = Math.ceil(cb.dailyLimit * 0.75);
  }

  const blocked = tradeCount >= effectiveLimit;
  const remaining = Math.max(0, effectiveLimit - tradeCount);

  // "1 trade left" warning — fires once when remaining drops to 1
  if (!blocked && remaining === 1 && cb.warningNotifiedDate !== today) {
    db.circuitBreaker.update({
      where: { extensionToken: token },
      data: { warningNotifiedDate: today },
    }).catch(() => {});
    sendPushToUser(cb.userId, {
      title: "TradeMind — Last Trade",
      body: `1 trade left for today (limit: ${effectiveLimit}). Make it count — or sit it out.`,
      url: "/dashboard",
    }).catch(() => {});
  }

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