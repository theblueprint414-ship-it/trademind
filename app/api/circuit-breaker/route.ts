import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET — fetch circuit breaker settings
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cb = await db.circuitBreaker.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json(cb ?? null);
}

// PATCH — upsert settings
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { isActive, dailyLimit, scoreAdaptive, resetHour } = body;

  const data: Record<string, unknown> = {};
  if (typeof isActive === "boolean") data.isActive = isActive;
  if (typeof dailyLimit === "number" && dailyLimit >= 1 && dailyLimit <= 50) data.dailyLimit = dailyLimit;
  if (typeof scoreAdaptive === "boolean") data.scoreAdaptive = scoreAdaptive;
  if (typeof resetHour === "number" && resetHour >= 0 && resetHour <= 23) data.resetHour = resetHour;

  const cb = await db.circuitBreaker.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json(cb);
}