export const runtime = "nodejs";
export const maxDuration = 30;

import { auth } from "@/auth";
import { rateLimit } from "@/lib/ratelimit";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Uses Claude to map unknown CSV columns to TradeMind's required fields.
// Accepts: headers array + up to 3 sample rows.
// Returns: { mapping: { date, symbol, side, pnl, entryPrice, exitPrice, commission, entryTime } }
// where each value is the 0-based column index (-1 if not found).

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "strict");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.headers || !Array.isArray(body.headers)) {
    return Response.json({ error: "headers required" }, { status: 400 });
  }

  const { headers, sampleRows = [] } = body as { headers: string[]; sampleRows: string[][] };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "AI not configured" }, { status: 503 });

  const client = new Anthropic({ apiKey });

  const prompt = `You are a trading data expert. Given the CSV column headers and sample rows below, identify which column index (0-based) corresponds to each of these trading fields:

- date: trade close date (YYYY-MM-DD or similar)
- symbol: instrument/ticker (e.g. "ES", "NQ", "AAPL", "BTCUSDT")
- side: trade direction ("long"/"buy" or "short"/"sell")
- pnl: realized profit/loss in dollars
- entryPrice: entry/open price
- exitPrice: exit/close price (may not exist)
- commission: fees/commissions paid
- entryTime: entry time or datetime

HEADERS (0-indexed):
${headers.map((h, i) => `${i}: "${h}"`).join("\n")}

SAMPLE ROWS (first ${sampleRows.length}):
${sampleRows.map((r, i) => `Row ${i + 1}: ${r.map((v, j) => `[${j}]="${v}"`).join(", ")}`).join("\n")}

Respond ONLY with a valid JSON object. Use -1 for fields you cannot find. Example:
{"date":3,"symbol":1,"side":4,"pnl":7,"entryPrice":5,"exitPrice":6,"commission":8,"entryTime":2}`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (msg.content[0] as { text: string }).text.trim();
    // Extract JSON from response
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) return Response.json({ error: "AI could not parse format" }, { status: 422 });

    const mapping = JSON.parse(jsonMatch[0]) as Record<string, number>;

    // Validate: at minimum date + pnl must be >= 0
    if ((mapping.date ?? -1) < 0 || (mapping.pnl ?? -1) < 0) {
      return Response.json({ error: "Could not identify date or P&L columns. Please use manual mapping." }, { status: 422 });
    }

    return Response.json({ ok: true, mapping, detectedBy: "ai" });
  } catch {
    return Response.json({ error: "AI mapping failed" }, { status: 500 });
  }
}
