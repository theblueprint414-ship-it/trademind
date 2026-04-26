import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

// POST /api/circles/invite — get WhatsApp invite link for a circle
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const circleId = body?.circleId;
  if (!circleId) return Response.json({ error: "circleId required" }, { status: 400 });

  const member = await db.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId: guard.userId } },
    include: { circle: true },
  });

  if (!member) return Response.json({ error: "Not a member of this circle" }, { status: 403 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trademindedge.com";
  const joinUrl = `${appUrl}/join-circle/${member.circle.token}`;

  return Response.json({ ok: true, joinUrl, circleName: member.circle.name });
}