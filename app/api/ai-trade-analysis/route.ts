import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { symbol, side, pnl, rMultiple, emotionBefore, emotionAfter, checkinScore, entryHour, setup, mistake } = body;

  const prompt = `You are a trading psychology coach reviewing a single trade. Provide a brief, specific analysis in JSON format.

Trade data:
- Symbol: ${symbol ?? "Unknown"}
- Side: ${side ?? "unknown"}
- P&L: ${pnl !== null && pnl !== undefined ? `$${pnl.toFixed(2)}` : "not logged"}
- R-Multiple: ${rMultiple !== null && rMultiple !== undefined ? `${rMultiple >= 0 ? "+" : ""}${rMultiple.toFixed(2)}R` : "not calculated"}
- Mental score that day: ${checkinScore ?? "not recorded"}/100
- Emotion before: ${emotionBefore ? ["Terrible","Bad","Neutral","Good","Great"][emotionBefore - 1] : "not recorded"}
- Emotion after: ${emotionAfter ? ["Terrible","Bad","Neutral","Good","Great"][emotionAfter - 1] : "not recorded"}
- Entry hour (UTC): ${entryHour ?? "unknown"}
- Setup/thesis: ${setup || "none provided"}
- Mistake noted: ${mistake || "none"}

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "alignment": "1-2 sentences: how well did mental state align with trade execution?",
  "risk": "1-2 sentences: risk management assessment for this specific trade",
  "lesson": "1 sentence: the most actionable lesson from this trade"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: "Invalid AI response" }, { status: 500 });

    const analysis = JSON.parse(jsonMatch[0]) as { alignment: string; risk: string; lesson: string };
    return Response.json({ ok: true, analysis });
  } catch {
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}