export const runtime = "nodejs";
export const maxDuration = 60;

import { db } from "@/lib/db";
import { syncJournalForUser } from "@/lib/syncJournal";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cooldownCutoff = new Date(Date.now() - 10 * 60 * 1000);

  // Find users with at least one active broker connection whose cooldown expired
  const connectionsToSync = await db.brokerConnection.findMany({
    where: {
      status: "active",
      OR: [{ lastSyncAt: null }, { lastSyncAt: { lt: cooldownCutoff } }],
      user: { plan: { in: ["pro", "premium"] } },
    },
    select: { userId: true },
    distinct: ["userId"],
    take: 50,
  });

  const userIds = connectionsToSync.map((c) => c.userId);

  let synced = 0;
  let imported = 0;

  for (const userId of userIds) {
    try {
      const result = await syncJournalForUser(userId, { notify: true });
      if (result && !result.skipped) {
        synced++;
        imported += result.imported;
      }
    } catch {
      // continue — one failing broker shouldn't block others
    }
  }

  return Response.json({ ok: true, synced, imported, candidates: userIds.length });
}
