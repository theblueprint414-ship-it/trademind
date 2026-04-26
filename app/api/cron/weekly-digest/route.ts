export const runtime = "nodejs";

import { db } from "@/lib/db";
import { Resend } from "resend";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

function makeUnsubscribeToken(email: string) {
  return createHmac("sha256", process.env.CRON_SECRET ?? "").update(email).digest("hex");
}

function verdictLabel(score: number) {
  if (score >= 70) return "GO";
  if (score >= 45) return "CAUTION";
  return "NO-TRADE";
}

function verdictColor(score: number) {
  if (score >= 70) return "#00E87A";
  if (score >= 45) return "#FFB020";
  return "#FF3B5C";
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - 6);
  const mondayStr = monday.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const prevMonday = new Date(monday);
  prevMonday.setDate(prevMonday.getDate() - 7);
  const prevMondayStr = prevMonday.toISOString().split("T")[0];
  const prevSunday = new Date(monday);
  prevSunday.setDate(prevSunday.getDate() - 1);
  const prevSundayStr = prevSunday.toISOString().split("T")[0];

  const users = await db.user.findMany({
    where: { emailReminders: true },
    select: {
      id: true,
      email: true,
      name: true,
      checkins: {
        where: { date: { gte: prevMondayStr, lte: todayStr } },
        select: { score: true, date: true },
        orderBy: { date: "asc" },
      },
    },
  });

  // Bulk-load streak data for all users in one query instead of N+1
  const allUserIds = users.map((u) => u.id);
  const streakRows = await db.checkin.findMany({
    where: { userId: { in: allUserIds }, date: { gte: (() => { const d = new Date(); d.setDate(d.getDate() - 60); return d.toISOString().split("T")[0]; })() } },
    select: { userId: true, date: true },
    orderBy: { date: "desc" },
  });
  const streakByUser = new Map<string, string[]>();
  for (const row of streakRows) {
    if (!streakByUser.has(row.userId)) streakByUser.set(row.userId, []);
    streakByUser.get(row.userId)!.push(row.date);
  }

  const now = new Date();
  let sent = 0;
  for (const user of users) {
    const allCheckins = user.checkins;
    const checkins = allCheckins.filter((c) => c.date >= mondayStr);
    const prevCheckins = allCheckins.filter((c) => c.date >= prevMondayStr && c.date <= prevSundayStr);
    if (checkins.length === 0) continue;

    const go = checkins.filter((c) => c.score >= 70).length;
    const caution = checkins.filter((c) => c.score >= 45 && c.score < 70).length;
    const noTrade = checkins.filter((c) => c.score < 45).length;
    const avg = Math.round(checkins.reduce((s, c) => s + c.score, 0) / checkins.length);
    const avgColor = verdictColor(avg);

    const prevAvg = prevCheckins.length > 0
      ? Math.round(prevCheckins.reduce((s, c) => s + c.score, 0) / prevCheckins.length)
      : null;
    const avgDelta = prevAvg !== null ? avg - prevAvg : null;

    const bestDay = checkins.length > 0
      ? checkins.reduce((b, c) => c.score > b.score ? c : b)
      : null;
    const worstDay = checkins.length > 0
      ? checkins.reduce((w, c) => c.score < w.score ? c : w)
      : null;

    // Streak calc from pre-loaded data
    let streak = 0;
    const userDates = streakByUser.get(user.id) ?? [];
    for (let i = 0; i < userDates.length; i++) {
      const diff = Math.round((now.getTime() - new Date(userDates[i] + "T12:00:00").getTime()) / 86400000);
      if (diff === i) streak++; else break;
    }

    const firstName = user.name?.split(" ")[0] ?? "";
    const token = makeUnsubscribeToken(user.email);
    const unsubUrl = `https://trademindedge.com/unsubscribe?email=${encodeURIComponent(user.email)}&token=${token}`;

    const dayBars = checkins.map((c) => {
      const day = new Date(c.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
      const color = verdictColor(c.score);
      const h = Math.max(Math.round((c.score / 100) * 48), 4);
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
        <div style="width:100%;max-width:28px;height:${h}px;background:${color};border-radius:3px;opacity:0.85;"></div>
        <div style="font-size:9px;color:#3D4F6A;text-transform:uppercase;">${day}</div>
        <div style="font-size:10px;font-weight:700;color:${color};">${verdictLabel(c.score).slice(0, 2)}</div>
      </div>`;
    }).join("");

    try {
      await resend.emails.send({
        from: "TradeMind <noreply@trademindedge.com>",
        to: user.email,
        subject: `Your week in review — avg score ${avg}/100`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070B14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 24px;">

  <img src="https://trademindedge.com/logo.svg" alt="TradeMind" height="26" style="display:block;margin:0 auto 32px;">

  <h1 style="color:#E8F0FF;font-size:22px;font-weight:700;text-align:center;margin:0 0 6px;">
    ${firstName ? `${firstName}'s` : "Your"} week in review
  </h1>
  <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 32px;">
    ${mondayStr} – ${todayStr}
  </p>

  <!-- Avg score -->
  <div style="text-align:center;margin-bottom:${avgDelta !== null ? "12px" : "32px"};">
    <div style="font-size:64px;font-weight:800;color:${avgColor};line-height:1;margin-bottom:4px;">${avg}</div>
    <div style="font-size:12px;color:#3D4F6A;letter-spacing:0.1em;">AVERAGE MENTAL SCORE</div>
  </div>
  ${avgDelta !== null ? `<div style="text-align:center;margin-bottom:32px;font-size:13px;font-weight:700;color:${avgDelta >= 0 ? "#00E87A" : "#FF3B5C"};">
    ${avgDelta >= 0 ? "▲" : "▼"} ${Math.abs(avgDelta)} pts vs last week
  </div>` : ""}

  <!-- Bar chart -->
  <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:20px;margin-bottom:20px;">
    <div style="font-size:10px;color:#3D4F6A;letter-spacing:0.08em;margin-bottom:16px;">THIS WEEK</div>
    <div style="display:flex;align-items:flex-end;gap:6px;height:60px;">${dayBars}</div>
  </div>

  <!-- Verdict breakdown -->
  <div style="display:flex;gap:10px;margin-bottom:28px;">
    <div style="flex:1;background:#0D1420;border:1px solid #00E87A30;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#00E87A;line-height:1;">${go}</div>
      <div style="font-size:9px;color:#3D4F6A;letter-spacing:0.08em;margin-top:4px;">GO DAYS</div>
    </div>
    <div style="flex:1;background:#0D1420;border:1px solid #FFB02030;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#FFB020;line-height:1;">${caution}</div>
      <div style="font-size:9px;color:#3D4F6A;letter-spacing:0.08em;margin-top:4px;">CAUTION</div>
    </div>
    <div style="flex:1;background:#0D1420;border:1px solid #FF3B5C30;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#FF3B5C;line-height:1;">${noTrade}</div>
      <div style="font-size:9px;color:#3D4F6A;letter-spacing:0.08em;margin-top:4px;">NO-TRADE</div>
    </div>
  </div>

  <!-- Best / Worst day insight -->
  ${bestDay && worstDay && bestDay.date !== worstDay.date ? `<div style="background:#0D1420;border:1px solid #1E2D45;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
    <div style="font-size:10px;color:#3D4F6A;letter-spacing:0.08em;margin-bottom:12px;">THIS WEEK'S RANGE</div>
    <div style="display:flex;gap:12px;">
      <div style="flex:1;text-align:center;">
        <div style="font-size:11px;color:#00E87A;font-weight:700;letter-spacing:0.06em;margin-bottom:4px;">PEAK DAY</div>
        <div style="font-size:22px;font-weight:800;color:#00E87A;">${bestDay.score}</div>
        <div style="font-size:10px;color:#3D4F6A;">${new Date(bestDay.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}</div>
      </div>
      <div style="width:1px;background:#1E2D45;"></div>
      <div style="flex:1;text-align:center;">
        <div style="font-size:11px;color:#FF3B5C;font-weight:700;letter-spacing:0.06em;margin-bottom:4px;">LOWEST DAY</div>
        <div style="font-size:22px;font-weight:800;color:#FF3B5C;">${worstDay.score}</div>
        <div style="font-size:10px;color:#3D4F6A;">${new Date(worstDay.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}</div>
      </div>
    </div>
  </div>` : ""}

  ${streak >= 3 ? `<div style="background:#0D1420;border:1px solid #FFB02030;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px;">
    <div style="font-size:32px;line-height:1;">🔥</div>
    <div>
      <div style="font-size:14px;font-weight:700;color:#FFB020;margin-bottom:2px;">${streak}-day streak</div>
      <div style="font-size:12px;color:#7A8BA8;line-height:1.5;">Consistency is the edge most traders can't build. You're building it.</div>
    </div>
  </div>` : ""}

  <div style="text-align:center;margin-bottom:32px;">
    <a href="https://trademindedge.com/analytics" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:600;">
      View Full Analytics →
    </a>
  </div>

  <p style="color:#3D4F6A;font-size:11px;text-align:center;line-height:1.7;">
    You're receiving this because you're a TradeMind user with weekly digests enabled.<br>
    TradeMind · 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801, United States<br>
    <a href="${unsubUrl}" style="color:#4F8EF7;text-decoration:none;">Unsubscribe from weekly emails</a> · <a href="https://trademindedge.com/privacy" style="color:#3D4F6A;text-decoration:none;">Privacy Policy</a>
  </p>

</div>
</body>
</html>`.trim(),
      });
      sent++;
    } catch {
      // continue
    }
  }

  return Response.json({ sent, total: users.length });
}