export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

// POST — attach lifestyle data to today's check-in (exercise, stress, etc.)
// Merges into the existing answers JSON without overwriting check-in scores
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { exercise, stress, date } = body ?? {};
  const targetDate = date ?? new Date().toISOString().split("T")[0];

  const checkin = await db.checkin.findUnique({
    where: { userId_date: { userId: session.user.id, date: targetDate } },
  });
  if (!checkin) return Response.json({ error: "No check-in found for this date" }, { status: 404 });

  let existingAnswers: Record<string, unknown> = {};
  try { existingAnswers = JSON.parse(checkin.answers); } catch {}

  const merged = { ...existingAnswers, lifestyle: { exercise, stress } };
  await db.checkin.update({
    where: { userId_date: { userId: session.user.id, date: targetDate } },
    data: { answers: JSON.stringify(merged) },
  });

  return Response.json({ ok: true });
}

// GET — fetch lifestyle breakdown across last N check-ins for correlation display
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const days = Number(new URL(request.url).searchParams.get("days") ?? 30);
  const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];

  const checkins = await db.checkin.findMany({
    where: { userId: session.user.id, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  const lifestyleData = checkins
    .map((c) => {
      let answers: Record<string, unknown> = {};
      try { answers = JSON.parse(c.answers); } catch {}
      const lifestyle = answers.lifestyle as { exercise?: boolean; stress?: number } | undefined;
      if (!lifestyle) return null;
      return { date: c.date, score: c.score, verdict: c.verdict, exercise: lifestyle.exercise, stress: lifestyle.stress };
    })
    .filter(Boolean);

  // Compute correlations
  const withExercise = lifestyleData.filter((d) => d?.exercise);
  const withoutExercise = lifestyleData.filter((d) => d?.exercise === false);
  const avgScoreWithExercise = withExercise.length
    ? Math.round(withExercise.reduce((s, d) => s + (d?.score ?? 0), 0) / withExercise.length)
    : null;
  const avgScoreWithoutExercise = withoutExercise.length
    ? Math.round(withoutExercise.reduce((s, d) => s + (d?.score ?? 0), 0) / withoutExercise.length)
    : null;

  return Response.json({
    data: lifestyleData,
    insights: {
      exerciseCount: withExercise.length,
      noExerciseCount: withoutExercise.length,
      avgScoreWithExercise,
      avgScoreWithoutExercise,
      exerciseLift: avgScoreWithExercise !== null && avgScoreWithoutExercise !== null
        ? avgScoreWithExercise - avgScoreWithoutExercise
        : null,
    },
  });
}