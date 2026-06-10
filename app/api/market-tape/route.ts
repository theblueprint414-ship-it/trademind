import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// Live quote tape — returns latest quotes for symbols the user has traded
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  let symbols: string[] = [];
  if (symbolsParam) {
    symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 10);
  } else {
    // Auto: top 8 most-traded symbols for this user in last 30 days
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const entries = await db.tradeEntry.findMany({
      where: { userId: auth.userId, date: { gte: cutoff }, symbol: { not: null } },
      select: { symbol: true },
      take: 200,
    });
    const symCounts: Record<string, number> = {};
    for (const e of entries) {
      if (e.symbol) symCounts[e.symbol.toUpperCase()] = (symCounts[e.symbol.toUpperCase()] ?? 0) + 1;
    }
    symbols = Object.entries(symCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([s]) => s);
  }

  if (symbols.length === 0) return Response.json({ quotes: [] });

  // Try Alpaca first
  const alpacaConn = await db.brokerConnection.findFirst({
    where: { userId: auth.userId, broker: "alpaca", status: "active" },
  });

  if (alpacaConn) {
    try {
      const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbols.join(",")}`;
      const resp = await fetch(url, {
        headers: {
          "APCA-API-KEY-ID": alpacaConn.apiKey,
          "APCA-API-SECRET-KEY": alpacaConn.apiSecret ?? "",
        },
      });
      if (resp.ok) {
        const data = await resp.json() as { quotes: Record<string, { ap: number; bp: number; t: string }> };
        const quotes = symbols
          .filter((s) => data.quotes[s])
          .map((s) => {
            const q = data.quotes[s];
            const mid = q.ap && q.bp ? (q.ap + q.bp) / 2 : q.ap ?? q.bp ?? 0;
            return { symbol: s, price: mid, ask: q.ap, bid: q.bp, time: q.t };
          });
        return Response.json({ quotes, source: "alpaca" });
      }
    } catch { /* fall through to Yahoo */ }
  }

  // Fallback: Yahoo Finance quotes (no API key needed)
  try {
    const results = await Promise.all(
      symbols.map(async (sym) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1m&includePrePost=false`;
        const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!r.ok) return null;
        const d = await r.json() as { chart: { result?: { meta: { regularMarketPrice: number; previousClose: number; symbol: string } }[] } };
        const meta = d.chart?.result?.[0]?.meta;
        if (!meta) return null;
        const change = meta.regularMarketPrice - meta.previousClose;
        const changePct = (change / meta.previousClose) * 100;
        return { symbol: sym, price: meta.regularMarketPrice, change, changePct };
      })
    );
    const quotes = results.filter(Boolean);
    return Response.json({ quotes, source: "yahoo" });
  } catch {
    return Response.json({ quotes: [], source: "none" });
  }
}
