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
    select: { pnl: true, entryTime: true },
    orderBy: { date: "desc" },
    take: 1000,
  });

  // 24 hours × 7 days grid
  const grid: { losses: number; total: number }[][] = Array.from({ length: 24 }, () =>
    Array.from({ length: 7 }, () => ({ losses: 0, total: 0 }))
  );

  for (const t of trades) {
    if (!t.entryTime) continue;
    const dt = new Date(t.entryTime);
    const hour = dt.getHours();
    const dow = dt.getDay(); // 0=Sun
    grid[hour][dow].total++;
    if ((t.pnl ?? 0) < 0) grid[hour][dow].losses++;
  }

  const cells: { hour: number; dow: number; losses: number; total: number; lossRate: number }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let d = 0; d < 7; d++) {
      const { losses, total } = grid[h][d];
      if (total > 0) {
        cells.push({
          hour: h,
          dow: d,
          losses,
          total,
          lossRate: Math.round((losses / total) * 100),
        });
      }
    }
  }

  // Summary: worst hour and worst day
  const hourTotals = Array.from({ length: 24 }, (_, h) => {
    const losses = grid[h].reduce((s, c) => s + c.losses, 0);
    const total = grid[h].reduce((s, c) => s + c.total, 0);
    return { hour: h, losses, total, lossRate: total > 0 ? Math.round((losses / total) * 100) : 0 };
  }).filter((x) => x.total >= 3);

  const dowTotals = Array.from({ length: 7 }, (_, d) => {
    const losses = grid.reduce((s, row) => s + row[d].losses, 0);
    const total = grid.reduce((s, row) => s + row[d].total, 0);
    return { dow: d, losses, total, lossRate: total > 0 ? Math.round((losses / total) * 100) : 0 };
  }).filter((x) => x.total >= 3);

  const worstHour = hourTotals.length
    ? hourTotals.reduce((a, b) => (b.lossRate > a.lossRate ? b : a))
    : null;
  const worstDow = dowTotals.length
    ? dowTotals.reduce((a, b) => (b.lossRate > a.lossRate ? b : a))
    : null;

  return Response.json({
    ok: true,
    cells,
    totalTrades: trades.length,
    worstHour,
    worstDow,
  });
}
