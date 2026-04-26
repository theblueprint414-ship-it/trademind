export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const recaps = await db.dailyRecap.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 90,
    select: { id: true, date: true, mood: true, pnl: true, playbookScore: true, lesson: true, tradesCount: true },
  });

  return Response.json({ recaps });
}