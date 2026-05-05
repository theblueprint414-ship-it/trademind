import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { NextResponse } from "next/server";

// GET /api/circuit-breaker/override — authenticated, returns last 30 days of overrides
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const overrides = await db.circuitBreakerOverride.findMany({
    where: { userId: session.user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: { id: true, source: true, reason: true, createdAt: true },
  });

  return NextResponse.json({ overrides });
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

// POST /api/circuit-breaker/override?token=<extensionToken>
// Called by Chrome extension when user confirms Emergency Override.
// Also callable from dashboard (authenticated) without token.
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  let userId: string;

  if (token) {
    const cb = await db.circuitBreaker.findUnique({
      where: { extensionToken: token },
      select: { userId: true },
    });
    if (!cb) return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS });
    userId = cb.userId;
  } else {
    // Authenticated dashboard call
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
    userId = session.user.id;
  }

  let reason: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.reason === "string" && body.reason.trim()) reason = body.reason.trim().slice(0, 280);
  } catch { /* optional */ }

  const override = await db.circuitBreakerOverride.create({
    data: { userId, source: token ? "extension" : "dashboard", reason: reason ?? null },
  });

  // Notify accountability partners (fire-and-forget)
  notifyPartners(userId).catch(() => {});

  return NextResponse.json({ ok: true, id: override.id, createdAt: override.createdAt }, { headers: CORS });
}

async function notifyPartners(userId: string) {
  const partnerships = await db.partnership.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }], status: "active" },
    select: { userAId: true, userBId: true },
  });
  const partnerIds = partnerships.map((p) => p.userAId === userId ? p.userBId : p.userAId);
  await Promise.allSettled(
    partnerIds.map((pid) =>
      sendPushToUser(pid, {
        title: "TradeMind — Partner Override",
        body: "Your accountability partner triggered an Emergency Override on their circuit breaker.",
        url: "/partners",
      })
    )
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}