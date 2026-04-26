export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [user, checkins, tradeEntries, dailyRecaps] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, plan: true, traderType: true, tradeLimit: true, createdAt: true },
    }),
    db.checkin.findMany({
      where: { userId },
      select: { date: true, score: true, verdict: true, answers: true, createdAt: true },
      orderBy: { date: "asc" },
    }),
    db.tradeEntry.findMany({
      where: { userId },
      select: { date: true, symbol: true, side: true, pnl: true, setup: true, emotionBefore: true, emotionAfter: true, mistake: true, notes: true, reflection: true, tags: true, checkinScore: true, createdAt: true },
      orderBy: { date: "asc" },
    }),
    db.dailyRecap.findMany({
      where: { userId },
      select: { date: true, mood: true, pnl: true, playbookScore: true, lesson: true, tradesCount: true, createdAt: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: user,
    checkins,
    journal: tradeEntries,
    recaps: dailyRecaps,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="trademind-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}