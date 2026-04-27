export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { logger } from "@/lib/logger";

// POST — use streak freeze for today (Pro only)
export async function POST() {
  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: guard.userId },
    select: { streakFreezeUsedAt: true },
  });

  if (!user) return Response.json({ error: "Not found" }, { status: 404 });

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  if (user.streakFreezeUsedAt === currentMonth) {
    return Response.json({ error: "Freeze already used this month", alreadyUsed: true }, { status: 409 });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    // Insert a synthetic checkin with score 50 (CAUTION) marked as a freeze day
    await db.checkin.upsert({
      where: { userId_date: { userId: guard.userId, date: today } },
      update: { score: 50, verdict: "CAUTION", answers: JSON.stringify({ freeze: true }) },
      create: { userId: guard.userId, date: today, score: 50, verdict: "CAUTION", answers: JSON.stringify({ freeze: true }) },
    });
    await db.user.update({
      where: { id: guard.userId },
      data: { streakFreezeUsedAt: currentMonth },
    });
    return Response.json({ ok: true, message: "Streak protected for today." });
  } catch (err) {
    logger.error("StreakFreeze POST failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to apply streak freeze" }, { status: 500 });
  }
}

// GET — check freeze availability
export async function GET() {
  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return Response.json({ available: false, isPro: false });

  const user = await db.user.findUnique({
    where: { id: guard.userId },
    select: { streakFreezeUsedAt: true },
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const available = user?.streakFreezeUsedAt !== currentMonth;

  return Response.json({ available, isPro: true, usedThisMonth: !available });
}