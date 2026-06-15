export const runtime = "nodejs";

import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const userId = guard.userId;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? null;
  const endDate = searchParams.get("endDate") ?? null;

  const where: Record<string, unknown> = { userId };
  if (startDate) where.date = { ...(where.date as object ?? {}), gte: startDate };
  if (endDate) where.date = { ...(where.date as object ?? {}), lte: endDate };

  const trades = await db.tradeEntry.findMany({
    where,
    select: {
      pnl: true,
      rMultiple: true,
      stopLoss: true,
      takeProfit: true,
      entryPrice: true,
      exitPrice: true,
      side: true,
      symbol: true,
    },
    orderBy: { date: "desc" },
    take: 500,
  });

  const total = trades.length;
  if (total === 0) return Response.json({ ok: true, noData: true });

  const withR = trades.filter((t) => t.rMultiple !== null);
  const withSL = trades.filter((t) => t.stopLoss !== null);
  const withTP = trades.filter((t) => t.takeProfit !== null);

  const slDiscipline = total > 0 ? Math.round((withSL.length / total) * 100) : null;

  const avgR =
    withR.length > 0
      ? Math.round((withR.reduce((s, t) => s + (t.rMultiple ?? 0), 0) / withR.length) * 100) / 100
      : null;

  const winners = withR.filter((t) => (t.rMultiple ?? 0) > 0);
  const tpHits = winners.filter((t) => (t.rMultiple ?? 0) >= 1.0);
  const tpHitRate = winners.length > 0 ? Math.round((tpHits.length / winners.length) * 100) : null;

  const fumbles = withTP.filter((t) => (t.rMultiple ?? 0) < 0);
  const fumbleRate = withTP.length > 0 ? Math.round((fumbles.length / withTP.length) * 100) : null;

  const rBuckets: Record<string, number> = {
    "< -2R": 0,
    "-2R – -1R": 0,
    "-1R – 0R": 0,
    "0R – 1R": 0,
    "1R – 2R": 0,
    "> 2R": 0,
  };
  for (const t of withR) {
    const r = t.rMultiple ?? 0;
    if (r < -2) rBuckets["< -2R"]++;
    else if (r < -1) rBuckets["-2R – -1R"]++;
    else if (r < 0) rBuckets["-1R – 0R"]++;
    else if (r < 1) rBuckets["0R – 1R"]++;
    else if (r < 2) rBuckets["1R – 2R"]++;
    else rBuckets["> 2R"]++;
  }
  const rDistribution = Object.entries(rBuckets).map(([label, count]) => ({ label, count }));

  let captureSum = 0;
  let captureCount = 0;
  for (const t of trades) {
    if (t.entryPrice === null || t.exitPrice === null || t.takeProfit === null) continue;
    const isLong =
      !t.side || t.side.toLowerCase() === "long" || t.side.toLowerCase() === "buy";
    const fullRange = isLong ? t.takeProfit - t.entryPrice : t.entryPrice - t.takeProfit;
    const captured = isLong ? t.exitPrice - t.entryPrice : t.entryPrice - t.exitPrice;
    if (fullRange > 0) {
      captureSum += Math.max(-200, Math.min(200, (captured / fullRange) * 100));
      captureCount++;
    }
  }
  const avgProfitCapture = captureCount > 0 ? Math.round(captureSum / captureCount) : null;

  return Response.json({
    ok: true,
    totalTrades: total,
    tradesWithR: withR.length,
    slDiscipline,
    avgR,
    tpHitRate,
    fumbleRate,
    avgProfitCapture,
    rDistribution,
  });
}
