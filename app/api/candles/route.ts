import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// Fetch OHLCV bars from Alpaca around a trade's entry/exit time
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("tradeId");
  const timeframe = (searchParams.get("timeframe") ?? "5Min") as string;

  if (!tradeId) return Response.json({ error: "tradeId required" }, { status: 400 });

  const trade = await db.tradeEntry.findUnique({ where: { id: tradeId } });
  if (!trade || trade.userId !== auth.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Need a symbol and at least a date
  if (!trade.symbol) return Response.json({ error: "Trade has no symbol" }, { status: 422 });

  // Find user's Alpaca connection
  const alpacaConn = await db.brokerConnection.findFirst({
    where: { userId: auth.userId, broker: "alpaca", status: "active" },
  });
  if (!alpacaConn) {
    return Response.json({ error: "No Alpaca connection — connect Alpaca in Settings to see charts" }, { status: 422 });
  }

  // Build the time window: 2h before entry, 2h after exit
  const entryMs = trade.entryTime
    ? new Date(trade.entryTime).getTime()
    : new Date(trade.date + "T13:30:00Z").getTime(); // assume NYSE open
  const exitMs = trade.exitTime
    ? new Date(trade.exitTime).getTime()
    : entryMs + 2 * 3600 * 1000;

  const windowStart = new Date(entryMs - 2 * 3600 * 1000).toISOString();
  const windowEnd   = new Date(exitMs  + 2 * 3600 * 1000).toISOString();

  const TF_MAP: Record<string, string> = {
    "1Min": "1Min", "5Min": "5Min", "15Min": "15Min",
  };
  const alpacaTf = TF_MAP[timeframe] ?? "5Min";

  // Normalize symbol for Alpaca
  const sym = trade.symbol.replace("/", "").replace("-", "").toUpperCase();

  const baseUrl = alpacaConn.environment === "paper"
    ? "https://data.alpaca.markets"
    : "https://data.alpaca.markets";

  const url = `${baseUrl}/v2/stocks/${encodeURIComponent(sym)}/bars?timeframe=${alpacaTf}&start=${encodeURIComponent(windowStart)}&end=${encodeURIComponent(windowEnd)}&limit=500&feed=iex`;

  const resp = await fetch(url, {
    headers: {
      "APCA-API-KEY-ID": alpacaConn.apiKey,
      "APCA-API-SECRET-KEY": alpacaConn.apiSecret ?? "",
    },
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return Response.json({ error: `Alpaca error: ${txt.slice(0, 200)}` }, { status: resp.status });
  }

  const data = await resp.json() as { bars: { t: string; o: number; h: number; l: number; c: number; v: number }[] };
  const bars = (data.bars ?? []).map((b) => ({
    time: Math.floor(new Date(b.t).getTime() / 1000),
    open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v,
  }));

  return Response.json({
    bars,
    entryTime: trade.entryTime ? Math.floor(new Date(trade.entryTime).getTime() / 1000) : null,
    exitTime: trade.exitTime ? Math.floor(new Date(trade.exitTime).getTime() / 1000) : null,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    side: trade.side,
  });
}
