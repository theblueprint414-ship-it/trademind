"use client";
import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi, SeriesMarker, UTCTimestamp, ISeriesMarkersPluginApi } from "lightweight-charts";

type Candle = { time: number; open: number; high: number; low: number; close: number };
type Phase = "loading" | "ready" | "playing" | "paused" | "done" | "nodata";
type Speed = 1 | 2 | 4 | 8;

const TICK_MS: Record<Speed, number> = { 1: 600, 2: 300, 4: 150, 8: 60 };
const PRE = 14;
const POST = 6;

// Known futures base symbols (strip contract month/year before appending =F)
const FUTURES_BASES = new Set(["ES","NQ","CL","GC","SI","ZB","YM","RTY","NKD","NG","HO","RB","ZC","ZW","ZS","ZM","ZL","KC","CT","CC","SB","OJ","MES","MNQ","MCL","MGC","M6E","M6A","MBT","MET","FDAX","FESX"]);
const CCY_SET = new Set(["EUR","GBP","JPY","CHF","AUD","CAD","NZD","USD","MXN","SGD","HKD","NOK","SEK","DKK","ZAR","TRY","CNH","PLN","CZK","HUF"]);

function normalizeForFetch(symbol: string): { crypto: boolean; isForex: boolean; isFutures: boolean; binanceSym: string; yahooSym: string; twelveDataSym: string; stooqSym: string } {
  // Strip contract months (ESH24, NQ1!, EUR/USD.p), periods/slashes
  const s = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "")
    .replace(/[FGHJKMNQUVXZ]\d{1,2}$/, "")  // contract month+year suffix
    .replace(/\d{2,4}$/, "")                  // year-only suffix
    .replace(/1$/, "");                        // "1!" continuous contract suffix

  const crypto  = /USDT|USDC|BTC|ETH|BNB|SOL|XRP|DOGE|AVAX|MATIC|LINK|UNI|AAVE/.test(s);
  const isForex = !crypto && s.length === 6 && CCY_SET.has(s.slice(0, 3)) && CCY_SET.has(s.slice(3));
  const isFutures = !crypto && !isForex && FUTURES_BASES.has(s);

  const binanceSym    = crypto ? (s.includes("USDT") ? s : s + "USDT") : "";
  const yahooSym      = isForex ? s + "=X" : isFutures ? s + "=F" : s;
  const twelveDataSym = isForex ? s.slice(0, 3) + "/" + s.slice(3) : s;
  const stooqSym      = isForex ? s.toLowerCase() : isFutures ? s.toLowerCase() + ".f" : s.toLowerCase() + ".us";

  return { crypto, isForex, isFutures, binanceSym, yahooSym, twelveDataSym, stooqSym };
}

async function fetchFromYahoo(yahooSym: string, start: number, end: number, interval: string): Promise<Candle[]> {
  const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=${interval}&period1=${Math.floor(start / 1000)}&period2=${Math.floor(end / 1000)}`;
  try {
    const r = await fetch(`/api/price-proxy?url=${encodeURIComponent(yUrl)}`, { cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json() as { chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ open: number[]; high: number[]; low: number[]; close: number[] }> } }> } };
    const res = d?.chart?.result?.[0];
    if (!res?.timestamp) return [];
    const ts = res.timestamp as number[];
    const q = res.indicators?.quote?.[0];
    if (!q) return [];
    return ts.map((t, i) => ({
      time: t * 1000, open: q.open[i] ?? 0, high: q.high[i] ?? 0,
      low: q.low[i] ?? 0, close: q.close[i] ?? 0,
    })).filter(c => c.open > 0);
  } catch { return []; }
}

// Stooq: free intraday data, no API key, returns CSV
async function fetchFromStooq(stooqSym: string, start: number, end: number, interval: string): Promise<Candle[]> {
  const stooqInterval: Record<string, string> = { "1m": "m", "5m": "5", "15m": "15" };
  const i = stooqInterval[interval] ?? "m";
  const fmt = (ts: number) => new Date(ts).toISOString().slice(0, 10).replace(/-/g, "");
  const url = `https://stooq.com/q/d/l/?s=${stooqSym}&d1=${fmt(start)}&d2=${fmt(end)}&i=${i}`;
  try {
    const r = await fetch(`/api/price-proxy?url=${encodeURIComponent(url)}`, { cache: "no-store" });
    if (!r.ok) return [];
    const text = await r.text();
    const lines = text.trim().split("\n").slice(1); // skip header
    const candles: Candle[] = [];
    for (const line of lines) {
      const [date, time, open, high, low, close] = line.split(",");
      if (!date || !open) continue;
      const ts = time
        ? new Date(`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}T${time}Z`).getTime()
        : new Date(`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}T12:00:00Z`).getTime();
      const o = parseFloat(open), h = parseFloat(high), l = parseFloat(low), c = parseFloat(close);
      if (o > 0) candles.push({ time: ts, open: o, high: h, low: l, close: c });
    }
    return candles;
  } catch { return []; }
}

