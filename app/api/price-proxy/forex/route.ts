// Proxy for Twelve Data time series — keeps API key server-side
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const TD_INTERVAL: Record<string, string> = { "1m": "1min", "5m": "5min", "15m": "15min", "30m": "30min", "1h": "1h" };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol   = searchParams.get("symbol");
    const interval = searchParams.get("interval") ?? "1m";
    const start    = searchParams.get("start");
    const end      = searchParams.get("end");

    const apiKey = (process.env.TWELVE_DATA_API_KEY ?? "").trim();
    if (!apiKey) return Response.json({ error: "no_key" }, { status: 204 });
    if (!symbol || !start || !end) return Response.json({ error: "missing params" }, { status: 400 });

    const startMs = parseInt(start, 10);
    const endMs   = parseInt(end, 10);
    if (isNaN(startMs) || isNaN(endMs)) return Response.json({ error: "invalid timestamps" }, { status: 400 });

    const startDate = new Date(startMs).toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
    const endDate   = new Date(endMs).toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
    const tdInterval = TD_INTERVAL[interval] ?? "1min";

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${tdInterval}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&outputsize=500&timezone=UTC&apikey=${apiKey}`;

    const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return Response.json({ error: `upstream ${r.status}` }, { status: r.status });
    const d = await r.json() as { status?: string; values?: unknown[] };
    if (d.status === "error" || !d.values?.length) return Response.json({ error: "no_data" }, { status: 204 });
    return Response.json(d, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    return Response.json({ error: "internal", detail: String(e) }, { status: 502 });
  }
}