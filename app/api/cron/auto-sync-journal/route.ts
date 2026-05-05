export const runtime = "nodejs";
export const maxDuration = 60;

import { db } from "@/lib/db";
import { syncJournalForUser } from "@/lib/syncJournal";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const cooldownCutoff = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago

  // Active Pro/Premium users: checked in today + broker connected + cooldown expired
  const users = await db.user.findMany({
    where: {
      plan: { in: ["pro", "premium"] },
      brokerConnection: {
        status: "active",
        OR: [
          { lastSyncAt: null },
          { lastSyncAt: { lt: cooldownCutoff } },
        ],
      },
      checkins: { some: { date: today } },
    },
    select: { id: true },
    take: 30, // cap per run to stay within 60s timeout
  });

  let synced = 0;
  let imported = 0;

  for (const user of users) {
    try {
      const result = await syncJournalForUser(user.id, { notify: true });
      if (result && !result.skipped) {
        synced++;
        imported += result.imported;
      }
    } catch {
      // continue — one failing broker shouldn't block others
    }
  }

  return Response.json({ ok: true, synced, imported, candidates: users.length });
}