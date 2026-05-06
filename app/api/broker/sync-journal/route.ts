import { requirePlan } from "@/lib/planGuard";
import { syncJournalForUser } from "@/lib/syncJournal";
import { rateLimit } from "@/lib/ratelimit";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, "normal");
  if (!rl.ok) return rl.response!;

  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  const result = await syncJournalForUser(guard.userId, { force });

  if (result === null) {
    return Response.json({ error: "Could not reach broker" }, { status: 502 });
  }

  return Response.json({ ok: true, ...result });
}