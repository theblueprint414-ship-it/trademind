import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [accounts, trades] = await Promise.all([
    db.tradingAccount.findMany({
      where: { userId: auth.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    db.tradeEntry.findMany({
      where: { userId: auth.userId },
      select: {
        tradingAccountId: true,
        pnl: true,
        date: true,
        rMultiple: true,
      },
    }),
  ]);

  // Group trades by account id (null = unassigned)
  const byAccount = new Map<string | null, typeof trades>();
  for (const t of trades) {
    const key = t.tradingAccountId ?? null;
    if (!byAccount.has(key)) byAccount.set(key, []);
    byAccount.get(key)!.push(t);
  }

  const accountStats = accounts.map((acc) => {
    const accTrades = byAccount.get(acc.id) ?? [];
    const hasPnl = accTrades.filter((t) => t.pnl !== null);

    const totalPnl = hasPnl.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const todayPnl = hasPnl.filter((t) => t.date === today).reduce((s, t) => s + (t.pnl ?? 0), 0);
    const last30Trades = hasPnl.filter((t) => t.date >= thirtyDaysAgo);
    const last30Pnl = last30Trades.reduce((s, t) => s + (t.pnl ?? 0), 0);

    const wins = hasPnl.filter((t) => (t.pnl ?? 0) > 0).length;
    const losses = hasPnl.filter((t) => (t.pnl ?? 0) < 0).length;
    const total = hasPnl.length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    const rTrades = accTrades.filter((t) => t.rMultiple !== null);
    const avgR = rTrades.length > 0 ? rTrades.reduce((s, t) => s + (t.rMultiple ?? 0), 0) / rTrades.length : null;

    // Drawdown metrics (only if startingBalance is set)
    let drawdownUsedPct: number | null = null;
    let drawdownRemainingDollar: number | null = null;
    let currentBalance: number | null = null;

    if (acc.startingBalance !== null) {
      currentBalance = acc.startingBalance + totalPnl;
      if (totalPnl < 0) {
        drawdownUsedPct = (Math.abs(totalPnl) / acc.startingBalance) * 100;
        drawdownRemainingDollar = acc.startingBalance - Math.abs(totalPnl);
      } else {
        drawdownUsedPct = 0;
        drawdownRemainingDollar = acc.startingBalance;
      }
    }

    // Daily drawdown: best approximation using today's P&L vs starting balance
    let dailyDrawdownPct: number | null = null;
    if (acc.startingBalance !== null && todayPnl < 0) {
      dailyDrawdownPct = (Math.abs(todayPnl) / acc.startingBalance) * 100;
    }

    // Determine status
    let status: "healthy" | "caution" | "danger" = "healthy";
    if (drawdownUsedPct !== null) {
      if (drawdownUsedPct >= 8) status = "danger";
      else if (drawdownUsedPct >= 5) status = "caution";
    } else {
      // No starting balance — fall back to recent loss streak
      let consecutive = 0;
      const sorted = [...hasPnl].sort((a, b) => a.date.localeCompare(b.date));
      for (let i = sorted.length - 1; i >= 0; i--) {
        if ((sorted[i].pnl ?? 0) < 0) consecutive++;
        else break;
      }
      if (consecutive >= 5) status = "danger";
      else if (consecutive >= 3) status = "caution";
    }

    // 7-day daily P&L array (for sparkline)
    const dailyPnlMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      dailyPnlMap[d] = 0;
    }
    for (const t of hasPnl) {
      if (t.date in dailyPnlMap) dailyPnlMap[t.date] += t.pnl ?? 0;
    }
    const last7Days = Object.entries(dailyPnlMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]) => ({ date, pnl }));

    return {
      id: acc.id,
      name: acc.name,
      currency: acc.currency,
      isDefault: acc.isDefault,
      startingBalance: acc.startingBalance,
      currentBalance,
      totalPnl,
      todayPnl,
      last30Pnl,
      wins,
      losses,
      total,
      winRate,
      avgR,
      drawdownUsedPct,
      drawdownRemainingDollar,
      dailyDrawdownPct,
      status,
      last7Days,
    };
  });

  // Combined totals (all accounts)
  const combinedPnl = accountStats.reduce((s, a) => s + a.totalPnl, 0);
  const combinedTodayPnl = accountStats.reduce((s, a) => s + a.todayPnl, 0);
  const combinedTrades = accountStats.reduce((s, a) => s + a.total, 0);
  const combinedWins = accountStats.reduce((s, a) => s + a.wins, 0);
  const combinedWinRate = combinedTrades > 0 ? (combinedWins / combinedTrades) * 100 : 0;

  // Unassigned trades (no account)
  const unassigned = byAccount.get(null) ?? [];
  const unassignedPnl = unassigned.filter((t) => t.pnl !== null).reduce((s, t) => s + (t.pnl ?? 0), 0);

  return Response.json({
    accounts: accountStats,
    combined: {
      totalPnl: combinedPnl,
      todayPnl: combinedTodayPnl,
      totalTrades: combinedTrades,
      winRate: combinedWinRate,
    },
    unassignedCount: unassigned.length,
    unassignedPnl,
  });
}
