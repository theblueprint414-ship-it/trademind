import { auth } from "@/auth";
import { db } from "@/lib/db";
import { testBrokerConnection, fetchTodayTrades, fetchHistoricalTrades } from "@/lib/brokers";
import { encrypt, safeDecrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

const VALID_BROKERS = ["alpaca", "binance", "bybit", "coinbase", "kraken", "tradovate", "topstepx", "metaapi", "tradestation", "ibkr", "mt4"];
const VALID_ENVIRONMENTS = ["live", "paper"];

// GET — get current broker connection
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await db.brokerConnection.findUnique({ where: { userId: session.user.id } });
  if (!conn) return Response.json({ connected: false });

  return Response.json({
    connected: true,
    broker: conn.broker,
    environment: conn.environment,
    status: conn.status,
    lastSyncAt: conn.lastSyncAt,
  });
}

// POST — connect a broker
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

  const { broker, apiKey, apiSecret, environment = "live" } = body;

  // Validate inputs
  if (!broker || !VALID_BROKERS.includes(broker)) {
    return Response.json({ error: "Invalid broker" }, { status: 400 });
  }
  if (!apiKey || typeof apiKey !== "string" || apiKey.length > 500) {
    return Response.json({ error: "Invalid API key" }, { status: 400 });
  }
  if (apiSecret && (typeof apiSecret !== "string" || apiSecret.length > 500)) {
    return Response.json({ error: "Invalid API secret" }, { status: 400 });
  }
  if (!VALID_ENVIRONMENTS.includes(environment)) {
    return Response.json({ error: "Invalid environment" }, { status: 400 });
  }

  // Test the connection before saving
  const test = await testBrokerConnection({ broker, apiKey: apiKey.trim(), apiSecret: apiSecret?.trim(), environment });
  if (!test.ok) return Response.json({ error: test.error ?? "Connection failed" }, { status: 400 });

  // For password-based brokers (e.g. Tradovate), store the returned token — never store the password
  const keyToStore = test.token ?? apiKey.trim();
  const secretToStore = test.token ? null : (apiSecret?.trim() || null);

  const encryptedKey = encrypt(keyToStore);
  const encryptedSecret = secretToStore ? encrypt(secretToStore) : null;

  const conn = await db.brokerConnection.upsert({
    where: { userId },
    update: { broker, apiKey: encryptedKey, apiSecret: encryptedSecret, environment, status: "active", lastSyncAt: null },
    create: { userId, broker, apiKey: encryptedKey, apiSecret: encryptedSecret, environment, status: "active" },
  });


  // Initial trade sync — decrypt before using
  const today = new Date().toISOString().split("T")[0];
  const trades = await fetchTodayTrades({
    broker: conn.broker,
    apiKey: safeDecrypt(conn.apiKey),
    apiSecret: conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined,
    environment: conn.environment,
  });

  if (trades !== null) {
    await db.trade.deleteMany({ where: { userId, date: today } });
    if (trades > 0) {
      await db.trade.createMany({
        data: Array.from({ length: trades }).map(() => ({ userId, date: today })),
      });
    }
    await db.brokerConnection.update({ where: { userId }, data: { lastSyncAt: new Date(), status: "active" } });
  }

  // Auto-import 90-day history in the background (fire-and-forget)
  importHistory(userId, conn.broker, safeDecrypt(conn.apiKey), conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined, conn.environment);

  return Response.json({ ok: true, broker, tradesCount: trades ?? 0 });
}

async function importHistory(userId: string, broker: string, apiKey: string, apiSecret: string | undefined, environment: string) {
  try {
    const trades = await fetchHistoricalTrades({ broker, apiKey, apiSecret, environment }, 90);
    if (!trades || trades.length === 0) return;

    // Abort if the user already disconnected their broker
    const stillConnected = await db.brokerConnection.findUnique({ where: { userId }, select: { id: true } });
    if (!stillConnected) return;

    const existing = await db.tradeEntry.findMany({ where: { userId }, select: { date: true, symbol: true } });
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
        })),
      });
    }
  } catch { /* silent — never block the connect flow */ }
}

// DELETE — disconnect broker
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await db.brokerConnection.deleteMany({ where: { userId: session.user.id } });
  return Response.json({ ok: true });
}
