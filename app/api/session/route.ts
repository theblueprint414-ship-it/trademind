import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const [trades, checkin, circuitBreaker, user, midCheckins, preTradeRituals] = await Promise.all([
    db.tradeEntry.findMany({
      where: { userId: auth.userId, date },
      orderBy: { createdAt: "asc" },
    }),
    db.checkin.findUnique({
      where: { userId_date: { userId: auth.userId, date } },
      select: { score: true, verdict: true, answers: true },
    }),
    db.circuitBreaker.findUnique({
      where: { userId: auth.userId },
      select: { dailyLimit: true, tradeCountToday: true, isActive: true },
    }),
    db.user.findUnique({
      where: { id: auth.userId },
      select: { tradeLimit: true, plan: true },
    }),
    db.midSessionCheckin.findMany({
      where: { userId: auth.userId, date },
      select: { id: true, score: true, mood: true, note: true, time: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.preTradeRitual.findMany({
      where: { userId: auth.userId, date },
      select: { id: true, setupType: true, conviction: true, reason: true, hasStopLoss: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const winners = trades.filter((t) => (t.pnl ?? 0) > 0).length;
  const losers = trades.filter((t) => (t.pnl ?? 0) < 0).length;
  const winRate = trades.length > 0 ? Math.round((winners / trades.length) * 100) : null;
  const tradeLimit = circuitBreaker?.dailyLimit ?? user?.tradeLimit ?? 5;

  return Response.json({
    date,
    trades,
    checkin,
    totalPnl,
    tradeCount: trades.length,
    tradeLimit,
    winners,
    losers,
    winRate,
    plan: user?.plan ?? "free",
    midCheckins,
    preTradeRituals,
  });
}