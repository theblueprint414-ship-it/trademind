import { auth } from "@/auth";
import { db } from "@/lib/db";
import { testBrokerConnection, fetchTodayTrades, fetchHistoricalTrades } from "@/lib/brokers";
import { encrypt, safeDecrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

const VALID_BROKERS = ["alpaca", "binance", "bybit", "coinbase", "kraken", "tradovate", "topstepx", "metaapi", "tradestation", "ibkr", "mt4", "dxtrade"];

// GET — get all broker connections for user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conns = await db.brokerConnection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  if (conns.length === 0) return Response.json({ connected: false, connections: [] });

  return Response.json({
    connected: true,
    // Legacy single-connection shape (first connection) for backward compat
    broker: conns[0].broker,
    environment: conns[0].environment,
    status: conns[0].status,
    lastSyncAt: conns[0].lastSyncAt,
    connections: conns.map((c) => ({
      id: c.id,
      name: c.name,
      broker: c.broker,
      environment: c.environment,
      status: c.status,
      lastSyncAt: c.lastSyncAt,
      startingBalance: c.startingBalance,
    })),
  });
}

// POST — add a broker connection
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const isPaid = user?.plan === "pro" || user?.plan === "premium";
  if (!isPaid) {
    return Response.json({ error: "Broker Connect requires a TradeMind subscription." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const { broker, apiKey, apiSecret, environment = "live", name, startingBalance } = body;

  if (!broker || !VALID_BROKERS.includes(broker)) {
    return Response.json({ error: "Invalid broker" }, { status: 400 });
  }
  if (!apiKey || typeof apiKey !== "string" || apiKey.length > 500) {
    return Response.json({ error: "Invalid API key" }, { status: 400 });
  }
  if (apiSecret && (typeof apiSecret !== "string" || apiSecret.length > 500)) {
    return Response.json({ error: "Invalid API secret" }, { status: 400 });
  }

  // Allow up to 5 broker connections
  const existing = await db.brokerConnection.count({ where: { userId } });
  if (existing >= 5) {
    return Response.json({ error: "Maximum 5 broker connections allowed." }, { status: 400 });
  }

  const test = await testBrokerConnection({ broker, apiKey: apiKey.trim(), apiSecret: apiSecret?.trim(), environment: String(environment) });
  if (!test.ok) return Response.json({ error: test.error ?? "Connection failed" }, { status: 400 });

  const keyToStore = test.token ?? apiKey.trim();
  const secretToStore = test.token ? null : (apiSecret?.trim() || null);

  const encryptedKey = encrypt(keyToStore);
  const encryptedSecret = secretToStore ? encrypt(secretToStore) : null;

  const conn = await db.brokerConnection.create({
    data: {
      userId,
      name: name?.trim() || null,
      broker,
      apiKey: encryptedKey,
      apiSecret: encryptedSecret,
      environment: String(environment),
      status: "active",
      startingBalance: startingBalance ? Number(startingBalance) : null,
    },
  });

  // Initial today trade count
  const today = new Date().toISOString().split("T")[0];
  const trades = await fetchTodayTrades({
    broker: conn.broker,
    apiKey: safeDecrypt(conn.apiKey),
    apiSecret: conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined,
    environment: conn.environment,
  });

  if (trades !== null) {
    await db.brokerConnection.update({ where: { id: conn.id }, data: { lastSyncAt: new Date(), status: "active" } });
  }

  // Fire-and-forget 90-day history import
  importHistory(userId, conn.id, conn.broker, safeDecrypt(conn.apiKey), conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined, conn.environment);

  return Response.json({ ok: true, id: conn.id, broker, tradesCount: trades ?? 0 });
}

async function importHistory(userId: string, connId: string, broker: string, apiKey: string, apiSecret: string | undefined, environment: string) {
  try {
    const trades = await fetchHistoricalTrades({ broker, apiKey, apiSecret, environment }, 90);
    if (!trades || trades.length === 0) return;

    const stillConnected = await db.brokerConnection.findUnique({ where: { id: connId }, select: { id: true } });
    if (!stillConnected) return;

    const existing = await db.tradeEntry.findMany({ where: { userId }, select: { date: true, symbol: true, brokerTradeId: true, entryTime: true } });
    const existingIds  = new Set(existing.map((e) => e.brokerTradeId).filter(Boolean));
    const existingKeys = new Set(existing.map((e) => `${e.date}:${e.symbol ?? ""}:${e.entryTime ?? ""}`));
    const toCreate = trades.filter((t) => {
      if (t.brokerTradeId && existingIds.has(t.brokerTradeId)) return false;
      if (!t.brokerTradeId && existingKeys.has(`${t.date}:${t.symbol}:${t.entryTime ?? ""}`)) return false;
      return true;
    });

    if (toCreate.length > 0) {
      await db.tradeEntry.createMany({
        data: toCreate.map((t) => ({
          userId,
          brokerConnectionId: connId,
          date: t.date,
          symbol: t.symbol.slice(0, 20),
          side: t.side,
          pnl: t.pnl,
          source: "broker",
        })),
      });
    }
  } catch { /* silent */ }
}

// DELETE — disconnect a specific broker connection
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (id) {
    await db.brokerConnection.deleteMany({ where: { id, userId: session.user.id } });
  } else {
    // Legacy: delete all
    await db.brokerConnection.deleteMany({ where: { userId: session.user.id } });
  }
  return Response.json({ ok: true });
}

// PATCH — update connection name or starting balance
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, startingBalance } = await request.json().catch(() => ({}));
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  await db.brokerConnection.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(name !== undefined ? { name: name?.trim() || null } : {}),
      ...(startingBalance !== undefined ? { startingBalance: startingBalance ? Number(startingBalance) : null } : {}),
    },
  });

  return Response.json({ ok: true });
}
