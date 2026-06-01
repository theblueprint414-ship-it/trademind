import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

function checkSecret(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "");
  const secret = process.env.CRON_SECRET ?? "";
  if (!token || !secret) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!checkSecret(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const day7 = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
  const day30 = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];

  const [
    totalUsers,
    proUsers,
    premiumUsers,
    signups7d,
    signups30d,
    checkinsToday,
    checkins7d,
    tradesTotal,
    tradesThisWeek,
    brokerConnected,
    brokerErrors,
    errorCount24h,
    warnCount24h,
    recentSignups,
    planDistribution,
    checkinFunnel,
    topErrors,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { plan: "pro" } }),
    db.user.count({ where: { plan: "premium" } }),
    db.user.count({ where: { createdAt: { gte: new Date(day7) } } }),
    db.user.count({ where: { createdAt: { gte: new Date(day30) } } }),
    db.checkin.count({ where: { date: todayStr } }),
    db.checkin.count({ where: { date: { gte: day7 } } }),
    db.tradeEntry.count(),
    db.tradeEntry.count({ where: { date: { gte: day7 } } }),
    db.brokerConnection.count({ where: { status: "active" } }),
    db.brokerConnection.count({ where: { status: "error" } }),
    db.appError.count({ where: { level: "error", createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    db.appError.count({ where: { level: "warn", createdAt: { gte: new Date(Date.now() - 86400000) } } }),

    // Last 10 signups
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, name: true, plan: true, createdAt: true },
    }),

    // Plan distribution
    db.user.groupBy({ by: ["plan"], _count: { plan: true } }),

    // Funnel: users who checked in at least once, logged a trade, etc.
    Promise.all([
      db.user.count(),
      db.checkin.groupBy({ by: ["userId"] }).then((r) => r.length),
      db.tradeEntry.groupBy({ by: ["userId"] }).then((r) => r.length),
      db.user.count({ where: { plan: { in: ["pro", "premium"] } } }),
    ]),

    // Top 5 errors last 7 days
    db.appError.findMany({
      where: { level: "error", createdAt: { gte: new Date(day7) } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, message: true, route: true, createdAt: true, level: true },
    }),
  ]);

  // Verdicts today
  const todayVerdicts = await db.checkin.groupBy({
    by: ["verdict"],
    where: { date: todayStr },
    _count: { verdict: true },
  });

  // Broker breakdown
  const brokerBreakdown = await db.brokerConnection.groupBy({
    by: ["broker"],
    _count: { broker: true },
  });

  // Checkins per day last 7d
  const checkinsByDay = await db.checkin.groupBy({
    by: ["date"],
    where: { date: { gte: day7 } },
    _count: { date: true },
    orderBy: { date: "asc" },
  });

  return Response.json({
    timestamp: now.toISOString(),
    users: {
      total: totalUsers,
      pro: proUsers,
      premium: premiumUsers,
      free: totalUsers - proUsers - premiumUsers,
      signups7d,
      signups30d,
      recent: recentSignups,
      planDistribution,
    },
    engagement: {
      checkinsToday,
      checkins7d,
      tradesTotal,
      tradesThisWeek,
      verdictsToday: todayVerdicts,
      checkinsByDay,
    },
    brokers: {
      connected: brokerConnected,
      errors: brokerErrors,
      none: totalUsers - brokerConnected - brokerErrors,
      breakdown: brokerBreakdown,
    },
    funnel: {
      totalSignups: checkinFunnel[0],
      didCheckin: checkinFunnel[1],
      loggedTrade: checkinFunnel[2],
      upgraded: checkinFunnel[3],
    },
    errors: {
      last24hErrors: errorCount24h,
      last24hWarnings: warnCount24h,
      topErrors,
    },
  });
}
