export const runtime = "nodejs";

import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { NextRequest } from "next/server";

// Runs at 13:00 UTC (during US pre-market / early session) to prompt mid-session check-ins.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  let pushed = 0;

  try {
    // Users with 2+ trades today and no mid-session check-in
    const candidates = await db.user.findMany({
      where: {
        tradeEntries: { some: { date: todayStr } },
        midSessionCheckins: { none: { date: todayStr } },
      },
      select: {
        id: true,
        tradeEntries: { where: { date: todayStr }, select: { id: true, pnl: true } },
      },
      take: 1000,
    });

    for (const user of candidates) {
      if (user.tradeEntries.length < 2) continue;

      const runningPnl = user.tradeEntries.reduce((s, t) => s + (t.pnl ?? 0), 0);
      const pnlStr = runningPnl >= 0 ? `+$${Math.round(runningPnl)}` : `-$${Math.abs(Math.round(runningPnl))}`;

      try {
        await sendPushToUser(user.id, {
          title: "Pulse check",
          body: `${user.tradeEntries.length} trades in · ${pnlStr} so far. How's your head? 30 sec check-in.`,
          url: "/mid-checkin",
        });
        pushed++;
      } catch {}
    }
  } catch {}

  return Response.json({ ok: true, pushed });
}