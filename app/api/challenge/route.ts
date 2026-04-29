import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true, challengeEnabled: true, challengeFirm: true, challengeAccountSize: true,
        challengeDailyLimit: true, challengeMaxDrawdown: true, challengeStartDate: true,
        challengeEndDate: true, challengeProfitTarget: true, challengeTradingDaysTarget: true,
      },
    });
    if (!user) return Response.json({ error: "Not found" }, { status: 404 });
    if (user.plan !== "pro" && user.plan !== "premium") return Response.json({ error: "TradeMind subscription required" }, { status: 403 });
    return Response.json({
      enabled: user.challengeEnabled,
      firm: user.challengeFirm ?? null,
      accountSize: user.challengeAccountSize ?? null,
      dailyLimit: user.challengeDailyLimit ?? 5,
      maxDrawdown: user.challengeMaxDrawdown ?? 10,
      startDate: user.challengeStartDate ?? null,
      endDate: user.challengeEndDate ?? null,
      profitTarget: user.challengeProfitTarget ?? null,
      tradingDaysTarget: user.challengeTradingDaysTarget ?? null,
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