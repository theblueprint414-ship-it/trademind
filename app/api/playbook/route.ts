import { db } from "@/lib/db";
import { requirePlan, requireAuth } from "@/lib/planGuard";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  // Auth required but plan check is soft — returns empty rules for non-premium
  // so the check-in screen silently skips the playbook step
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { plan: true } });
  if (user?.plan !== "premium") {
    return Response.json({ rules: [], premium: false });
  }

  const playbook = await db.playbook.findUnique({ where: { userId: auth.userId } });
  const rules = playbook ? JSON.parse(playbook.rules) : [];
  return Response.json({ rules, premium: true });
}

export async function PUT(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["premium"]);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.rules)) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  if (body.rules.length > 50) {
    return Response.json({ error: "Max 50 rules" }, { status: 400 });
  }

  const VALID_CATEGORIES = ["Entry", "Exit", "Risk", "Mindset"];

  const rules = body.rules.map((r: { id?: string; text?: string; category?: string; enabled?: boolean }) => ({
    id: typeof r.id === "string" && r.id.length < 100 ? r.id : crypto.randomUUID(),
    text: String(r.text ?? "").slice(0, 300).trim(),
    category: VALID_CATEGORIES.includes(r.category ?? "") ? r.category : "Mindset",
    enabled: r.enabled !== false,
  })).filter((r: { text: string }) => r.text.length > 0);

  await db.playbook.upsert({
    where: { userId: guard.userId },
    update: { rules: JSON.stringify(rules) },
    create: { userId: guard.userId, rules: JSON.stringify(rules) },
  });

  return Response.json({ ok: true, rules });
}