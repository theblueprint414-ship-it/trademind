import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const invite = await db.partnerInvite.findUnique({
      where: { token },
      include: { from: { select: { name: true, email: true } } },
    });
    if (!invite) return Response.json({ error: "Invite not found" }, { status: 404 });
    if (invite.status !== "pending") return Response.json({ error: "Invite already used" }, { status: 410 });
    return Response.json({
      token: invite.token,
      fromName: invite.from.name ?? invite.from.email,
      fromEmail: invite.from.email,
      toEmail: invite.toEmail,
    });
  } catch (err) {
    logger.error("Partner invite GET failed", err, { token });
    return Response.json({ error: "Failed to fetch invite" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });
  const { action } = body;
  if (action !== "accept" && action !== "decline") {
    return Response.json({ error: "action must be 'accept' or 'decline'" }, { status: 400 });
  }

  try {
    const invite = await db.partnerInvite.findUnique({ where: { token } });
    if (!invite) return Response.json({ error: "Invite not found" }, { status: 404 });
    if (invite.status !== "pending") return Response.json({ error: "Invite already used" }, { status: 410 });
    if (invite.toEmail && invite.toEmail !== session.user.email) {
      return Response.json({ error: "This invite is not for your account" }, { status: 403 });
    }
    if (invite.fromId === session.user.id) {
      return Response.json({ error: "You can't accept your own invite" }, { status: 400 });
    }
    const acceptingUser = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
    if (!acceptingUser || (acceptingUser.plan !== "pro" && acceptingUser.plan !== "premium")) {
      return Response.json({ error: "pro_required" }, { status: 402 });
    }
    await db.partnerInvite.update({
      where: { token },
      data: { status: action === "accept" ? "accepted" : "declined" },
    });
    if (action === "accept") {
      const [a, b] = [invite.fromId, session.user.id].sort();
      await db.partnership.upsert({
        where: { userAId_userBId: { userAId: a, userBId: b } },
        update: { status: "active" },
        create: { userAId: a, userBId: b, status: "active" },
      });
    }
    return Response.json({ ok: true, action });
  } catch (err) {
    logger.error("Partner invite PATCH failed", err, { userId: session.user.id, token });
    return Response.json({ error: "Failed to process invite" }, { status: 500 });
  }
}