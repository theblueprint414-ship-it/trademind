import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { fetchHistoricalTrades } from "@/lib/brokers";
import { safeDecrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["premium"]);
  if (!guard.ok) return guard.response;

  const conn = await db.brokerConnection.findUnique({ where: { userId: guard.userId } });
  if (!conn) return Response.json({ error: "No broker connected" }, { status: 404 });

  const trades = await fetchHistoricalTrades({
    broker: conn.broker,
    apiKey: safeDecrypt(conn.apiKey),
    apiSecret: conn.apiSecret ? safeDecrypt(conn.apiSecret) : undefined,
    environment: conn.environment,
  }, 90);

  if (trades === null) {
    return Response.json({ error: "Failed to fetch trade history from broker" }, { status: 502 });
  }

  if (trades.length === 0) {
    return Response.json({ ok: true, imported: 0, skipped: 0 });
  }

  // Deduplicate: skip entries where same date+symbol already exists
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

  return Response.json({
    ok: true,
    imported: toCreate.length,
    skipped: trades.length - toCreate.length,
  });
}