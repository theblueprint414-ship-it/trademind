export const runtime = "nodejs";

import { db } from "@/lib/db";
import { Resend } from "resend";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

function makeUnsubscribeToken(email: string) {
  return createHmac("sha256", process.env.CRON_SECRET ?? "").update(email).digest("hex");
}

function unsubUrl(email: string) {
  const token = makeUnsubscribeToken(email);
  return `https://trademindedge.com/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

function footer(email: string) {
  return `
  <p style="color:#3D4F6A;font-size:11px;text-align:center;line-height:1.7;margin-top:40px;">
    TradeMind · 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801, United States<br>
    <a href="${unsubUrl(email)}" style="color:#4F8EF7;text-decoration:none;">Unsubscribe from emails</a> · <a href="https://trademindedge.com/privacy" style="color:#3D4F6A;text-decoration:none;">Privacy Policy</a>
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

const EMAILS: Record<number, (firstName: string, email: string) => { subject: string; html: string }> = {
  1: (firstName, email) => ({
    subject: `Welcome to TradeMind${firstName ? `, ${firstName}` : ""} — your first check-in takes 60 seconds`,
    html: wrap(`
      <h1 style="color:#E8F0FF;font-size:24px;font-weight:700;text-align:center;margin:0 0 8px;">
        Welcome${firstName ? `, ${firstName}` : ""}
      </h1>
      <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 32px;">You made the right call.</p>

      <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:24px;margin-bottom:20px;">
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0 0 16px;">
          Most traders lose money not because of a bad strategy — but because of <strong style="color:#E8F0FF;">a bad mental state they didn't notice</strong>.
        </p>
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0;">
          TradeMind measures your mental readiness every morning with 5 questions. It takes 60 seconds. The data it builds over time is what changes your trading.
        </p>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://trademindedge.com/checkin" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:600;">
          Do Your First Check-in →
        </a>
      </div>

      <div style="display:flex;gap:12px;">
        ${["Sleep quality", "Emotional state", "Focus level", "Financial stress", "Recent performance"].map((q, i) => `
        <div style="flex:1;background:#0D1420;border:1px solid #1E2D45;border-radius:8px;padding:10px 6px;text-align:center;">
          <div style="font-size:16px;font-weight:800;color:#4F8EF7;line-height:1;margin-bottom:4px;">Q${i + 1}</div>
          <div style="font-size:9px;color:#3D4F6A;line-height:1.4;">${q}</div>
        </div>`).join("")}
      </div>

      ${footer(email)}
    `),
  }),

  2: (firstName, email) => ({
    subject: "What does your TradeMind score actually mean?",
    html: wrap(`
      <h1 style="color:#E8F0FF;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">
        Your score. Decoded.
      </h1>
      <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 32px;">
        ${firstName ? `${firstName}, here` : "Here"}'s what GO, CAUTION, and NO-TRADE actually mean for your trading day.
      </p>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px;">
        <div style="background:#0D1420;border:1px solid #00E87A30;border-radius:12px;padding:18px 20px;display:flex;align-items:center;gap:16px;">
          <div style="font-size:22px;font-weight:800;color:#00E87A;min-width:60px;">GO</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#E8F0FF;margin-bottom:4px;">Score 70–100 · Trade your full plan</div>
            <div style="font-size:12px;color:#7A8BA8;line-height:1.6;">Your mental state is dialed in. Follow your rules, trade your setups, trust your edge.</div>
          </div>
        </div>
        <div style="background:#0D1420;border:1px solid #FFB02030;border-radius:12px;padding:18px 20px;display:flex;align-items:center;gap:16px;">
          <div style="font-size:22px;font-weight:800;color:#FFB020;min-width:60px;">CAU&shy;TION</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#E8F0FF;margin-bottom:4px;">Score 45–69 · Trade smaller, no revenge</div>
            <div style="font-size:12px;color:#7A8BA8;line-height:1.6;">You can trade, but reduce position size. Stick to A+ setups only. Skip marginal plays.</div>
          </div>
        </div>
        <div style="background:#0D1420;border:1px solid #FF3B5C30;border-radius:12px;padding:18px 20px;display:flex;align-items:center;gap:16px;">
          <div style="font-size:22px;font-weight:800;color:#FF3B5C;min-width:60px;">NO&shy;TRADE</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#E8F0FF;margin-bottom:4px;">Score 0–44 · Sit on your hands</div>
            <div style="font-size:12px;color:#7A8BA8;line-height:1.6;">The market will be there tomorrow. Your account might not be if you trade today. This is protecting capital, not weakness.</div>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://trademindedge.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:600;">
          Check In Today →
        </a>
      </div>

      ${footer(email)}
    `),
  }),

  3: (firstName, email) => ({
    subject: "The feature that separates profitable traders from the rest",
    html: wrap(`
      <h1 style="color:#E8F0FF;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">
        Your Trade Journal
      </h1>
      <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 28px;">
        ${firstName ? `${firstName}, most` : "Most"} traders know journaling matters. Almost none do it consistently.
      </p>

      <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:24px;margin-bottom:20px;">
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0 0 16px;">
          TradeMind's journal links <strong style="color:#E8F0FF;">every trade to your mental score that day</strong>. After 30 trades, you'll see a pattern no other journal can show you:
        </p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            ["Your win rate on GO days vs NO-TRADE days", "#00E87A"],
            ["Which emotions correlate with your best setups", "#4F8EF7"],
            ["Your biggest losses — and what your score was that morning", "#FF3B5C"],
          ].map(([text, color]) => `
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;"></div>
            <div style="font-size:13px;color:#7A8BA8;">${text}</div>
          </div>`).join("")}
        </div>
      </div>

      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://trademindedge.com/journal" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:600;">
          Log Your First Trade →
        </a>
      </div>

      ${footer(email)}
    `),
  }),

  5: (firstName, email) => ({
    subject: "Your mental patterns are starting to show",
    html: wrap(`
      <h1 style="color:#E8F0FF;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">
        Day 5 — patterns are forming
      </h1>
      <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 28px;">
        ${firstName ? `${firstName}, you` : "You"}'ve been check-ing in for 5 days. Here's what unlocks next.
      </p>

      <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:24px;margin-bottom:16px;">
        <div style="font-size:11px;color:#3D4F6A;letter-spacing:0.08em;margin-bottom:16px;">ANALYTICS DASHBOARD</div>
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0 0 12px;">
          After 7 days your analytics unlock a <strong style="color:#E8F0FF;">Psychology vs P&L chart</strong> — a direct line between your mental state and your profit.
        </p>
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0;">
          Most traders who see it for the first time say it's the most honest thing they've ever seen about their trading.
        </p>
      </div>

      <div style="background:#0D1420;border:1px solid #8B5CF630;border-radius:14px;padding:24px;margin-bottom:20px;">
        <div style="font-size:11px;color:#8B5CF6;letter-spacing:0.08em;margin-bottom:12px;">AI COACH · ALEX</div>
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0;">
          Alex, your AI trading psychologist, analyzes your specific patterns and gives you one precise action per session — not generic advice. <strong style="color:#E8F0FF;">Try it free while you're in your trial.</strong>
        </p>
      </div>

      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://trademindedge.com/analytics" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:600;">
          View Your Analytics →
        </a>
      </div>

      ${footer(email)}
    `),
  }),

  7: (firstName, email) => ({
    subject: `${firstName ? `${firstName}, your` : "Your"} 7-day trial ends tomorrow — here's what you've built`,
    html: wrap(`
      <h1 style="color:#E8F0FF;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">
        Your trial ends tomorrow
      </h1>
      <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 32px;">
        ${firstName ? `${firstName}, you` : "You"}'ve been building something most traders never build: data on yourself.
      </p>

      <div style="background:#0D1420;border:1px solid #00E87A30;border-radius:14px;padding:24px;margin-bottom:20px;">
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0 0 16px;">
          Every check-in you've done is a data point. Every trade you've logged has a mental score attached to it. <strong style="color:#E8F0FF;">This is a dataset about your specific edge — no one else has it.</strong>
        </p>
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0;">
          Cancel now and you lose access to all of it. Keep going and in 30 days you'll know exactly when to push and when to sit out.
        </p>
      </div>

      <div style="background:#0D1420;border:1px solid #8B5CF630;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
        <div style="font-size:11px;color:#8B5CF6;letter-spacing:0.08em;margin-bottom:8px;">TRADEMIND</div>
        <div style="font-size:36px;font-weight:800;color:#E8F0FF;line-height:1;margin-bottom:4px;">$39</div>
        <div style="font-size:10px;color:#3D4F6A;">/month · everything included · cancel anytime</div>
      </div>

      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://trademindedge.com/settings" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:600;">
          Keep My Data →
        </a>
      </div>

      <p style="color:#3D4F6A;font-size:12px;text-align:center;line-height:1.7;">
        If you cancel, your data stays safe for 30 days in case you change your mind.
      </p>

      ${footer(email)}
    `),
  }),
};

function buildDay4PersonalizedEmail(
  firstName: string,
  email: string,
  stats: {
    totalCheckins: number;
    goDays: number;
    cautionDays: number;
    noTradeDays: number;
    goAvgPnl: number | null;
    cautionAvgPnl: number | null;
    hasPnlData: boolean;
  }
): { subject: string; html: string } {
  const name = firstName || "Trader";

  let insightBlock = "";

  if (stats.hasPnlData && stats.cautionAvgPnl !== null && stats.goAvgPnl !== null) {
    const diff = stats.goAvgPnl - stats.cautionAvgPnl;
    const cautionColor = stats.cautionAvgPnl < 0 ? "#FF3B5C" : "#FFB020";
    const goColor = stats.goAvgPnl >= 0 ? "#00E87A" : "#FFB020";
    insightBlock = `
      <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:24px;margin-bottom:16px;">
        <div style="font-size:11px;color:#3D4F6A;letter-spacing:0.1em;font-weight:700;margin-bottom:16px;">YOUR 4-DAY SNAPSHOT</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1E2D45;padding-bottom:12px;">
            <span style="font-size:13px;color:#7A8BA8;">GO days avg P&L</span>
            <span style="font-size:16px;font-weight:700;color:${goColor};">${stats.goAvgPnl >= 0 ? "+" : ""}$${Math.abs(Math.round(stats.goAvgPnl))}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1E2D45;padding-bottom:12px;">
            <span style="font-size:13px;color:#7A8BA8;">CAUTION days avg P&L</span>
            <span style="font-size:16px;font-weight:700;color:${cautionColor};">${stats.cautionAvgPnl >= 0 ? "+" : ""}$${Math.abs(Math.round(stats.cautionAvgPnl))}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;color:#E8F0FF;font-weight:600;">Difference per session</span>
            <span style="font-size:18px;font-weight:800;color:#4F8EF7;">${diff >= 0 ? "+" : "-"}$${Math.abs(Math.round(diff))}</span>
          </div>
        </div>
      </div>
      <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0 0 20px;">
        In just 4 days, ${name}, your data already shows a <strong style="color:#E8F0FF;">$${Math.abs(Math.round(diff))} performance gap</strong> between your GO and CAUTION mental states.
        Multiply that over 20 trading days a month.
      </p>`;
  } else if (stats.totalCheckins > 0) {
    const goColor = stats.goDays > 0 ? "#00E87A" : "#3D4F6A";
    const cautionColor = stats.cautionDays > 0 ? "#FFB020" : "#3D4F6A";
    const ntColor = stats.noTradeDays > 0 ? "#FF3B5C" : "#3D4F6A";
    insightBlock = `
      <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:24px;margin-bottom:16px;">
        <div style="font-size:11px;color:#3D4F6A;letter-spacing:0.1em;font-weight:700;margin-bottom:16px;">YOUR 4-DAY SNAPSHOT</div>
        <div style="display:flex;gap:10px;margin-bottom:16px;">
          <div style="flex:1;background:#070B14;border:1px solid ${goColor}30;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${goColor};line-height:1;">${stats.goDays}</div>
            <div style="font-size:10px;color:#3D4F6A;margin-top:4px;letter-spacing:0.06em;">GO</div>
          </div>
          <div style="flex:1;background:#070B14;border:1px solid ${cautionColor}30;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${cautionColor};line-height:1;">${stats.cautionDays}</div>
            <div style="font-size:10px;color:#3D4F6A;margin-top:4px;letter-spacing:0.06em;">CAUTION</div>
          </div>
          <div style="flex:1;background:#070B14;border:1px solid ${ntColor}30;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${ntColor};line-height:1;">${stats.noTradeDays}</div>
            <div style="font-size:10px;color:#3D4F6A;margin-top:4px;letter-spacing:0.06em;">NO-TRADE</div>
          </div>
        </div>
      </div>
      <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0 0 20px;">
        You've already built ${stats.totalCheckins} data points${name !== "Trader" ? `, ${name}` : ""}. Log your first trades and in 2 weeks you'll see exactly which mental states are costing you money.
      </p>`;
  } else {
    insightBlock = `
      <div style="background:#0D1420;border:1px solid #1E2D45;border-radius:14px;padding:24px;margin-bottom:16px;">
        <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0;">
          Your data is waiting. Every check-in you do builds a mental fingerprint — a dataset no other trader has about themselves.
          <strong style="color:#E8F0FF;">Log your first trades + scores to unlock your P&L vs. psychology correlation.</strong>
        </p>
      </div>`;
  }

  return {
    subject: `${name !== "Trader" ? `${name}, ` : ""}your trial ends tomorrow — here's what 7 days of your data shows`,
    html: wrap(`
      <h1 style="color:#E8F0FF;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">
        Tomorrow you'll be charged.
      </h1>
      <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 28px;">
        Before that happens — here's what your data already reveals.
      </p>

      ${insightBlock}

      <div style="background:#0D1420;border:1px solid #8B5CF630;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
        <div style="font-size:11px;color:#8B5CF6;letter-spacing:0.08em;margin-bottom:8px;">TRADEMIND</div>
        <div style="font-size:36px;font-weight:800;color:#E8F0FF;line-height:1;margin-bottom:4px;">$39</div>
        <div style="font-size:10px;color:#3D4F6A;">/month · everything included · cancel anytime</div>
      </div>

      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://trademindedge.com/settings" style="display:inline-block;background:linear-gradient(135deg,#4F8EF7,#3a6fd8);color:white;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:600;">
          Keep My Access →
        </a>
      </div>

      <p style="color:#3D4F6A;font-size:12px;text-align:center;line-height:1.7;">
        Not seeing value yet? Cancel at trademindedge.com/settings before tomorrow — no charge.
      </p>

      ${footer(email)}
    `),
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const users = await db.user.findMany({
    where: { emailReminders: true },
    select: { id: true, email: true, name: true, createdAt: true, plan: true },
  });

  const results: Record<number, number> = {};

  for (const user of users) {
    const daysSince = Math.round((now.getTime() - new Date(user.createdAt).getTime()) / 86400000);

    let subject: string;
    let html: string;

    // Day 8 — only for users who converted to paid (trial ended, now charging)
    if (daysSince === 8 && (user.plan === "pro" || user.plan === "premium")) {
      const firstName = user.name?.split(" ")[0] ?? "";
      subject = `${firstName ? `${firstName}, you're` : "You're"} officially a TradeMind member`;
      html = wrap(`
        <h1 style="color:#E8F0FF;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">
          You're officially in. 🎯
        </h1>
        <p style="color:#3D4F6A;font-size:13px;text-align:center;margin:0 0 32px;">
          ${firstName ? `${firstName}, your` : "Your"} first payment just processed. Welcome to the traders who take their edge seriously.
        </p>

        <div style="background:#0D1420;border:1px solid #00E87A30;border-radius:14px;padding:24px;margin-bottom:20px;">
          <div style="font-size:11px;color:#00E87A;letter-spacing:0.08em;margin-bottom:12px;">THIS WEEK'S FOCUS</div>
          <p style="color:#7A8BA8;font-size:14px;line-height:1.8;margin:0 0 16px;">
            You've done the hard part — you've built data on yourself. Now use it.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${[
              ["Check your Analytics", "See your GO vs NO-TRADE P&L gap. It's probably bigger than you think.", "https://trademindedge.com/analytics", "#4F8EF7"],
              ["Talk to Alex", "Your AI coach has been watching your patterns. Ask: 'What's my biggest pattern costing me?'", "https://trademindedge.com/coach", "#8B5CF6"],
              ["Set up your Playbook", "Write your rules once. TradeMind surfaces them before every check-in.", "https://trademindedge.com/playbook", "#00E87A"],
            ].map(([title, desc, , color]) => `
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;margin-top:5px;"></div>
              <div>
                <div style="font-size:13px;font-weight:700;color:#E8F0FF;margin-bottom:2px;">${title}</div>
                <div style="font-size:12px;color:#7A8BA8;line-height:1.6;">${desc}</div>
              </div>
            </div>`).join("")}
          </div>
        </div>

        <div style="background:#0D1420;border:1px solid #8B5CF630;border-radius:14px;padding:20px;margin-bottom:20px;text-align:center;">
          <div style="font-size:11px;color:#8B5CF6;letter-spacing:0.08em;margin-bottom:8px;">REFER & EARN</div>
          <p style="color:#7A8BA8;font-size:13px;line-height:1.7;margin:0 0 12px;">
            Know a trader who's fighting the same battles? Refer 3 traders and get <strong style="color:#E8F0FF;">1 month free</strong>. Your referral link is in Settings.
          </p>
          <a href="https://trademindedge.com/settings#referral" style="display:inline-block;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);color:#8B5CF6;text-decoration:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:600;">
            Get My Referral Link →
          </a>
        </div>

        <div style="text-align:center;margin-bottom:8px;">
          <a href="https://trademindedge.com/checkin" style="display:inline-block;background:linear-gradient(135deg,#00E87A,#00c46a);color:#070B14;text-decoration:none;border-radius:10px;padding:14px 36px;font-size:15px;font-weight:700;">
            Start Today's Check-in →
          </a>
        </div>

        ${footer(user.email)}
      `);
    } else if (daysSince === 4) {
      // Personalized pre-charge email — fetch real data
      const [checkins, trades] = await Promise.all([
        db.checkin.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 10 }),
        db.tradeEntry.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 }),
      ]);

      const goDays = checkins.filter((c) => c.verdict === "GO").length;
      const cautionDays = checkins.filter((c) => c.verdict === "CAUTION").length;
      const noTradeDays = checkins.filter((c) => c.verdict === "NO-TRADE").length;

      const withPnl = trades.filter((t) => t.pnl !== null && t.checkinScore !== null);
      const goTrades = withPnl.filter((t) => (t.checkinScore ?? 0) >= 70);
      const cautionTrades = withPnl.filter((t) => (t.checkinScore ?? 0) >= 45 && (t.checkinScore ?? 0) < 70);

      const avgPnl = (arr: typeof withPnl) =>
        arr.length ? arr.reduce((s, t) => s + (t.pnl ?? 0), 0) / arr.length : null;

      const result = buildDay4PersonalizedEmail(
        user.name?.split(" ")[0] ?? "",
        user.email,
        {
          totalCheckins: checkins.length,
          goDays,
          cautionDays,
          noTradeDays,
          goAvgPnl: avgPnl(goTrades),
          cautionAvgPnl: avgPnl(cautionTrades),
          hasPnlData: withPnl.length >= 2,
        }
      );
      subject = result.subject;
      html = result.html;
    } else {
      const emailFn = EMAILS[daysSince];
      if (!emailFn) continue;
      const firstName = user.name?.split(" ")[0] ?? "";
      ({ subject, html } = emailFn(firstName, user.email));
    }

    try {
      await resend.emails.send({
        from: "TradeMind <noreply@trademindedge.com>",
        to: user.email,
        subject,
        html,
      });
      results[daysSince] = (results[daysSince] ?? 0) + 1;
    } catch {
      // continue
    }
  }

  return Response.json({ results });
}