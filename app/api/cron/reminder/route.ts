export const runtime = "nodejs";

import { db } from "@/lib/db";
import { Resend } from "resend";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";
import { sendPushToUser } from "@/lib/push";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

function makeUnsubscribeToken(email: string) {
  return createHmac("sha256", process.env.CRON_SECRET ?? "")
    .update(email)
    .digest("hex");
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const users = await db.user.findMany({
    where: {
      checkins: { none: { date: todayStr } },
    },
    select: { id: true, email: true, name: true, emailReminders: true,
      checkins: { orderBy: { date: "desc" }, take: 1, select: { score: true } },
    },
  });

  if (users.length === 0) return Response.json({ sent: 0 });

  let sent = 0;
  for (const user of users) {
    const token = makeUnsubscribeToken(user.email);
    const unsubUrl = `https://trademindedge.com/unsubscribe?email=${encodeURIComponent(user.email)}&token=${token}`;
    const firstName = user.name?.split(" ")[0] ?? "";
    const lastScore = user.checkins[0]?.score ?? null;

    // Push notification (for all users with subscriptions, regardless of email pref)
    let pushBody = "Morning. Your mental edge check-in is ready.";
    if (lastScore !== null) {
      if (lastScore >= 70) pushBody = `Yesterday: ${lastScore} — GO. Let's see where today lands.`;
      else if (lastScore >= 45) pushBody = `Yesterday: ${lastScore} — CAUTION. Check yourself before you trade.`;
      else pushBody = `Yesterday was NO-TRADE (${lastScore}). Take 60 seconds before you open the market.`;
    }
    await sendPushToUser(user.id, { title: "TradeMind — Daily Check-in", body: pushBody, url: "/checkin" }).catch(() => {});

    if (!user.emailReminders) continue;

    try {
      await resend.emails.send({
        from: "TradeMind <noreply@trademindedge.com>",
        to: user.email,
        subject: "🧠 Did you do your check-in today?",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070B14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://trademindedge.com/logo.svg" alt="TradeMind" height="28" style="display:block;margin:0 auto 24px;">
      <div style="font-size:48px;margin-bottom:16px;">🧠</div>
      <h1 style="color:#E8F0FF;font-size:28px;font-weight:700;margin:0 0 12px;">Markets are open.</h1>
      <p style="color:#7A8BA8;font-size:15px;line-height:1.7;margin:0;">
        ${firstName ? `Hey ${firstName}, you` : "You"} haven't done your daily mental check-in yet.<br>
        5 questions. 60 seconds. Know if you're ready to trade.
      </p>
    </div>

    <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:24px;margin-bottom:24px;">
      <div style="display:flex;gap:12px;margin-bottom:16px;">
        <div style="flex:1;background:#131C2E;border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:20px;font-weight:700;color:#00E87A;margin-bottom:4px;">GO</div>
          <div style="font-size:10px;color:#3D4F6A;letter-spacing:0.06em;">SCORE 70+</div>
        </div>
        <div style="flex:1;background:#131C2E;border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:20px;font-weight:700;color:#FFB020;margin-bottom:4px;">CAUTION</div>
          <div style="font-size:10px;color:#3D4F6A;letter-spacing:0.06em;">SCORE 45–69</div>
        </div>
        <div style="flex:1;background:#131C2E;border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:20px;font-weight:700;color:#FF3B5C;margin-bottom:4px;">NO-TRADE</div>
          <div style="font-size:10px;color:#3D4F6A;letter-spacing:0.06em;">SCORE &lt;45</div>
        </div>
      </div>
      <p style="color:#7A8BA8;font-size:13px;line-height:1.6;margin:0;text-align:center;">
        Traders who skip their mental check consistently report more emotional mistakes and larger losses.
      </p>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://trademindedge.com/checkin" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:16px 40px;font-size:16px;font-weight:600;box-shadow:0 4px 16px rgba(79,142,247,0.3);">
        Start Check-in →
      </a>
    </div>

    <p style="color:#3D4F6A;font-size:11px;text-align:center;line-height:1.7;">
      You're receiving this because you're a TradeMind user with reminders enabled.<br>
      TradeMind · 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801, United States<br>
      <a href="${unsubUrl}" style="color:#4F8EF7;text-decoration:none;">Unsubscribe from reminders</a> · <a href="https://trademindedge.com/privacy" style="color:#3D4F6A;text-decoration:none;">Privacy Policy</a>
    </p>

  </div>
</body>
</html>`.trim(),
      });
      sent++;
    } catch (err) {
      console.error(`Reminder email failed for ${user.email}:`, err);
    }
  }

  return Response.json({ sent, total: users.length });
}