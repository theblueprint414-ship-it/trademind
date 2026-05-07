import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

function getWeekBounds(offsetWeeks = 0): { start: string; end: string; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun…6=Sat
  const daysToMon = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMon - offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const labelFmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    start: fmt(monday),
    end: fmt(sunday),
    label: `${labelFmt(monday)} – ${labelFmt(sunday)}`,
  };
}

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const offsetWeeks = parseInt(url.searchParams.get("offset") ?? "1", 10);
  const week = getWeekBounds(Math.max(0, offsetWeeks));

  const [checkins, trades] = await Promise.all([
    db.checkin.findMany({
      where: { userId: auth.userId, date: { gte: week.start, lte: week.end } },
      orderBy: { date: "asc" },
    }),
    db.tradeEntry.findMany({
      where: { userId: auth.userId, date: { gte: week.start, lte: week.end } },
      orderBy: { date: "asc" },
    }),
  ]);

  if (trades.length === 0 && checkins.length === 0) {
    return Response.json({ ok: false, reason: "no_data", weekLabel: week.label });
  }

  // P&L metrics
  const tradesWithPnl = trades.filter((t) => t.pnl !== null);
  const totalPnl = tradesWithPnl.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winners = tradesWithPnl.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = tradesWithPnl.length > 0 ? Math.round((winners / tradesWithPnl.length) * 100) : null;

  // Daily P&L map
  const dailyPnl: Record<string, number> = {};
  for (const t of tradesWithPnl) {
    dailyPnl[t.date] = (dailyPnl[t.date] ?? 0) + (t.pnl ?? 0);
  }
  const dailyEntries = Object.entries(dailyPnl).sort(([a], [b]) => a.localeCompare(b));
  const bestDay = dailyEntries.length
    ? dailyEntries.reduce((best, e) => (e[1] > best[1] ? e : best))
    : null;
  const worstDay = dailyEntries.length
    ? dailyEntries.reduce((worst, e) => (e[1] < worst[1] ? e : worst))
    : null;

  // Verdict counts
  let goDays = 0, cautionDays = 0, noTradeDays = 0;
  for (const c of checkins) {
    if (c.verdict === "GO") goDays++;
    else if (c.verdict === "CAUTION") cautionDays++;
    else noTradeDays++;
  }

  // NO-TRADE compliance: % of NO-TRADE days where no trades were placed
  const noTradeDayDates = checkins.filter((c) => c.verdict === "NO-TRADE").map((c) => c.date);
  const tradeDates = new Set(trades.map((t) => t.date));
  const noTradeRespected = noTradeDayDates.filter((d) => !tradeDates.has(d)).length;
  const noTradeCompliance = noTradeDayDates.length > 0
    ? Math.round((noTradeRespected / noTradeDayDates.length) * 100)
    : null;

  // Average mental score
  const avgMentalScore = checkins.length > 0
    ? Math.round(checkins.reduce((s, c) => s + c.score, 0) / checkins.length)
    : null;

  return Response.json({
    ok: true,
    weekLabel: week.label,
    weekStart: week.start,
    weekEnd: week.end,
    totalPnl: Math.round(totalPnl * 100) / 100,
    tradeCount: trades.length,
    winRate,
    goDays,
    cautionDays,
    noTradeDays,
    noTradeCompliance,
    bestDay: bestDay ? { date: bestDay[0], pnl: Math.round(bestDay[1] * 100) / 100 } : null,
    worstDay: worstDay ? { date: worstDay[0], pnl: Math.round(worstDay[1] * 100) / 100 } : null,
    avgMentalScore,
    checkinDays: checkins.length,
  });
}