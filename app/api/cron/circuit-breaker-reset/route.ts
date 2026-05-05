import { db } from "@/lib/db";
import { unlockBroker } from "@/lib/circuitBreakerLock";
import { NextRequest, NextResponse } from "next/server";

// Runs every hour via Vercel Cron.
// Resets each user at their configured resetHour (UTC), not just midnight.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentHour = new Date().getUTCHours();

  // Find circuit breakers whose reset hour matches now and have an active block or warning flag
  const due = await db.circuitBreaker.findMany({
    where: {
      isActive: true,
      resetHour: currentHour,
      OR: [
        { blockedNotifiedDate: { not: null } },
        { warningNotifiedDate: { not: null } },
      ],
    },
    select: { userId: true, extensionToken: true },
  });

  let unlocked = 0;
  await Promise.allSettled(
    due.map(async (cb) => {
      await unlockBroker(cb.userId);
      await db.circuitBreaker.update({
        where: { extensionToken: cb.extensionToken },
        data: { blockedNotifiedDate: null, warningNotifiedDate: null, blockedAt: null },
      });
      unlocked++;
    })
  );

  return NextResponse.json({ ok: true, unlocked, resetHour: currentHour });
}