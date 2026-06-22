export const runtime = "nodejs";

import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

// All k-element subsets of `items` (items must already be sorted for stable keys).
// Capped at size 3 — beyond that the combo count per trade grows combinatorially
// (a trade can carry up to 10 setup tags) without adding meaningful signal.
function combinations(items: string[], k: number): string[][] {
  if (k > items.length) return [];
  if (k === 0) return [[]];
  const [head, ...rest] = items;
  const withHead = combinations(rest, k - 1).map((c) => [head, ...c]);
  const withoutHead = combinations(rest, k);
  return [...withHead, ...withoutHead];
}

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const userId = guard.userId;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? null;
  const endDate = searchParams.get("endDate") ?? null;

  const where: Record<string, unknown> = { userId };
  if (startDate || endDate) {
    const dateFilter: Record<string, string> = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;
    where.date = dateFilter;
  }

  const trades = await db.tradeEntry.findMany({
    where,
    select: { pnl: true, rMultiple: true, ictSetups: true, tags: true },
  });

  // Only trades with at least one ICT setup tagged
  const tagged = trades.filter((t) => t.ictSetups && t.ictSetups !== "[]");

  if (tagged.length < 3) {
    return Response.json({ singles: [], combos: [], minTrades: 3, taggedCount: tagged.length });
  }

  // Build stats per setup and per combo
  const singleMap = new Map<string, { wins: number; losses: number; totalPnl: number; rSum: number; rCount: number }>();
  const comboMap = new Map<string, { wins: number; losses: number; totalPnl: number; rSum: number; rCount: number }>();

  for (const t of tagged) {
    const setups = parseTags(t.ictSetups);
    const pnl = t.pnl ?? 0;
    const isWin = pnl > 0;

    // Single setups
    for (const s of setups) {
      if (!singleMap.has(s)) singleMap.set(s, { wins: 0, losses: 0, totalPnl: 0, rSum: 0, rCount: 0 });
      const e = singleMap.get(s)!;
      if (isWin) e.wins++; else if (pnl < 0) e.losses++;
      e.totalPnl += pnl;
      if (t.rMultiple !== null) { e.rSum += t.rMultiple; e.rCount++; }
    }

    // 2- and 3-setup combos (order-independent) — e.g. "FVG+OB" and "BOS+OB+FVG"
    if (setups.length >= 2) {
      const sorted = [...new Set(setups)].sort();
      const combos = [...combinations(sorted, 2), ...combinations(sorted, 3)];
      for (const combo of combos) {
        const key = combo.join("+");
        if (!comboMap.has(key)) comboMap.set(key, { wins: 0, losses: 0, totalPnl: 0, rSum: 0, rCount: 0 });
        const e = comboMap.get(key)!;
        if (isWin) e.wins++; else if (pnl < 0) e.losses++;
        e.totalPnl += pnl;
        if (t.rMultiple !== null) { e.rSum += t.rMultiple; e.rCount++; }
      }
    }
  }

  function toResult(key: string, v: { wins: number; losses: number; totalPnl: number; rSum: number; rCount: number }) {
    const total = v.wins + v.losses;
    return {
      key,
      total,
      wins: v.wins,
      losses: v.losses,
      winRate: total > 0 ? Math.round((v.wins / total) * 100) : null,
      avgPnl: total > 0 ? Math.round(v.totalPnl / total * 100) / 100 : null,
      avgR: v.rCount > 0 ? Math.round(v.rSum / v.rCount * 100) / 100 : null,
      totalPnl: Math.round(v.totalPnl * 100) / 100,
    };
  }

  const MIN_TRADES = 2;
  const singles = [...singleMap.entries()]
    .map(([k, v]) => toResult(k, v))
    .filter((r) => r.total >= MIN_TRADES)
    .sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0));

  const combos = [...comboMap.entries()]
    .map(([k, v]) => toResult(k, v))
    .filter((r) => r.total >= MIN_TRADES)
    .sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0));

  return Response.json({ singles, combos, taggedCount: tagged.length, totalTrades: trades.length });
}
