import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const attempts = await db.challengeAttempt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json({ attempts });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  if (!user || user.plan !== "premium") return Response.json({ error: "Premium feature" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });
  if (!body.startDate) return Response.json({ error: "startDate is required" }, { status: 400 });
  if (!body.accountSize || isNaN(Number(body.accountSize)) || Number(body.accountSize) <= 0) return Response.json({ error: "accountSize must be a positive number" }, { status: 400 });
  if (body.dailyLimit === undefined || body.dailyLimit === null || isNaN(Number(body.dailyLimit))) return Response.json({ error: "dailyLimit is required" }, { status: 400 });
  if (body.maxDrawdown === undefined || body.maxDrawdown === null || isNaN(Number(body.maxDrawdown))) return Response.json({ error: "maxDrawdown is required" }, { status: 400 });
  if (body.outcome !== undefined && !["passed", "failed", "active"].includes(body.outcome)) return Response.json({ error: "outcome must be passed, failed, or active" }, { status: 400 });

  const attempt = await db.challengeAttempt.create({
    data: {
      userId: session.user.id,
      firm: body.firm ?? null,
      accountSize: body.accountSize,
      profitTarget: body.profitTarget ?? null,
      dailyLimit: body.dailyLimit,
      maxDrawdown: body.maxDrawdown,
      tradingDaysTarget: body.tradingDaysTarget ?? null,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      outcome: body.outcome ?? "active",
      finalPnl: body.finalPnl ?? null,
      tradingDays: body.tradingDays ?? null,
      notes: body.notes ?? null,
    },
  });

  return Response.json({ ok: true, id: attempt.id });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.id) return Response.json({ error: "Missing id" }, { status: 400 });

  const attempt = await db.challengeAttempt.findFirst({
    where: { id: body.id, userId: session.user.id },
  });
  if (!attempt) return Response.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (typeof body.outcome === "string") {
    if (!["passed", "failed", "active"].includes(body.outcome)) return Response.json({ error: "outcome must be passed, failed, or active" }, { status: 400 });
    data.outcome = body.outcome;
  }
  if (typeof body.finalPnl === "number") data.finalPnl = body.finalPnl;
  if (typeof body.tradingDays === "number") data.tradingDays = body.tradingDays;
  if (typeof body.endDate === "string") data.endDate = body.endDate;
  if (typeof body.notes === "string") data.notes = body.notes;

  await db.challengeAttempt.update({ where: { id: body.id }, data });
  return Response.json({ ok: true });
}