import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

// GET — list circles the user belongs to (as creator or member), with members + latest scores
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const userId = guard.userId;

  try {
    const memberships = await db.circleMember.findMany({
      where: { userId },
      include: {
        circle: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
          },
        },
      },
    });

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    const circles = await Promise.all(
      memberships.map(async (m) => {
        const circle = m.circle;

        const memberData = await Promise.all(
          circle.members.map(async (cm) => {
            const latestCheckin = await db.checkin.findFirst({
              where: { userId: cm.userId, date: { gte: sevenDaysAgo } },
              orderBy: { date: "desc" },
            });
            return {
              id: cm.userId,
              name: cm.user.name ?? cm.user.email,
              avatar: cm.user.image ?? "",
              score: latestCheckin?.score ?? null,
              verdict: (latestCheckin?.verdict ?? null) as "GO" | "CAUTION" | "NO-TRADE" | null,
              checkedInToday: latestCheckin?.date === today,
              isMe: cm.userId === userId,
            };
          })
        );

        return {
          id: circle.id,
          name: circle.name,
          token: circle.token,
          isCreator: circle.createdBy === userId,
          memberCount: circle.members.length,
          members: memberData,
        };
      })
    );

    return Response.json({ circles });
  } catch (err) {
    logger.error("Circles GET failed", err, { userId });
    return Response.json({ error: "Failed to fetch circles" }, { status: 500 });
  }
}

// POST — create a new circle
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const name = body?.name ? String(body.name).slice(0, 60).trim() : "";
  if (!name) return Response.json({ error: "Circle name required" }, { status: 400 });

  try {
    const circle = await db.circle.create({
      data: { name, createdBy: guard.userId },
    });
    await db.circleMember.create({
      data: { circleId: circle.id, userId: guard.userId },
    });
    return Response.json({ ok: true, circle: { id: circle.id, name: circle.name, token: circle.token } });
  } catch (err) {
    logger.error("Circles POST failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to create circle" }, { status: 500 });
  }
}

// PATCH — rename a circle (creator only)
export async function PATCH(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const circleId = new URL(request.url).searchParams.get("circleId");
  if (!circleId) return Response.json({ error: "circleId required" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const name = body?.name ? String(body.name).slice(0, 60).trim() : "";
  if (!name) return Response.json({ error: "name required" }, { status: 400 });

  try {
    const circle = await db.circle.findUnique({ where: { id: circleId } });
    if (!circle) return Response.json({ error: "Not found" }, { status: 404 });
    if (circle.createdBy !== guard.userId) return Response.json({ error: "Not the creator" }, { status: 403 });
    await db.circle.update({ where: { id: circleId }, data: { name } });
    return Response.json({ ok: true, name });
  } catch (err) {
    logger.error("Circles PATCH failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to update circle" }, { status: 500 });
  }
}

// DELETE — delete a circle (creator only)
export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const circleId = new URL(request.url).searchParams.get("circleId");
  if (!circleId) return Response.json({ error: "circleId required" }, { status: 400 });

  try {
    const circle = await db.circle.findUnique({ where: { id: circleId } });
    if (!circle) return Response.json({ error: "Not found" }, { status: 404 });
    if (circle.createdBy !== guard.userId) return Response.json({ error: "Not the creator" }, { status: 403 });
    await db.circle.delete({ where: { id: circleId } });
    return Response.json({ ok: true });
  } catch (err) {
    logger.error("Circles DELETE failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to delete circle" }, { status: 500 });
  }
}