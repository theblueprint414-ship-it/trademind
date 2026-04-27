import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const circleId = new URL(request.url).searchParams.get("circleId");
  if (!circleId) return Response.json({ error: "circleId required" }, { status: 400 });

  try {
    await db.circleMember.deleteMany({ where: { circleId, userId: guard.userId } });
    const remaining = await db.circleMember.count({ where: { circleId } });
    if (remaining === 0) await db.circle.delete({ where: { id: circleId } });
    return Response.json({ ok: true });
  } catch (err) {
    logger.error("Circles leave DELETE failed", err, { userId: guard.userId });
    return Response.json({ error: "Failed to leave circle" }, { status: 500 });
  }
}