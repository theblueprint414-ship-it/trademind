import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// DELETE /api/circles/leave?circleId=xxx — leave a circle
export async function DELETE(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const circleId = new URL(request.url).searchParams.get("circleId");
  if (!circleId) return Response.json({ error: "circleId required" }, { status: 400 });

  await db.circleMember.deleteMany({ where: { circleId, userId: guard.userId } });

  // If no members left, delete the circle
  const remaining = await db.circleMember.count({ where: { circleId } });
  if (remaining === 0) await db.circle.delete({ where: { id: circleId } });

  return Response.json({ ok: true });
}