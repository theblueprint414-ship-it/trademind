"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { showToast } from "@/components/Toast";

// ── Types ─────────────────────────────────────────────────────────────────────

type ParsedTrade = {
  date: string;
  symbol?: string | null;
  side?: string | null;
  pnl?: number | null;
  entryPrice?: number | null;
  exitPrice?: number | null;
  entryTime?: string | null;
  exitTime?: string | null;
  commission?: number | null;
  quantity?: number | null;
  notes?: string | null;
};

type BrokerFormat = "tradovate" | "ninjatrader" | "rithmic" | "mt4" | "generic";

// ── CSV Parsers ───────────────────────────────────────────────────────────────

function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const cols: string[] = [];
    let cur = "";
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
}

function numParse(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v.replace(/[$,\s]/g, ""));
  return isNaN(n) ? null : n;
}

function detectFormat(headers: string[]): BrokerFormat {
  const h = headers.map((x) => x.toLowerCase());
  const has = (k: string) => h.some((x) => x.includes(k));

  if (has("buy price") && has("sell price") && has("contract")) return "tradovate";
  if (has("market pos") || (has("instrument") && has("gross profit"))) return "ninjatrader";
  if (has("rithmic") || (has("entry price") && has("exit price") && has("open time"))) return "rithmic";
  if (has("ticket") && has("open time") && has("s/l")) return "mt4";
  return "generic";
}

