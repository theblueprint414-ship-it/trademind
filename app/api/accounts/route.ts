import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const accounts = await db.tradingAccount.findMany({
    where: { userId: auth.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    include: { _count: { select: { tradeEntries: true } } },
  });
  return Response.json({ accounts });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { name, startingBalance, currency, isDefault } = body;
  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return Response.json({ error: "Name required" }, { status: 400 });
  }

  const existing = await db.tradingAccount.count({ where: { userId: auth.userId } });
  if (existing >= 20) return Response.json({ error: "Max 20 accounts" }, { status: 400 });

  if (isDefault) {
    await db.tradingAccount.updateMany({ where: { userId: auth.userId }, data: { isDefault: false } });
  }

  const account = await db.tradingAccount.create({
    data: {
      userId: auth.userId,
      name: name.trim().slice(0, 60),
      startingBalance: typeof startingBalance === "number" && isFinite(startingBalance) ? startingBalance : null,
      currency: typeof currency === "string" ? currency.toUpperCase().slice(0, 3) : "USD",
      isDefault: !!isDefault || existing === 0,
    },
  });
  return Response.json({ ok: true, account });
}

export async function PATCH(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.tradingAccount.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { name, startingBalance, currency, isDefault } = body;
  if (isDefault) {
    await db.tradingAccount.updateMany({ where: { userId: auth.userId }, data: { isDefault: false } });
  }

  const account = await db.tradingAccount.update({
    where: { id },
    data: {
      ...(name ? { name: String(name).trim().slice(0, 60) } : {}),
      ...(startingBalance !== undefined ? { startingBalance: typeof startingBalance === "number" && isFinite(startingBalance) ? startingBalance : null } : {}),
      ...(currency ? { currency: String(currency).toUpperCase().slice(0, 3) } : {}),
      ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}),
    },
  });
  return Response.json({ ok: true, account });
}

export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await db.tradingAccount.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db.tradingAccount.delete({ where: { id } });
  return Response.json({ ok: true });
}
