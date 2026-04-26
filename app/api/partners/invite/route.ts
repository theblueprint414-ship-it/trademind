import { auth } from "@/auth";
import { db } from "@/lib/db";
import { requirePlan } from "@/lib/planGuard";

// POST /api/partners/invite — generate a WhatsApp invite link (no email required)
export async function POST(request: Request) {
  const guard = await requirePlan(["pro", "premium"]);
  if (!guard.ok) return guard.response;

  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const email: string = body?.email ?? "";

  if (email && session.user.email === email) {
    return Response.json({ error: "You can't invite yourself" }, { status: 400 });
  }

  const invite = await db.partnerInvite.create({
    data: { fromId: guard.userId, toEmail: email },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trademindedge.com";
  const acceptUrl = `${appUrl}/accept-invite/${invite.token}`;

  return Response.json({ ok: true, token: invite.token, acceptUrl });
}

// GET /api/partners/invite — list pending invites sent to current user's email
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await db.partnerInvite.findMany({
    where: { toEmail: session.user.email, status: "pending" },
    include: { from: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    invites: invites.map((inv) => ({
      token: inv.token,
      fromName: inv.from.name ?? inv.from.email,
      fromEmail: inv.from.email,
      createdAt: inv.createdAt,
    })),
  });
}