function parseTradovate(rows: string[][], headers: string[]): ParsedTrade[] {
  const idx = (name: string) => headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
  const trades: ParsedTrade[] = [];
  for (const row of rows.slice(1)) {
    const get = (i: number) => (i >= 0 ? row[i] ?? "" : "");
    const contractIdx = idx("contract") >= 0 ? idx("contract") : idx("symbol");
    const buyIdx = idx("buy price");
    const sellIdx = idx("sell price");
    const pnlIdx = idx("p&l") >= 0 ? idx("p&l") : idx("pnl");
    const commIdx = idx("commission") >= 0 ? idx("commission") : idx("comm");
    const entryTimeIdx = idx("entry time") >= 0 ? idx("entry time") : idx("open time");
    const exitTimeIdx = idx("exit time") >= 0 ? idx("exit time") : idx("close time");
    const qtyIdx = idx("qty") >= 0 ? idx("qty") : idx("quantity");

    const pnl = numParse(get(pnlIdx));
    if (pnl === null && !get(contractIdx)) continue;

    const buyPrice = numParse(get(buyIdx));
    const sellPrice = numParse(get(sellIdx));
    const isBuy = buyPrice !== null && sellPrice !== null && buyPrice < sellPrice ? false : true;

    const entryTimeRaw = get(entryTimeIdx);
    const date = entryTimeRaw
      ? entryTimeRaw.split(" ")[0].replace(/\//g, "-").replace(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/, (_, m, d, y) => `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`)
      : "";
    if (!date) continue;

    trades.push({
      date,
      symbol: get(contractIdx) || null,
      side: buyPrice !== null && sellPrice !== null ? (buyPrice < sellPrice ? "long" : "short") : null,
      pnl,
      entryPrice: isBuy ? buyPrice : sellPrice,
      exitPrice: isBuy ? sellPrice : buyPrice,
      entryTime: entryTimeRaw || null,
      exitTime: get(exitTimeIdx) || null,
      commission: numParse(get(commIdx)),
      quantity: numParse(get(qtyIdx)),
    });
  }
  return trades;
}

function parseNinjaTrader(rows: string[][], headers: string[]): ParsedTrade[] {
  const idx = (name: string) => headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
  const trades: ParsedTrade[] = [];

  const timeIdx = idx("time") >= 0 ? idx("time") : idx("entry time");
  const instrIdx = idx("instrument") >= 0 ? idx("instrument") : idx("symbol");
  const posIdx = idx("market pos") >= 0 ? idx("market pos") : idx("side");
  const qtyIdx = idx("quantity") >= 0 ? idx("quantity") : idx("qty");
  const entryPIdx = idx("entry price") >= 0 ? idx("entry price") : idx("price");
  const exitPIdx = idx("exit price");
  const commIdx = idx("commission") >= 0 ? idx("commission") : idx("comm");
  const netIdx = idx("net profit") >= 0 ? idx("net profit") : (idx("profit") >= 0 ? idx("profit") : idx("pnl"));
  const exitTimeIdx = idx("exit time");

  for (const row of rows.slice(1)) {
    const get = (i: number) => (i >= 0 ? row[i] ?? "" : "");
    const timeRaw = get(timeIdx);
    if (!timeRaw) continue;

    const datePart = timeRaw.split(" ")[0];
    const date = datePart.replace(/\//g, "-").replace(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/, (_, m, d, y) =>
      `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
    );
    if (!date || date.length < 8) continue;

    const posRaw = get(posIdx).toLowerCase();
    const side = posRaw.includes("long") || posRaw.includes("buy") ? "long"
      : posRaw.includes("short") || posRaw.includes("sell") ? "short" : null;

    trades.push({
      date,
      symbol: get(instrIdx) || null,
      side,
      pnl: numParse(get(netIdx)),
      entryPrice: numParse(get(entryPIdx)),
      exitPrice: numParse(get(exitPIdx)),
      entryTime: timeRaw || null,
      exitTime: get(exitTimeIdx) || null,
      commission: numParse(get(commIdx)),
      quantity: numParse(get(qtyIdx)),
    });
  }
  return trades;
}

function parseRithmic(rows: string[][], headers: string[]): ParsedTrade[] {
  const idx = (name: string) => headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
  const trades: ParsedTrade[] = [];

  const symIdx = idx("symbol");
  const sideIdx = idx("side") >= 0 ? idx("side") : idx("buy/sell");
  const entryIdx = idx("entry price");
  const exitIdx = idx("exit price");
  const pnlIdx = idx("profit/loss") >= 0 ? idx("profit/loss") : (idx("pnl") >= 0 ? idx("pnl") : idx("p&l"));
  const openIdx = idx("open time") >= 0 ? idx("open time") : idx("entry time");
  const closeIdx = idx("close time") >= 0 ? idx("close time") : idx("exit time");
  const qtyIdx = idx("quantity") >= 0 ? idx("quantity") : idx("qty");
  const commIdx = idx("commission") >= 0 ? idx("commission") : idx("comm");

  for (const row of rows.slice(1)) {
    const get = (i: number) => (i >= 0 ? row[i] ?? "" : "");
    const openRaw = get(openIdx);
    if (!openRaw) continue;

    const datePart = openRaw.split(" ")[0];
    const date = datePart.replace(/\//g, "-").replace(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/, (_, m, d, y) =>
      `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
    );
    if (!date || date.length < 8) continue;

    const sideRaw = get(sideIdx).toLowerCase();
    const side = sideRaw.includes("buy") || sideRaw.includes("long") ? "long"
      : sideRaw.includes("sell") || sideRaw.includes("short") ? "short" : null;

    trades.push({
      date,
      symbol: get(symIdx) || null,
      side,
      pnl: numParse(get(pnlIdx)),
      entryPrice: numParse(get(entryIdx)),
      exitPrice: numParse(get(exitIdx)),
      entryTime: openRaw || null,
      exitTime: get(closeIdx) || null,
      commission: numParse(get(commIdx)),
      quantity: numParse(get(qtyIdx)),
    });
  }
  return trades;
}

function parseMT4(rows: string[][], headers: string[]): ParsedTrade[] {
  const idx = (name: string) => headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
  const trades: ParsedTrade[] = [];

  const openTimeIdx = idx("open time");
  const typeIdx = idx("type");
  const sizeIdx = idx("size") >= 0 ? idx("size") : idx("lots");
  const symbolIdx = idx("symbol");
  const openPriceIdx = idx("price") >= 0 ? headers.findIndex((h, i) => h.toLowerCase() === "price" && i > 1) : -1;
  const slIdx = idx("s/l");
  const tpIdx = idx("t/p");
  const closeTimeIdx = idx("close time");
  const profitIdx = idx("profit");
  const commIdx = idx("commission") >= 0 ? idx("commission") : idx("comm");
  const swapIdx = idx("swap");

  for (const row of rows.slice(1)) {
    const get = (i: number) => (i >= 0 ? row[i] ?? "" : "");
    const openRaw = get(openTimeIdx);
    if (!openRaw) continue;

    const typeRaw = get(typeIdx).toLowerCase();
    if (typeRaw === "balance" || typeRaw === "credit" || typeRaw === "deposit" || typeRaw === "withdrawal") continue;

    const datePart = openRaw.split(" ")[0];
    const date = datePart.replace(/\./g, "-").replace(/\//g, "-").replace(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/, (_, m, d, y) =>
      `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
    );
    if (!date || date.length < 8) continue;

    const side = typeRaw.includes("buy") ? "long"
      : typeRaw.includes("sell") ? "short" : null;
    if (!side) continue;

    const pnlRaw = numParse(get(profitIdx));
    const commission = numParse(get(commIdx));
    const swap = numParse(get(swapIdx));
    const pnl = pnlRaw !== null ? pnlRaw + (commission ?? 0) + (swap ?? 0) : null;

    // In MT4, columns 5 and 9 are typically open and close price
    const openPrice = numParse(get(openPriceIdx >= 0 ? openPriceIdx : 5));
    const closePrice = numParse(row[9] ?? "");

    trades.push({
      date,
      symbol: get(symbolIdx) || null,
      side,
      pnl,
      entryPrice: openPrice,
      exitPrice: closePrice,
      entryTime: openRaw || null,
      exitTime: get(closeTimeIdx) || null,
      commission,
      quantity: numParse(get(sizeIdx)),
      notes: slIdx >= 0 && get(slIdx) ? `SL: ${get(slIdx)} TP: ${get(tpIdx)}` : null,
    });
  }
  return trades;
}

function parseGeneric(rows: string[][], headers: string[]): ParsedTrade[] {
  const idx = (names: string[]) =>
    headers.findIndex((h) => names.some((n) => h.toLowerCase().includes(n.toLowerCase())));

  const dateIdx = idx(["date", "time", "opened", "closed", "entry time", "trade date"]);
  const symIdx = idx(["symbol", "instrument", "contract", "ticker", "asset", "pair"]);
  const sideIdx = idx(["side", "direction", "type", "pos", "buy/sell", "long/short"]);
  const pnlIdx = idx(["pnl", "p&l", "profit", "net profit", "gain/loss", "result"]);
  const entryIdx = idx(["entry price", "open price", "entry", "buy price", "open"]);
  const exitIdx = idx(["exit price", "close price", "exit", "sell price", "close"]);
  const commIdx = idx(["commission", "fee", "comm"]);
  const qtyIdx = idx(["quantity", "qty", "size", "lots", "volume"]);
  const exitTimeIdx = idx(["exit time", "close time", "closed", "exit date"]);

  if (dateIdx < 0) return [];

  const trades: ParsedTrade[] = [];
  for (const row of rows.slice(1)) {
    const get = (i: number) => (i >= 0 ? row[i] ?? "" : "");
    const rawDate = get(dateIdx);
    if (!rawDate) continue;

    const datePart = rawDate.split(/[T ]/)[0];
    let date = datePart;
    const mdy = datePart.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (mdy) {
      const [, p1, p2, p3] = mdy;
      const year = p3.length === 2 ? "20" + p3 : p3;
      date = `${year}-${p1.padStart(2, "0")}-${p2.padStart(2, "0")}`;
    }
    if (!date || date.length < 8) continue;

    const sideRaw = get(sideIdx).toLowerCase();
    const side = sideRaw.includes("long") || sideRaw.includes("buy") ? "long"
      : sideRaw.includes("short") || sideRaw.includes("sell") ? "short" : null;

    trades.push({
      date,
      symbol: get(symIdx) || null,
      side,
      pnl: numParse(get(pnlIdx)),
      entryPrice: numParse(get(entryIdx)),
      exitPrice: numParse(get(exitIdx)),
      entryTime: rawDate || null,
      exitTime: get(exitTimeIdx) || null,
      commission: numParse(get(commIdx)),
      quantity: numParse(get(qtyIdx)),
    });
  }
  return trades.filter((t) => t.pnl !== null || t.entryPrice !== null);
}

function parseFile(text: string): { format: BrokerFormat; trades: ParsedTrade[]; rawHeaders: string[] } {
  const rows = parseCSV(text);
  if (rows.length < 2) return { format: "generic", trades: [], rawHeaders: [] };

  // Some exports have metadata rows at the top — find the header row
  let headerRow = 0;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (row.length >= 3 && row.some((c) => /date|time|symbol|instrument|contract|pnl|profit/i.test(c))) {
      headerRow = i;
      break;
    }
  }

  const headers = rows[headerRow].map((h) => h.trim());
  const dataRows = rows.slice(headerRow + 1).filter((r) => r.some((c) => c.trim()));
  const format = detectFormat(headers);

  let trades: ParsedTrade[] = [];
  switch (format) {
    case "tradovate":    trades = parseTradovate([headers, ...dataRows], headers); break;
    case "ninjatrader": trades = parseNinjaTrader([headers, ...dataRows], headers); break;
    case "rithmic":     trades = parseRithmic([headers, ...dataRows], headers); break;
    case "mt4":         trades = parseMT4([headers, ...dataRows], headers); break;
    default:            trades = parseGeneric([headers, ...dataRows], headers);
  }

  return { format, trades, rawHeaders: headers };
}

// ── Format labels ─────────────────────────────────────────────────────────────

const FORMAT_LABELS: Record<BrokerFormat, { label: string; brokers: string; color: string }> = {
  tradovate:    { label: "Tradovate", brokers: "TopStep, Apex, Funded Next, Lucid Trading", color: "#5e6ad2" },
  ninjatrader:  { label: "NinjaTrader", brokers: "NinjaTrader 8, many futures platforms", color: "#F59E0B" },
  rithmic:      { label: "Rithmic", brokers: "TopStepX, Apex, BulenoxX, Earn2Trade", color: "#00C896" },
  mt4:          { label: "MT4 / MT5", brokers: "FTMO, IC Markets, FxFlat, all forex brokers", color: "#FF6B35" },
  generic:      { label: "Generic CSV", brokers: "Any broker — we auto-detect columns", color: "#A78BFA" },
};

// ── Component ─────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  const abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n >= 0 ? "+" : "−") + "$" + abs;
}

export default function ImportPage() {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<{ format: BrokerFormat; trades: ParsedTrade[]; rawHeaders: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      setError("Please upload a .csv or .txt file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const result = parseFile(text);
        if (result.trades.length === 0) {
          setError("No trades found in this file. Check the format and try again.");
          return;
        }
        setParsed(result);
        setStep("preview");
        setError(null);
      } catch {
        setError("Failed to parse this file. Try a different export format.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  async function doImport() {
    if (!parsed) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades: parsed.trades }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        return;
      }
      setResult({ imported: data.imported, skipped: data.skipped });
      setStep("done");
      showToast(`Imported ${data.imported} trade${data.imported !== 1 ? "s" : ""}`, "success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  const fmtInfo = parsed ? FORMAT_LABELS[parsed.format] : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0 24px" }}>
          <Link href="/journal">
            <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Link>
          <div>
            <h1 className="font-bebas" style={{ fontSize: 30, lineHeight: 1, color: "var(--text)" }}>IMPORT TRADES</h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Tradovate · NinjaTrader · Rithmic · MT4/MT5 · Any CSV
            </p>
          </div>
        </div>

        {/* Step: Upload */}
        {step === "upload" && (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? "var(--green)" : "var(--border-bright)"}`,
                borderRadius: 20,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragging ? "rgba(0,232,122,0.04)" : "var(--surface)",
                transition: "all 0.2s",
                marginBottom: 24,
              }}
            >
              <div style={{ marginBottom: 16, color: dragging ? "var(--green)" : "var(--text-muted)" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto" }}>
                  <rect x="8" y="12" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M24 8v20M18 14l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 34h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                Drop your CSV here
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                or click to browse
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {Object.entries(FORMAT_LABELS).map(([key, info]) => (
                  <span key={key} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: info.color + "15", color: info.color, border: `1px solid ${info.color}30`,
                  }}>
                    {info.label}
                  </span>
                ))}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
            />

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.2)", color: "var(--red)", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Format guides */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>SUPPORTED FORMATS</div>
              {Object.entries(FORMAT_LABELS).map(([, info]) => (
                <div key={info.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: info.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{info.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{info.brokers}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* How to export guide */}
            <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 14 }}>HOW TO EXPORT</div>
              {[
                { broker: "Tradovate", steps: "Performance → Account Performance → Export CSV" },
                { broker: "NinjaTrader 8", steps: "Tools → Trade Performance → Export button" },
                { broker: "TopStepX / Rithmic", steps: "Reports → Trade History → Export as CSV" },
                { broker: "MT4 / MT5", steps: "Account History tab → right-click → Save as Report" },
                { broker: "Any other broker", steps: "Export your trade history as CSV — we auto-detect columns" },
              ].map(({ broker, steps }) => (
                <div key={broker} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{broker}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{steps}</div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Tip: Most brokers let you filter by date range — import 30 days at a time for best results.
              </div>
            </div>
          </>
        )}

        {/* Step: Preview */}
        {step === "preview" && parsed && fmtInfo && (
          <>
            {/* Detected format */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 14, background: "var(--surface)", border: `1px solid ${fmtInfo.color}30`, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: fmtInfo.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: fmtInfo.color }}>
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  Detected: <span style={{ color: fmtInfo.color }}>{fmtInfo.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{fmtInfo.brokers}</div>
              </div>
              <div className="font-bebas" style={{ fontSize: 28, color: "var(--text)" }}>{parsed.trades.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>trades<br />found</div>
            </div>

            {/* Stats summary */}
            {(() => {
              const withPnl = parsed.trades.filter((t) => t.pnl !== null);
              const totalPnl = withPnl.reduce((s, t) => s + (t.pnl ?? 0), 0);
              const winners = withPnl.filter((t) => (t.pnl ?? 0) > 0).length;
              const winRate = withPnl.length > 0 ? Math.round((winners / withPnl.length) * 100) : null;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "TOTAL P&L", value: fmt(totalPnl), color: totalPnl >= 0 ? "var(--green)" : "var(--red)" },
                    { label: "WIN RATE", value: winRate !== null ? `${winRate}%` : "—", color: winRate !== null && winRate >= 50 ? "var(--green)" : "var(--red)" },
                    { label: "TRADES", value: parsed.trades.length, color: "var(--text)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card" style={{ padding: "14px 12px", textAlign: "center" }}>
                      <div className="font-bebas" style={{ fontSize: 22, color, lineHeight: 1, marginBottom: 3 }}>{value}</div>
                      <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 700 }}>{label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Preview table */}
            <div className="card" style={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>PREVIEW (first 5 trades)</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{parsed.trades.length} total</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--surface2)" }}>
                      {["Date", "Symbol", "Side", "P&L", "Entry", "Exit"].map((h) => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.trades.slice(0, 5).map((t, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{t.date}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700 }}>{t.symbol ?? "—"}</td>
                        <td style={{ padding: "10px 12px" }}>
                          {t.side && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                              background: t.side === "long" ? "rgba(0,232,122,0.1)" : "rgba(255,59,92,0.1)",
                              color: t.side === "long" ? "var(--green)" : "var(--red)",
                            }}>
                              {t.side.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: (t.pnl ?? 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                          {fmt(t.pnl)}
                        </td>
                        <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>
                          {t.entryPrice ? `$${t.entryPrice.toLocaleString()}` : "—"}
                        </td>
                        <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>
                          {t.exitPrice ? `$${t.exitPrice.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.2)", color: "var(--red)", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setStep("upload"); setParsed(null); setError(null); }}
                style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Change File
              </button>
              <button
                onClick={doImport}
                disabled={importing}
                style={{ flex: 2, padding: "13px 0", borderRadius: 12, border: "none", background: importing ? "var(--surface3)" : "var(--green)", color: importing ? "var(--text-muted)" : "#09090b", fontSize: 14, fontWeight: 800, cursor: importing ? "default" : "pointer", transition: "background 0.15s" }}
              >
                {importing ? "Importing..." : `Import ${parsed.trades.length} Trades →`}
              </button>
            </div>
          </>
        )}

        {/* Step: Done */}
        {step === "done" && result && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,232,122,0.1)", border: "2px solid rgba(0,232,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "var(--green)" }}>
                <path d="M8 16l5 5 11-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-bebas" style={{ fontSize: 40, color: "var(--green)", lineHeight: 1, marginBottom: 8 }}>
              {result.imported} TRADES IMPORTED
            </h2>
            {result.skipped > 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                {result.skipped} rows were skipped (missing date or unreadable format).
              </p>
            )}
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 32 }}>
              Your journal and analytics have been updated. Head to Analytics to see your performance patterns.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/analytics">
                <button className="btn-primary" style={{ padding: "12px 28px", fontSize: 14 }}>View Analytics →</button>
              </Link>
              <Link href="/journal">
                <button className="btn-ghost" style={{ padding: "12px 20px", fontSize: 14 }}>View Journal</button>
              </Link>
            </div>
            <button
              onClick={() => { setStep("upload"); setParsed(null); setResult(null); setError(null); }}
              style={{ marginTop: 20, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }}
            >
              Import another file
            </button>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
