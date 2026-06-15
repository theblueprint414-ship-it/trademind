export const runtime = "nodejs";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

const MAX_IMPORT = 500;
const MAX_PNL = 1_000_000;

type RawTrade = {
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
  stopLoss?: number | null;
  takeProfit?: number | null;
  mae?: number | null;
  mfe?: number | null;
  rMultiple?: number | null;
  notes?: string | null;
  sessionType?: string | null;
};

function sanitizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Try common date formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function sanitizeSide(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (["long", "buy", "b", "bought"].includes(s)) return "long";
  if (["short", "sell", "s", "sold"].includes(s)) return "short";
  return null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(/[$,\s]/g, ""));
  if (isNaN(n) || !isFinite(n)) return null;
  if (Math.abs(n) > MAX_PNL) return null;
  return Math.round(n * 10000) / 10000;
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const userId = auth.userId;

  let body: { trades: RawTrade[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.trades)) {
    return Response.json({ error: "trades must be an array" }, { status: 400 });
  }

  const trades = body.trades.slice(0, MAX_IMPORT);
  if (trades.length === 0) return Response.json({ imported: 0, skipped: 0 });

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const raw of trades) {
    const date = sanitizeDate(raw.date);
    if (!date) { skipped++; continue; }

    // Validate date is reasonable (not in the future by more than 1 day)
    const d = new Date(date + "T12:00:00Z");
    if (isNaN(d.getTime())) { skipped++; continue; }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d > tomorrow) { skipped++; continue; }

    const pnl = num(raw.pnl);
    const entryPrice = num(raw.entryPrice);
    const exitPrice = num(raw.exitPrice);
    const commission = num(raw.commission);
    const side = sanitizeSide(raw.side);

    // Auto-compute R-multiple if possible
    let rMultiple = num(raw.rMultiple);
    if (rMultiple === null && pnl !== null && raw.stopLoss && entryPrice && exitPrice) {
      const sl = num(raw.stopLoss);
      if (sl !== null && entryPrice !== null) {
        const riskPerUnit = Math.abs(entryPrice - sl);
        if (riskPerUnit > 0) {
          const gainPerUnit = exitPrice - entryPrice;
          rMultiple = Math.round((gainPerUnit / riskPerUnit) * 100) / 100;
        }
      }
    }

    try {
      await db.tradeEntry.create({
        data: {
          userId,
          date,
          symbol: raw.symbol?.trim().toUpperCase() || null,
          side,
          pnl,
          entryPrice,
          exitPrice,
          entryTime: raw.entryTime || null,
          exitTime: raw.exitTime || null,
          commission,
          rMultiple,
          stopLoss: num(raw.stopLoss),
          takeProfit: num(raw.takeProfit),
          mae: num(raw.mae),
          mfe: num(raw.mfe),
          notes: raw.notes?.slice(0, 1000) || null,
          sessionType: raw.sessionType || null,
          lotSize: num(raw.quantity),
          // Mark as imported
          tags: "imported",
        },
      });
      imported++;
    } catch (err) {
      errors.push(`Row for ${date}: ${err instanceof Error ? err.message : "DB error"}`);
      skipped++;
    }
  }

  return Response.json({ imported, skipped, errors: errors.slice(0, 10) });
}
