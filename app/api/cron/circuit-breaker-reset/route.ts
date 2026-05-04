import { db } from "@/lib/db";
import { unlockBroker } from "@/lib/circuitBreakerLock";
import { NextRequest, NextResponse } from "next/server";

// Runs at midnight UTC via Vercel Cron.
// Unlocks every user whose circuit breaker was triggered yesterday.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Find all circuit breakers that were triggered before today
  const blocked = await db.circuitBreaker.findMany({
    where: {
      isActive: true,
      blockedNotifiedDate: { not: null, lt: today },
    },
    select: { userId: true, extensionToken: true },
  });

  let unlocked = 0;
  await Promise.allSettled(
    blocked.map(async (cb) => {
      // Unlock broker trading (Alpaca suspend_trade: false, etc.)
      await unlockBroker(cb.userId);
      // Reset notification dedup so next block sends a fresh push
      await db.circuitBreaker.update({
        where: { extensionToken: cb.extensionToken },
        data: { blockedNotifiedDate: null, blockedAt: null },
      });
      unlocked++;
    })
  );

  return NextResponse.json({ ok: true, unlocked, date: today });
}