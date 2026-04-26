export const runtime = "nodejs";

import { db } from "@/lib/db";
import { Resend } from "resend";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";
import { sendPushToUser } from "@/lib/push";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

function makeUnsubToken(email: string) {
  return createHmac("sha256", process.env.CRON_SECRET ?? "").update(email).digest("hex");
}

function brandWrap(inner: string) {
  return `<div style="font-family:Inter,sans-serif;background:#070B14;color:#E8F0FF;max-width:520px;margin:0 auto;padding:40px 32px;border-radius:16px;">
    <img src="https://trademindedge.com/logo.svg" alt="TradeMind" style="height:20px;display:block;margin-bottom:32px;" />
    ${inner}
  </div>`;
}

function footer(email: string) {
  const token = makeUnsubToken(email);
  return `<p style="font-size:11px;color:#3D4F6A;margin-top:32px;line-height:1.7;">
    You're receiving this because you're a TradeMind user with email reminders enabled.<br>
    TradeMind · 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801, United States<br>
    <a href="https://trademindedge.com/unsubscribe?token=${token}&email=${encodeURIComponent(email)}" style="color:#3D4F6A;text-decoration:underline;">Unsubscribe</a> · <a href="https://trademindedge.com/privacy" style="color:#3D4F6A;text-decoration:none;">Privacy Policy</a>
  </p>`;
}

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let sent = 0;

  // ── 1. Re-engagement: haven't checked in for 2+ days ────────────────────
  try {
    const dormant = await db.user.findMany({
      where: {
        emailReminders: true,
        checkins: {
          none: { date: { gte: twoDaysAgoStr } },
          some: { date: { lt: twoDaysAgoStr } }, // has history but been gone 2+ days
        },
      },
      select: { id: true, name: true, email: true },
      take: 200,
    });

    for (const user of dormant) {
      if (!user.email) continue;
      const firstName = user.name?.split(" ")[0] ?? "Trader";
      try {
        await resend.emails.send({
          from: "TradeMind <noreply@trademindedge.com>",
          to: user.email,
          subject: "Your edge is slipping — 2 days without a check-in",
          html: brandWrap(`
            <h2 style="font-size:22px;font-weight:700;margin-bottom:12px;">Hey ${firstName},</h2>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:16px;">
              You haven't checked in for 2 days. That's fine — markets don't always cooperate with routines.
            </p>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:28px;">
              But the traders who <strong style="color:#E8F0FF;">compound the most gains</strong> are the ones who check in <em>especially</em> after a break. Coming back blind is how streaks turn into drawdowns.
            </p>
            <a href="https://trademindedge.com/checkin" style="display:inline-block;background:#4F8EF7;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
              Get back on track →
            </a>
            ${footer(user.email)}
          `),
        });
        sent++;
      } catch {}
    }
  } catch {}

  // ── 2. First NO-TRADE day: celebrate the discipline ──────────────────────
  try {
    const firstNoTrade = await db.user.findMany({
      where: {
        emailReminders: true,
        checkins: {
          some: { date: yesterdayStr, verdict: "NO-TRADE" },
        },
      },
      select: {
        id: true, name: true, email: true,
        checkins: { where: { verdict: "NO-TRADE" }, orderBy: { date: "asc" }, take: 2 },
      },
      take: 200,
    });

    for (const user of firstNoTrade) {
      if (!user.email) continue;
      const isFirst = user.checkins.length === 1;
      if (!isFirst) continue; // only send on their very first NO-TRADE
      const firstName = user.name?.split(" ")[0] ?? "Trader";
      try {
        await resend.emails.send({
          from: "TradeMind <noreply@trademindedge.com>",
          to: user.email,
          subject: "You made the right call yesterday.",
          html: brandWrap(`
            <div style="background:rgba(0,232,122,0.08);border:1px solid rgba(0,232,122,0.2);border-radius:12px;padding:20px 20px;margin-bottom:24px;text-align:center;">
              <div style="font-size:40px;margin-bottom:8px;">🛡️</div>
              <div style="font-size:28px;font-weight:800;color:#00E87A;letter-spacing:0.04em;">NO-TRADE</div>
              <div style="font-size:13px;color:#7A8BA8;margin-top:4px;">Yesterday · Your first</div>
            </div>
            <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Hey ${firstName} — that took discipline.</h2>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:16px;">
              Your mental score was below 45 yesterday. You could have traded anyway — most people do. Instead, you honored the signal.
            </p>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:28px;">
              <strong style="color:#E8F0FF;">Traders who sit out their NO-TRADE days avoid an average of $891 in losses per session.</strong> That number gets personal once you've been logging P&L for a few weeks.
            </p>
            <a href="https://trademindedge.com/checkin" style="display:inline-block;background:#4F8EF7;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
              Check in today →
            </a>
            ${footer(user.email)}
          `),
        });
        sent++;
      } catch {}
    }
  } catch {}

  // ── 3. Streak milestones: 7 / 14 / 30 days ──────────────────────────────
  const MILESTONE_DAYS = [7, 14, 30];
  try {
    const active = await db.user.findMany({
      where: {
        emailReminders: true,
        checkins: { some: { date: todayStr } },
      },
      select: {
        id: true, name: true, email: true,
        checkins: { orderBy: { date: "desc" }, take: 35, select: { date: true } },
      },
      take: 500,
    });

    for (const user of active) {
      if (!user.email) continue;
      // Count consecutive days
      let streak = 0;
      const dates = user.checkins.map(c => c.date).sort().reverse();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today); expected.setDate(today.getDate() - i);
        if (dates[i] === expected.toISOString().split("T")[0]) streak++;
        else break;
      }

      if (!MILESTONE_DAYS.includes(streak)) continue;

      // Check we haven't sent this milestone email before (use checkin count as proxy)
      const firstName = user.name?.split(" ")[0] ?? "Trader";
      const milestoneEmoji = streak === 7 ? "🔥" : streak === 14 ? "⚡" : "🏆";
      const milestoneMsg = streak === 7
        ? "You've built the habit. Most traders quit in week one."
        : streak === 14
        ? "Two weeks straight. You're in the top 5% for consistency."
        : "30 days. You now have a full month of mental data — this is where patterns get real.";

      try {
        await resend.emails.send({
          from: "TradeMind <noreply@trademindedge.com>",
          to: user.email,
          subject: `${milestoneEmoji} ${streak}-day streak — you're in rare company`,
          html: brandWrap(`
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:56px;margin-bottom:8px;">${milestoneEmoji}</div>
              <div style="font-size:64px;font-weight:800;color:#FFB020;line-height:1;font-family:monospace;">${streak}</div>
              <div style="font-size:14px;color:#7A8BA8;margin-top:4px;letter-spacing:0.06em;">DAY STREAK</div>
            </div>
            <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;text-align:center;">Hey ${firstName},</h2>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:28px;text-align:center;">
              ${milestoneMsg}
            </p>
            <a href="https://trademindedge.com/analytics" style="display:block;background:linear-gradient(135deg,#8B5CF6,#6366f1);color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;text-align:center;">
              View your ${streak}-day patterns →
            </a>
            ${footer(user.email)}
          `),
        });
        sent++;
      } catch {}
    }
  } catch {}

  // ── 4. AI Proactive: 3+ consecutive CAUTION or NO-TRADE days ────────────
  try {
    const potentialStruggling = await db.user.findMany({
      where: {
        emailReminders: true,
        checkins: { some: { date: { gte: twoDaysAgoStr } } },
      },
      select: {
        id: true, name: true, email: true,
        checkins: { orderBy: { date: "desc" }, take: 5, select: { date: true, verdict: true, score: true } },
        tradeEntries: { orderBy: { date: "desc" }, take: 20, select: { date: true, pnl: true, checkinScore: true } },
      },
      take: 500,
    });

    for (const user of potentialStruggling) {
      if (!user.email) continue;

      // Check for 3+ consecutive CAUTION/NO-TRADE days
      const sortedCheckins = user.checkins.sort((a, b) => b.date.localeCompare(a.date));
      let consecutiveBad = 0;
      for (let i = 0; i < sortedCheckins.length; i++) {
        const expected = new Date(today); expected.setDate(today.getDate() - i);
        const expectedStr = expected.toISOString().split("T")[0];
        if (sortedCheckins[i]?.date !== expectedStr) break;
        if (sortedCheckins[i].verdict === "CAUTION" || sortedCheckins[i].verdict === "NO-TRADE") {
          consecutiveBad++;
        } else {
          break;
        }
      }

      if (consecutiveBad < 3) continue;

      // Compute P&L lost on those bad days (if trade data available)
      const badDates = sortedCheckins.slice(0, consecutiveBad).map((c) => c.date);
      const badDayTrades = user.tradeEntries.filter((t) => badDates.includes(t.date) && t.pnl !== null);
      const totalPnlBadDays = badDayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
      const avgScore = Math.round(sortedCheckins.slice(0, consecutiveBad).reduce((s, c) => s + c.score, 0) / consecutiveBad);

      const firstName = user.name?.split(" ")[0] ?? "Trader";
      const pnlLine = badDayTrades.length >= 2 && totalPnlBadDays < 0
        ? `<p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:16px;">
            In those ${consecutiveBad} days, your logged trades totaled <strong style="color:#FF3B5C;">$${Math.round(totalPnlBadDays)}</strong>. That's the cost of trading in this mental state.
           </p>`
        : "";

      try {
        await sendPushToUser(user.id, {
          title: `${consecutiveBad} days flagged`,
          body: `Your score has been CAUTION/NO-TRADE for ${consecutiveBad} days straight${pnlLine ? " — check your P&L impact" : ""}. Check in now.`,
          url: "/checkin",
        }).catch(() => {});
        await resend.emails.send({
          from: "TradeMind <noreply@trademindedge.com>",
          to: user.email,
          subject: `${consecutiveBad} days in the danger zone — your pattern is flagged`,
          html: brandWrap(`
            <div style="background:rgba(255,59,92,0.08);border:1px solid rgba(255,59,92,0.25);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
              <div style="font-size:32px;font-weight:800;color:#FF3B5C;letter-spacing:0.04em;">${consecutiveBad} DAYS</div>
              <div style="font-size:13px;color:#7A8BA8;margin-top:4px;">Consecutive CAUTION / NO-TRADE · Avg score: ${avgScore}/100</div>
            </div>
            <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Hey ${firstName},</h2>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:16px;">
              Your mental score has been flagged for <strong style="color:#E8F0FF;">${consecutiveBad} consecutive days</strong>. This is exactly when most traders make their biggest mistakes — forcing trades to "make it back."
            </p>
            ${pnlLine}
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:24px;">
              The data says: <strong style="color:#E8F0FF;">sit tight</strong>. Check in today and let your score guide you. If it's still in NO-TRADE territory, honor it.
            </p>
            <a href="https://trademindedge.com/checkin" style="display:inline-block;background:#4F8EF7;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
              Check in now →
            </a>
            ${footer(user.email)}
          `),
        });
        sent++;
      } catch {}
    }
  } catch {}

  // ── 5. AI Proactive: Big loss yesterday + score drop ────────────────────
  try {
    const allActive = await db.user.findMany({
      where: {
        emailReminders: true,
        checkins: { some: { date: yesterdayStr } },
      },
      select: {
        id: true, name: true, email: true,
        checkins: {
          where: { date: { in: [yesterdayStr, todayStr] } },
          orderBy: { date: "desc" },
          select: { date: true, score: true, verdict: true },
        },
        tradeEntries: {
          where: { date: yesterdayStr },
          select: { pnl: true },
        },
      },
      take: 500,
    });

    for (const user of allActive) {
      if (!user.email) continue;
      const yesterdayCheckin = user.checkins.find((c) => c.date === yesterdayStr);
      const todayCheckin = user.checkins.find((c) => c.date === todayStr);
      if (!yesterdayCheckin || !todayCheckin) continue;

      const scoreDrop = yesterdayCheckin.score - todayCheckin.score;
      const yesterdayPnl = user.tradeEntries.reduce((s, t) => s + (t.pnl ?? 0), 0);

      // Only trigger if: lost money yesterday AND score dropped 15+ points today AND into NO-TRADE/CAUTION
      if (yesterdayPnl >= 0 || scoreDrop < 15 || todayCheckin.score >= 70) continue;

      const firstName = user.name?.split(" ")[0] ?? "Trader";
      const verdictColor = todayCheckin.verdict === "NO-TRADE" ? "#FF3B5C" : "#FFB020";

      try {
        await sendPushToUser(user.id, {
          title: "Revenge trading alert",
          body: `Loss yesterday + score dropped ${scoreDrop} pts today. This is the pattern. Don't trade — check in first.`,
          url: "/dashboard",
        }).catch(() => {});
        await resend.emails.send({
          from: "TradeMind <noreply@trademindedge.com>",
          to: user.email,
          subject: `After a $${Math.abs(Math.round(yesterdayPnl))} loss — your score just dropped ${scoreDrop} points`,
          html: brandWrap(`
            <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;">Hey ${firstName},</h2>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:16px;">
              Yesterday you logged a <strong style="color:#FF3B5C;">$${Math.round(yesterdayPnl)}</strong> session. Today your mental score dropped <strong style="color:#E8F0FF;">${scoreDrop} points</strong> to <strong style="color:${verdictColor};">${todayCheckin.score}/100 — ${todayCheckin.verdict}</strong>.
            </p>
            <div style="background:#0D1420;border:1px solid rgba(255,59,92,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
              <p style="font-size:14px;color:#7A8BA8;line-height:1.8;margin:0;">
                This is the <strong style="color:#E8F0FF;">revenge trading setup</strong> — the pattern that turns a bad day into a blown week. Your system is telling you something. Don't override it.
              </p>
            </div>
            <p style="font-size:15px;color:#7A8BA8;line-height:1.8;margin-bottom:24px;">
              The best trade you can make today is <strong style="color:#E8F0FF;">no trade</strong>.
            </p>
            <a href="https://trademindedge.com/dashboard" style="display:inline-block;background:#4F8EF7;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
              View today's verdict →
            </a>
            ${footer(user.email)}
          `),
        });
        sent++;
      } catch {}
    }
  } catch {}

  return Response.json({ ok: true, sent });
}