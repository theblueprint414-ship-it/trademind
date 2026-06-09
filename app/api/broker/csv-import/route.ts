import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

interface ColMap {
  date: number;
  symbol: number;
  side: number;
  pnl: number;
  entryPrice: number;
  exitPrice: number;
  commission: number;
  entryTime: number;
}

interface ParsedTrade {
  date: string;
  symbol: string;
  side: "long" | "short";
  pnl: number | null;
  entryPrice: number | null;
  exitPrice: number | null;
  commission: number | null;
  entryTime: string | null;
}

type DetectedCols = ColMap & { format: string };

function parseDate(raw: string): string | null {
  if (!raw?.trim()) return null;
  let s = raw.trim().replace(/["']/g, "");
  // DD/MM/YYYY or DD-MM-YYYY → YYYY-MM-DD
  s = s.replace(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3-$2-$1");
  // M/D/YYYY → try as-is (US format handled by Date)
  const d = new Date(s.split(" ")[0]);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function parseMoney(raw: string): number | null {
  if (!raw?.trim()) return null;
  const s = raw.replace(/["'$€£¥,\s]/g, "").replace(/^\((.+)\)$/, "-$1");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function parseSide(raw: string): "long" | "short" {
  const s = (raw ?? "").toLowerCase().replace(/["' ]/g, "");
  return s === "buy" || s === "long" || s === "bo" || s.startsWith("buy") ? "long" : "short";
}

function splitRow(line: string): string[] {
  const result: string[] = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === "," && !inQ) { result.push(cur.trim()); cur = ""; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

function idx(h: string[], ...needles: string[]): number {
  for (const n of needles) {
    const i = h.findIndex((x) => x === n || x.includes(n));
    if (i >= 0) return i;
  }
  return -1;
}

function detectFormat(raw: string[]): DetectedCols | null {
  const h = raw.map((x) => x.trim().toLowerCase().replace(/[^a-z0-9/&]/g, ""));

  // MT4/MT5 — has "ticket" column or open/close time + profit + symbol + type
  if (h.some((x) => x === "ticket") || (h.includes("profit") && h.includes("symbol") && h.includes("type") && h.some((x) => x.includes("time")))) {
    return { date: idx(h, "closetime", "opentime"), symbol: idx(h, "symbol"), side: idx(h, "type"), pnl: idx(h, "profit"), entryPrice: idx(h, "price", "openprice"), exitPrice: -1, commission: idx(h, "commission"), entryTime: idx(h, "opentime"), format: "MT4/MT5" };
  }

  // NinjaTrader — "market pos." column
  if (h.some((x) => x.includes("marketpos") || x.includes("cumprofit"))) {
    return { date: idx(h, "exittime", "entrytime"), symbol: idx(h, "instrument", "symbol"), side: idx(h, "marketpos"), pnl: idx(h, "profit"), entryPrice: idx(h, "entryprice"), exitPrice: idx(h, "exitprice"), commission: idx(h, "commission"), entryTime: idx(h, "entrytime"), format: "NinjaTrader" };
  }

  // Tradovate — "b/s" column or "contractname" or "realizedpnl"
  if (h.some((x) => x === "bs" || x === "contractname" || x === "realizedpnl")) {
    return { date: idx(h, "timestamp", "time", "date"), symbol: idx(h, "symbol", "contractname", "contract", "instrument"), side: idx(h, "bs", "action", "buysell"), pnl: idx(h, "pl", "p&l", "realizedpnl", "netp"), entryPrice: -1, exitPrice: idx(h, "price"), commission: idx(h, "commission", "fees"), entryTime: idx(h, "timestamp", "time"), format: "Tradovate" };
  }

  // Interactive Brokers Flex Query — "conid" or "iborderid" or "realizedpl"
  if (h.some((x) => x === "conid" || x === "iborderid" || x === "realizedpl" || x === "fiforealized")) {
    return { date: idx(h, "datetime", "settledate", "date"), symbol: idx(h, "symbol"), side: idx(h, "buysell"), pnl: idx(h, "realizedpl", "fiforealized"), entryPrice: idx(h, "tradeprice", "price"), exitPrice: -1, commission: idx(h, "ibcommission", "commission", "tax"), entryTime: idx(h, "datetime"), format: "Interactive Brokers" };
  }

  // thinkorswim / TD Ameritrade — "exec leg" or "spread" column
  if (h.some((x) => x === "execleg" || x === "spread" || x === "expdate")) {
    return { date: idx(h, "date/time", "date"), symbol: idx(h, "symbol"), side: idx(h, "side", "action"), pnl: idx(h, "pl", "pnl", "profit"), entryPrice: idx(h, "price", "execprice"), exitPrice: -1, commission: idx(h, "commission", "fees"), entryTime: idx(h, "date/time", "date"), format: "thinkorswim" };
  }

  // Schwab — "fees & comm" or "schwab" in header text
  if (h.some((x) => x.includes("fees&comm") || x === "fees&comm") && h.includes("action") && h.includes("symbol")) {
    return { date: idx(h, "date"), symbol: idx(h, "symbol"), side: idx(h, "action"), pnl: idx(h, "amount"), entryPrice: idx(h, "price"), exitPrice: -1, commission: idx(h, "fees&comm", "commission"), entryTime: idx(h, "date"), format: "Schwab" };
  }

  // Tastytrade — "underlying symbol" column
  if (h.some((x) => x === "underlyingsymbol" || x === "underlying")) {
    return { date: idx(h, "date", "datetime"), symbol: idx(h, "underlyingsymbol", "symbol", "underlying"), side: idx(h, "action", "buysell", "side"), pnl: idx(h, "realizedpl", "pl", "profit"), entryPrice: idx(h, "averageopen", "avgopen", "openingprice"), exitPrice: idx(h, "averageclose", "avgclose", "closingprice"), commission: idx(h, "commission", "fees"), entryTime: idx(h, "time"), format: "Tastytrade" };
  }

  // TradeStation — "account" + "time" + "price" + "size"
  if (h.some((x) => x === "account") && h.includes("symbol") && h.some((x) => x === "entryprice" || x === "exitprice")) {
    return { date: idx(h, "exitdate", "entrydate", "date"), symbol: idx(h, "symbol"), side: idx(h, "type", "side", "direction"), pnl: idx(h, "totalpl", "netprofit", "pnl", "profit"), entryPrice: idx(h, "entryprice"), exitPrice: idx(h, "exitprice"), commission: idx(h, "commission"), entryTime: idx(h, "entrytime", "entrydate"), format: "TradeStation" };
  }

  // Quantower — "baseasset" or "tradingpair" or "fillside" columns
  if (h.some((x) => x === "baseasset" || x === "tradingpair" || x === "fillside" || x === "tradeside")) {
    return { date: idx(h, "closetime", "opentime", "time", "date"), symbol: idx(h, "baseasset", "tradingpair", "symbol", "instrument"), side: idx(h, "fillside", "tradeside", "side", "direction"), pnl: idx(h, "grossprofit", "netprofit", "realizedpnl", "pnl", "profit"), entryPrice: idx(h, "avgopenprice", "openprice", "entryprice", "price"), exitPrice: idx(h, "avgcloseprice", "closeprice", "exitprice"), commission: idx(h, "commission", "fees"), entryTime: idx(h, "opentime", "entrytime", "time"), format: "Quantower" };
  }

  // FTMO / prop firm MT4 export — "comment" column + ticket + swap (FTMO-specific)
  if (h.some((x) => x === "swap") && h.some((x) => x === "ticket" || x === "order") && h.includes("profit")) {
    return { date: idx(h, "closetime", "time"), symbol: idx(h, "symbol", "item"), side: idx(h, "type", "action"), pnl: idx(h, "profit"), entryPrice: idx(h, "openprice", "price"), exitPrice: idx(h, "closeprice"), commission: idx(h, "commission"), entryTime: idx(h, "opentime", "time"), format: "FTMO/MT4" };
  }

  // Topstep / Rithmic-style — "accountid" or "execid" or "clorderid" columns
  if (h.some((x) => x === "accountid" || x === "execid" || x === "clorderid" || x === "fillid")) {
    return { date: idx(h, "filltime", "exectime", "timestamp", "date"), symbol: idx(h, "symbol", "instrument", "contract"), side: idx(h, "side", "bs", "buysell", "direction"), pnl: idx(h, "pnl", "realizedpnl", "profit", "pl"), entryPrice: idx(h, "execprice", "fillprice", "price"), exitPrice: -1, commission: idx(h, "commission", "fees"), entryTime: idx(h, "filltime", "exectime", "timestamp"), format: "Rithmic/Topstep" };
  }

  // Apex Trader Funding — "tradeid" or "orderid" with "instrumentsymbol"
  if (h.some((x) => x === "instrumentsymbol" || x === "tradeid") && h.some((x) => x.includes("realized"))) {
    return { date: idx(h, "exittime", "closetime", "date"), symbol: idx(h, "instrumentsymbol", "symbol", "instrument"), side: idx(h, "tradetype", "side", "direction", "action"), pnl: idx(h, "realizedpnl", "netpl", "profitloss"), entryPrice: idx(h, "entryprice", "avgentryprice"), exitPrice: idx(h, "exitprice", "avgexitprice"), commission: idx(h, "commission", "fees"), entryTime: idx(h, "entrytime", "entrydate"), format: "Apex/Funded" };
  }

  // ATAS / OrderFlow+ — "bartime" or "signature" or "magicnumber" columns
  if (h.some((x) => x === "bartime" || x === "magicnumber" || x === "signature" || x === "ordernotes")) {
    return { date: idx(h, "closetime", "bartime", "exittime"), symbol: idx(h, "symbol", "instrument"), side: idx(h, "direction", "side", "type"), pnl: idx(h, "profit", "pnl", "realizedpnl"), entryPrice: idx(h, "entryprice", "openprice"), exitPrice: idx(h, "exitprice", "closeprice"), commission: idx(h, "commission", "fees"), entryTime: idx(h, "entrytime", "bartime", "opentime"), format: "ATAS" };
  }

  // Generic fallback — needs at least a date col + pnl col
  const dateIdx = idx(h, "date", "datetime", "closetime", "opentime", "time", "close");
  const pnlIdx  = idx(h, "pnl", "pl", "profit", "realizedpl", "netpl", "profitloss");
  if (dateIdx >= 0 && pnlIdx >= 0) {
    return { date: dateIdx, symbol: idx(h, "symbol", "ticker", "instrument", "pair", "contract"), side: idx(h, "side", "type", "direction", "action", "bs", "buysell"), pnl: pnlIdx, entryPrice: idx(h, "entryprice", "openprice", "price"), exitPrice: idx(h, "exitprice", "closeprice"), commission: idx(h, "commission", "fees"), entryTime: dateIdx, format: "Generic" };
  }

  return null;
}

function parseCsv(text: string, mapping?: Partial<ColMap>): {
  trades: ParsedTrade[];
  format: string;
  needsMapping?: boolean;
  headers?: string[];
} {
  const lines = text.trim().split(/\r?\n/).filter((l) => {
    const t = l.trim();
    return t && !t.startsWith("//") && !t.startsWith("#") && !t.startsWith(";");
  });
  if (lines.length < 2) return { trades: [], format: "unknown" };

  // Find header row (first line with commas)
  const headerIdx = lines.findIndex((l) => l.includes(","));
  if (headerIdx < 0) return { trades: [], format: "unknown" };
  const rawHeaders = splitRow(lines[headerIdx]);

  let cols: DetectedCols | null = detectFormat(rawHeaders);

  // Apply user-provided column mapping
  if (mapping && Object.keys(mapping).length > 0) {
    if (!cols) cols = { date: -1, symbol: -1, side: -1, pnl: -1, entryPrice: -1, exitPrice: -1, commission: -1, entryTime: -1, format: "Custom" };
    for (const [k, v] of Object.entries(mapping)) {
      if (typeof v === "number") (cols as unknown as Record<string, number | string>)[k] = v;
    }
    cols.format = "Custom";
  }

  if (!cols) {
    return { trades: [], format: "unknown", needsMapping: true, headers: rawHeaders };
  }

  const trades: ParsedTrade[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = splitRow(lines[i]);
    if (row.length < 2) continue;

    const get = (c: number) => (c >= 0 ? (row[c] ?? "").replace(/['"]/g, "").trim() : "");

    const date = parseDate(get(cols.date));
    if (!date) continue;

    const symbol = get(cols.symbol).slice(0, 20) || "UNKNOWN";
    const side = parseSide(get(cols.side));
    const pnl = parseMoney(get(cols.pnl));
    const entryPrice = parseMoney(get(cols.entryPrice));
    const exitPrice = parseMoney(get(cols.exitPrice));
    const commission = parseMoney(get(cols.commission));

    const entryTimeRaw = cols.entryTime >= 0 && cols.entryTime !== cols.date ? get(cols.entryTime) : null;
    let entryTime: string | null = null;
    if (entryTimeRaw) {
      try { const d = new Date(entryTimeRaw); if (!isNaN(d.getTime())) entryTime = d.toISOString(); } catch {}
    }

    trades.push({ date, symbol, side, pnl, entryPrice, exitPrice, commission, entryTime });
  }

  return { trades, format: cols.format };
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const formData = await request.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: "File too large (max 10MB)" }, { status: 400 });

  const mappingRaw = formData.get("mapping") as string | null;
  let mapping: Partial<ColMap> | undefined;
  if (mappingRaw) {
    try { mapping = JSON.parse(mappingRaw) as Partial<ColMap>; } catch {}
  }

  const text = await file.text();
  const { trades, format, needsMapping, headers } = parseCsv(text, mapping);

  if (needsMapping) {
    return Response.json({ needsMapping: true, headers, format: "unknown" });
  }

  if (trades.length === 0) {
    return Response.json({ error: "Could not parse any trades. Try the column mapper or check your CSV format." }, { status: 422 });
  }

  const existing = await db.tradeEntry.findMany({
    where: { userId: guard.userId },
    select: { date: true, symbol: true, entryTime: true },
  });
  const existingKeys = new Set(existing.map((e) => `${e.date}:${e.symbol ?? ""}:${e.entryTime ?? ""}`));
  const toCreate = trades.filter((t) => !existingKeys.has(`${t.date}:${t.symbol}:${t.entryTime ?? ""}`));

  if (toCreate.length > 0) {
    await db.tradeEntry.createMany({
      data: toCreate.map((t) => ({
        userId: guard.userId,
        date: t.date,
        symbol: t.symbol,
        side: t.side,
        pnl: t.pnl,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        commission: t.commission,
        entryTime: t.entryTime,
      })),
    });
  }

  return Response.json({ ok: true, imported: toCreate.length, skipped: trades.length - toCreate.length, total: trades.length, format });
}