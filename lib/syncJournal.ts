import { db } from "@/lib/db";
import { fetchHistoricalTrades } from "@/lib/brokers";
import { safeDecrypt } from "@/lib/crypto";
import { sendPushToUser } from "@/lib/push";

export interface SyncResult {
  imported: number;
  total: number;
  broker: string;
  skipped?: boolean; // true if cooldown prevented sync
}

const COOLDOWN_MINUTES = 10;

export async function syncJournalForUser(
  userId: string,
  opts: { notify?: boolean } = {}
): Promise<SyncResult | null> {
  const conn = await db.brokerConnection.findUnique({ where: { userId } });
  if (!conn) return null;

  // Cooldown: skip if synced within 10 minutes
  if (conn.lastSyncAt) {
    const minsSince = (Date.now() - conn.lastSyncAt.getTime()) / 60_000;
    if (minsSince < COOLDOWN_MINUTES) {
      return { imported: 0, total: 0, broker: conn.broker, skipped: true };
    }
  }

  // Days to look back: 90 on first sync, otherwise since last sync + 2-day buffer
  let daysBack = 90;
  if (conn.lastSyncAt) {
    const daysSince = Math.ceil((Date.now() - conn.lastSyncAt.getTime()) / 86_400_000);
    daysBack = Math.min(daysSince + 2, 90);
  }

  const trades = await fetchHistoricalTrades(
    {
      broker: conn.broker,
      apiKey: safeDecrypt(conn.apiKey),
      apiSecret: conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined,
      environment: conn.environment,
    },
    daysBack
  );

  if (trades === null) {
    await db.brokerConnection.update({ where: { userId }, data: { status: "error" } });
    return null;
  }

  if (trades.length === 0) {
    await db.brokerConnection.update({ where: { userId }, data: { lastSyncAt: new Date(), status: "active" } });
    return { imported: 0, total: 0, broker: conn.broker };
  }

  // Attach today's mental score to trades placed today
  const today = new Date().toISOString().split("T")[0];
  const todayCheckin = await db.checkin.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { score: true },
  });

  // Deduplicate: skip entries where same date+symbol already in journal
  const existing = await db.tradeEntry.findMany({
    where: { userId },
    select: { date: true, symbol: true },
  });
  const existingSet = new Set(existing.map((e) => `${e.date}:${e.symbol ?? ""}`));
  const toCreate = trades.filter((t) => !existingSet.has(`${t.date}:${t.symbol}`));

  if (toCreate.length > 0) {
    await db.tradeEntry.createMany({
      data: toCreate.map((t) => ({
        userId,
        date: t.date,
        symbol: t.symbol.slice(0, 20),
        side: t.side,
        pnl: t.pnl,
        // attach mental score only if this trade is from today
        checkinScore: t.date === today ? (todayCheckin?.score ?? null) : null,
      })),
    });
  }

  // Keep the circuit breaker trade count in sync for today
  const todayCount = trades.filter((t) => t.date === today).length;
  await db.trade.deleteMany({ where: { userId, date: today } });
  if (todayCount > 0) {
    await db.trade.createMany({
      data: Array.from({ length: todayCount }).map(() => ({ userId, date: today })),
    });
  }

  await db.brokerConnection.update({
    where: { userId },
    data: { lastSyncAt: new Date(), status: "active" },
  });

  // Push notification when background sync finds new trades
  if (opts.notify && toCreate.length > 0) {
    await sendPushToUser(userId, {
      title: `${toCreate.length} new trade${toCreate.length !== 1 ? "s" : ""} synced`,
      body: `${conn.broker.toUpperCase()} → TradeMind journal updated automatically.`,
      url: "/journal",
    }).catch(() => {});
  }

  return { imported: toCreate.length, total: trades.length, broker: conn.broker };
}