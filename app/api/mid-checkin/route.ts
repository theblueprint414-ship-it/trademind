import { db } from "@/lib/db";
import { requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

const MOODS = ["focused", "anxious", "tired", "confident", "frustrated", "neutral"] as const;

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const today = new Date().toISOString().split("T")[0];
  const checkins = await db.midSessionCheckin.findMany({
    where: { userId: auth.userId, date: today },
    orderBy: { createdAt: "asc" },
  });
  return Response.json({ checkins });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { score, mood, tradesCount, note } = body;

  if (typeof score !== "number" || score < 1 || score > 10) {
    return Response.json({ error: "score must be 1–10" }, { status: 400 });
  }
  if (!mood || !MOODS.includes(mood as (typeof MOODS)[number])) {
    return Response.json({ error: "Invalid mood" }, { status: 400 });
  }

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().slice(0, 5);

  const checkin = await db.midSessionCheckin.create({
    data: {
      userId: auth.userId,
      date,
      time,
      score,
      mood,
      tradesCount: typeof tradesCount === "number" ? tradesCount : 0,
      note: note ? String(note).slice(0, 300).trim() : null,
    },
  });

  return Response.json({ ok: true, checkin });
}