async function fetchFromTwelveData(sym: string, start: number, end: number, interval: string): Promise<Candle[]> {
  try {
    const r = await fetch(`/api/price-proxy/forex?symbol=${encodeURIComponent(sym)}&interval=${interval}&start=${start}&end=${end}`, { cache: "no-store" });
    if (!r.ok || r.status === 204) return [];
    const d = await r.json() as { values?: Array<{ datetime: string; open: string; high: string; low: string; close: string }> };
    if (!d.values?.length) return [];
    return d.values.slice().reverse().map(v => ({
      time: new Date(v.datetime.includes("T") ? v.datetime : v.datetime + "Z").getTime(),
      open: parseFloat(v.open), high: parseFloat(v.high),
      low: parseFloat(v.low), close: parseFloat(v.close),
    })).filter(c => c.open > 0);
  } catch { return []; }
}

async function fetchCandles(symbol: string, entryTime: string, exitTime: string): Promise<Candle[]> {
  const end   = new Date(exitTime).getTime()  + 5_400_000;
  const start = new Date(entryTime).getTime() - 5_400_000;
  const range = end - start;
  const interval = range < 7_200_000 ? "1m" : range < 21_600_000 ? "5m" : "15m";
  const { crypto, isForex, binanceSym, yahooSym, twelveDataSym, stooqSym } = normalizeForFetch(symbol);

  // Crypto: Binance
  if (crypto) {
    try {
      const binInterval = interval === "1m" ? "1m" : interval === "5m" ? "5m" : "15m";
      const r = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${binanceSym}&interval=${binInterval}&startTime=${start}&endTime=${end}&limit=500`,
        { cache: "no-store" }
      );
      if (!r.ok) return [];
      const d = (await r.json()) as unknown[][];
      return d.map(k => ({
        time: k[0] as number,
        open: parseFloat(k[1] as string), high: parseFloat(k[2] as string),
        low: parseFloat(k[3] as string), close: parseFloat(k[4] as string),
      }));
    } catch { return []; }
  }

  // Forex: Twelve Data → Yahoo Finance → Stooq
  if (isForex) {
    const td = await fetchFromTwelveData(twelveDataSym, start, end, interval);
    if (td.length > 0) return td;
    const yf = await fetchFromYahoo(yahooSym, start, end, interval);
    if (yf.length > 0) return yf;
    return fetchFromStooq(stooqSym, start, end, interval);
  }

  // Stocks / Futures: Yahoo Finance → Stooq
  const yf = await fetchFromYahoo(yahooSym, start, end, interval);
  if (yf.length > 0) return yf;
  return fetchFromStooq(stooqSym, start, end, interval);
}

export interface TradeReplayProps {
  symbol: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  pnl?: number | null;
  qty?: number | null;
  onClose: () => void;
}

export default function TradeReplay({
  symbol, side, entryPrice, exitPrice, entryTime, exitTime, pnl, qty, onClose,
}: TradeReplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<UTCTimestamp> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(0);
  const replayRef = useRef<Candle[]>([]);
  const markersRef = useRef<SeriesMarker<UTCTimestamp>[]>([]);
  const entryIdxRef = useRef(-1);
  const exitIdxRef = useRef(-1);
  const entryHitRef = useRef(false);
  const exitHitRef = useRef(false);
  const chartCreatedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("loading");
  const [speed, setSpeed] = useState<Speed>(4);
  const [currentTs, setCurrentTs] = useState(0);
  const [currentClose, setCurrentClose] = useState(0);
  const [entryHit, setEntryHit] = useState(false);
  const [exitHit, setExitHit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const entryTs = new Date(entryTime).getTime();
  const exitTs = new Date(exitTime).getTime();

  // Load candles once
  useEffect(() => {
    let cancelled = false;
    fetchCandles(symbol, entryTime, exitTime)
      .then(candles => {
        if (cancelled) return;
        if (!candles.length) { setPhase("nodata"); return; }
        const entryRaw = candles.findIndex(c => c.time >= entryTs);
        const exitRaw = candles.findIndex(c => c.time >= exitTs);
        const si = Math.max(0, (entryRaw >= 0 ? entryRaw : 0) - PRE);
        const ei = Math.min(candles.length, (exitRaw >= 0 ? exitRaw : candles.length - 1) + POST + 1);
        const slice = candles.slice(si, ei);
        replayRef.current = slice;
        entryIdxRef.current = entryRaw >= 0 ? entryRaw - si : -1;
        exitIdxRef.current = exitRaw >= 0 ? exitRaw - si : slice.length - 1;
        setPhase("ready");
      })
      .catch(() => { if (!cancelled) setPhase("nodata"); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Init chart once when entering "ready"
  useEffect(() => {
    if (phase !== "ready" || chartCreatedRef.current) return;
    if (!containerRef.current) return;
    chartCreatedRef.current = true;
    let destroyed = false;

    (async () => {
      const { createChart, CandlestickSeries, createSeriesMarkers } = await import("lightweight-charts");
      if (destroyed || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        layout: { background: { color: "transparent" }, textColor: "#9ca3af" },
        grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
        timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
      });
      chartRef.current = chart;

      const cs = chart.addSeries(CandlestickSeries, {
        upColor: "#00d084", downColor: "#ff3b5c",
        borderUpColor: "#00d084", borderDownColor: "#ff3b5c",
        wickUpColor: "#00d084", wickDownColor: "#ff3b5c",
      });
      seriesRef.current = cs;
      markersPluginRef.current = createSeriesMarkers(cs, []) as ISeriesMarkersPluginApi<UTCTimestamp>;

      const c = replayRef.current[0];
      if (c) {
        cs.setData([{ time: Math.floor(c.time / 1000) as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close }]);
        setCurrentTs(c.time);
        setCurrentClose(c.close);
      }
    })();

    return () => { destroyed = true; };
  }, [phase]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      chartRef.current?.remove();
    };
  }, []);

  function stopAnim() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function showFlash(msg: string) {
    setFlash(msg);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), 1800);
  }

  function tick() {
    const series = seriesRef.current;
    const replay = replayRef.current;
    if (!series || !replay.length) return;

    const next = idxRef.current + 1;
    if (next >= replay.length) {
      stopAnim();
      setPhase("done");
      return;
    }
    idxRef.current = next;
    const c = replay[next];

    series.update({ time: Math.floor(c.time / 1000) as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close });
    setCurrentTs(c.time);
    setCurrentClose(c.close);
    setProgress(next / Math.max(1, replay.length - 1));

    // Entry event
    if (next >= entryIdxRef.current && entryIdxRef.current >= 0 && !entryHitRef.current) {
      entryHitRef.current = true;
      setEntryHit(true);
      const ec = replay[entryIdxRef.current];
      markersRef.current = [...markersRef.current, {
        time: Math.floor(ec.time / 1000) as UTCTimestamp,
        position: side === "long" ? "belowBar" : "aboveBar",
        color: "#5e6ad2",
        shape: side === "long" ? "arrowUp" : "arrowDown",
        text: `ENTRY ${entryPrice}`,
        size: 1.5,
      }];
      markersPluginRef.current?.setMarkers(markersRef.current);
      showFlash(`ENTERED @ ${entryPrice}`);
    }

    // Exit event
    if (next >= exitIdxRef.current && exitIdxRef.current >= 0 && !exitHitRef.current) {
      exitHitRef.current = true;
      setExitHit(true);
      const xc = replay[exitIdxRef.current];
      const win = pnl !== null && pnl !== undefined ? pnl >= 0 : null;
      markersRef.current = [...markersRef.current, {
        time: Math.floor(xc.time / 1000) as UTCTimestamp,
        position: side === "long" ? "aboveBar" : "belowBar",
        color: win === null ? "#9ca3af" : win ? "#00d084" : "#ff3b5c",
        shape: "square" as const,
        text: `EXIT ${exitPrice}`,
        size: 1.5,
      }];
      markersPluginRef.current?.setMarkers(markersRef.current);
      showFlash(`EXITED @ ${exitPrice}`);
    }
  }

  function startPlay(spd?: Speed) {
    stopAnim();
    setPhase("playing");
    timerRef.current = setInterval(tick, TICK_MS[spd ?? speed]);
  }

  function pause() { stopAnim(); setPhase("paused"); }

  function restart() {
    stopAnim();
    const series = seriesRef.current;
    const replay = replayRef.current;
    if (!series || !replay.length) return;
    const c = replay[0];
    series.setData([{ time: Math.floor(c.time / 1000) as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close }]);
    markersPluginRef.current?.setMarkers([]);
    markersRef.current = [];
    idxRef.current = 0;
    entryHitRef.current = false;
    exitHitRef.current = false;
    setEntryHit(false);
    setExitHit(false);
    setProgress(0);
    setCurrentTs(c.time);
    setCurrentClose(c.close);
    setPhase("ready");
  }

  // Restart interval when speed changes while playing
  useEffect(() => {
    if (phase === "playing") {
      stopAnim();
      timerRef.current = setInterval(tick, TICK_MS[speed]);
    }
  }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const runningPnl = entryHit && !exitHit
    ? (side === "long" ? currentClose - entryPrice : entryPrice - currentClose) * (qty ?? 1)
    : null;
  const isProfitTrade = pnl !== null && pnl !== undefined ? pnl >= 0 : null;
  const showControls = phase === "playing" || phase === "paused";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "14px 20px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 900 }}>{symbol}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: side === "long" ? "rgba(0,208,132,0.12)" : "rgba(255,59,92,0.12)", color: side === "long" ? "#00d084" : "#ff3b5c" }}>
            {side.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Trade Replay</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {phase === "loading" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "var(--bg)" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: "#5e6ad2", animation: "rspin 0.8s linear infinite" }} />
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading price data…</span>
            <style>{`@keyframes rspin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {phase === "nodata" && (() => {
          const { isForex, isFutures } = normalizeForFetch(symbol);
          const hint = isForex
            ? "Add a free Twelve Data API key (TWELVE_DATA_API_KEY) to enable forex replay."
            : isFutures
            ? "Futures intraday data requires a recent trade — historical replay may not be available."
            : "Intraday price data unavailable for this symbol or time range.";
          return (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "var(--bg)", padding: 32 }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ color: "var(--text-muted)" }}>
                <rect x="4" y="28" width="8" height="12" rx="2" fill="currentColor" opacity="0.3"/>
                <rect x="17" y="18" width="8" height="22" rx="2" fill="currentColor" opacity="0.5"/>
                <rect x="30" y="8" width="8" height="32" rx="2" fill="currentColor" opacity="0.7"/>
                <path d="M6 6l32 32" stroke="#ff3b5c" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Price data unavailable</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", maxWidth: 300, lineHeight: 1.6 }}>{hint}</span>
            </div>
          );
        })()}

        {phase === "ready" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <button
                onClick={() => startPlay()}
                style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#5e6ad2,#8B5CF6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 40px rgba(94,106,210,0.55)" }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M10 6l18 10-18 10V6z" fill="white"/>
                </svg>
              </button>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                {replayRef.current.length} candles · {entryIdxRef.current >= 0 ? entryIdxRef.current : "?"} candles of context before entry
              </span>
            </div>
          </div>
        )}

        {/* Flash notification */}
        {flash && (
          <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", background: flash.startsWith("ENTERED") ? "rgba(94,106,210,0.93)" : isProfitTrade ? "rgba(0,208,132,0.93)" : "rgba(255,59,92,0.93)", backdropFilter: "blur(10px)", borderRadius: 10, padding: "9px 24px", fontSize: 14, fontWeight: 800, color: "white", letterSpacing: "0.04em", pointerEvents: "none", animation: "rflash 1.8s ease forwards" }}>
            {flash}
            <style>{`@keyframes rflash{0%{opacity:0;transform:translateX(-50%) translateY(-10px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}75%{opacity:1}100%{opacity:0}}`}</style>
          </div>
        )}

        {/* Running unrealized P&L */}
        {runningPnl !== null && (
          <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", border: `1px solid ${runningPnl >= 0 ? "rgba(0,208,132,0.35)" : "rgba(255,59,92,0.35)"}`, borderRadius: 12, padding: "10px 16px" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 2 }}>UNREALIZED</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: runningPnl >= 0 ? "#00d084" : "#ff3b5c" }}>
              {runningPnl >= 0 ? "+" : ""}{qty ? `$${Math.abs(runningPnl).toFixed(2)}` : `${Math.abs(runningPnl).toFixed(2)} pts`}
            </div>
          </div>
        )}

        {/* Current timestamp */}
        {(phase === "playing" || phase === "paused" || phase === "done") && currentTs > 0 && (
          <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>
            {new Date(currentTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}

        {/* Done overlay */}
        {phase === "done" && isProfitTrade !== null && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
            <div style={{ background: "var(--surface)", border: `1px solid ${isProfitTrade ? "rgba(0,208,132,0.3)" : "rgba(255,59,92,0.3)"}`, borderRadius: 22, padding: "36px 44px", textAlign: "center", boxShadow: `0 20px 60px ${isProfitTrade ? "rgba(0,208,132,0.15)" : "rgba(255,59,92,0.15)"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {isProfitTrade ? "Winner" : "Loser"} · {symbol} {side.toUpperCase()}
              </div>
              <div style={{ fontSize: 46, fontWeight: 900, color: isProfitTrade ? "#00d084" : "#ff3b5c", lineHeight: 1 }}>
                {pnl! >= 0 ? "+" : ""}${Math.abs(pnl!).toFixed(2)}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={restart} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7A5 5 0 1 0 7 2M2 7V3.5M2 7H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Replay
                </button>
                <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#5e6ad2,#8B5CF6)", border: "none", color: "white", cursor: "pointer" }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      {showControls && (
        <div style={{ flexShrink: 0, background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 4, background: "var(--surface2)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg,#5e6ad2,#8B5CF6)", borderRadius: 2, transition: "width 0.08s linear" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={restart} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 9A7 7 0 1 0 9 2M2 9V5.5M2 9H5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {phase === "playing"
              ? <button onClick={pause} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 4, display: "flex" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="5" y="4" width="4" height="14" rx="1.5" fill="currentColor"/>
                    <rect x="13" y="4" width="4" height="14" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
              : <button onClick={() => startPlay()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 4, display: "flex" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M6 4l13 7-13 7V4z" fill="currentColor"/>
                  </svg>
                </button>
            }
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>SPEED</span>
            {([1, 2, 4, 8] as Speed[]).map(s => (
              <button key={s} onClick={() => setSpeed(s)} style={{ padding: "4px 10px", borderRadius: 7, fontSize: 12, fontWeight: 700, border: `1px solid ${speed === s ? "#5e6ad2" : "var(--border)"}`, background: speed === s ? "rgba(94,106,210,0.15)" : "transparent", color: speed === s ? "#5e6ad2" : "var(--text-muted)", cursor: "pointer" }}>
                {s}×
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}