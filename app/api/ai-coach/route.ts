import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { requirePlan } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const SYSTEM_PROMPT = `You are Alex, an elite trading psychology coach with 20+ years coaching professional traders at top hedge funds. You specialize in behavioral finance and performance under pressure.

You have real data on this trader — their check-in scores, trading P&L, patterns, and personal rules. Everything you say is grounded in their specific numbers.

Your coaching philosophy:
- ALWAYS lead with the most damaging pattern in their data — name it, quantify it, then prescribe the fix
- Reference exact numbers: win rates, P&L figures, specific days, score thresholds, day-of-week stats
- If day-of-week data shows a losing day (e.g. "Mondays avg -$420"), name it directly
- If revenge trading is detected (overtrading the day after a loss), call it out with exact frequency
- If trades taken below a score threshold are losing money, name that threshold explicitly
- Give ONE specific, actionable instruction — not a list, one focus
- Be direct and honest. Comfortable conversations don't build elite traders
- If they're improving, name exactly what's working and how to sustain it
- If they're struggling, name the exact problem and give the exact solution

Never:
- Give advice that applies to any trader (that's not coaching, it's a blog post)
- Use vague language like "be more disciplined" without specifics
- Write more than 4 sentences for daily messages
- Mention you're an AI, Claude, or Anthropic
- Give multiple recommendations — one clear focus is always more powerful than three scattered ones`;

