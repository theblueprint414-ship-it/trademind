import { db } from "@/lib/db";
import { fetchTodayTrades } from "@/lib/brokers";
import { safeDecrypt } from "@/lib/crypto";
import { sendPushToUser } from "@/lib/push";
import { lockBroker } from "@/lib/circuitBreakerLock";
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
    select: { userId: true, isActive: true, dailyLimit: true, scoreAdaptive: true, resetHour: true, blockedNotifiedDate: true, warningNotifiedDate: true },
  });

  if (!cb) return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS });

  if (!cb.isActive) {
    return NextResponse.json({ blocked: false, reason: "inactive" }, { headers: CORS });
  }

  const today = new Date().toISOString().split("T")[0];

  // Window start: the most recent occurrence of resetHour UTC before now.
  // e.g. resetHour=14 at 15:00 UTC → today at 14:00 UTC
  //      resetHour=14 at 10:00 UTC → yesterday at 14:00 UTC
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setUTCHours(cb.resetHour, 0, 0, 0);
  if (now.getUTCHours() < cb.resetHour) {
    windowStart.setUTCDate(windowStart.getUTCDate() - 1);
  }

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
        // Keep Trade table in sync — transaction prevents race between concurrent polls
        db.$transaction([
          db.trade.deleteMany({ where: { userId: cb.userId, loggedAt: { gte: windowStart } } }),
          ...(liveCount > 0
            ? [db.trade.createMany({ data: Array.from({ length: liveCount }, () => ({ userId: cb.userId, date: today })) })]
            : []),
        ]).catch(() => {});
      }
    } catch {
      // Broker API failed — fall through to cached count
    }
  }

  if (countSource === "journal") {
    // EA-reported trades (MT4/MT5 without MetaAPI, or any direct report)
    const eaCount = await db.trade.count({ where: { userId: cb.userId, loggedAt: { gte: windowStart } } });
    if (eaCount > 0) {
      tradeCount = eaCount;
      countSource = "ea_report";
    } else {
      // Last resort: manual journal entries
      tradeCount = await db.tradeEntry.count({ where: { userId: cb.userId, createdAt: { gte: windowStart } } });
    }
  }

  // ── 2. Score-adaptive limit ───────────────────────────────────────────────
  let effectiveLimit = cb.dailyLimit;
  let verdict = "GO";
  let checkinDone = false;

  const checkin = await db.checkin.findUnique({
    where: { userId_date: { userId: cb.userId, date: today } },
    select: { verdict: true },
  });

  if (checkin) {
    checkinDone = true;
    verdict = checkin.verdict;
    if (cb.scoreAdaptive) {
      if (checkin.verdict === "NO-TRADE") effectiveLimit = 0;
      else if (checkin.verdict === "CAUTION") effectiveLimit = Math.ceil(cb.dailyLimit * 0.5);
    }
  } else {
    // No check-in today — apply 75% limit as a discipline penalty regardless of scoreAdaptive
    effectiveLimit = Math.ceil(cb.dailyLimit * 0.75);
  }

  const blocked = tradeCount >= effectiveLimit;
  const remaining = Math.max(0, effectiveLimit - tradeCount);

  // "1 trade left" warning push — fires once when remaining drops to 1
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

  // "Limit reached" push — fires once when first blocked today
  if (blocked && cb.blockedNotifiedDate !== today) {
    db.circuitBreaker.update({
      where: { extensionToken: token },
      data: { blockedNotifiedDate: today, blockedAt: new Date() },
    }).catch(() => {});

    // Layer 2+3: suspend trading at broker level
    lockBroker(cb.userId).catch(() => {});

    const verdictLine = verdict !== "GO" ? ` Mental state: ${verdict}.` : "";
    sendPushToUser(cb.userId, {
      title: "TradeMind — Trade Limit Reached",
      body: `You've hit your daily limit of ${effectiveLimit} trade${effectiveLimit === 1 ? "" : "s"} (${tradeCount} done).${verdictLine} Circuit breaker is now active.`,
      url: "/dashboard",
    }).catch(() => {});
  }

  return NextResponse.json(
    { blocked, tradeCount, effectiveLimit, dailyLimit: cb.dailyLimit, scoreAdaptive: cb.scoreAdaptive, verdict, remaining, date: today, source: countSource, checkinDone },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}