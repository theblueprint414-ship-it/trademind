import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

// Server-side scoring — mirrors the client QUESTIONS definition exactly.
// Client-supplied score is ignored; we recompute from raw answers to prevent tampering.
const QUESTION_WEIGHTS: Record<string, number> = {
  sleep: 0.25,
  emotion: 0.3,
  focus: 0.2,
  financial_stress: 0.15,
  recent_performance: 0.1,
};

// Valid option values per question (slider "focus" accepts any 0-100 integer)
const VALID_OPTION_VALUES: Record<string, number[] | null> = {
  sleep: [0, 40, 65, 85, 100],
  emotion: [0, 25, 75, 90, 100],
  focus: null, // slider — any 0-100 value accepted
  financial_stress: [0, 40, 70, 100],
  recent_performance: [0, 35, 65, 85, 100],
};

function computeScore(answers: Record<string, unknown>): number {
  let score = 0;
  for (const [id, weight] of Object.entries(QUESTION_WEIGHTS)) {
    const raw = answers[id];
    const val = typeof raw === "number" ? raw : 50; // default 50 if unanswered
    score += Math.max(0, Math.min(100, val)) * weight;
  }
  return Math.round(score);
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const { answers, date } = body;

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return Response.json({ error: "Invalid answers" }, { status: 400 });
  }

  // Validate individual answer values
  for (const [id, validValues] of Object.entries(VALID_OPTION_VALUES)) {
    const val = (answers as Record<string, unknown>)[id];
    if (val === undefined) continue; // unanswered — defaults to 50 in scoring
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

  const score = computeScore(answers as Record<string, unknown>);

  let verdict: "GO" | "CAUTION" | "NO-TRADE";
  if (score >= 70) verdict = "GO";
  else if (score >= 45) verdict = "CAUTION";
  else verdict = "NO-TRADE";

  try {
    await db.checkin.upsert({
      where: { userId_date: { userId: session.user.id, date } },
      update: { score, verdict, answers: JSON.stringify(answers) },
      create: { userId: session.user.id, date, score, verdict, answers: JSON.stringify(answers) },
    });
  } catch (err) {
    logger.error("Checkin DB upsert failed", err, { userId: session.user.id, date });
    return Response.json({ error: "Failed to save check-in" }, { status: 500 });
  }

  return Response.json({ ok: true, score, verdict, date });
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
        select: { date: true, score: true, verdict: true },
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