export const runtime = "nodejs";

import { db } from "@/lib/db";
import { Resend } from "resend";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

function makeUnsubscribeToken(email: string) {
  return createHmac("sha256", process.env.CRON_SECRET ?? "").update(email).digest("hex");
}

function footer(email: string) {
  return `
  <p style="color:#3D4F6A;font-size:11px;text-align:center;line-height:1.7;margin-top:40px;">
    TradeMind · 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801, United States<br>
    <a href="https://trademindedge.com/unsubscribe?email=${encodeURIComponent(email)}&token=${makeUnsubscribeToken(email)}" style="color:#4F8EF7;text-decoration:none;">Unsubscribe</a> · <a href="https://trademindedge.com/privacy" style="color:#3D4F6A;text-decoration:none;">Privacy Policy</a>
  </p>`;
}

function wrap(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070B14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 24px;">
  <img src="https://trademindedge.com/logo.svg" alt="TradeMind" height="26" style="display:block;margin:0 auto 32px;">
  ${content}
</div>
</body>
</html>`.trim();
}

function computeStreak(dates: string[], yesterday: string): number {
  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  let expected = yesterday;
  for (const d of sorted) {
    if (d === expected) {
      streak++;
      const dt = new Date(expected + "T12:00:00Z");
      dt.setUTCDate(dt.getUTCDate() - 1);
      expected = dt.toISOString().split("T")[0];
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const dt = new Date(now.getTime() - 86400000);
  const yesterday = dt.toISOString().split("T")[0];

  // Find users who checked in yesterday but NOT today — their streak is at risk
  const atRiskUsers = await db.user.findMany({
    where: {
      emailReminders: true,
      checkins: {
        some: { date: yesterday },
        none: { date: today },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      checkins: { select: { date: true }, orderBy: { date: "desc" }, take: 60 },
    },
  });

  let sent = 0;

  for (const user of atRiskUsers) {
    const dates = user.checkins.map((c) => c.date);
    const streak = computeStreak(dates, yesterday);

    // Only nudge users with a real streak worth protecting (3+)
    if (streak < 3) continue;

    const firstName = user.name?.split(" ")[0] ?? "";
    const streakEmoji = streak >= 30 ? "👑" : streak >= 14 ? "🏆" : streak >= 7 ? "⚡" : "🔥";

    try {
      await resend.emails.send({
        from: "TradeMind <noreply@trademindedge.com>",
        to: user.email,
        subject: `${streakEmoji} ${firstName ? `${firstName}, your` : "Your"} ${streak}-day streak ends at midnight`,
        html: wrap(`
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:56px;margin-bottom:8px;">${streakEmoji}</div>
            <h1 style="color:#E8F0FF;font-size:24px;font-weight:700;margin:0 0 8px;">
              ${streak}-day streak at risk
            </h1>
            <p style="color:#3D4F6A;font-size:13px;margin:0;">
              ${firstName ? `${firstName}, you` : "You"} haven't checked in yet today.
            </p>
          </div>

          <div style="background:#0D1420;border:1px solid #FFB02030;border-radius:14px;padding:24px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
              <div style="flex:1;height:6px;background:#1E2D45;border-radius:3px;overflow:hidden;">
                <div style="height:100%;background:linear-gradient(90deg,#FFB020,#FF8C00);border-radius:3px;width:${Math.min(100, (streak / (streak + 1)) * 100)}%;"></div>
              </div>
              <div style="font-size:13px;font-weight:700;color:#FFB020;white-space:nowrap;">${streak} days</div>
            </div>
            <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0;">
              Your ${streak}-day check-in streak is one of the most valuable things you've built in TradeMind. <strong style="color:#E8F0FF;">It takes 60 seconds to protect it.</strong>
            </p>
          </div>

          <div style="text-align:center;margin-bottom:20px;">
            <a href="https://trademindedge.com/checkin" style="display:inline-block;background:linear-gradient(135deg,#FFB020,#FF8C00);color:#070B14;text-decoration:none;border-radius:10px;padding:14px 40px;font-size:15px;font-weight:700;">
              Keep My Streak →
            </a>
          </div>

          <p style="color:#3D4F6A;font-size:12px;text-align:center;line-height:1.7;margin:0;">
            60 seconds. That's all it takes. Your future self will thank you.
          </p>

          ${footer(user.email)}
        `),
      });
      sent++;
    } catch {
      // continue
    }
  }

  return Response.json({ sent, checked: atRiskUsers.length });
}