import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, email: true, name: true, tradeLimit: true, emailReminders: true, traderType: true, publicProfile: true, challengeEnabled: true, challengeFirm: true, challengeAccountSize: true, challengeDailyLimit: true, challengeMaxDrawdown: true, challengeStartDate: true, challengeEndDate: true, challengeProfitTarget: true, challengeTradingDaysTarget: true },
    });
    return Response.json({
      id: session.user.id,
      plan: user?.plan ?? "free",
      email: user?.email,
      name: user?.name,
      tradeLimit: user?.tradeLimit ?? 5,
      emailReminders: user?.emailReminders ?? true,
      traderType: user?.traderType ?? null,
      publicProfile: user?.publicProfile ?? false,
      challenge: user?.challengeEnabled ? {
        enabled: true,
        firm: user.challengeFirm ?? null,
        accountSize: user.challengeAccountSize ?? null,
        dailyLimit: user.challengeDailyLimit ?? 5,
        maxDrawdown: user.challengeMaxDrawdown ?? 10,
        startDate: user.challengeStartDate ?? null,
        endDate: user.challengeEndDate ?? null,
        profitTarget: user.challengeProfitTarget ?? null,
        tradingDaysTarget: user.challengeTradingDaysTarget ?? null,
      } : null,
    });
  } catch (err) {
    logger.error("Me GET failed", err, { userId: session.user.id });
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });
  const data: Record<string, unknown> = {};

  if (typeof body.tradeLimit === "number") {
    if (body.tradeLimit < 1 || body.tradeLimit > 5) {
      return Response.json({ error: "Invalid trade limit" }, { status: 400 });
    }
    data.tradeLimit = body.tradeLimit;
  }

  if (typeof body.emailReminders === "boolean") {
    data.emailReminders = body.emailReminders;
  }

  if (typeof body.traderType === "string" && body.traderType.length <= 50) {
    data.traderType = body.traderType;
  }

  if (typeof body.publicProfile === "boolean") {
    data.publicProfile = body.publicProfile;
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    await db.user.update({ where: { id: session.user.id }, data });
    return Response.json({ ok: true });
  } catch (err) {
    logger.error("Me PATCH failed", err, { userId: session.user.id });
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}