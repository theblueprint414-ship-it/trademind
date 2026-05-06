"use client";

import { useEffect, useRef, useState } from "react";

interface TradeChartProps {
  symbol: string;
  side: "long" | "short";
  entryPrice?: number | null;
  exitPrice?: number | null;
  entryTime?: string | null;
  exitTime?: string | null;
  pnl?: number | null;
  mentalScore?: number | null;
  height?: number;
}

type Candle = { time: number; open: number; high: number; low: number; close: number };

function isCrypto(symbol: string) {
  return /USDT|USDC|BTC|ETH|BNB|SOL|XRP|DOGE|AVAX|MATIC/i.test(symbol);
}

function normalizeSymbol(symbol: string): { type: "crypto" | "stock" | "futures"; fetchSymbol: string } {
  const s = symbol.toUpperCase().replace("/", "");
  if (isCrypto(s)) {
    const normalized = s.includes("USDT") ? s : s + "USDT";
    return { type: "crypto", fetchSymbol: normalized };
  }
  if (/^(NQ|ES|YM|RTY|CL|GC|SI|NG|ZB|ZN|MNQ|MES)/.test(s)) {
    return { type: "futures", fetchSymbol: s };
  }
  return { type: "stock", fetchSymbol: s };
}

async function fetchCryptoCandles(symbol: string, entryTime: string | null, exitTime: string | null): Promise<Candle[]> {
  const end = exitTime ? new Date(exitTime).getTime() + 3_600_000 : Date.now();
  const start = entryTime ? new Date(entryTime).getTime() - 3_600_000 : end - 14_400_000;
  const range = end - start;
  const interval = range < 3_600_000 ? "1m" : range < 14_400_000 ? "5m" : "15m";

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${start}&endTime=${end}&limit=200`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((k: unknown[]) => ({
    time: (k[0] as number),
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
  }));
}

async function fetchStockCandles(symbol: string, entryTime: string | null, exitTime: string | null): Promise<Candle[]> {
  const end = exitTime ? new Date(exitTime).getTime() + 3_600_000 : Date.now();
  const start = entryTime ? new Date(entryTime).getTime() - 3_600_000 : end - 14_400_000;
  const range = end - start;
  const interval = range < 3_600_000 ? "1m" : range < 14_400_000 ? "5m" : "15m";

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&period1=${Math.floor(start / 1000)}&period2=${Math.floor(end / 1000)}`;
  const res = await fetch(`/api/price-proxy?url=${encodeURIComponent(url)}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) return [];
  const timestamps: number[] = result.timestamp ?? [];
  const ohlcv = result.indicators?.quote?.[0];
  if (!ohlcv || !timestamps.length) return [];
  return timestamps.map((t: number, i: number) => ({
    time: t * 1000,
    open: ohlcv.open[i] ?? 0,
    high: ohlcv.high[i] ?? 0,
    low: ohlcv.low[i] ?? 0,
    close: ohlcv.close[i] ?? 0,
  })).filter(c => c.open > 0);
}

export default function TradeChart({
  symbol, side, entryPrice, exitPrice, entryTime, exitTime, pnl, mentalScore, height = 280,
}: TradeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "nodata">("loading");
  const hasChartData = !!(entryPrice && (entryTime || exitTime));

  useEffect(() => {
    if (!hasChartData) { setStatus("nodata"); return; }
    if (!containerRef.current) return;

    let chart: import("lightweight-charts").IChartApi | null = null;
    let destroyed = false;

    async function build() {
      const { createChart, CandlestickSeries, LineSeries } = await import("lightweight-charts");
      if (destroyed || !containerRef.current) return;

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: { background: { color: "transparent" }, textColor: "#9ca3af" },
        grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
        timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
        handleScroll: true,
        handleScale: true,
      });

      const { type, fetchSymbol } = normalizeSymbol(symbol);
      let candles: Candle[] = [];

      try {
        if (type === "crypto") {
          candles = await fetchCryptoCandles(fetchSymbol, entryTime ?? null, exitTime ?? null);
        } else {
          candles = await fetchStockCandles(fetchSymbol, entryTime ?? null, exitTime ?? null);
        }
      } catch {
        // ignore fetch errors
      }

      if (destroyed) { chart?.remove(); return; }

      if (candles.length === 0) {
        setStatus("nodata");
        chart?.remove();
        return;
      }

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#00d084", downColor: "#ff3b5c",
        borderUpColor: "#00d084", borderDownColor: "#ff3b5c",
        wickUpColor: "#00d084", wickDownColor: "#ff3b5c",
      });

      const chartData = candles.map(c => ({
        time: Math.floor(c.time / 1000) as import("lightweight-charts").UTCTimestamp,
        open: c.open, high: c.high, low: c.low, close: c.close,
      }));
      candleSeries.setData(chartData);

      // Entry line
      if (entryPrice) {
        const entryLine = chart.addSeries(LineSeries, {
          color: "#5e6ad2", lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false,
        });
        entryLine.setData(chartData.map(d => ({ time: d.time, value: entryPrice })));
      }

      // Exit line
      if (exitPrice) {
        const isProfit = pnl !== null && pnl !== undefined ? pnl >= 0 : side === "long" ? (exitPrice > (entryPrice ?? 0)) : (exitPrice < (entryPrice ?? 0));
        const exitLine = chart.addSeries(LineSeries, {
          color: isProfit ? "#00d084" : "#ff3b5c",
          lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false,
        });
        exitLine.setData(chartData.map(d => ({ time: d.time, value: exitPrice })));
      }

      chart.timeScale().fitContent();
      setStatus("ready");
    }

    build();
    return () => { destroyed = true; chart?.remove(); };
  }, [symbol, entryPrice, exitPrice, entryTime, exitTime, pnl, side, height, hasChartData]);

  const isProfit = pnl !== null && pnl !== undefined && pnl >= 0;

  return (
    <div style={{ position: "relative" }}>
      {/* Mental score overlay */}
      {mentalScore !== null && mentalScore !== undefined && (
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 10,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
          padding: "5px 10px", fontSize: 12, fontWeight: 700,
          color: mentalScore >= 7 ? "#00d084" : mentalScore >= 5 ? "#ffb020" : "#ff3b5c",
        }}>
          Mental {mentalScore}/10
        </div>
      )}

      {/* P&L overlay */}
      {pnl !== null && pnl !== undefined && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          border: `1px solid ${isProfit ? "rgba(0,208,132,0.3)" : "rgba(255,59,92,0.3)"}`,
          borderRadius: 8, padding: "5px 10px", fontSize: 13, fontWeight: 800,
          color: isProfit ? "#00d084" : "#ff3b5c",
        }}>
          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
        </div>
      )}

      {status === "loading" && hasChartData && (
        <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)", borderRadius: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: "#5e6ad2", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {status === "nodata" && (
        <div style={{ height: height * 0.6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface2)", borderRadius: 12, gap: 8 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: "var(--text-muted)" }}>
            <rect x="3" y="18" width="5" height="7" rx="1" fill="currentColor" opacity="0.4"/>
            <rect x="11" y="11" width="5" height="14" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="19" y="5" width="5" height="20" rx="1" fill="currentColor"/>
          </svg>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chart available once entry/exit price data syncs</span>
        </div>
      )}

      <div ref={containerRef} style={{ display: status === "ready" ? "block" : "none", borderRadius: 12, overflow: "hidden" }} />
    </div>
  );
}