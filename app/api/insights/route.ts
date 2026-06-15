export const runtime = "nodejs";

import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

type Insight = {
  id: string;
  type: "positive" | "warning" | "info";
  title: string;
  body: string;
  value?: string;
  action?: string;
  actionHref?: string;
};

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "loose");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const userId = guard.userId;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const [trades, checkins] = await Promise.all([
    db.tradeEntry.findMany({
      where: { userId, date: { gte: cutoffStr } },
      select: { pnl: true, tags: true, side: true, entryTime: true, date: true, rMultiple: true },
      orderBy: { date: "desc" },
      take: 200,
    }),
    db.checkin.findMany({
      where: { userId, date: { gte: cutoffStr } },
      select: { date: true, score: true, verdict: true },
      orderBy: { date: "desc" },
      take: 60,
    }),
  ]);

  const insights: Insight[] = [];

  if (trades.length < 5) {
    return Response.json({ insights: [] });
  }

  // ── 1. Most expensive tag ─────────────────────────────────────────────────
  const tagPnl: Record<string, { sum: number; count: number }> = {};
  for (const t of trades) {
    const tags = parseTags(t.tags);
    for (const tag of tags) {
      if (!tagPnl[tag]) tagPnl[tag] = { sum: 0, count: 0 };
      tagPnl[tag].sum += t.pnl ?? 0;
      tagPnl[tag].count++;
    }
  }
  const negTags = Object.entries(tagPnl)
    .filter(([, v]) => v.sum < 0 && v.count >= 2)
    .sort((a, b) => a[1].sum - b[1].sum);
  if (negTags.length > 0) {
    const [tag, data] = negTags[0];
    insights.push({
      id: "expensive-tag",
      type: "warning",
      title: `"${tag}" trades are costing you`,
      body: `Your ${data.count} "${tag}"-tagged trades have totaled ${data.sum < 0 ? "−" : "+"}$${Math.abs(data.sum).toFixed(0)} over the past 60 days.`,
      value: `−$${Math.abs(data.sum).toFixed(0)}`,
      action: "See tag analytics",
      actionHref: "/analytics?tab=performance",
    });
  }

  // ── 2. Mental score vs P&L correlation ───────────────────────────────────
  if (checkins.length >= 5) {
    const checkinMap = new Map(checkins.map((c) => [c.date, c.score]));
    const tradeDates = new Map<string, number>();
    for (const t of trades) {
      if (t.pnl === null) continue;
      tradeDates.set(t.date, (tradeDates.get(t.date) ?? 0) + t.pnl);
    }
    let highScoreSum = 0, highScoreCount = 0;
    let lowScoreSum = 0, lowScoreCount = 0;
    for (const [date, pnl] of tradeDates) {
      const score = checkinMap.get(date);
      if (score === undefined) continue;
      if (score >= 70) { highScoreSum += pnl; highScoreCount++; }
      else if (score < 50) { lowScoreSum += pnl; lowScoreCount++; }
    }
    if (highScoreCount >= 3 && lowScoreCount >= 2) {
      const highAvg = highScoreSum / highScoreCount;
      const lowAvg = lowScoreSum / lowScoreCount;
      const diff = highAvg - lowAvg;
      if (Math.abs(diff) >= 20) {
        insights.push({
          id: "score-correlation",
          type: diff > 0 ? "positive" : "warning",
          title: diff > 0 ? "Your score predicts your profits" : "Low-score days are costly",
          body: diff > 0
            ? `On GO days (score ≥70) you average $${highAvg.toFixed(0)} P&L. On low-score days you average $${lowAvg.toFixed(0)}. That's a $${diff.toFixed(0)} difference per day.`
            : `On low-score days (<50) you average $${lowAvg.toFixed(0)} vs $${highAvg.toFixed(0)} on GO days. Your check-in is protecting you from $${Math.abs(diff).toFixed(0)}/day in losses.`,
          value: diff > 0 ? `+$${diff.toFixed(0)}/day` : `−$${Math.abs(diff).toFixed(0)}/day`,
          action: "View full correlation",
          actionHref: "/analytics?tab=psychology",
        });
      }
    }
  }

  // ── 3. Best time of day ───────────────────────────────────────────────────
  const hourBuckets: Record<number, { sum: number; wins: number; count: number }> = {};
  for (const t of trades) {
    if (t.pnl === null) continue;
    const hour = t.entryTime ? new Date(t.entryTime).getHours() : null;
    if (hour === null) continue;
    if (!hourBuckets[hour]) hourBuckets[hour] = { sum: 0, wins: 0, count: 0 };
    hourBuckets[hour].sum += t.pnl;
    hourBuckets[hour].count++;
    if (t.pnl > 0) hourBuckets[hour].wins++;
  }
  const hoursWithData = Object.entries(hourBuckets).filter(([, v]) => v.count >= 3);
  if (hoursWithData.length >= 3) {
    const best = hoursWithData.sort((a, b) => {
      const aWr = a[1].wins / a[1].count;
      const bWr = b[1].wins / b[1].count;
      return bWr - aWr;
    })[0];
    const worst = [...hoursWithData].sort((a, b) => (a[1].sum / a[1].count) - (b[1].sum / b[1].count))[0];
    const bestHour = parseInt(best[0]);
    const worstHour = parseInt(worst[0]);
    const bestWr = Math.round((best[1].wins / best[1].count) * 100);
    const bestAmPm = bestHour >= 12 ? `${bestHour === 12 ? 12 : bestHour - 12}pm` : `${bestHour === 0 ? 12 : bestHour}am`;
    if (bestWr >= 55 && bestHour !== worstHour) {
      insights.push({
        id: "best-hour",
        type: "positive",
        title: `${bestAmPm} is your best hour`,
        body: `You win ${bestWr}% of trades entered around ${bestAmPm} over the past 60 days. Focus your best setups in this window.`,
        value: `${bestWr}% WR`,
        action: "See heatmap",
        actionHref: "/analytics?tab=heatmap",
      });
    }
  }

  // ── 4. Win streak since last loss ────────────────────────────────────────
  const sortedTrades = [...trades].sort((a, b) => b.date.localeCompare(a.date));
  let currentWinStreak = 0;
  for (const t of sortedTrades) {
    if (t.pnl === null) continue;
    if (t.pnl > 0) currentWinStreak++;
    else break;
  }
  if (currentWinStreak >= 3) {
    insights.push({
      id: "win-streak",
      type: "positive",
      title: `${currentWinStreak}-trade winning streak`,
      body: `You're on a roll — ${currentWinStreak} consecutive profitable trades. Stay disciplined: don't let a winner become your worst day.`,
      value: `${currentWinStreak}W`,
    });
  }

  // ── 5. Sizing down recommendation ────────────────────────────────────────
  const recentLossTrades = sortedTrades.slice(0, 10).filter((t) => (t.pnl ?? 0) < 0);
  if (recentLossTrades.length >= 6) {
    const lossTotal = recentLossTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
    insights.push({
      id: "recent-losses",
      type: "warning",
      title: "Rough stretch — consider sizing down",
      body: `${recentLossTrades.length} of your last 10 trades were losses (${(lossTotal).toFixed(0)} total). This may be a setup quality issue or market condition change.`,
      value: `${recentLossTrades.length}/10 L`,
      action: "Run Monte Carlo",
      actionHref: "/analytics?tab=performance",
    });
  }

  return Response.json({ insights: insights.slice(0, 3) });
}
