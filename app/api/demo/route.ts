export const runtime = "nodejs";

import { NextResponse } from "next/server";

// Generates deterministic realistic demo data for new users
// showing what the product looks like with real trading history.
// No auth required — it's public demo data only.

const SYMBOLS = ["NQ", "ES", "AAPL", "TSLA", "EUR/USD", "GBP/USD", "BTC/USDT", "ETH/USDT"];

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function seed(n: number) {
  // Simple deterministic number from seed
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

export async function GET() {
  // Generate 90 days of demo trades — realistic prop trader curve
  // Win rate ~55%, avg win $320, avg loss $180, profit factor 1.9
  const trades: Array<{ date: string; symbol: string; side: "long" | "short"; pnl: number; checkinScore: number | null }> = [];

  let cumPnl = 0;
  let tradeId = 0;

  for (let day = 89; day >= 0; day--) {
    const isWeekend = [0, 6].includes(new Date(dateStr(day)).getDay());
    if (isWeekend) continue;

    const numTrades = seed(day * 7) > 0.6 ? 2 : seed(day * 11) > 0.8 ? 3 : 1;
    const score = Math.round(40 + seed(day * 3) * 60); // 40–100

    for (let t = 0; t < numTrades; t++) {
      const s = seed(tradeId * 13);
      const isWin = s < 0.55 + (score > 70 ? 0.08 : score < 50 ? -0.1 : 0);
      const symbol = SYMBOLS[Math.floor(seed(tradeId * 5) * SYMBOLS.length)];
      const side: "long" | "short" = seed(tradeId * 17) > 0.5 ? "long" : "short";
      const pnl = isWin ? Math.round(150 + seed(tradeId * 7) * 350) : -Math.round(80 + seed(tradeId * 11) * 200);
      cumPnl += pnl;
      trades.push({ date: dateStr(day), symbol, side, pnl, checkinScore: score });
      tradeId++;
    }
  }

  // Build equity curve
  let cum = 0;
  const equityCurveMap = new Map<string, number>();
  for (const t of trades) {
    cum += t.pnl;
    equityCurveMap.set(t.date, cum);
  }
  const equityCurve = Array.from(equityCurveMap.entries()).map(([date, c]) => ({ date, cumPnl: c }));

  // Build checkins (one per trading day)
  const checkins = Array.from(new Set(trades.map((t) => t.date))).map((date, i) => {
    const score = trades.find((t) => t.date === date)?.checkinScore ?? 70;
    return {
      date,
      score,
      verdict: score >= 70 ? "GO" : score >= 45 ? "CAUTION" : "NO-TRADE",
    };
  });

  // Stats
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  // Time-of-day buckets (deterministic)
  const hours = [9, 10, 11, 14, 15, 16];
  const timeOfDay = hours.map((h, i) => ({
    hour: h,
    pnl: Math.round(totalPnl * (0.1 + seed(i * 13) * 0.2) * (seed(i * 7) > 0.4 ? 1 : -0.3)),
    trades: Math.round(3 + seed(i * 5) * 8),
    winRate: Math.round(45 + seed(i * 11) * 25),
  }));

  // Day-of-week
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = [1, 2, 3, 4, 5].map((d) => ({
    day: d,
    label: days[d],
    pnl: Math.round(totalPnl * (0.15 + seed(d * 9) * 0.25) * (seed(d * 3) > 0.35 ? 1 : -0.2)),
    trades: Math.round(trades.length / 5),
    winRate: Math.round(48 + seed(d * 7) * 20),
  }));

  // Symbol breakdown
  const symbolStats = SYMBOLS.map((sym, i) => ({
    symbol: sym,
    pnl: Math.round(totalPnl * (0.05 + seed(i * 13) * 0.2) * (seed(i * 7) > 0.3 ? 1 : -0.2)),
    trades: Math.round(3 + seed(i * 5) * 10),
    winRate: Math.round(45 + seed(i * 11) * 25),
    avgR: Math.round((1.2 + seed(i * 3) * 1.8) * 10) / 10,
  }));

  return NextResponse.json({
    isDemo: true,
    totalPnl,
    tradeCount: trades.length,
    winRate: Math.round((wins.length / trades.length) * 100),
    avgWin: Math.round(grossWin / (wins.length || 1)),
    avgLoss: Math.round(grossLoss / (losses.length || 1)),
    profitFactor: Math.round((grossWin / (grossLoss || 1)) * 100) / 100,
    expectancy: Math.round(totalPnl / trades.length),
    maxDrawdown: Math.round(totalPnl * 0.18),
    maxWinStreak: 7,
    maxLoseStreak: 4,
    equityCurve: equityCurve.map((e, i) => ({ ...e, dailyPnl: i === 0 ? e.cumPnl : e.cumPnl - equityCurve[i - 1].cumPnl })),
    timeOfDay,
    dayOfWeek,
    symbols: symbolStats,
    checkins: checkins.slice(-30),
    recentTrades: trades.slice(-10).reverse(),
  });
}