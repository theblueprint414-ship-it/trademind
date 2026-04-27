import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Token required" }, { status: 400 });

  try {
    const circle = await db.circle.findUnique({
      where: { token },
      include: {
        creator: { select: { name: true, email: true } },
        members: true,
      },
    });
    if (!circle) return Response.json({ error: "Invite not found" }, { status: 404 });
    return Response.json({
      id: circle.id,
      name: circle.name,
      creatorName: circle.creator.name ?? circle.creator.email,
      memberCount: circle.members.length,
      token: circle.token,
    });
  } catch (err) {
    logger.error("Circles join GET failed", err);
    return Response.json({ error: "Failed to fetch circle" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (!token) return Response.json({ error: "Token required" }, { status: 400 });

  try {
    const circle = await db.circle.findUnique({ where: { token } });
    if (!circle) return Response.json({ error: "Circle not found" }, { status: 404 });
    await db.circleMember.upsert({
      where: { circleId_userId: { circleId: circle.id, userId: guard.userId } },
      update: {},
      create: { circleId: circle.id, userId: guard.userId },
    });
    return Response.json({ ok: true, circleId: circle.id, circleName: circle.name });
  } catch (err) {
    logger.error("Circles join POST failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to join circle" }, { status: 500 });
  }
}