import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["premium"]);
  if (!guard.ok) return guard.response;

  const userId = guard.userId;

  const [checkins, trades] = await Promise.all([
    db.checkin.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 180 }),
    db.tradeEntry.findMany({ where: { userId, pnl: { not: null } }, orderBy: { date: "desc" }, take: 2000 }),
  ]);

  // Group trades by date
  const tradesByDate = new Map<string, number>();
  for (const t of trades) {
    const d = t.date.slice(0, 10);
    tradesByDate.set(d, (tradesByDate.get(d) ?? 0) + (t.pnl ?? 0));
  }

  // Match check-ins to trade P&L
  const byVerdict: Record<string, { pnlSum: number; days: number; tradedDays: number; pnlValues: number[] }> = {
    GO:       { pnlSum: 0, days: 0, tradedDays: 0, pnlValues: [] },
    CAUTION:  { pnlSum: 0, days: 0, tradedDays: 0, pnlValues: [] },
    "NO-TRADE": { pnlSum: 0, days: 0, tradedDays: 0, pnlValues: [] },
  };

  let noTradeViolationCost = 0; // P&L lost when trading on NO-TRADE days
  let noTradeComplianceSaved = 0; // Count of NO-TRADE days correctly avoided
  let noTradeTotalDays = 0;

  for (const c of checkins) {
    const verdict = c.verdict;
    if (!(verdict in byVerdict)) continue;
    const v = byVerdict[verdict];
    const dayPnl = tradesByDate.get(c.date) ?? null;
    const traded = dayPnl !== null;

    v.days++;
    if (traded) {
      v.tradedDays++;
      v.pnlSum += dayPnl!;
      v.pnlValues.push(dayPnl!);
    }

    if (verdict === "NO-TRADE") {
      noTradeTotalDays++;
      if (traded) {
        if (dayPnl! < 0) noTradeViolationCost += dayPnl!; // losses incurred despite NO-TRADE
      } else {
        noTradeComplianceSaved++;
      }
    }
  }

  const avg = (sum: number, n: number) => (n > 0 ? Math.round((sum / n) * 100) / 100 : null);

  // Timeline: last 30 check-in days with verdict + P&L
  const timeline = checkins.slice(0, 30).reverse().map((c) => ({
    date: c.date,
    score: c.score,
    verdict: c.verdict,
    pnl: tradesByDate.has(c.date) ? Math.round((tradesByDate.get(c.date)!) * 100) / 100 : null,
  }));

  const goTradedDays = byVerdict.GO.tradedDays;
  const cautionTradedDays = byVerdict.CAUTION.tradedDays;
  const noTradeTradedDays = byVerdict["NO-TRADE"].tradedDays;

  return Response.json({
    avgPnl: {
      go:      avg(byVerdict.GO.pnlSum, goTradedDays),
      caution: avg(byVerdict.CAUTION.pnlSum, cautionTradedDays),
      noTrade: avg(byVerdict["NO-TRADE"].pnlSum, noTradeTradedDays),
    },
    days: {
      go: byVerdict.GO.days,
      caution: byVerdict.CAUTION.days,
      noTrade: byVerdict["NO-TRADE"].days,
    },
    tradedDays: { go: goTradedDays, caution: cautionTradedDays, noTrade: noTradeTradedDays },
    noTradeViolationCost: Math.round(noTradeViolationCost * 100) / 100, // negative number
    noTradeComplianceSaved,
    noTradeTotalDays,
    complianceRate: noTradeTotalDays > 0 ? Math.round((noTradeComplianceSaved / noTradeTotalDays) * 100) : null,
    timeline,
    hasData: checkins.length > 0 && trades.length > 0,
  });
}