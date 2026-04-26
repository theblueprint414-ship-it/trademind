import { auth } from "@/auth";
import { db } from "@/lib/db";

export type Plan = "free" | "pro" | "premium";

type GuardSuccess = { ok: true; userId: string; plan: Plan };
type GuardFailure = { ok: false; response: Response };
type GuardResult = GuardSuccess | GuardFailure;

/**
 * Checks that the current session user has one of the allowed plans.
 * Returns { ok: true, userId, plan } on success, or { ok: false, response } to return immediately.
 *
 * Usage:
 *   const guard = await requirePlan(["pro", "premium"]);
 *   if (!guard.ok) return guard.response;
 */
export async function requirePlan(allowed: Plan[]): Promise<GuardResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const plan = (user?.plan ?? "free") as Plan;

  if (!allowed.includes(plan)) {
    // premium: true signals the UI to show the premium upsell (vs generic 403)
    const needsPremium = !allowed.includes("pro");
    return {
      ok: false,
      response: Response.json(
        { error: "Upgrade required", premium: needsPremium },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId: session.user.id, plan };
}

/**
 * Only checks auth (no plan requirement). Returns userId or a 401 response.
 */
export async function requireAuth(): Promise<{ ok: true; userId: string } | GuardFailure> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, userId: session.user.id };
}