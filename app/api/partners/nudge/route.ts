export const runtime = "nodejs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId } = await req.json();
  if (!partnerId) return NextResponse.json({ error: "partnerId required" }, { status: 400 });

  try {
    const partnership = await db.partnership.findFirst({
      where: {
        status: "active",
        OR: [
          { userAId: session.user.id, userBId: partnerId },
          { userAId: partnerId, userBId: session.user.id },
        ],
      },
    });
    if (!partnership) return NextResponse.json({ error: "Not partners" }, { status: 403 });

    const [sender, partner] = await Promise.all([
      db.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } }),
      db.user.findUnique({ where: { id: partnerId }, select: { name: true, email: true, emailReminders: true } }),
    ]);

    if (!partner?.email) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

    const senderName = sender?.name ?? sender?.email ?? "Your trading partner";
    const partnerName = partner.name ?? "Trader";
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    await resend.emails.send({
      from: "TradeMind <noreply@trademindedge.com>",
      to: partner.email,
      subject: `${senderName} is waiting for your check-in`,
      html: `
        <div style="font-family:Inter,sans-serif;background:#070B14;color:#E8F0FF;max-width:480px;margin:0 auto;padding:40px 32px;border-radius:16px;">
          <img src="https://trademindedge.com/logo.svg" alt="TradeMind" style="height:22px;margin-bottom:32px;" />
          <h2 style="font-size:22px;font-weight:700;margin-bottom:12px;color:#E8F0FF;">Hey ${partnerName} 👋</h2>
          <p style="font-size:15px;color:#7A8BA8;line-height:1.7;margin-bottom:20px;">
            <strong style="color:#E8F0FF;">${senderName}</strong> noticed you haven't checked in yet today (${today}).
          </p>
          <p style="font-size:15px;color:#7A8BA8;line-height:1.7;margin-bottom:32px;">
            60 seconds. Rate your mental state. Know your verdict before you open your charts.
          </p>
          <a href="https://trademindedge.com/checkin" style="display:inline-block;background:#4F8EF7;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Do my check-in →
          </a>
          <p style="font-size:12px;color:#3D4F6A;margin-top:32px;">
            You're getting this because ${senderName} sent you a nudge through TradeMind.
            <a href="https://trademindedge.com/unsubscribe" style="color:#3D4F6A;">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Partners nudge POST failed", err, { userId: session.user.id, partnerId });
    return NextResponse.json({ error: "Failed to send nudge" }, { status: 500 });
  }
}