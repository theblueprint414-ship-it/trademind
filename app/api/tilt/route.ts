export const runtime = "nodejs";

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
  const todayStr = new Date().toISOString().split("T")[0];

  // Get today's trades ordered by entry time (fallback to createdAt)
  const trades = await db.tradeEntry.findMany({
    where: { userId, date: todayStr },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      pnl: true,
      entryTime: true,
      exitTime: true,
      createdAt: true,
    },
  });

  if (trades.length === 0) {
    return Response.json({ riskLevel: "safe", consecutiveLosses: 0, revengeTradesCount: 0, todayTradesCount: 0, todayPnl: 0, message: null, tip: null, shouldStop: false });
  }

  // Today's total P&L
  const todayPnl = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);

  // Consecutive losses from the END (most recent streak)
  let consecutiveLosses = 0;
  for (let i = trades.length - 1; i >= 0; i--) {
    if ((trades[i].pnl ?? 0) < 0) consecutiveLosses++;
    else break;
  }

  // Revenge trade detection: loss followed by another trade within 5 minutes
  let revengeTradesCount = 0;
  for (let i = 1; i < trades.length; i++) {
    const prev = trades[i - 1];
    const curr = trades[i];
    if ((prev.pnl ?? 0) >= 0) continue; // previous was not a loss

    // Use exitTime of prev or createdAt as proxy for "when trade closed"
    const prevCloseStr = prev.exitTime ?? prev.createdAt.toISOString();
    const currOpenStr = curr.entryTime ?? curr.createdAt.toISOString();

    const prevClose = new Date(prevCloseStr).getTime();
    const currOpen = new Date(currOpenStr).getTime();
    const diffMin = (currOpen - prevClose) / 60000;

    if (diffMin >= 0 && diffMin <= 5) revengeTradesCount++;
  }

  // Determine risk level
  let riskLevel: "safe" | "caution" | "tilt" | "danger";
  let message: string;
  let tip: string;
  let shouldStop = false;

  if (consecutiveLosses >= 4 || (consecutiveLosses >= 3 && todayPnl < 0)) {
    riskLevel = "danger";
    shouldStop = true;
    message = `${consecutiveLosses} consecutive losses. Your edge is gone right now.`;
    tip = "The best traders know when to stop. Log this session and come back tomorrow.";
  } else if (revengeTradesCount >= 2 && consecutiveLosses >= 2) {
    riskLevel = "danger";
    shouldStop = true;
    message = "Revenge trading pattern detected — losses triggering fast re-entries.";
    tip = "Step away for 30 minutes. Revenge trades statistically have a 73% loss rate.";
  } else if (consecutiveLosses >= 3 || revengeTradesCount >= 2) {
    riskLevel = "tilt";
    message = consecutiveLosses >= 3
      ? `${consecutiveLosses} consecutive losses today. Emotional bias risk is high.`
      : "You've re-entered quickly after losses more than once today.";
    tip = consecutiveLosses >= 3
      ? "Take a 15-minute break before your next trade. Your next setup needs to be A+."
      : "Slow down. Wait at least 10 minutes before considering your next trade.";
  } else if (consecutiveLosses === 2 || revengeTradesCount === 1) {
    riskLevel = "caution";
    message = consecutiveLosses === 2
      ? "2 consecutive losses. Watch for emotional bias on your next trade."
      : "You entered quickly after a loss. Make sure this next trade is in your plan.";
    tip = "Ask yourself: am I trading to recover losses, or because there's a genuine setup?";
  } else {
    riskLevel = "safe";
    message = null as unknown as string;
    tip = null as unknown as string;
  }

  return Response.json({
    riskLevel,
    consecutiveLosses,
    revengeTradesCount,
    todayTradesCount: trades.length,
    todayPnl,
    message,
    tip,
    shouldStop,
  });
}
