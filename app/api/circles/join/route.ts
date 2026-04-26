import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// GET /api/circles/join?token=xxx — get circle info by invite token (no auth required)
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Token required" }, { status: 400 });

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
}

// POST /api/circles/join — join a circle by token
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (!token) return Response.json({ error: "Token required" }, { status: 400 });

  const circle = await db.circle.findUnique({ where: { token } });
  if (!circle) return Response.json({ error: "Circle not found" }, { status: 404 });

  await db.circleMember.upsert({
    where: { circleId_userId: { circleId: circle.id, userId: guard.userId } },
    update: {},
    create: { circleId: circle.id, userId: guard.userId },
  });

  return Response.json({ ok: true, circleId: circle.id, circleName: circle.name });
}