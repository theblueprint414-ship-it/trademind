import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { fetchHistoricalTrades } from "@/lib/brokers";
import { safeDecrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// POST /api/broker/sync-journal
// Pulls trades from the connected broker and inserts new ones into the journal.
// First sync (no lastSyncAt): fetches 90 days of history.
// Subsequent syncs: fetches since last sync + 2-day buffer to catch gaps.
// Skips duplicates (by date+symbol). Also keeps the TradeLimit count in sync.
// Returns { ok, imported, total, broker }
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["premium"]);
  if (!guard.ok) return guard.response;

  const conn = await db.brokerConnection.findUnique({ where: { userId: guard.userId } });
  if (!conn) return Response.json({ error: "No broker connected" }, { status: 404 });

  // Days to look back: 90 on first-ever sync, otherwise days since last sync + 2-day buffer
  let daysBack = 90;
  if (conn.lastSyncAt) {
    const daysSince = Math.ceil((Date.now() - conn.lastSyncAt.getTime()) / (1000 * 60 * 60 * 24));
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
    await db.brokerConnection.update({ where: { userId: guard.userId }, data: { status: "error" } });
    return Response.json({ error: "Could not reach broker" }, { status: 502 });
  }

  if (trades.length === 0) {
    await db.brokerConnection.update({ where: { userId: guard.userId }, data: { lastSyncAt: new Date(), status: "active" } });
    return Response.json({ ok: true, imported: 0, total: 0, broker: conn.broker });
  }

  // Deduplicate: skip entries where same date+symbol already exists in the journal
  const existing = await db.tradeEntry.findMany({
    where: { userId: guard.userId },
    select: { date: true, symbol: true },
  });
  const existingSet = new Set(existing.map((e) => `${e.date}:${e.symbol ?? ""}`));

  const toCreate = trades.filter((t) => !existingSet.has(`${t.date}:${t.symbol}`));

  if (toCreate.length > 0) {
    await db.tradeEntry.createMany({
      data: toCreate.map((t) => ({
        userId: guard.userId,
        date: t.date,
        symbol: t.symbol.slice(0, 20),
        side: t.side,
        pnl: t.pnl,
      })),
    });
  }

  // Keep the TradeLimit Trade table in sync for today
  const today = new Date().toISOString().split("T")[0];
  const todayCount = trades.filter((t) => t.date === today).length;
  await db.trade.deleteMany({ where: { userId: guard.userId, date: today } });
  if (todayCount > 0) {
    await db.trade.createMany({
      data: Array.from({ length: todayCount }).map(() => ({ userId: guard.userId, date: today })),
    });
  }

  await db.brokerConnection.update({
    where: { userId: guard.userId },
    data: { lastSyncAt: new Date(), status: "active" },
  });

  return Response.json({ ok: true, imported: toCreate.length, total: trades.length, broker: conn.broker });
}