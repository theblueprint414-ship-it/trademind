import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get("days") ?? "90"), 365);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const entries = await db.tradeEntry.findMany({
    where: { userId: auth.userId, date: { gte: sinceStr }, pnl: { not: null } },
    select: { date: true, pnl: true },
    orderBy: { date: "asc" },
  });

  // Aggregate by day
  const byDay: Record<string, number> = {};
  for (const e of entries) {
    byDay[e.date] = (byDay[e.date] ?? 0) + (e.pnl ?? 0);
  }

  // Build cumulative curve
  let cum = 0;
  const curve = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => {
      cum += pnl;
      return { date, pnl: Math.round(pnl * 100) / 100, cum: Math.round(cum * 100) / 100 };
    });

  // Key stats
  const totalPnl = cum;
  const wins = Object.values(byDay).filter(v => v > 0).length;
  const losses = Object.values(byDay).filter(v => v < 0).length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;

  const grossProfit = Object.values(byDay).filter(v => v > 0).reduce((s, v) => s + v, 0);
  const grossLoss = Math.abs(Object.values(byDay).filter(v => v < 0).reduce((s, v) => s + v, 0));
  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : null;

  // Max drawdown
  let peak = 0, maxDd = 0, running = 0;
  for (const { pnl } of curve) {
    running += pnl;
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDd) maxDd = dd;
  }

  // Trade-level stats for avg R
  const trades = await db.tradeEntry.findMany({
    where: { userId: auth.userId, date: { gte: sinceStr }, rMultiple: { not: null } },
    select: { rMultiple: true },
  });
  const avgR = trades.length > 0
    ? Math.round((trades.reduce((s, t) => s + (t.rMultiple ?? 0), 0) / trades.length) * 100) / 100
    : null;

  return Response.json({
    ok: true,
    curve,
    stats: {
      totalPnl: Math.round(totalPnl * 100) / 100,
      winRate,
      profitFactor,
      maxDrawdown: Math.round(maxDd * 100) / 100,
      avgR,
      tradingDays: curve.length,
    },
  });
}
