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
  opts: { notify?: boolean; force?: boolean } = {}
): Promise<SyncResult | null> {
  const conn = await db.brokerConnection.findUnique({ where: { userId } });
  if (!conn) return null;

  // Cooldown: skip if synced within 10 minutes (bypass with force)
  if (!opts.force && conn.lastSyncAt) {
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

  // Deduplicate: prefer brokerTradeId match, fallback to date:symbol:entryTime
  const existing = await db.tradeEntry.findMany({
    where: { userId },
    select: { date: true, symbol: true, brokerTradeId: true, entryTime: true },
  });
  const existingIds  = new Set(existing.map((e) => e.brokerTradeId).filter(Boolean));
  const existingKeys = new Set(existing.map((e) => `${e.date}:${e.symbol ?? ""}:${e.entryTime ?? ""}`));
  const toCreate = trades.filter((t) => {
    if (t.brokerTradeId && existingIds.has(t.brokerTradeId)) return false;
    if (!t.brokerTradeId && existingKeys.has(`${t.date}:${t.symbol}:${t.entryTime ?? ""}`)) return false;
    return true;
  });

  if (toCreate.length > 0) {
    await db.tradeEntry.createMany({
      data: toCreate.map((t) => {
        const entryMs = t.entryTime ? new Date(t.entryTime).getTime() : null;
        const exitMs  = t.exitTime  ? new Date(t.exitTime).getTime()  : null;
        const duration = (entryMs && exitMs && exitMs > entryMs) ? Math.round((exitMs - entryMs) / 1000) : null;
        return {
          userId,
          date: t.date,
          symbol: t.symbol.slice(0, 20),
          side: t.side,
          pnl: t.pnl,
          brokerTradeId: t.brokerTradeId ?? null,
          entryPrice: t.entryPrice ?? null,
          exitPrice: t.exitPrice ?? null,
          entryTime: t.entryTime ?? null,
          exitTime: t.exitTime ?? null,
          qty: t.qty ?? null,
          commission: t.commission ?? null,
          assetType: t.assetType ?? null,
          duration,
          checkinScore: t.date === today ? (todayCheckin?.score ?? null) : null,
        };
      }),
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