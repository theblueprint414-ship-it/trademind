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

  const [checkins, tradeEntries, user, recaps] = await Promise.all([
    db.checkin.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 90 }),
    db.tradeEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 500 }),
    db.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    db.dailyRecap.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 90, select: { date: true, mood: true, pnl: true, playbookScore: true, lesson: true, tradesCount: true } }),
  ]);

  // ── Score trend (last 90 days, oldest-first for chart) ────────────────────
  const scoreTrend = [...checkins].reverse().map((c) => ({
    date: c.date,
    score: c.score,
    verdict: c.verdict,
  }));

  // ── Verdict breakdown ─────────────────────────────────────────────────────
  const verdictCounts = { GO: 0, CAUTION: 0, "NO-TRADE": 0 };
  for (const c of checkins) {
    if (c.verdict in verdictCounts) verdictCounts[c.verdict as keyof typeof verdictCounts]++;
  }

  // ── Streak calculation ────────────────────────────────────────────────────
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  const checkinDates = new Set(sorted.map((c) => c.date));

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];
  const hasCheckinToday = checkinDates.has(todayStr);

  // Current streak: start from today if checked in, else yesterday
  let currentStreak = 0;
  for (let i = hasCheckinToday ? 0 : 1; i < 365; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    if (checkinDates.has(d.toISOString().split("T")[0])) currentStreak++;
    else break;
  }

  // Longest streak: scan all 365 days
  let longestStreak = 0;
  let running = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    if (checkinDates.has(d.toISOString().split("T")[0])) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  // ── Discipline % ──────────────────────────────────────────────────────────
  const joinDate = user?.createdAt ?? new Date();
  const daysSinceJoin = Math.max(1, Math.ceil((Date.now() - new Date(joinDate).getTime()) / 86400000));
  const disciplinePct = Math.min(100, Math.round((checkins.length / Math.min(daysSinceJoin, 90)) * 100));

  // ── Average scores ────────────────────────────────────────────────────────
  const avgScore = checkins.length > 0
    ? Math.round(checkins.reduce((s, c) => s + c.score, 0) / checkins.length)
    : null;
  const last30 = checkins.slice(0, 30);
  const avg30 = last30.length > 0
    ? Math.round(last30.reduce((s, c) => s + c.score, 0) / last30.length)
    : null;

  // ── P&L grouping by date ──────────────────────────────────────────────────
  const pnlByDate: Record<string, number> = {};
  for (const t of tradeEntries) {
    if (t.pnl !== null && t.pnl !== undefined) {
      pnlByDate[t.date] = (pnlByDate[t.date] ?? 0) + t.pnl;
    }
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
  const avgLoss = lowScoreLossDays.length > 0
    ? Math.abs(lowScoreLossDays.reduce((s, c) => s + c.pnl, 0) / lowScoreLossDays.length)
    : 0;
  const estimatedSaved = Math.round(respectedNoTrade.length * avgLoss);

  // ── 90-day calendar heatmap ───────────────────────────────────────────────
  const checkinMap: Record<string, { score: number; verdict: string }> = {};
  for (const c of checkins) checkinMap[c.date] = { score: c.score, verdict: c.verdict };

  const calendarDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = checkinMap[dateStr];
    return {
      date: dateStr,
      score: entry?.score ?? null,
      verdict: entry?.verdict ?? null,
      pnl: pnlByDate[dateStr] ?? null,
    };
  });

  // ── Journal stats ─────────────────────────────────────────────────────────
  const totalPnl = tradeEntries.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const tradesWithPnl = tradeEntries.filter((t) => t.pnl !== null);
  const winners = tradesWithPnl.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = tradesWithPnl.length > 0 ? Math.round((winners / tradesWithPnl.length) * 100) : null;

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
        ? Math.round((rangeTradesWithPnl.reduce((s, t) => s + (t.pnl ?? 0), 0) / rangeTradesWithPnl.length) * 100) / 100
        : null,
    };
  }

  const highDates = new Set(checkins.filter((c) => c.score >= 70).map((c) => c.date));
  const midDates = new Set(checkins.filter((c) => c.score >= 45 && c.score < 70).map((c) => c.date));
  const lowDates = new Set(checkins.filter((c) => c.score < 45).map((c) => c.date));

  const scoreRangePerformance = {
    high: computeRangeStats("GO (70+)", highDates),
    mid: computeRangeStats("CAUTION (45–69)", midDates),
    low: computeRangeStats("NO-TRADE (<45)", lowDates),
  };

  // ── Day of week analysis (Mon–Fri only) ───────────────────────────────────
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const byDayOfWeek = DAY_NAMES.map((day, idx) => {
    const dayNum = idx + 1; // 1=Mon … 5=Fri
    const dayCheckins = checkins.filter((c) => new Date(c.date + "T12:00:00").getDay() === dayNum);
    const dayTrades = tradeEntries.filter((t) => new Date(t.date + "T12:00:00").getDay() === dayNum);
    const dayTradesWithPnl = dayTrades.filter((t) => t.pnl !== null);
    const dayWinners = dayTradesWithPnl.filter((t) => (t.pnl ?? 0) > 0).length;
    return {
      day,
      avgScore: dayCheckins.length > 0
        ? Math.round(dayCheckins.reduce((s, c) => s + c.score, 0) / dayCheckins.length)
        : null,
      trades: dayTrades.length,
      winRate: dayTradesWithPnl.length > 0 ? Math.round((dayWinners / dayTradesWithPnl.length) * 100) : null,
      avgPnl: dayTradesWithPnl.length > 0
        ? Math.round((dayTradesWithPnl.reduce((s, t) => s + (t.pnl ?? 0), 0) / dayTradesWithPnl.length) * 100) / 100
        : null,
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
    if (ordered.length >= 2 && (ordered[0].pnl ?? 0) < 0) {
      revengeTradingDays++;
    }
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
    fomoTrades: {
      detected: fomoCount > 0,
      count: fomoCount,
    },
    overtradingDays: {
      detected: overtradingDaysCount > 0,
      days: overtradingDaysCount,
    },
  };

  // ── Playbook compliance from recaps ──────────────────────────────────────
  const recapsWithPlaybook = recaps.filter((r) => r.playbookScore !== null);
  const playbookCompliance = recapsWithPlaybook.length > 0
    ? {
        followed: recapsWithPlaybook.filter((r) => r.playbookScore === 0).length,
        mostly: recapsWithPlaybook.filter((r) => r.playbookScore === 1).length,
        ignored: recapsWithPlaybook.filter((r) => r.playbookScore === 2).length,
        total: recapsWithPlaybook.length,
        followRate: Math.round(
          (recapsWithPlaybook.filter((r) => r.playbookScore === 0).length / recapsWithPlaybook.length) * 100
        ),
      }
    : null;

  // ── Recap P&L vs checkin score correlation ────────────────────────────────
  const recapPnlTrend = recaps
    .filter((r) => r.pnl !== null)
    .map((r) => {
      const checkin = checkins.find((c) => c.date === r.date);
      return { date: r.date, pnl: r.pnl!, score: checkin?.score ?? null };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return Response.json({
    totalCheckins: checkins.length,
    avgScore,
    avg30,
    currentStreak,
    longestStreak,
    disciplinePct,
    verdictCounts,
    scoreTrend,
    correlation,
    estimatedSaved,
    respectedNoTradeCount: respectedNoTrade.length,
    tradedOnNoTradeDayCount: tradedOnNoTradeDay.length,
    calendarDays,
    totalPnl: Math.round(totalPnl * 100) / 100,
    winRate,
    totalTrades: tradeEntries.length,
    scoreRangePerformance,
    byDayOfWeek,
    behavioralPatterns,
    playbookCompliance,
    recapPnlTrend,
  });
}