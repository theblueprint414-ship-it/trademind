import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

interface ParsedTrade {
  date: string;
  symbol: string;
  side: "long" | "short";
  pnl: number | null;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/\//g, "-").replace(/\s+/g, "T");
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function parsePnl(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s]/g, "").replace(/[()]/g, (m) => m === "(" ? "-" : "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function parseSide(raw: string): "long" | "short" {
  const lower = raw.toLowerCase();
  if (lower.includes("buy") || lower.includes("long") || lower === "b") return "long";
  return "short";
}

// Detect format and return column indices
function detectFormat(headers: string[]): { date: number; symbol: number; side: number; pnl: number; format: string } | null {
  const h = headers.map((x) => x.trim().toLowerCase());

  if (h.includes("ticket") || (h.includes("profit") && h.includes("symbol") && h.includes("type"))) {
    return {
      date: h.indexOf("close time") !== -1 ? h.indexOf("close time") : h.indexOf("open time"),
      symbol: h.indexOf("symbol"),
      side: h.indexOf("type"),
      pnl: h.indexOf("profit"),
      format: "MT4/MT5",
    };
  }

  const isTradovate =
    h.includes("b/s") ||
    h.includes("contractname") ||
    h.includes("realizedpnl") ||
    h.some((x) => x === "p/l" || x.includes("realized p") || x.includes("net p"));
  if (isTradovate) {
    return {
      date: h.findIndex((x) => x.includes("time") || x.includes("date") || x === "timestamp"),
      symbol: h.findIndex((x) => x === "symbol" || x === "contract" || x === "contractname" || x === "instrument"),
      side: h.findIndex((x) => x === "b/s" || x === "action" || x === "buy/sell"),
      pnl: h.findIndex((x) => x === "p/l" || x === "p&l" || x === "realizedpnl" || x.includes("realized p") || x.includes("net p") || x.includes("p&l")),
      format: "Tradovate",
    };
  }

  if (h.some((x) => x.includes("market pos") || x.includes("cum. profit"))) {
    return {
      date: h.findIndex((x) => x.includes("exit time") || x.includes("entry time")),
      symbol: h.findIndex((x) => x.includes("instrument") || x === "symbol"),
      side: h.findIndex((x) => x.includes("market pos")),
      pnl: h.findIndex((x) => x === "profit" || (x.includes("profit") && !x.includes("cum"))),
      format: "NinjaTrader",
    };
  }

  const dateIdx = h.findIndex((x) => x.includes("date") || x.includes("time") || x === "close");
  const symbolIdx = h.findIndex((x) => x === "symbol" || x === "ticker" || x === "instrument" || x === "pair");
  const sideIdx = h.findIndex((x) => x === "side" || x === "type" || x === "direction" || x === "action" || x === "b/s");
  const pnlIdx = h.findIndex((x) => x === "pnl" || x === "p&l" || x === "profit" || x === "profit/loss" || x === "net p/l");

  if (dateIdx !== -1 && pnlIdx !== -1) {
    return { date: dateIdx, symbol: symbolIdx !== -1 ? symbolIdx : 0, side: sideIdx !== -1 ? sideIdx : -1, pnl: pnlIdx, format: "Generic" };
  }

  return null;
}

function parseCsv(text: string): { trades: ParsedTrade[]; format: string } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { trades: [], format: "unknown" };

  const headers = lines[0].split(",");
  const cols = detectFormat(headers);
  if (!cols) return { trades: [], format: "unknown" };

  const trades: ParsedTrade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (row.length < 2) continue;

    const dateStr = cols.date >= 0 ? (row[cols.date]?.trim() ?? "") : "";
    const date = parseDate(dateStr);
    if (!date) continue;

    const symbolRaw = cols.symbol >= 0 ? (row[cols.symbol]?.trim() ?? "") : "";
    const symbol = symbolRaw.slice(0, 20) || "UNKNOWN";
    const sideRaw = cols.side >= 0 ? (row[cols.side]?.trim() ?? "") : "";
    const side = parseSide(sideRaw);
    const pnl = cols.pnl >= 0 ? parsePnl(row[cols.pnl]?.trim() ?? "") : null;

    trades.push({ date, symbol, side, pnl });
  }

  return { trades, format: cols.format };
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["premium"]);
  if (!guard.ok) return guard.response;

  const formData = await request.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });

  const text = await file.text();
  const { trades, format } = parseCsv(text);

  if (trades.length === 0) {
    return Response.json({ error: "Could not parse any trades. Check the CSV format." }, { status: 422 });
  }

  const existing = await db.tradeEntry.findMany({
    where: { userId: guard.userId },
    select: { date: true, symbol: true },
  });
  const existingSet = new Set(existing.map((e) => `${e.date}:${e.symbol ?? ""}`));
  const toCreate = trades.filter((t: ParsedTrade) => !existingSet.has(`${t.date}:${t.symbol}`));

  if (toCreate.length > 0) {
    await db.tradeEntry.createMany({
      data: toCreate.map((t: ParsedTrade) => ({
        userId: guard.userId,
        date: t.date,
        symbol: t.symbol,
        side: t.side,
        pnl: t.pnl,
      })),
    });
  }

  return Response.json({ ok: true, imported: toCreate.length, skipped: trades.length - toCreate.length, total: trades.length, format });
}