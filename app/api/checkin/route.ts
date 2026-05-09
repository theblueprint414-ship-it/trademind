import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

const QUESTION_WEIGHTS: Record<string, number> = {
  sleep: 0.25,
  emotion: 0.3,
  focus: 0.2,
  financial_stress: 0.15,
  recent_performance: 0.1,
};

const VALID_OPTION_VALUES: Record<string, number[] | null> = {
  sleep: [0, 40, 65, 85, 100],
  emotion: [0, 25, 75, 90, 100],
  focus: null,
  financial_stress: [0, 40, 70, 100],
  recent_performance: [0, 35, 65, 85, 100],
};

const CAFFEINE_LEVELS = ["none", "low", "medium", "high"];

function computeBaseScore(answers: Record<string, unknown>): number {
  let score = 0;
  for (const [id, weight] of Object.entries(QUESTION_WEIGHTS)) {
    const raw = answers[id];
    const val = typeof raw === "number" ? raw : 50;
    score += Math.max(0, Math.min(100, val)) * weight;
  }
  return Math.round(score);
}

function computeReadinessScore(
  baseScore: number,
  opts: {
    sleepQuality?: number | null;
    caffeineLevel?: string | null;
    alcoholLast24h?: boolean | null;
    exerciseToday?: boolean | null;
  }
): number {
  let adjustment = 0;
  if (opts.sleepQuality !== null && opts.sleepQuality !== undefined) {
    if (opts.sleepQuality >= 8) adjustment += 5;
    else if (opts.sleepQuality <= 4) adjustment -= 5;
  }
  if (opts.caffeineLevel === "high") adjustment -= 8;
  if (opts.alcoholLast24h) adjustment -= 15;
  if (opts.exerciseToday) adjustment += 8;
  return Math.max(0, Math.min(100, baseScore + adjustment));
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const {
    answers, date,
    sleepQuality, sleepHours, caffeineLevel, alcoholLast24h, exerciseToday, tradingPlan,
  } = body;

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return Response.json({ error: "Invalid answers" }, { status: 400 });
  }

  for (const [id, validValues] of Object.entries(VALID_OPTION_VALUES)) {
    const val = (answers as Record<string, unknown>)[id];
    if (val === undefined) continue;
    if (typeof val !== "number" || !Number.isFinite(val)) {
      return Response.json({ error: `Invalid answer for ${id}` }, { status: 400 });
    }
    if (validValues !== null && !validValues.includes(val)) {
      return Response.json({ error: `Invalid option value for ${id}` }, { status: 400 });
    }
    if (val < 0 || val > 100) {
      return Response.json({ error: `Answer out of range for ${id}` }, { status: 400 });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
  if (date !== today && date !== yesterday) {
    return Response.json({ error: "Date out of range" }, { status: 400 });
  }

  // Validate lifestyle fields
  const sqVal = typeof sleepQuality === "number" && sleepQuality >= 1 && sleepQuality <= 10 ? sleepQuality : null;
  const shVal = typeof sleepHours === "number" && sleepHours >= 0 && sleepHours <= 24 ? sleepHours : null;
  const clVal = typeof caffeineLevel === "string" && CAFFEINE_LEVELS.includes(caffeineLevel) ? caffeineLevel : null;
  const alVal = typeof alcoholLast24h === "boolean" ? alcoholLast24h : null;
  const exVal = typeof exerciseToday === "boolean" ? exerciseToday : null;
  const tpVal = typeof tradingPlan === "string" && tradingPlan.length <= 500 ? tradingPlan.trim() || null : null;

  const baseScore = computeBaseScore(answers as Record<string, unknown>);
  const readiness = computeReadinessScore(baseScore, {
    sleepQuality: sqVal, caffeineLevel: clVal, alcoholLast24h: alVal, exerciseToday: exVal,
  });

  let verdict: "GO" | "CAUTION" | "NO-TRADE";
  if (readiness >= 70) verdict = "GO";
  else if (readiness >= 45) verdict = "CAUTION";
  else verdict = "NO-TRADE";

  try {
    await db.checkin.upsert({
      where: { userId_date: { userId: session.user.id, date } },
      update: {
        score: readiness, verdict, answers: JSON.stringify(answers),
        sleepQuality: sqVal, sleepHours: shVal, caffeineLevel: clVal,
        alcoholLast24h: alVal, exerciseToday: exVal, tradingPlan: tpVal,
        readinessScore: readiness,
      },
      create: {
        userId: session.user.id, date, score: readiness, verdict,
        answers: JSON.stringify(answers),
        sleepQuality: sqVal, sleepHours: shVal, caffeineLevel: clVal,
        alcoholLast24h: alVal, exerciseToday: exVal, tradingPlan: tpVal,
        readinessScore: readiness,
      },
    });
  } catch (err) {
    logger.error("Checkin DB upsert failed", err, { userId: session.user.id, date });
    return Response.json({ error: "Failed to save check-in" }, { status: 500 });
  }

  return Response.json({ ok: true, score: readiness, verdict, date, baseScore });
}

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "loose");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const limit = Math.min(Number(searchParams.get("limit") || 7), 90);

  try {
    if (date === "history") {
      const history = await db.checkin.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
        take: limit,
        select: {
          date: true, score: true, verdict: true,
          sleepQuality: true, sleepHours: true, caffeineLevel: true,
          alcoholLast24h: true, exerciseToday: true, readinessScore: true,
        },
      });
      return Response.json({ history });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ error: "Invalid date format" }, { status: 400 });
    }

    const checkin = await db.checkin.findUnique({
      where: { userId_date: { userId: session.user.id, date } },
    });

    return Response.json({ date, score: checkin?.score ?? null, verdict: checkin?.verdict ?? null });
  } catch (err) {
    logger.error("Checkin GET failed", err, { userId: session.user.id });
    return Response.json({ error: "Failed to fetch check-in" }, { status: 500 });
  }
}