async function buildUserContext(userId: string): Promise<string> {
  const [checkins, tradeEntries, playbook] = await Promise.all([
    db.checkin.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 60 }),
    db.tradeEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 100 }),
    db.playbook.findUnique({ where: { userId } }),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayCheckin = checkins.find((c) => c.date === today);

  // Averages
  const last30 = checkins.slice(0, 30);
  const prev30 = checkins.slice(30, 60);
  const avg30 = last30.length ? Math.round(last30.reduce((s, c) => s + c.score, 0) / last30.length) : null;
  const avgPrev30 = prev30.length ? Math.round(prev30.reduce((s, c) => s + c.score, 0) / prev30.length) : null;
  const trend = avg30 !== null && avgPrev30 !== null ? avg30 - avgPrev30 : null;

  // Recent 15 vs prev 15
  const avg15 = checkins.slice(0, 15).length ? Math.round(checkins.slice(0, 15).reduce((s, c) => s + c.score, 0) / checkins.slice(0, 15).length) : null;
  const avgPrev15 = checkins.slice(15, 30).length ? Math.round(checkins.slice(15, 30).reduce((s, c) => s + c.score, 0) / checkins.slice(15, 30).length) : null;

  // Streak
  let streak = 0;
  for (let i = 0; i < checkins.length; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (checkins[i]?.date === d.toISOString().split("T")[0]) streak++;
    else break;
  }

  // Verdicts
  const vc = { GO: 0, CAUTION: 0, NT: 0 };
  for (const c of last30) {
    if (c.verdict === "GO") vc.GO++;
    else if (c.verdict === "CAUTION") vc.CAUTION++;
    else vc.NT++;
  }

  // Performance by mental state
  const withPnl = tradeEntries.filter((t) => t.pnl !== null && t.checkinScore !== null);
  const calc = (trades: typeof withPnl) => {
    if (!trades.length) return null;
    const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length;
    const total = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
    return { n: trades.length, wr: Math.round((wins / trades.length) * 100), avg: Math.round(total / trades.length), total: Math.round(total) };
  };
  const goP = calc(withPnl.filter((t) => (t.checkinScore ?? 0) >= 70));
  const cauP = calc(withPnl.filter((t) => (t.checkinScore ?? 0) >= 45 && (t.checkinScore ?? 0) < 70));
  const ntP = calc(withPnl.filter((t) => (t.checkinScore ?? 999) < 45));

  // After-loss next-day score pattern
  const tradesByDate: Record<string, number> = {};
  for (const t of tradeEntries.filter((t) => t.pnl !== null)) {
    tradesByDate[t.date] = (tradesByDate[t.date] ?? 0) + (t.pnl ?? 0);
  }
  const lossDays = Object.entries(tradesByDate).filter(([, pnl]) => pnl < 0).map(([d]) => d);
  const nextDayScores = lossDays.map((d) => {
    const next = new Date(d + "T12:00:00"); next.setDate(next.getDate() + 1);
    const nStr = next.toISOString().split("T")[0];
    return checkins.find((c) => c.date === nStr)?.score ?? null;
  }).filter((s): s is number => s !== null);
  const avgAfterLoss = nextDayScores.length >= 3 ? Math.round(nextDayScores.reduce((a, b) => a + b, 0) / nextDayScores.length) : null;

  // Consecutive bad day pattern
  let maxConsecNT = 0; let curConsec = 0;
  for (const c of [...checkins].reverse()) {
    if (c.verdict === "NO-TRADE") { curConsec++; maxConsecNT = Math.max(maxConsecNT, curConsec); }
    else curConsec = 0;
  }

  // Overtrading
  const overtradingDays = tradeEntries.reduce((acc: Record<string, number>, t) => { acc[t.date] = (acc[t.date] ?? 0) + 1; return acc; }, {});
  const otDays = Object.values(overtradingDays).filter((n) => n >= 4).length;

  // Day-of-week P&L correlation
  const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dowPnl: Record<string, { pnl: number; count: number }> = {};
  for (const [dateStr, pnl] of Object.entries(tradesByDate)) {
    const dow = DOW_NAMES[new Date(dateStr + "T12:00:00").getDay()];
    if (!dowPnl[dow]) dowPnl[dow] = { pnl: 0, count: 0 };
    dowPnl[dow].pnl += pnl;
    dowPnl[dow].count++;
  }
  const dowAvg = Object.entries(dowPnl)
    .filter(([, v]) => v.count >= 2)
    .map(([day, v]) => ({ day, avg: Math.round(v.pnl / v.count), count: v.count }))
    .sort((a, b) => a.avg - b.avg);
  const worstDow = dowAvg.length ? dowAvg[0] : null;
  const bestDow = dowAvg.length ? dowAvg[dowAvg.length - 1] : null;

  // Revenge trading: loss day followed by high-trade-count next calendar day
  const sortedTradeDates = Object.keys(tradesByDate).sort();
  let revengeTradingCount = 0;
  for (let i = 0; i < sortedTradeDates.length - 1; i++) {
    const d = sortedTradeDates[i];
    const next = new Date(d + "T12:00:00"); next.setDate(next.getDate() + 1);
    const nextD = next.toISOString().split("T")[0];
    if (tradesByDate[d] < 0 && (overtradingDays[nextD] ?? 0) >= 4) revengeTradingCount++;
  }

  // Score threshold: win rate below vs above 45
  const below45 = withPnl.filter((t) => (t.checkinScore ?? 999) < 45);
  const above45 = withPnl.filter((t) => (t.checkinScore ?? 0) >= 45);
  const below45WR = below45.length >= 3 ? Math.round((below45.filter((t) => (t.pnl ?? 0) > 0).length / below45.length) * 100) : null;
  const above45WR = above45.length >= 3 ? Math.round((above45.filter((t) => (t.pnl ?? 0) > 0).length / above45.length) * 100) : null;
  const below45Avg = below45.length >= 3 ? Math.round(below45.reduce((s, t) => s + (t.pnl ?? 0), 0) / below45.length) : null;

  // Best state profile: conditions when trader performs best
  const topPerfDays = Object.entries(tradesByDate)
    .filter(([, pnl]) => pnl > 0)
    .map(([d, pnl]) => ({ d, pnl, score: checkins.find((c) => c.date === d)?.score ?? null }))
    .filter((x) => x.score !== null)
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 5);
  const avgScoreOnBestDays = topPerfDays.length >= 3
    ? Math.round(topPerfDays.reduce((s, x) => s + (x.score ?? 0), 0) / topPerfDays.length)
    : null;

  // Recent journal mistakes & reflections
  const recentMistakes = tradeEntries.filter((t) => t.mistake).slice(0, 4).map((t) => t.mistake);
  const recentReflections = tradeEntries.filter((t) => t.reflection).slice(0, 2).map((t) => t.reflection);

  // Playbook rules
  const rules: { text: string; category: string; enabled: boolean }[] = playbook ? (() => { try { return JSON.parse(playbook.rules); } catch { return []; } })() : [];
  const activeRules = rules.filter((r) => r.enabled);

  const lines: string[] = [];

  lines.push(`=== TODAY ===`);
  lines.push(`Score: ${todayCheckin?.score ?? "no check-in yet"}/100 — ${todayCheckin?.verdict ?? "none"}`);

  lines.push(`\n=== TRENDS ===`);
  lines.push(`30-day average: ${avg30 ?? "—"}/100 ${trend !== null ? `(${trend >= 0 ? "+" : ""}${trend} vs prior 30 days)` : ""}`);
  if (avg15 && avgPrev15) lines.push(`Last 15 days: ${avg15} vs prior 15: ${avgPrev15} — ${avg15 > avgPrev15 ? "📈 improving" : "📉 declining"}`);
  lines.push(`Current streak: ${streak} days`);
  lines.push(`Last 30 verdicts: ${vc.GO} GO, ${vc.CAUTION} CAUTION, ${vc.NT} NO-TRADE`);

  lines.push(`\n=== PERFORMANCE BY MENTAL STATE ===`);
  if (goP) lines.push(`GO days: ${goP.n} trades, ${goP.wr}% win rate, avg $${goP.avg}/trade, total $${goP.total}`);
  if (cauP) lines.push(`CAUTION days: ${cauP.n} trades, ${cauP.wr}% win rate, avg $${cauP.avg}/trade`);
  if (ntP) lines.push(`NO-TRADE days (traded anyway): ${ntP.n} trades, ${ntP.wr}% win rate, avg $${ntP.avg}/trade, total $${ntP.total}`);

  lines.push(`\n=== BEHAVIORAL PATTERNS ===`);
  if (avgAfterLoss !== null) lines.push(`After losing days, next check-in averages ${avgAfterLoss}/100 (${avgAfterLoss < 45 ? "NO-TRADE zone — danger" : avgAfterLoss < 70 ? "CAUTION zone" : "still GO"})`);
  if (otDays > 0) lines.push(`Overtrading: ${otDays} days with 4+ trades`);
  if (revengeTradingCount >= 2) lines.push(`Revenge trading detected: ${revengeTradingCount} times — overtraded (4+ trades) the day after a losing day`);
  if (maxConsecNT >= 2) lines.push(`Max consecutive NO-TRADE days: ${maxConsecNT}`);

  if (worstDow && worstDow.avg < -50) lines.push(`Worst day of week: ${worstDow.day} — avg $${worstDow.avg}/day over ${worstDow.count} sessions (significant drag)`);
  if (bestDow && bestDow.avg > 50) lines.push(`Best day of week: ${bestDow.day} — avg $${bestDow.avg}/day over ${bestDow.count} sessions`);
  if (worstDow && bestDow && worstDow.day !== bestDow.day && worstDow.avg < 0 && bestDow.avg > 0)
    lines.push(`Day-of-week edge: ${bestDow.day} avg $${bestDow.avg} vs ${worstDow.day} avg $${worstDow.avg} — ${Math.round(Math.abs(bestDow.avg / (worstDow.avg || 1)))}x difference`);

  if (below45WR !== null && above45WR !== null) lines.push(`Score threshold impact: trades taken below score 45 → ${below45WR}% win rate (avg $${below45Avg}/trade); above 45 → ${above45WR}% win rate`);
  if (avgScoreOnBestDays !== null) lines.push(`Best trading days (top 5 by P&L) happened at avg score ${avgScoreOnBestDays}/100`);

  if (recentMistakes.length > 0) lines.push(`Recent logged mistakes: ${recentMistakes.join("; ")}`);
  if (recentReflections.length > 0) lines.push(`Recent journal reflections: ${recentReflections.join("; ")}`);

  if (activeRules.length > 0) {
    lines.push(`\n=== TRADER'S OWN RULES (from their Playbook) ===`);
    for (const r of activeRules) lines.push(`[${r.category}] ${r.text}`);
  }

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "strict");
  if (!rl.ok) return rl.response!;

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "AI Coach not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  const type: "daily" | "weekly" | "chat" = body?.type ?? "daily";
  const stream: boolean = body?.stream === true;
  const chatMessages: { role: "user" | "assistant"; content: string }[] = body?.messages ?? [];

  // weekly analysis and chat require Pro or Premium; daily briefing is free
  if (type === "weekly" || type === "chat") {
    const guard = await requirePlan(["premium"]);
    if (!guard.ok) return guard.response;
  }

  const context = await buildUserContext(session.user.id);
  const client = new Anthropic({ apiKey });

  // Model selection: Opus 4.7 for deep weekly analysis, Sonnet 4.6 for daily/chat
  const model = type === "weekly" ? "claude-opus-4-7" : "claude-sonnet-4-6";

  let userPrompt = "";
  if (type === "daily") {
    userPrompt = `Trader data:\n${context}\n\nGive a 2-4 sentence daily coaching message for today. Be specific to their numbers.`;
  } else if (type === "weekly") {
    userPrompt = `Trader data:\n${context}\n\nGive a 6-8 sentence weekly analysis. Structure: (1) What's their biggest pattern right now — reference exact numbers. (2) How it's affecting their P&L specifically. (3) One clear behavioral change to make this week. Reference their Playbook rules if relevant.`;
  } else {
    const lastMsg = chatMessages[chatMessages.length - 1]?.content ?? "";
    userPrompt = `Trader data:\n${context}\n\nTrader asks: ${lastMsg}\n\nAnswer directly using their data. Be specific. 2-5 sentences.`;
  }

  const messages: Anthropic.MessageParam[] = type === "chat"
    ? [
        ...chatMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content } as Anthropic.MessageParam)),
        { role: "user", content: userPrompt },
      ]
    : [{ role: "user", content: userPrompt }];

  // Streaming response for chat
  if (stream) {
    const anthropicStream = client.messages.stream({
      model,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of anthropicStream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          logger.error("AI Coach stream error", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  }

  // Non-streaming (daily / weekly)
  const response = await client.messages.create({
    model,
    max_tokens: type === "weekly" ? 600 : 300,
    system: SYSTEM_PROMPT,
    messages,
  });

  const message = response.content?.[0]?.type === "text" ? (response.content[0] as { type: "text"; text: string }).text : "";
  return Response.json({ message });
}