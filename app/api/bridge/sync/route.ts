// EdgeBridge sync — receives trades from the desktop app and upserts them
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

type IncomingTrade = {
  brokerTradeId: string;
  date: string;            // YYYY-MM-DD
  symbol?: string;
  side?: "long" | "short";
  pnl?: number;
  entryPrice?: number;
  exitPrice?: number;
  entryTime?: string;      // ISO datetime
  exitTime?: string;       // ISO datetime
  qty?: number;
  commission?: number;
  assetType?: string;
  stopLoss?: number;
  takeProfit?: number;
  riskAmount?: number;
};

const ASSET_TYPES = ["futures", "forex", "crypto", "stocks", "options"];
const MAX_BATCH = 100;

async function resolveUserId(token: string): Promise<string | null> {
  const record = await db.bridgeToken.findUnique({
    where: { token },
    select: { userId: true, id: true },
  });
  if (!record) return null;
  // Update lastUsedAt without blocking response
  db.bridgeToken.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});
  return record.userId;
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  // Auth via Bearer token (EdgeBridge desktop sends Authorization: Bearer <token>)
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const userId = await resolveUserId(token);
  if (!userId) {
    return Response.json({ error: "Invalid or revoked token" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { trades, source } = body as { trades: unknown; source?: string };
  if (!Array.isArray(trades)) {
    return Response.json({ error: "trades must be an array" }, { status: 400 });
  }
  if (trades.length > MAX_BATCH) {
    return Response.json({ error: `Max ${MAX_BATCH} trades per request` }, { status: 400 });
  }

  const syncSource = ["manual", "edgebridge", "csv"].includes(source ?? "") ? (source as string) : "edgebridge";

  const results = { created: 0, updated: 0, skipped: 0, errors: 0 };

  for (const raw of trades) {
    const t = raw as IncomingTrade;

    // Validate required fields
    if (!t.brokerTradeId || typeof t.brokerTradeId !== "string") { results.errors++; continue; }
    if (!t.date || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) { results.errors++; continue; }
    if (t.side !== undefined && t.side !== null && !["long", "short"].includes(t.side)) { results.errors++; continue; }

    const safeNum = (v: unknown): number | null =>
      typeof v === "number" && isFinite(v) ? v : null;

    const pnl = safeNum(t.pnl);
    const riskAmount = safeNum(t.riskAmount);
    const rMultiple = riskAmount && riskAmount > 0 && pnl !== null
      ? Math.round((pnl / riskAmount) * 100) / 100
      : null;

    let duration: number | null = null;
    if (t.entryTime && t.exitTime) {
      const ms = new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime();
      if (ms > 0 && ms < 86400000 * 7) duration = Math.round(ms / 1000);
    }

    const data = {
      userId,
      date: t.date,
      source: syncSource,
      brokerTradeId: String(t.brokerTradeId).slice(0, 100),
      symbol: t.symbol ? String(t.symbol).slice(0, 20).trim() : null,
      side: t.side ?? null,
      pnl,
      entryPrice: safeNum(t.entryPrice),
      exitPrice: safeNum(t.exitPrice),
      entryTime: t.entryTime ? String(t.entryTime) : null,
      exitTime: t.exitTime ? String(t.exitTime) : null,
      qty: safeNum(t.qty),
      commission: safeNum(t.commission),
      assetType: typeof t.assetType === "string" && ASSET_TYPES.includes(t.assetType) ? t.assetType : null,
      stopLoss: safeNum(t.stopLoss),
      takeProfit: safeNum(t.takeProfit),
      riskAmount,
      rMultiple,
      duration,
    };

    try {
      // Dedup: check if a trade with this brokerTradeId already exists for this user
      const existing = await db.tradeEntry.findFirst({
        where: { userId, brokerTradeId: data.brokerTradeId },
        select: { id: true },
      });

      if (existing) {
        // Update price/pnl fields only — don't overwrite user-added notes/tags
        await db.tradeEntry.update({
          where: { id: existing.id },
          data: {
            pnl: data.pnl,
            entryPrice: data.entryPrice,
            exitPrice: data.exitPrice,
            entryTime: data.entryTime,
            exitTime: data.exitTime,
            qty: data.qty,
            commission: data.commission,
            rMultiple: data.rMultiple,
            duration: data.duration,
          },
        });
        results.updated++;
      } else {
        await db.tradeEntry.create({ data });
        results.created++;
      }
    } catch (err) {
      logger.error("Bridge sync trade failed", err, { userId, brokerTradeId: t.brokerTradeId });
      results.errors++;
    }
  }

  // Update brokers list on token
  if (body.brokers && Array.isArray(body.brokers)) {
    const safeB = body.brokers.slice(0, 10).map((b: unknown) => String(b).slice(0, 30));
    db.bridgeToken.updateMany({
      where: { userId, token },
      data: { brokers: JSON.stringify(safeB) },
    }).catch(() => {});
  }

  return Response.json({ ok: true, ...results });
}