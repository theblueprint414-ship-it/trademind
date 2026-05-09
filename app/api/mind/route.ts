import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const userId = auth.userId;

  const [checkins, tradeEntries] = await Promise.all([
    db.checkin.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 90,
      select: {
        date: true, score: true, verdict: true,
        sleepQuality: true, sleepHours: true,
        caffeineLevel: true, alcoholLast24h: true, exerciseToday: true,
        readinessScore: true,
      },
    }),
    db.tradeEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 500,
      select: { date: true, pnl: true, emotionBefore: true, emotionAfter: true, side: true },
    }),
  ]);

  // Build date → daily P&L map
  const dailyPnl: Record<string, number> = {};
  const dailyTrades: Record<string, number> = {};
  const dailyWins: Record<string, number> = {};
  for (const t of tradeEntries) {
    if (t.pnl !== null) {
      dailyPnl[t.date] = (dailyPnl[t.date] ?? 0) + t.pnl;
      dailyTrades[t.date] = (dailyTrades[t.date] ?? 0) + 1;
      if (t.pnl > 0) dailyWins[t.date] = (dailyWins[t.date] ?? 0) + 1;
    }
  }

  // ── Sleep quality vs P&L buckets ─────────────────────────────────────────
  const sleepBuckets: Record<string, { pnl: number[]; count: number }> = {
    "1-3 (Poor)": { pnl: [], count: 0 },
    "4-6 (Fair)": { pnl: [], count: 0 },
    "7-8 (Good)": { pnl: [], count: 0 },
    "9-10 (Great)": { pnl: [], count: 0 },
  };
  for (const c of checkins) {
    if (c.sleepQuality === null) continue;
    const pnl = dailyPnl[c.date] ?? null;
    if (pnl === null) continue;
    let bucket: string;
    if (c.sleepQuality <= 3) bucket = "1-3 (Poor)";
    else if (c.sleepQuality <= 6) bucket = "4-6 (Fair)";
    else if (c.sleepQuality <= 8) bucket = "7-8 (Good)";
    else bucket = "9-10 (Great)";
    sleepBuckets[bucket].pnl.push(pnl);
    sleepBuckets[bucket].count++;
  }
  const sleepVsPnl = Object.entries(sleepBuckets).map(([label, { pnl, count }]) => ({
    label,
    count,
    avgPnl: count > 0 ? Math.round(pnl.reduce((s, v) => s + v, 0) / count) : null,
    winRate: count > 0 ? Math.round((pnl.filter((v) => v > 0).length / count) * 100) : null,
  }));

  // ── Mental score vs P&L scatter (each day with both) ─────────────────────
  const scoreVsPnl: { date: string; score: number; pnl: number; verdict: string }[] = [];
  for (const c of checkins) {
    const pnl = dailyPnl[c.date];
    if (pnl !== undefined) {
      scoreVsPnl.push({ date: c.date, score: c.score, pnl, verdict: c.verdict });
    }
  }

  // ── Caffeine vs P&L ───────────────────────────────────────────────────────
  const cafBuckets: Record<string, { pnl: number[]; count: number }> = {
    none: { pnl: [], count: 0 },
    low: { pnl: [], count: 0 },
    medium: { pnl: [], count: 0 },
    high: { pnl: [], count: 0 },
  };
  for (const c of checkins) {
    const key = c.caffeineLevel ?? "none";
    if (!(key in cafBuckets)) continue;
    const pnl = dailyPnl[c.date] ?? null;
    if (pnl === null) continue;
    cafBuckets[key].pnl.push(pnl);
    cafBuckets[key].count++;
  }
  const caffeineVsPnl = (["none", "low", "medium", "high"] as const).map((lvl) => {
    const { pnl, count } = cafBuckets[lvl];
    return {
      label: lvl.charAt(0).toUpperCase() + lvl.slice(1),
      count,
      avgPnl: count > 0 ? Math.round(pnl.reduce((s, v) => s + v, 0) / count) : null,
      winRate: count > 0 ? Math.round((pnl.filter((v) => v > 0).length / count) * 100) : null,
    };
  });

  // ── Exercise vs no exercise ───────────────────────────────────────────────
  const exBuckets = { yes: { pnl: [] as number[], count: 0 }, no: { pnl: [] as number[], count: 0 } };
  for (const c of checkins) {
    if (c.exerciseToday === null) continue;
    const pnl = dailyPnl[c.date] ?? null;
    if (pnl === null) continue;
    const key = c.exerciseToday ? "yes" : "no";
    exBuckets[key].pnl.push(pnl);
    exBuckets[key].count++;
  }
  const exerciseVsPnl = (["yes", "no"] as const).map((k) => {
    const { pnl, count } = exBuckets[k];
    return {
      label: k === "yes" ? "Exercised" : "No Exercise",
      count,
      avgPnl: count > 0 ? Math.round(pnl.reduce((s, v) => s + v, 0) / count) : null,
      winRate: count > 0 ? Math.round((pnl.filter((v) => v > 0).length / count) * 100) : null,
    };
  });

  // ── Alcohol vs no alcohol ─────────────────────────────────────────────────
  const alcBuckets = { yes: { pnl: [] as number[], count: 0 }, no: { pnl: [] as number[], count: 0 } };
  for (const c of checkins) {
    if (c.alcoholLast24h === null) continue;
    const pnl = dailyPnl[c.date] ?? null;
    if (pnl === null) continue;
    const key = c.alcoholLast24h ? "yes" : "no";
    alcBuckets[key].pnl.push(pnl);
    alcBuckets[key].count++;
  }
  const alcoholVsPnl = (["yes", "no"] as const).map((k) => {
    const { pnl, count } = alcBuckets[k];
    return {
      label: k === "yes" ? "Alcohol Last 24h" : "No Alcohol",
      count,
      avgPnl: count > 0 ? Math.round(pnl.reduce((s, v) => s + v, 0) / count) : null,
      winRate: count > 0 ? Math.round((pnl.filter((v) => v > 0).length / count) * 100) : null,
    };
  });

  // ── Mental score buckets vs win rate ─────────────────────────────────────
  const scoreBuckets = {
    "0-44 (NO-TRADE)": { pnl: [] as number[], count: 0 },
    "45-69 (CAUTION)": { pnl: [] as number[], count: 0 },
    "70-100 (GO)": { pnl: [] as number[], count: 0 },
  };
  for (const c of checkins) {
    const pnl = dailyPnl[c.date] ?? null;
    if (pnl === null) continue;
    let bucket: keyof typeof scoreBuckets;
    if (c.score < 45) bucket = "0-44 (NO-TRADE)";
    else if (c.score < 70) bucket = "45-69 (CAUTION)";
    else bucket = "70-100 (GO)";
    scoreBuckets[bucket].pnl.push(pnl);
    scoreBuckets[bucket].count++;
  }
  const mentalVsWinRate = Object.entries(scoreBuckets).map(([label, { pnl, count }]) => ({
    label,
    count,
    avgPnl: count > 0 ? Math.round(pnl.reduce((s, v) => s + v, 0) / count) : null,
    winRate: count > 0 ? Math.round((pnl.filter((v) => v > 0).length / count) * 100) : null,
  }));

  // ── Sleep hours vs performance ────────────────────────────────────────────
  const sleepHrsBuckets: Record<string, { pnl: number[]; count: number }> = {
    "< 5h": { pnl: [], count: 0 },
    "5-6h": { pnl: [], count: 0 },
    "7-8h": { pnl: [], count: 0 },
    "> 8h": { pnl: [], count: 0 },
  };
  for (const c of checkins) {
    if (c.sleepHours === null) continue;
    const pnl = dailyPnl[c.date] ?? null;
    if (pnl === null) continue;
    let bucket: string;
    if (c.sleepHours < 5) bucket = "< 5h";
    else if (c.sleepHours < 7) bucket = "5-6h";
    else if (c.sleepHours <= 8) bucket = "7-8h";
    else bucket = "> 8h";
    sleepHrsBuckets[bucket].pnl.push(pnl);
    sleepHrsBuckets[bucket].count++;
  }
  const sleepHrsVsPnl = (["< 5h", "5-6h", "7-8h", "> 8h"] as const).map((label) => {
    const { pnl, count } = sleepHrsBuckets[label];
    return {
      label,
      count,
      avgPnl: count > 0 ? Math.round(pnl.reduce((s, v) => s + v, 0) / count) : null,
      winRate: count > 0 ? Math.round((pnl.filter((v) => v > 0).length / count) * 100) : null,
    };
  });

  // ── Key insights (auto-generated text) ───────────────────────────────────
  const insights: string[] = [];

  const sleepHighAvgPnl = sleepVsPnl.find((b) => b.label === "9-10 (Great)")?.avgPnl;
  const sleepLowAvgPnl = sleepVsPnl.find((b) => b.label === "1-3 (Poor)")?.avgPnl;
  if (sleepHighAvgPnl !== null && sleepLowAvgPnl !== null && sleepHighAvgPnl !== undefined && sleepLowAvgPnl !== undefined) {
    const diff = sleepHighAvgPnl - sleepLowAvgPnl;
    if (Math.abs(diff) > 50) {
      insights.push(`Great sleep nights earn you ${diff > 0 ? "+" : ""}$${diff} more per day vs poor sleep nights.`);
    }
  }

  const exYes = exerciseVsPnl.find((b) => b.label === "Exercised");
  const exNo = exerciseVsPnl.find((b) => b.label === "No Exercise");
  if (exYes?.avgPnl !== null && exNo?.avgPnl !== null && exYes?.count && exNo?.count) {
    const diff = (exYes!.avgPnl ?? 0) - (exNo!.avgPnl ?? 0);
    if (Math.abs(diff) > 30) {
      insights.push(`Exercise days average ${diff > 0 ? "+" : ""}$${diff} vs rest days.`);
    }
  }

  const cafHigh = caffeineVsPnl.find((b) => b.label === "High");
  const cafNone = caffeineVsPnl.find((b) => b.label === "None");
  if (cafHigh?.avgPnl !== null && cafNone?.avgPnl !== null && cafHigh?.count && cafNone?.count) {
    const diff = (cafNone!.avgPnl ?? 0) - (cafHigh!.avgPnl ?? 0);
    if (diff > 30) {
      insights.push(`No-caffeine days outperform high-caffeine days by $${diff} on average.`);
    } else if (diff < -30) {
      insights.push(`High-caffeine days actually perform $${Math.abs(diff)} better than no-caffeine days.`);
    }
  }

  const alcYes = alcoholVsPnl.find((b) => b.label === "Alcohol Last 24h");
  if (alcYes?.avgPnl !== null && alcYes?.count && (alcYes?.avgPnl ?? 0) < 0) {
    insights.push(`Alcohol in the last 24h correlates with losing days (avg: $${alcYes!.avgPnl}).`);
  }

  if (insights.length === 0) {
    insights.push("Log more days with lifestyle data to unlock personalized pattern insights.");
  }

  return Response.json({
    sleepVsPnl,
    sleepHrsVsPnl,
    caffeineVsPnl,
    exerciseVsPnl,
    alcoholVsPnl,
    mentalVsWinRate,
    scoreVsPnl,
    insights,
    totalDays: checkins.length,
    daysWithTrades: Object.keys(dailyPnl).length,
  });
}