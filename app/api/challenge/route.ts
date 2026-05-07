import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [user, trades] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: {
          plan: true, challengeEnabled: true, challengeFirm: true, challengeAccountSize: true,
          challengeDailyLimit: true, challengeMaxDrawdown: true, challengeStartDate: true,
          challengeEndDate: true, challengeProfitTarget: true, challengeTradingDaysTarget: true,
        },
      }),
      db.tradeEntry.findMany({ where: { userId: session.user.id }, select: { date: true, pnl: true } }),
    ]);
    if (!user) return Response.json({ error: "Not found" }, { status: 404 });
    if (user.plan !== "pro" && user.plan !== "premium") return Response.json({ error: "TradeMind subscription required" }, { status: 403 });

    const accountSize = user.challengeAccountSize ?? 0;
    const maxDrawdownPct = user.challengeMaxDrawdown ?? 10;
    const profitTargetPct = user.challengeProfitTarget ?? null;
    const startDate = user.challengeStartDate ?? null;

    // Compute live P&L from trade entries since challenge start
    const relevantTrades = startDate
      ? trades.filter((t) => t.date >= startDate && t.pnl !== null)
      : trades.filter((t) => t.pnl !== null);

    const totalPnl = relevantTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

    // Daily P&L (today)
    const today = new Date().toISOString().split("T")[0];
    const dailyPnl = relevantTrades.filter((t) => t.date === today).reduce((s, t) => s + (t.pnl ?? 0), 0);

    // Drawdown metrics
    const drawdownUsed = accountSize > 0 && totalPnl < 0 ? Math.abs(totalPnl) / accountSize * 100 : 0;
    const maxDrawdownDollar = accountSize > 0 ? accountSize * (maxDrawdownPct / 100) : null;
    const drawdownRemaining = maxDrawdownDollar !== null ? maxDrawdownDollar - Math.abs(Math.min(totalPnl, 0)) : null;
    const drawdownNearAlert = drawdownRemaining !== null && maxDrawdownDollar !== null && drawdownRemaining < maxDrawdownDollar * 0.2;

    // Profit progress
    const profitTargetDollar = accountSize > 0 && profitTargetPct ? accountSize * (profitTargetPct / 100) : null;
    const profitProgress = profitTargetDollar ? Math.min((totalPnl / profitTargetDollar) * 100, 100) : null;

    // Trading days with at least 1 trade
    const tradingDaysSet = new Set(relevantTrades.map((t) => t.date));
    const tradingDaysCompleted = tradingDaysSet.size;

    return Response.json({
      enabled: user.challengeEnabled,
      firm: user.challengeFirm ?? null,
      accountSize,
      dailyLimit: user.challengeDailyLimit ?? 5,
      maxDrawdown: maxDrawdownPct,
      startDate,
      endDate: user.challengeEndDate ?? null,
      profitTarget: profitTargetPct,
      tradingDaysTarget: user.challengeTradingDaysTarget ?? null,
      // Live computed
      totalPnl: Math.round(totalPnl * 100) / 100,
      dailyPnl: Math.round(dailyPnl * 100) / 100,
      drawdownUsed: Math.round(drawdownUsed * 10) / 10,
      drawdownRemaining: drawdownRemaining !== null ? Math.round(drawdownRemaining * 100) / 100 : null,
      drawdownNearAlert,
      profitProgress,
      tradingDaysCompleted,
    });
  } catch (err) {
    logger.error("Challenge GET failed", err, { userId: session.user.id });
    return Response.json({ error: "Failed to fetch challenge" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
    if (!user || (user.plan !== "pro" && user.plan !== "premium")) return Response.json({ error: "TradeMind subscription required" }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof body.enabled === "boolean") data.challengeEnabled = body.enabled;
    if (typeof body.firm === "string") data.challengeFirm = body.firm;
    if (typeof body.accountSize === "number" && body.accountSize > 0) data.challengeAccountSize = body.accountSize;
    if (typeof body.dailyLimit === "number" && body.dailyLimit > 0 && body.dailyLimit <= 100) data.challengeDailyLimit = body.dailyLimit;
    if (typeof body.maxDrawdown === "number" && body.maxDrawdown > 0 && body.maxDrawdown <= 100) data.challengeMaxDrawdown = body.maxDrawdown;
    if (typeof body.startDate === "string" || body.startDate === null) data.challengeStartDate = body.startDate;
    if (typeof body.endDate === "string" || body.endDate === null) data.challengeEndDate = body.endDate;
    if (typeof body.profitTarget === "number" && body.profitTarget > 0 && body.profitTarget <= 100) data.challengeProfitTarget = body.profitTarget;
    if (body.profitTarget === null) data.challengeProfitTarget = null;
    if (typeof body.tradingDaysTarget === "number" && body.tradingDaysTarget > 0) data.challengeTradingDaysTarget = body.tradingDaysTarget;
    if (body.tradingDaysTarget === null) data.challengeTradingDaysTarget = null;

    await db.user.update({ where: { id: session.user.id }, data });
    return Response.json({ ok: true });
  } catch (err) {
    logger.error("Challenge POST failed", err, { userId: session.user.id });
    return Response.json({ error: "Failed to update challenge" }, { status: 500 });
  }
}