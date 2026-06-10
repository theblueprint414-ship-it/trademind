import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const userId = guard.userId;

  // ── Date range filter ─────────────────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? null; // YYYY-MM-DD
  const endDate   = searchParams.get("endDate")   ?? null;

  try {
  const tradeWhere: Record<string, unknown> = { userId };
  if (startDate) tradeWhere.date = { ...(tradeWhere.date as object ?? {}), gte: startDate };
  if (endDate)   tradeWhere.date = { ...(tradeWhere.date as object ?? {}), lte: endDate };

  const checkinWhere: Record<string, unknown> = { userId };
  if (startDate) checkinWhere.date = { ...(checkinWhere.date as object ?? {}), gte: startDate };
  if (endDate)   checkinWhere.date = { ...(checkinWhere.date as object ?? {}), lte: endDate };

  const [checkins, tradeEntries, user, recaps, brokerConns] = await Promise.all([
    db.checkin.findMany({ where: checkinWhere, orderBy: { date: "desc" }, take: 90 }),
    db.tradeEntry.findMany({ where: tradeWhere, orderBy: { date: "desc" }, take: 1000 }),
    db.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    db.dailyRecap.findMany({ where: { userId, ...(startDate || endDate ? { date: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } } : {}) }, orderBy: { date: "desc" }, take: 90, select: { date: true, mood: true, pnl: true, playbookScore: true, lesson: true, tradesCount: true } }),
    db.brokerConnection.findMany({ where: { userId }, select: { startingBalance: true }, take: 5 }),
  ]);

  // Starting balance = sum of all connected accounts' starting balances
  const startingBalance = brokerConns.reduce((s, c) => s + (c.startingBalance ?? 0), 0) || null;

  // ── Score trend ───────────────────────────────────────────────────────────
  const scoreTrend = [...checkins].reverse().map((c) => ({ date: c.date, score: c.score, verdict: c.verdict }));

  // ── Verdict breakdown ─────────────────────────────────────────────────────
  const verdictCounts = { GO: 0, CAUTION: 0, "NO-TRADE": 0 };
  for (const c of checkins) {
    if (c.verdict in verdictCounts) verdictCounts[c.verdict as keyof typeof verdictCounts]++;
  }

  // ── Check-in streak ───────────────────────────────────────────────────────
  const allCheckins = startDate || endDate
    ? await db.checkin.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 90 })
    : checkins;
  const checkinDates = new Set(allCheckins.map((c) => c.date));
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];
  const hasCheckinToday = checkinDates.has(todayStr);
  let currentStreak = 0;
  for (let i = hasCheckinToday ? 0 : 1; i < 365; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    if (checkinDates.has(d.toISOString().split("T")[0])) currentStreak++;
    else break;
  }
  let longestStreak = 0, running = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    if (checkinDates.has(d.toISOString().split("T")[0])) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else { running = 0; }
  }

  // ── Discipline % ──────────────────────────────────────────────────────────
  const joinDate = user?.createdAt ?? new Date();
  const daysSinceJoin = Math.max(1, Math.ceil((Date.now() - new Date(joinDate).getTime()) / 86400000));
  const disciplinePct = Math.min(100, Math.round((checkins.length / Math.min(daysSinceJoin, 90)) * 100));

  const avgScore = checkins.length > 0 ? Math.round(checkins.reduce((s, c) => s + c.score, 0) / checkins.length) : null;
  const last30 = checkins.slice(0, 30);
  const avg30 = last30.length > 0 ? Math.round(last30.reduce((s, c) => s + c.score, 0) / last30.length) : null;

  // ── P&L grouping by date ──────────────────────────────────────────────────
  const pnlByDate: Record<string, number> = {};
  for (const t of tradeEntries) {
    if (t.pnl !== null) pnlByDate[t.date] = (pnlByDate[t.date] ?? 0) + t.pnl;
  }

  // ── Psychology–P&L correlation ────────────────────────────────────────────
  const correlation = checkins
    .filter((c) => pnlByDate[c.date] !== undefined)
    .map((c) => ({ date: c.date, score: c.score, pnl: pnlByDate[c.date], verdict: c.verdict }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Saved losses estimate ─────────────────────────────────────────────────
  const noTradeDates = checkins.filter((c) => c.verdict === "NO-TRADE").map((c) => c.date);
  const tradedOnNoTradeDay = noTradeDates.filter((d) => tradeEntries.some((t) => t.date === d));
  const respectedNoTrade = noTradeDates.filter((d) => !tradeEntries.some((t) => t.date === d));
  const lowScoreLossDays = correlation.filter((c) => c.score < 45 && c.pnl < 0);
  const avgLossAmount = lowScoreLossDays.length > 0
    ? Math.abs(lowScoreLossDays.reduce((s, c) => s + c.pnl, 0) / lowScoreLossDays.length) : 0;
  const estimatedSaved = Math.round(respectedNoTrade.length * avgLossAmount);

  // ── 90-day calendar heatmap ───────────────────────────────────────────────
  const checkinMap: Record<string, { score: number; verdict: string }> = {};
  for (const c of checkins) checkinMap[c.date] = { score: c.score, verdict: c.verdict };
  const calendarDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = checkinMap[dateStr];
    return { date: dateStr, score: entry?.score ?? null, verdict: entry?.verdict ?? null, pnl: pnlByDate[dateStr] ?? null };
  });

  // ── Journal stats (gross and net) ─────────────────────────────────────────
  const tradesWithPnl = tradeEntries.filter((t) => t.pnl !== null);
  const totalGrossPnl = tradeEntries.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const totalCommissions = tradeEntries.reduce((s, t) => s + (t.commission ?? 0), 0);
  const totalNetPnl = totalGrossPnl - totalCommissions;
  const winners = tradesWithPnl.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = tradesWithPnl.length > 0 ? Math.round((winners / tradesWithPnl.length) * 100) : null;

  // % return on starting balance
  const pctReturn = startingBalance && startingBalance > 0
    ? Math.round((totalNetPnl / startingBalance) * 10000) / 100 : null;

  // ── Score range performance ───────────────────────────────────────────────
  type RangeStats = { label: string; checkins: number; trades: number; winRate: number | null; avgPnl: number | null };
  function computeRangeStats(label: string, dates: Set<string>): RangeStats {
    const rangeTrades = tradeEntries.filter((t) => dates.has(t.date));
    const rangeTradesWithPnl = rangeTrades.filter((t) => t.pnl !== null);
    const rangeWinners = rangeTradesWithPnl.filter((t) => (t.pnl ?? 0) > 0).length;
    return {
      label,
      checkins: dates.size,
      trades: rangeTrades.length,
      winRate: rangeTradesWithPnl.length > 0 ? Math.round((rangeWinners / rangeTradesWithPnl.length) * 100) : null,
      avgPnl: rangeTradesWithPnl.length > 0
        ? Math.round((rangeTradesWithPnl.reduce((s, t) => s + (t.pnl ?? 0), 0) / rangeTradesWithPnl.length) * 100) / 100 : null,
    };
  }
  const highDates = new Set(checkins.filter((c) => c.score >= 70).map((c) => c.date));
  const midDates  = new Set(checkins.filter((c) => c.score >= 45 && c.score < 70).map((c) => c.date));
  const lowDates  = new Set(checkins.filter((c) => c.score < 45).map((c) => c.date));
  const scoreRangePerformance = {
    high: computeRangeStats("GO (70+)", highDates),
    mid:  computeRangeStats("CAUTION (45–69)", midDates),
    low:  computeRangeStats("NO-TRADE (<45)", lowDates),
  };

  // ── Day of week analysis ──────────────────────────────────────────────────
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const byDayOfWeek = DAY_NAMES.map((day, idx) => {
    const dayNum = idx + 1;
    const dayCheckins = checkins.filter((c) => new Date(c.date + "T12:00:00").getDay() === dayNum);
    const dayTrades = tradeEntries.filter((t) => new Date(t.date + "T12:00:00").getDay() === dayNum);
    const dayTradesWithPnl = dayTrades.filter((t) => t.pnl !== null);
    const dayWinners = dayTradesWithPnl.filter((t) => (t.pnl ?? 0) > 0).length;
    return {
      day,
      avgScore: dayCheckins.length > 0 ? Math.round(dayCheckins.reduce((s, c) => s + c.score, 0) / dayCheckins.length) : null,
      trades: dayTrades.length,
      winRate: dayTradesWithPnl.length > 0 ? Math.round((dayWinners / dayTradesWithPnl.length) * 100) : null,
      avgPnl: dayTradesWithPnl.length > 0
        ? Math.round((dayTradesWithPnl.reduce((s, t) => s + (t.pnl ?? 0), 0) / dayTradesWithPnl.length) * 100) / 100 : null,
    };
  });

  // ── Behavioral patterns ───────────────────────────────────────────────────
  const tradesByDate: Record<string, typeof tradeEntries> = {};
  for (const t of tradeEntries) {
    if (!tradesByDate[t.date]) tradesByDate[t.date] = [];
    tradesByDate[t.date].push(t);
  }
  let revengeTradingDays = 0;
  for (const [, dayTrades] of Object.entries(tradesByDate)) {
    const ordered = [...dayTrades].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (ordered.length >= 2 && (ordered[0].pnl ?? 0) < 0) revengeTradingDays++;
  }
  const fomoCount = tradeEntries.filter((t) => t.emotionBefore === 5 && (t.pnl ?? 0) < 0).length;
  const overtradingDaysCount = Object.values(tradesByDate).filter((ts) => ts.length >= 4).length;
  const behavioralPatterns = {
    revengeTrading: {
      detected: revengeTradingDays > 0,
      days: revengeTradingDays,
      description: revengeTradingDays > 0
        ? `You traded again after a loss on ${revengeTradingDays} ${revengeTradingDays === 1 ? "day" : "days"} — revenge trading risk.`
        : "No revenge trading detected.",
    },
    fomoTrades: { detected: fomoCount > 0, count: fomoCount },
    overtradingDays: { detected: overtradingDaysCount > 0, days: overtradingDaysCount },
  };

  // ── Playbook compliance ───────────────────────────────────────────────────
  const recapsWithPlaybook = recaps.filter((r) => r.playbookScore !== null);
  const playbookCompliance = recapsWithPlaybook.length > 0 ? {
    followed: recapsWithPlaybook.filter((r) => r.playbookScore === 0).length,
    mostly: recapsWithPlaybook.filter((r) => r.playbookScore === 1).length,
    ignored: recapsWithPlaybook.filter((r) => r.playbookScore === 2).length,
    total: recapsWithPlaybook.length,
    followRate: Math.round((recapsWithPlaybook.filter((r) => r.playbookScore === 0).length / recapsWithPlaybook.length) * 100),
  } : null;

  const recapPnlTrend = recaps
    .filter((r) => r.pnl !== null)
    .map((r) => { const c = checkins.find((c) => c.date === r.date); return { date: r.date, pnl: r.pnl!, score: c?.score ?? null }; })
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Time of day ───────────────────────────────────────────────────────────
  const hourMap: Record<number, { pnl: number; trades: number; wins: number }> = {};
  for (const t of tradeEntries) {
    const timeStr = t.exitTime ?? t.entryTime ?? null;
    if (!timeStr) continue;
    const hour = new Date(timeStr).getUTCHours();
    if (!hourMap[hour]) hourMap[hour] = { pnl: 0, trades: 0, wins: 0 };
    hourMap[hour].trades++;
    if (t.pnl !== null) { hourMap[hour].pnl += t.pnl; if (t.pnl > 0) hourMap[hour].wins++; }
  }
  const timeOfDay = Array.from({ length: 24 }, (_, h) => {
    const b = hourMap[h];
    return { hour: h, pnl: b ? Math.round(b.pnl * 100) / 100 : 0, trades: b?.trades ?? 0, winRate: b && b.trades > 0 ? Math.round((b.wins / b.trades) * 100) : null };
  }).filter((h) => h.trades > 0);

  // ── Symbol performance ────────────────────────────────────────────────────
  const symbolMap: Record<string, { pnl: number; trades: number; wins: number; rSum: number; rCount: number }> = {};
  for (const t of tradeEntries) {
    const sym = t.symbol ?? "UNKNOWN";
    if (!symbolMap[sym]) symbolMap[sym] = { pnl: 0, trades: 0, wins: 0, rSum: 0, rCount: 0 };
    symbolMap[sym].trades++;
    if (t.pnl !== null) { symbolMap[sym].pnl += t.pnl; if (t.pnl > 0) symbolMap[sym].wins++; }
    if (t.rMultiple !== null) { symbolMap[sym].rSum += t.rMultiple; symbolMap[sym].rCount++; }
  }
  const symbols = Object.entries(symbolMap)
    .map(([symbol, s]) => ({
      symbol, trades: s.trades,
      winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : null,
      avgPnl: s.trades > 0 ? Math.round((s.pnl / s.trades) * 100) / 100 : null,
      totalPnl: Math.round(s.pnl * 100) / 100,
      avgR: s.rCount > 0 ? Math.round((s.rSum / s.rCount) * 100) / 100 : null,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);

  // ── Monthly P&L breakdown ─────────────────────────────────────────────────
  const monthMap: Record<string, { pnl: number; trades: number; wins: number; commissions: number }> = {};
  for (const t of tradeEntries) {
    const month = t.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { pnl: 0, trades: 0, wins: 0, commissions: 0 };
    monthMap[month].trades++;
    if (t.pnl !== null) { monthMap[month].pnl += t.pnl; if (t.pnl > 0) monthMap[month].wins++; }
    monthMap[month].commissions += t.commission ?? 0;
  }
  const monthlyStats = Object.entries(monthMap)
    .map(([month, m]) => ({
      month,
      label: new Date(month + "-15").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      totalPnl: Math.round(m.pnl * 100) / 100,
      netPnl: Math.round((m.pnl - m.commissions) * 100) / 100,
      commissions: Math.round(m.commissions * 100) / 100,
      trades: m.trades,
      winRate: m.trades > 0 ? Math.round((m.wins / m.trades) * 100) : null,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // ── Setup (ICT/SMC) performance ───────────────────────────────────────────
  const setupMap: Record<string, { pnl: number; trades: number; wins: number; rSum: number; rCount: number; durations: number[]; maeArr: number[]; mfeArr: number[]; effArr: number[] }> = {};
  for (const t of tradeEntries) {
    if (!t.ictSetups) continue;
    let tags: string[] = [];
    try { tags = JSON.parse(t.ictSetups) as string[]; } catch { continue; }
    for (const setup of tags) {
      if (!setupMap[setup]) setupMap[setup] = { pnl: 0, trades: 0, wins: 0, rSum: 0, rCount: 0, durations: [], maeArr: [], mfeArr: [], effArr: [] };
      setupMap[setup].trades++;
      if (t.pnl !== null) { setupMap[setup].pnl += t.pnl; if (t.pnl > 0) setupMap[setup].wins++; }
      if (t.rMultiple !== null) { setupMap[setup].rSum += t.rMultiple; setupMap[setup].rCount++; }
      if (t.duration !== null) setupMap[setup].durations.push(t.duration);
      if ((t as { mae?: number | null }).mae !== null && (t as { mae?: number | null }).mae !== undefined) setupMap[setup].maeArr.push((t as { mae: number }).mae);
      if ((t as { mfe?: number | null }).mfe !== null && (t as { mfe?: number | null }).mfe !== undefined) {
        setupMap[setup].mfeArr.push((t as { mfe: number }).mfe);
        if (t.pnl !== null && (t as { mfe: number }).mfe > 0) {
          setupMap[setup].effArr.push(t.pnl / (t as { mfe: number }).mfe);
        }
      }
    }
  }
  const setups = Object.entries(setupMap).map(([setup, s]) => ({
    setup, trades: s.trades,
    winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : null,
    avgPnl: s.trades > 0 ? Math.round((s.pnl / s.trades) * 100) / 100 : null,
    totalPnl: Math.round(s.pnl * 100) / 100,
    avgR: s.rCount > 0 ? Math.round((s.rSum / s.rCount) * 100) / 100 : null,
    avgDurationMin: s.durations.length > 0 ? Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length / 60) : null,
    avgMae: s.maeArr.length > 0 ? Math.round(s.maeArr.reduce((a, b) => a + b, 0) / s.maeArr.length * 100) / 100 : null,
    avgMfe: s.mfeArr.length > 0 ? Math.round(s.mfeArr.reduce((a, b) => a + b, 0) / s.mfeArr.length * 100) / 100 : null,
    avgEfficiency: s.effArr.length > 0 ? Math.round(s.effArr.reduce((a, b) => a + b, 0) / s.effArr.length * 100) : null,
  })).sort((a, b) => b.totalPnl - a.totalPnl);

  // ── Tag performance ───────────────────────────────────────────────────────
  const tagMap: Record<string, { pnl: number; trades: number; wins: number }> = {};
  for (const t of tradeEntries) {
    if (!t.tags) continue;
    let tagList: string[] = [];
    try { tagList = JSON.parse(t.tags) as string[]; } catch { continue; }
    for (const tag of tagList) {
      if (!tagMap[tag]) tagMap[tag] = { pnl: 0, trades: 0, wins: 0 };
      tagMap[tag].trades++;
      if (t.pnl !== null) { tagMap[tag].pnl += t.pnl; if (t.pnl > 0) tagMap[tag].wins++; }
    }
  }
  const tagStats = Object.entries(tagMap)
    .map(([tag, s]) => ({
      tag, trades: s.trades,
      winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : null,
      avgPnl: s.trades > 0 ? Math.round((s.pnl / s.trades) * 100) / 100 : null,
      totalPnl: Math.round(s.pnl * 100) / 100,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);

  // ── Mistake performance ───────────────────────────────────────────────────
  const mistakeMap: Record<string, { pnl: number; trades: number; wins: number }> = {};
  for (const t of tradeEntries) {
    const m = t.mistake?.trim();
    if (!m) continue;
    if (!mistakeMap[m]) mistakeMap[m] = { pnl: 0, trades: 0, wins: 0 };
    mistakeMap[m].trades++;
    if (t.pnl !== null) { mistakeMap[m].pnl += t.pnl; if (t.pnl > 0) mistakeMap[m].wins++; }
  }
  const mistakeStats = Object.entries(mistakeMap)
    .map(([mistake, s]) => ({
      mistake, trades: s.trades,
      winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : null,
      avgPnl: s.trades > 0 ? Math.round((s.pnl / s.trades) * 100) / 100 : null,
      totalPnl: Math.round(s.pnl * 100) / 100,
    }))
    .sort((a, b) => a.totalPnl - b.totalPnl); // worst first

  // ── Equity curve ──────────────────────────────────────────────────────────
  const dailyPnlMap: Record<string, number> = {};
  for (const t of tradeEntries) {
    if (t.pnl !== null) dailyPnlMap[t.date] = (dailyPnlMap[t.date] ?? 0) + t.pnl;
  }
  const equityDates = Object.keys(dailyPnlMap).sort();
  let cumPnl = 0;
  const equityCurve = equityDates.map((date) => {
    cumPnl += dailyPnlMap[date];
    return { date, dailyPnl: Math.round(dailyPnlMap[date] * 100) / 100, cumPnl: Math.round(cumPnl * 100) / 100 };
  });

  // ── Profit metrics ────────────────────────────────────────────────────────
  const pnlTrades = tradesWithPnl.map((t) => t.pnl!);
  const winPnls = pnlTrades.filter((p) => p > 0);
  const lossPnls = pnlTrades.filter((p) => p < 0);
  const grossProfit = winPnls.reduce((s, p) => s + p, 0);
  const grossLoss = Math.abs(lossPnls.reduce((s, p) => s + p, 0));
  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : null;
  const avgWin = winPnls.length > 0 ? Math.round((grossProfit / winPnls.length) * 100) / 100 : null;
  const avgLossTrade = lossPnls.length > 0 ? Math.round((grossLoss / lossPnls.length) * 100) / 100 : null;
  const winRate2 = pnlTrades.length > 0 ? winPnls.length / pnlTrades.length : 0;
  const lossRate = 1 - winRate2;
  const expectancy = avgWin !== null && avgLossTrade !== null
    ? Math.round((avgWin * winRate2 - avgLossTrade * lossRate) * 100) / 100 : null;

  // ── Current win/loss streak (from most recent trades) ────────────────────
  const tradesByDateAsc = [...tradesWithPnl].sort((a, b) => {
    const aTime = (a.entryTime ?? a.date) as string;
    const bTime = (b.entryTime ?? b.date) as string;
    return aTime.localeCompare(bTime);
  });
  let currentWinStreak = 0, currentLoseStreak = 0;
  for (let i = tradesByDateAsc.length - 1; i >= 0; i--) {
    const p = tradesByDateAsc[i].pnl!;
    if (i === tradesByDateAsc.length - 1) {
      if (p > 0) { currentWinStreak = 1; currentLoseStreak = 0; }
      else if (p < 0) { currentLoseStreak = 1; currentWinStreak = 0; }
    } else {
      const lastP = tradesByDateAsc[i + 1].pnl!;
      if (lastP > 0 && p > 0) currentWinStreak++;
      else if (lastP < 0 && p < 0) currentLoseStreak++;
      else break;
    }
  }

  // ── Max streaks ───────────────────────────────────────────────────────────
  let maxWinStreak = 0, maxLoseStreak = 0, curWin = 0, curLose = 0;
  for (const p of pnlTrades) {
    if (p > 0) { curWin++; curLose = 0; maxWinStreak = Math.max(maxWinStreak, curWin); }
    else if (p < 0) { curLose++; curWin = 0; maxLoseStreak = Math.max(maxLoseStreak, curLose); }
    else { curWin = 0; curLose = 0; }
  }

  // ── Consecutive profitable days ───────────────────────────────────────────
  const profitableDays = new Set(Object.entries(pnlByDate).filter(([, p]) => p > 0).map(([d]) => d));
  let profitableDayStreak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (profitableDays.has(ds)) profitableDayStreak++;
    else if (i > 0) break; // only break after day 0 (today might not have trades yet)
  }
  if (!profitableDays.has(todayStr)) profitableDayStreak = 0; // reset if today not profitable

  // ── Avg R-multiple ────────────────────────────────────────────────────────
  const rTrades = tradeEntries.filter((t) => t.rMultiple !== null);
  const avgRMultiple = rTrades.length > 0
    ? Math.round((rTrades.reduce((s, t) => s + t.rMultiple!, 0) / rTrades.length) * 100) / 100 : null;

  // ── Max drawdown ──────────────────────────────────────────────────────────
  let peak = 0, maxDrawdown = 0, runningPnl = 0;
  for (const date of equityDates) {
    runningPnl += dailyPnlMap[date];
    if (runningPnl > peak) peak = runningPnl;
    const dd = peak - runningPnl;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // ── Advanced risk metrics ─────────────────────────────────────────────────
  const dailyReturns = equityDates.map((d) => dailyPnlMap[d]);
  let sharpeRatio: number | null = null;
  let sortinoRatio: number | null = null;
  if (dailyReturns.length >= 5) {
    const meanReturn = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((s, r) => s + Math.pow(r - meanReturn, 2), 0) / dailyReturns.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 0) sharpeRatio = Math.round((meanReturn / stdDev) * Math.sqrt(252) * 100) / 100;
    const downside = dailyReturns.filter((r) => r < 0);
    const downsideVariance = downside.reduce((s, r) => s + Math.pow(r, 2), 0) / Math.max(downside.length, 1);
    const downsideStd = Math.sqrt(downsideVariance);
    if (downsideStd > 0) sortinoRatio = Math.round((meanReturn / downsideStd) * Math.sqrt(252) * 100) / 100;
  }

  // ── Trade duration analytics ──────────────────────────────────────────────
  const durationBuckets = [
    { label: "Scalp (<5m)",    minSec: 0,   maxSec: 300    },
    { label: "Short (5–30m)",  minSec: 300, maxSec: 1800   },
    { label: "Medium (30m–2h)", minSec: 1800, maxSec: 7200  },
    { label: "Long (2h+)",     minSec: 7200, maxSec: Infinity },
  ];
  const durationMap: Record<string, { pnl: number; trades: number; wins: number }> = {};
  for (const { label } of durationBuckets) durationMap[label] = { pnl: 0, trades: 0, wins: 0 };
  let unknownDuration = 0;
  for (const t of tradeEntries) {
    if (t.duration === null) { unknownDuration++; continue; }
    const bucket = durationBuckets.find((b) => t.duration! >= b.minSec && t.duration! < b.maxSec);
    if (!bucket) continue;
    durationMap[bucket.label].trades++;
    if (t.pnl !== null) { durationMap[bucket.label].pnl += t.pnl; if (t.pnl > 0) durationMap[bucket.label].wins++; }
  }
  const durationStats = durationBuckets.map(({ label }) => {
    const b = durationMap[label];
    return {
      label, trades: b.trades,
      winRate: b.trades > 0 ? Math.round((b.wins / b.trades) * 100) : null,
      avgPnl: b.trades > 0 ? Math.round((b.pnl / b.trades) * 100) / 100 : null,
      totalPnl: Math.round(b.pnl * 100) / 100,
    };
  }).filter((b) => b.trades > 0);

  // ── Session performance (asian / london / new_york / overlap) ────────────
  const SESSION_LABELS: Record<string, string> = { asian: "Asian", london: "London", new_york: "New York", overlap_london_ny: "Overlap (Lon/NY)" };
  const sessionMap: Record<string, { pnl: number; trades: number; wins: number; rSum: number; rCount: number }> = {};
  for (const t of tradeEntries) {
    const s = (t as { sessionType?: string | null }).sessionType;
    if (!s) continue;
    if (!sessionMap[s]) sessionMap[s] = { pnl: 0, trades: 0, wins: 0, rSum: 0, rCount: 0 };
    sessionMap[s].trades++;
    if (t.pnl !== null) { sessionMap[s].pnl += t.pnl; if (t.pnl > 0) sessionMap[s].wins++; }
    if (t.rMultiple !== null) { sessionMap[s].rSum += t.rMultiple; sessionMap[s].rCount++; }
  }
  const sessionPerformance = Object.entries(sessionMap).map(([session, s]) => ({
    session,
    label: SESSION_LABELS[session] ?? session,
    trades: s.trades,
    winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : null,
    avgPnl: s.trades > 0 ? Math.round((s.pnl / s.trades) * 100) / 100 : null,
    totalPnl: Math.round(s.pnl * 100) / 100,
    avgR: s.rCount > 0 ? Math.round((s.rSum / s.rCount) * 100) / 100 : null,
  })).sort((a, b) => b.totalPnl - a.totalPnl);

  // ── Confidence level performance (1–10 buckets low/med/high) ────────────
  const confMap: Record<string, { pnl: number; trades: number; wins: number }> = { low: { pnl: 0, trades: 0, wins: 0 }, medium: { pnl: 0, trades: 0, wins: 0 }, high: { pnl: 0, trades: 0, wins: 0 } };
  for (const t of tradeEntries) {
    const c = (t as { confidence?: number | null }).confidence;
    if (c === null || c === undefined) continue;
    const bucket = c <= 3 ? "low" : c <= 6 ? "medium" : "high";
    confMap[bucket].trades++;
    if (t.pnl !== null) { confMap[bucket].pnl += t.pnl; if (t.pnl > 0) confMap[bucket].wins++; }
  }
  const confidencePerformance = Object.entries(confMap).map(([level, s]) => ({
    level, trades: s.trades,
    winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : null,
    avgPnl: s.trades > 0 ? Math.round((s.pnl / s.trades) * 100) / 100 : null,
    totalPnl: Math.round(s.pnl * 100) / 100,
  }));

  // ── Market condition performance ─────────────────────────────────────────
  const condMap: Record<string, { pnl: number; trades: number; wins: number }> = {};
  for (const t of tradeEntries) {
    const mc = (t as { marketCondition?: string | null }).marketCondition;
    if (!mc) continue;
    if (!condMap[mc]) condMap[mc] = { pnl: 0, trades: 0, wins: 0 };
    condMap[mc].trades++;
    if (t.pnl !== null) { condMap[mc].pnl += t.pnl; if (t.pnl > 0) condMap[mc].wins++; }
  }
  const marketConditionPerformance = Object.entries(condMap).map(([condition, s]) => ({
    condition, trades: s.trades,
    winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : null,
    avgPnl: s.trades > 0 ? Math.round((s.pnl / s.trades) * 100) / 100 : null,
    totalPnl: Math.round(s.pnl * 100) / 100,
  })).sort((a, b) => b.totalPnl - a.totalPnl);

  // ── Calmar ratio (annualized return / max drawdown) ───────────────────────
  let calmarRatio: number | null = null;
  if (maxDrawdown > 0 && equityDates.length >= 5) {
    const firstDate = new Date(equityDates[0]);
    const lastDate = new Date(equityDates[equityDates.length - 1]);
    const tradingDays = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / 86400000);
    const annualizedReturn = (totalNetPnl / tradingDays) * 252;
    calmarRatio = Math.round((annualizedReturn / maxDrawdown) * 100) / 100;
  }

  // ── Avg hold duration by hour of day ────────────────────────────────────
  const holdByHour: Record<number, { totalSec: number; count: number }> = {};
  for (const t of tradeEntries) {
    if (t.duration === null || t.duration === undefined) continue;
    const entryHour = t.entryTime ? new Date(t.entryTime).getHours() : (t.date ? new Date(t.date + "T12:00:00").getHours() : null);
    if (entryHour === null) continue;
    if (!holdByHour[entryHour]) holdByHour[entryHour] = { totalSec: 0, count: 0 };
    holdByHour[entryHour].totalSec += t.duration;
    holdByHour[entryHour].count++;
  }
  const avgHoldByHour = Object.entries(holdByHour)
    .map(([h, v]) => ({ hour: parseInt(h), avgSec: Math.round(v.totalSec / v.count), trades: v.count }))
    .sort((a, b) => a.hour - b.hour);

  // ── Commission drain ─────────────────────────────────────────────────────
  const commissionDrainPct = totalGrossPnl !== 0
    ? Math.round((totalCommissions / Math.abs(totalGrossPnl)) * 10000) / 100
    : null;

  // ── Day of week (full 0–6) ────────────────────────────────────────────────
  const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowMap: Record<number, { pnl: number; trades: number; wins: number }> = {};
  for (const t of tradeEntries) {
    const dow = new Date(t.date + "T12:00:00").getDay();
    if (!dowMap[dow]) dowMap[dow] = { pnl: 0, trades: 0, wins: 0 };
    dowMap[dow].trades++;
    if (t.pnl !== null) { dowMap[dow].pnl += t.pnl; if (t.pnl > 0) dowMap[dow].wins++; }
  }
  const dayOfWeek = DOW_LABELS.map((label, day) => {
    const b = dowMap[day];
    return { day, label, pnl: b ? Math.round(b.pnl * 100) / 100 : 0, trades: b?.trades ?? 0, winRate: b && b.trades > 0 ? Math.round((b.wins / b.trades) * 100) : null };
  }).filter((d) => d.trades > 0);

  return Response.json({
    // ── Psychology ──
    totalCheckins: checkins.length,
    avgScore, avg30, currentStreak, longestStreak, disciplinePct,
    verdictCounts, scoreTrend, correlation, estimatedSaved,
    respectedNoTradeCount: respectedNoTrade.length,
    tradedOnNoTradeDayCount: tradedOnNoTradeDay.length,
    calendarDays, scoreRangePerformance, byDayOfWeek,
    behavioralPatterns, playbookCompliance, recapPnlTrend,
    // ── Trading ──
    totalPnl: Math.round(totalGrossPnl * 100) / 100,
    totalNetPnl: Math.round(totalNetPnl * 100) / 100,
    totalCommissions: Math.round(totalCommissions * 100) / 100,
    commissionDrainPct,
    winRate, totalTrades: tradeEntries.length,
    pctReturn, startingBalance,
    // ── Streaks ──
    currentWinStreak, currentLoseStreak,
    maxWinStreak, maxLoseStreak,
    profitableDayStreak,
    // ── Charts & tables ──
    timeOfDay, dayOfWeek, symbols, setups, monthlyStats,
    equityCurve, durationStats, tagStats, mistakeStats, avgHoldByHour,
    // ── Risk metrics ──
    profitFactor, expectancy, avgWin,
    avgLoss: avgLossTrade,
    avgRMultiple,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio, sortinoRatio, calmarRatio,
    // ── Session / context breakdowns ──
    sessionPerformance, confidencePerformance, marketConditionPerformance,
    // ── Meta ──
    filtered: !!(startDate || endDate),
    filterStartDate: startDate,
    filterEndDate: endDate,
  });
  } catch (err) {
    logger.error("Analytics GET failed", err, { userId });
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
