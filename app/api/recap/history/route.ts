export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const recaps = await db.dailyRecap.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 90,
      select: { id: true, date: true, mood: true, pnl: true, playbookScore: true, lesson: true, tradesCount: true },
    });
    return Response.json({ recaps });
  } catch (err) {
    logger.error("Recap history GET failed", err, { userId: session.user.id });
    return Response.json({ error: "Failed to fetch recap history" }, { status: 500 });
  }
}