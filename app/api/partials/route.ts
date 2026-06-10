import { db } from "@/lib/db";
import { requireAuth, requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("tradeId");
  if (!tradeId) return Response.json({ error: "tradeId required" }, { status: 400 });

  // Verify trade ownership
  const trade = await db.tradeEntry.findUnique({ where: { id: tradeId }, select: { userId: true } });
  if (!trade || trade.userId !== auth.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const partials = await db.partialClose.findMany({
    where: { tradeEntryId: tradeId },
    orderBy: { closedAt: "asc" },
  });
  return Response.json({ partials });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { tradeId, price, qty, pnl, reason, closedAt, notes } = body;
  if (!tradeId || typeof tradeId !== "string") return Response.json({ error: "tradeId required" }, { status: 400 });
  if (typeof price !== "number" || !isFinite(price)) return Response.json({ error: "price required" }, { status: 400 });
  if (typeof qty !== "number" || !isFinite(qty) || qty <= 0) return Response.json({ error: "qty must be > 0" }, { status: 400 });
  if (!closedAt || typeof closedAt !== "string") return Response.json({ error: "closedAt required" }, { status: 400 });

  const trade = await db.tradeEntry.findUnique({ where: { id: tradeId }, select: { userId: true } });
  if (!trade || trade.userId !== guard.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const VALID_REASONS = ["profit_taking", "risk_reduction", "trailing_stop", "manual"];

  const partial = await db.partialClose.create({
    data: {
      tradeEntryId: tradeId,
      userId: guard.userId,
      price,
      qty,
      pnl: typeof pnl === "number" && isFinite(pnl) ? pnl : null,
      reason: typeof reason === "string" && VALID_REASONS.includes(reason) ? reason : null,
      closedAt,
      notes: typeof notes === "string" && notes.trim() ? notes.trim().slice(0, 500) : null,
    },
  });
  return Response.json({ ok: true, partial });
}

export async function PATCH(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.partialClose.findUnique({ where: { id } });
  if (!existing || existing.userId !== guard.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { price, qty, pnl, reason, closedAt, notes } = body;
  const VALID_REASONS = ["profit_taking", "risk_reduction", "trailing_stop", "manual"];
  const updateData: Record<string, unknown> = {};
  if (price !== undefined) updateData.price = typeof price === "number" && isFinite(price) ? price : existing.price;
  if (qty !== undefined) updateData.qty = typeof qty === "number" && isFinite(qty) && qty > 0 ? qty : existing.qty;
  if (pnl !== undefined) updateData.pnl = typeof pnl === "number" && isFinite(pnl) ? pnl : null;
  if (reason !== undefined) updateData.reason = typeof reason === "string" && VALID_REASONS.includes(reason) ? reason : null;
  if (closedAt !== undefined) updateData.closedAt = typeof closedAt === "string" ? closedAt : existing.closedAt;
  if (notes !== undefined) updateData.notes = typeof notes === "string" && notes.trim() ? notes.trim().slice(0, 500) : null;

  const partial = await db.partialClose.update({ where: { id }, data: updateData });
  return Response.json({ ok: true, partial });
}

export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.partialClose.findUnique({ where: { id } });
  if (!existing || existing.userId !== guard.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db.partialClose.delete({ where: { id } });
  return Response.json({ ok: true });
}
