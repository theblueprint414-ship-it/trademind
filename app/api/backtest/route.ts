import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

type Rule =
  | { type: "min_score";         value: number }
  | { type: "daily_loss_limit";  value: number }
  | { type: "max_trades_per_day"; value: number }
  | { type: "min_confidence";    value: number }
  | { type: "sessions";          values: string[] }
  | { type: "market_conditions"; values: string[] }
  | { type: "setups";            values: string[] }
  | { type: "sides";             values: string[] }
  | { type: "asset_types";       values: string[] }
  | { type: "timeframes";        values: string[] }
  | { type: "min_r";             value: number }
  | { type: "max_loss_per_trade"; value: number };

type TradeRow = {
  id: string;
  date: string;
  pnl: number | null;
  commission: number | null;
  checkinScore: number | null;
  rMultiple: number | null;
  side: string | null;
  assetType: string | null;
  ictSetups: string | null;
  confidence: number | null;
  sessionType: string | null;
  marketCondition: string | null;
  timeframe: string | null;
  entryTime: string | null;
  createdAt: Date;
};

function computeStats(trades: TradeRow[]) {
  const withPnl = trades.filter((t) => t.pnl !== null);
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const totalComm = trades.reduce((s, t) => s + (t.commission ?? 0), 0);
  const winners = withPnl.filter((t) => (t.pnl ?? 0) > 0);
  const losers = withPnl.filter((t) => (t.pnl ?? 0) < 0);
  const winRate = withPnl.length > 0 ? Math.round((winners.length / withPnl.length) * 100) : null;
  const grossProfit = winners.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(losers.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : null;
  const avgWin = winners.length > 0 ? Math.round((grossProfit / winners.length) * 100) / 100 : null;
  const avgLoss = losers.length > 0 ? Math.round((grossLoss / losers.length) * 100) / 100 : null;
  const rTrades = trades.filter((t) => t.rMultiple !== null);
  const avgR = rTrades.length > 0 ? Math.round((rTrades.reduce((s, t) => s + t.rMultiple!, 0) / rTrades.length) * 100) / 100 : null;

  // Equity curve + max drawdown
  const byDate: Record<string, number> = {};
  for (const t of trades) {
    if (t.pnl !== null) byDate[t.date] = (byDate[t.date] ?? 0) + t.pnl;
  }
  const dates = Object.keys(byDate).sort();
  let peak = 0, maxDrawdown = 0, cumPnl = 0;
  const equityCurve: { date: string; cumPnl: number }[] = [];
  for (const d of dates) {
    cumPnl += byDate[d];
    equityCurve.push({ date: d, cumPnl: Math.round(cumPnl * 100) / 100 });
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  return {
    trades: trades.length,
    totalPnl: Math.round(totalPnl * 100) / 100,
    netPnl: Math.round((totalPnl - totalComm) * 100) / 100,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    avgR,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    equityCurve,
  };
}

function applyRules(trades: TradeRow[], rules: Rule[]): { kept: TradeRow[]; reasons: Record<string, string[]> } {
  const reasons: Record<string, string[]> = {};

  // Group by date for day-level rules
  const byDate: Record<string, TradeRow[]> = {};
  for (const t of trades) {
    if (!byDate[t.date]) byDate[t.date] = [];
    byDate[t.date].push(t);
  }

  const kept: TradeRow[] = [];

  for (const date of Object.keys(byDate).sort()) {
    const dayTrades = [...byDate[date]].sort((a, b) => new Date(a.entryTime ?? a.createdAt).getTime() - new Date(b.entryTime ?? b.createdAt).getTime());
    let dailyPnl = 0;
    let dayCount = 0;

    // Check daily score rule — skip entire day if score too low
    const scoreRule = rules.find((r) => r.type === "min_score") as { type: "min_score"; value: number } | undefined;
    const dayScore = dayTrades[0]?.checkinScore ?? null;
    if (scoreRule && dayScore !== null && dayScore < scoreRule.value) {
      for (const t of dayTrades) {
        if (!reasons[t.id]) reasons[t.id] = [];
        reasons[t.id].push(`score ${dayScore} < ${scoreRule.value}`);
      }
      continue; // skip all trades on this day
    }

    for (const trade of dayTrades) {
      const tradeReasons: string[] = [];

      for (const rule of rules) {
        if (rule.type === "min_score") continue; // handled at day level

        if (rule.type === "daily_loss_limit") {
          if (dailyPnl <= -rule.value) { tradeReasons.push(`daily loss limit $${rule.value} reached`); break; }
        }

        if (rule.type === "max_trades_per_day") {
          if (dayCount >= rule.value) { tradeReasons.push(`max ${rule.value} trades/day reached`); break; }
        }

        if (rule.type === "min_confidence") {
          if (trade.confidence === null || trade.confidence < rule.value) {
            tradeReasons.push(`conviction ${trade.confidence ?? "none"} < ${rule.value}`);
          }
        }

        if (rule.type === "sessions") {
          if (!trade.sessionType || !rule.values.includes(trade.sessionType)) {
            tradeReasons.push(`session "${trade.sessionType ?? "none"}" not in filter`);
          }
        }

        if (rule.type === "market_conditions") {
          if (!trade.marketCondition || !rule.values.includes(trade.marketCondition)) {
            tradeReasons.push(`condition "${trade.marketCondition ?? "none"}" not in filter`);
          }
        }

        if (rule.type === "setups") {
          let tradeTags: string[] = [];
          try { tradeTags = JSON.parse(trade.ictSetups ?? "[]") as string[]; } catch { tradeTags = []; }
          const hasSetup = tradeTags.some((s) => rule.values.includes(s));
          if (!hasSetup) tradeReasons.push(`setup not in [${rule.values.join(",")}]`);
        }

        if (rule.type === "sides") {
          if (!trade.side || !rule.values.includes(trade.side)) {
            tradeReasons.push(`side "${trade.side ?? "none"}" not in filter`);
          }
        }

        if (rule.type === "asset_types") {
          if (!trade.assetType || !rule.values.includes(trade.assetType)) {
            tradeReasons.push(`asset type "${trade.assetType ?? "none"}" not in filter`);
          }
        }

        if (rule.type === "timeframes") {
          if (!trade.timeframe || !rule.values.includes(trade.timeframe)) {
            tradeReasons.push(`timeframe "${trade.timeframe ?? "none"}" not in filter`);
          }
        }

        if (rule.type === "max_loss_per_trade") {
          if (trade.pnl !== null && trade.pnl < -rule.value) {
            tradeReasons.push(`loss $${Math.abs(trade.pnl).toFixed(0)} > max $${rule.value}`);
          }
        }
      }

      if (tradeReasons.length > 0) {
        reasons[trade.id] = tradeReasons;
      } else {
        kept.push(trade);
        dailyPnl += trade.pnl ?? 0;
        dayCount++;
      }
    }
  }

  return { kept, reasons };
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const rules: Rule[] = Array.isArray(body.rules) ? body.rules : [];
  const startDate: string | null = typeof body.startDate === "string" ? body.startDate : null;
  const endDate: string | null = typeof body.endDate === "string" ? body.endDate : null;

  // Fetch trades
  const where: Record<string, unknown> = { userId: guard.userId };
  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate ? { lte: endDate } : {}),
    };
  }

  const rawTrades = await db.tradeEntry.findMany({
    where,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    take: 2000,
    select: {
      id: true, date: true, pnl: true, commission: true, checkinScore: true,
      rMultiple: true, side: true, assetType: true, ictSetups: true,
      confidence: true, sessionType: true, marketCondition: true, timeframe: true,
      entryTime: true, createdAt: true,
    },
  });

  if (rawTrades.length === 0) {
    return Response.json({ error: "No trades found" }, { status: 404 });
  }

  const trades: TradeRow[] = rawTrades.map((t) => ({
    ...t,
    confidence: (t as { confidence?: number | null }).confidence ?? null,
    sessionType: (t as { sessionType?: string | null }).sessionType ?? null,
    marketCondition: (t as { marketCondition?: string | null }).marketCondition ?? null,
    timeframe: (t as { timeframe?: string | null }).timeframe ?? null,
  }));

  const originalStats = computeStats(trades);

  if (rules.length === 0) {
    return Response.json({ original: originalStats, simulated: originalStats, skipped: 0, skippedPnl: 0, reasons: {} });
  }

  const { kept, reasons } = applyRules(trades, rules);
  const simulatedStats = computeStats(kept);

  const skippedTrades = trades.filter((t) => reasons[t.id]);
  const skippedPnl = skippedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  return Response.json({
    original: originalStats,
    simulated: simulatedStats,
    skipped: skippedTrades.length,
    skippedPnl: Math.round(skippedPnl * 100) / 100,
    reasons,
  });
}
