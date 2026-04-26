import { db } from "@/lib/db";
import { requireAuth, requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

const MAX_TEXT = 1000;
const MAX_PNL = 1_000_000;
const MAX_TAGS = 5;
const MAX_TAG_LEN = 30;
const FREE_DAILY_LIMIT = 3;

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { plan: true } });
  const isPro = user?.plan === "pro" || user?.plan === "premium";

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);

  // Free users: only last 7 days
  const where = date && date !== "all"
    ? { userId: auth.userId, date }
    : isPro
      ? { userId: auth.userId }
      : { userId: auth.userId, date: { gte: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0] } };

  const entries = await db.tradeEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return Response.json({ entries, plan: user?.plan ?? "free" });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { plan: true } });
  const isPro = user?.plan === "pro" || user?.plan === "premium";

  // Free users: max 3 trades/day (basic fields only — no emotion/psychology data)
  if (!isPro) {
    const today = new Date().toISOString().split("T")[0];
    const todayCount = await db.tradeEntry.count({ where: { userId: auth.userId, date: today } });
    if (todayCount >= FREE_DAILY_LIMIT) {
      return Response.json({ error: "Free plan limit: 3 trades/day. Upgrade to Pro for unlimited journaling.", limitReached: true }, { status: 403 });
    }
  }

  // Shim guard for downstream code
  const guard = { userId: auth.userId };

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { date, symbol, side, pnl, setup, emotionBefore, emotionAfter, mistake, notes, checkinScore, tags, reflection, chartUrl } = body;

  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }
  if (side && !["long", "short"].includes(side)) {
    return Response.json({ error: "Invalid side" }, { status: 400 });
  }
  if (pnl !== undefined && pnl !== null) {
    if (typeof pnl !== "number" || !isFinite(pnl) || Math.abs(pnl) > MAX_PNL) {
      return Response.json({ error: "Invalid pnl" }, { status: 400 });
    }
  }
  if (emotionBefore !== undefined && emotionBefore !== null && (emotionBefore < 1 || emotionBefore > 5)) {
    return Response.json({ error: "emotionBefore must be 1–5" }, { status: 400 });
  }
  if (emotionAfter !== undefined && emotionAfter !== null && (emotionAfter < 1 || emotionAfter > 5)) {
    return Response.json({ error: "emotionAfter must be 1–5" }, { status: 400 });
  }

  let tagsJson: string | null = null;
  if (tags !== undefined && tags !== null) {
    const arr = Array.isArray(tags) ? tags : [];
    const filtered = arr.slice(0, MAX_TAGS).map((t: unknown) => String(t).slice(0, MAX_TAG_LEN));
    tagsJson = JSON.stringify(filtered);
  }

  const entry = await db.tradeEntry.create({
    data: {
      userId: guard.userId,
      date,
      symbol: symbol ? String(symbol).slice(0, 20).trim() : null,
      side: side || null,
      pnl: pnl ?? null,
      setup: setup ? String(setup).slice(0, MAX_TEXT).trim() : null,
      emotionBefore: emotionBefore ?? null,
      emotionAfter: emotionAfter ?? null,
      mistake: mistake ? String(mistake).slice(0, MAX_TEXT).trim() : null,
      notes: notes ? String(notes).slice(0, MAX_TEXT).trim() : null,
      checkinScore: checkinScore ?? null,
      tags: tagsJson,
      reflection: reflection ? String(reflection).slice(0, MAX_TEXT).trim() : null,
      chartUrl: typeof chartUrl === "string" && chartUrl.startsWith("https://") ? chartUrl : null,
    },
  });

  return Response.json({ ok: true, entry });
}

export async function PATCH(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.tradeEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== guard.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { symbol, side, pnl, setup, emotionBefore, emotionAfter, mistake, notes, tags, reflection, chartUrl } = body;

  if (side !== undefined && side !== null && !["long", "short"].includes(side)) {
    return Response.json({ error: "Invalid side" }, { status: 400 });
  }
  if (pnl !== undefined && pnl !== null) {
    if (typeof pnl !== "number" || !isFinite(pnl) || Math.abs(pnl) > MAX_PNL) {
      return Response.json({ error: "Invalid pnl" }, { status: 400 });
    }
  }
  if (emotionBefore !== undefined && emotionBefore !== null && (emotionBefore < 1 || emotionBefore > 5)) {
    return Response.json({ error: "emotionBefore must be 1–5" }, { status: 400 });
  }
  if (emotionAfter !== undefined && emotionAfter !== null && (emotionAfter < 1 || emotionAfter > 5)) {
    return Response.json({ error: "emotionAfter must be 1–5" }, { status: 400 });
  }

  let tagsJson: string | null | undefined = undefined;
  if (tags !== undefined) {
    if (tags === null) {
      tagsJson = null;
    } else {
      const arr = Array.isArray(tags) ? tags : [];
      const filtered = arr.slice(0, MAX_TAGS).map((t: unknown) => String(t).slice(0, MAX_TAG_LEN));
      tagsJson = JSON.stringify(filtered);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (symbol !== undefined) updateData.symbol = symbol ? String(symbol).slice(0, 20).trim() : null;
  if (side !== undefined) updateData.side = side || null;
  if (pnl !== undefined) updateData.pnl = pnl ?? null;
  if (setup !== undefined) updateData.setup = setup ? String(setup).slice(0, MAX_TEXT).trim() : null;
  if (emotionBefore !== undefined) updateData.emotionBefore = emotionBefore ?? null;
  if (emotionAfter !== undefined) updateData.emotionAfter = emotionAfter ?? null;
  if (mistake !== undefined) updateData.mistake = mistake ? String(mistake).slice(0, MAX_TEXT).trim() : null;
  if (notes !== undefined) updateData.notes = notes ? String(notes).slice(0, MAX_TEXT).trim() : null;
  if (tagsJson !== undefined) updateData.tags = tagsJson;
  if (reflection !== undefined) updateData.reflection = reflection ? String(reflection).slice(0, MAX_TEXT).trim() : null;
  if (chartUrl !== undefined) updateData.chartUrl = typeof chartUrl === "string" && chartUrl.startsWith("https://") ? chartUrl : null;

  const updated = await db.tradeEntry.update({ where: { id }, data: updateData });
  return Response.json({ ok: true, entry: updated });
}

export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const entry = await db.tradeEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== guard.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db.tradeEntry.delete({ where: { id } });
  return Response.json({ ok: true });
}