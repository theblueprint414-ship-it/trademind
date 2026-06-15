export const runtime = "nodejs";

import { db } from "@/lib/db";
import { sendDay14Email, sendDay30Email } from "@/lib/email";
import { NextRequest } from "next/server";

// Runs daily at 9:30 AM UTC — handles day-14 upgrade nudge and day-30 re-engagement
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const users = await db.user.findMany({
    where: { emailReminders: true },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      plan: true,
      checkins: { select: { date: true }, orderBy: { date: "desc" }, take: 1 },
      tradeEntries: { select: { pnl: true }, take: 1 },
    },
  });

  let sent14 = 0;
  let sent30 = 0;

  for (const user of users) {
    const daysSince = Math.round((now.getTime() - new Date(user.createdAt).getTime()) / 86400000);

    try {
      if (daysSince === 14) {
        await sendDay14Email(user.email, user.name ?? undefined, user.plan ?? "free");
        sent14++;
      } else if (daysSince === 30) {
        const lastCheckin = user.checkins[0]?.date;
        const lastCheckInDays = lastCheckin
          ? Math.round((now.getTime() - new Date(lastCheckin).getTime()) / 86400000)
          : 30;
        await sendDay30Email(user.email, user.name ?? undefined, lastCheckInDays);
        sent30++;
      }
    } catch {
      // continue to next user
    }
  }

  return Response.json({ ok: true, sent14, sent30 });
}
