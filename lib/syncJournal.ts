import { db } from "@/lib/db";
import { fetchHistoricalTrades, refreshTradovateToken } from "@/lib/brokers";
import { safeDecrypt, encrypt } from "@/lib/crypto";
import { sendPushToUser } from "@/lib/push";

export interface SyncResult {
  imported: number;
  total: number;
  broker: string;
  skipped?: boolean;
}

const COOLDOWN_MINUTES = 10;

async function syncConnection(
  userId: string,
  connId: string,
  opts: { notify?: boolean; force?: boolean } = {}
): Promise<SyncResult | null> {
  const conn = await db.brokerConnection.findUnique({ where: { id: connId } });
  if (!conn || conn.userId !== userId) return null;

  if (!opts.force && conn.lastSyncAt) {
    const minsSince = (Date.now() - conn.lastSyncAt.getTime()) / 60_000;
    if (minsSince < COOLDOWN_MINUTES) {
      return { imported: 0, total: 0, broker: conn.broker, skipped: true };
    }
  }

  let daysBack = 90;
  if (conn.lastSyncAt) {
    const daysSince = Math.ceil((Date.now() - conn.lastSyncAt.getTime()) / 86_400_000);
    daysBack = Math.min(daysSince + 2, 90);
  }

  let activeToken = safeDecrypt(conn.apiKey);

  let trades = await fetchHistoricalTrades(
    {
      broker: conn.broker,
      apiKey: activeToken,
      apiSecret: conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined,
      environment: conn.environment,
    },
    daysBack
  );

  if (trades === null && conn.broker === "tradovate") {
    const refreshed = await refreshTradovateToken(activeToken, conn.environment);
    if (refreshed.ok && refreshed.newToken) {
      activeToken = refreshed.newToken;
      await db.brokerConnection.update({
        where: { id: connId },
        data: { apiKey: encrypt(activeToken), status: "active" },
      });
      trades = await fetchHistoricalTrades(
        { broker: conn.broker, apiKey: activeToken, environment: conn.environment },
        daysBack
      );
    }
  }

  if (trades === null) {
    await db.brokerConnection.update({ where: { id: connId }, data: { status: "error" } });
    return null;
  }

  if (trades.length === 0) {
    await db.brokerConnection.update({ where: { id: connId }, data: { lastSyncAt: new Date(), status: "active" } });
    return { imported: 0, total: 0, broker: conn.broker };
  }

  const today = new Date().toISOString().split("T")[0];
  const todayCheckin = await db.checkin.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { score: true },
  });

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
          brokerConnectionId: connId,
          date: t.date,
          symbol: t.symbol.slice(0, 20),
          side: t.side,
          pnl: t.pnl,
          brokerTradeId: t.brokerTradeId ?? null,
          entryPrice: t.entryPrice ?? null,
          exitPrice: t.exitPrice ?? null,
          entryTime: t.entryTime ?? null,
          exitTime:  t.exitTime  ?? null,
          qty: t.qty ?? null,
          commission: t.commission ?? null,
          assetType: t.assetType ?? null,
          duration,
          source: "broker",
          checkinScore: t.date === today ? (todayCheckin?.score ?? null) : null,
        };
      }),
    });
  }

  await db.brokerConnection.update({
    where: { id: connId },
    data: { lastSyncAt: new Date(), status: "active" },
  });

  if (opts.notify && toCreate.length > 0) {
    await sendPushToUser(userId, {
      title: `${toCreate.length} new trade${toCreate.length !== 1 ? "s" : ""} synced`,
      body: `${conn.broker.toUpperCase()} → TradeMind journal updated automatically.`,
      url: "/journal",
    }).catch(() => {});
  }

  return { imported: toCreate.length, total: trades.length, broker: conn.broker };
}

// Sync ALL broker connections for a user and aggregate results
export async function syncJournalForUser(
  userId: string,
  opts: { notify?: boolean; force?: boolean } = {}
): Promise<SyncResult | null> {
  const conns = await db.brokerConnection.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (conns.length === 0) return null;

  let totalImported = 0;
  let totalTrades = 0;
  let primaryBroker = conns[0].broker;
  let anySuccess = false;

  for (const conn of conns) {
    const result = await syncConnection(userId, conn.id, opts);
    if (result) {
      totalImported += result.imported;
      totalTrades   += result.total;
      primaryBroker  = result.broker;
      anySuccess = true;
    }
  }

  if (!anySuccess) return null;
  return { imported: totalImported, total: totalTrades, broker: primaryBroker };
}
