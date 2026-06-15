import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.AUTH_RESEND_KEY ?? "re_placeholder");
}
const FROM = process.env.AUTH_EMAIL_FROM ?? "TradeMind <noreply@trademindedge.com>";
const BASE_URL = "https://trademindedge.com";

export async function sendWelcomeEmail(to: string, name?: string) {
  const firstName = name?.split(" ")[0] ?? "Trader";
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your TradeMind account is ready — first check-in takes 60 seconds",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to TradeMind</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto 48px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

    <div style="background:#070B14;padding:28px 40px;text-align:center;">
      <img src="${BASE_URL}/logo.svg" alt="TradeMind" height="26" style="display:block;margin:0 auto;" />
    </div>

    <div style="padding:40px;">
      <h1 style="font-size:22px;font-weight:700;color:#0a0a0b;margin:0 0 16px;letter-spacing:-0.025em;">
        ${firstName}, your account is ready.
      </h1>
      <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 16px;">
        TradeMind gives you a pre-trade verdict — <strong style="color:#0a0a0b;">GO, CAUTION, or NO-TRADE</strong> — in 60 seconds, based on your mental state right now.
      </p>
      <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 28px;">
        Serious traders do this check-in before they open a chart. It's the only tool that tells you whether your mind is ready to risk money — before the damage is done.
      </p>

      <div style="text-align:center;margin:0 0 32px;">
        <a href="${BASE_URL}/checkin" style="display:inline-block;background:#e5e5e6;color:#010102;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:-0.011em;">
          Get your Mental Score →
        </a>
        <p style="font-size:12px;color:#a1a1aa;margin:12px 0 0;">60 seconds · No credit card needed</p>
      </div>

      <div style="background:#f9f9fb;border-radius:10px;padding:24px;">
        <p style="font-size:12px;font-weight:700;color:#3f3f46;letter-spacing:0.06em;margin:0 0 14px;text-transform:uppercase;">What TradeMind measures</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:13px;color:#52525b;">💤 Sleep quality</td>
            <td style="padding:8px 0 8px 16px;border-bottom:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;text-align:right;">−26% cognitive performance after &lt;6h sleep</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:13px;color:#52525b;">😤 Emotional state</td>
            <td style="padding:8px 0 8px 16px;border-bottom:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;text-align:right;">+60% loss aversion under stress</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:13px;color:#52525b;">🧠 Decision fatigue</td>
            <td style="padding:8px 0 8px 16px;border-bottom:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;text-align:right;">3× more rule violations when fatigued</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#52525b;">🎯 Focus &amp; stress</td>
            <td style="padding:8px 0 8px 16px;font-size:12px;color:#a1a1aa;text-align:right;">Your edge only works when your brain does</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="background:#f9f9fb;border-top:1px solid #e4e4e7;padding:20px 40px;text-align:center;">
      <p style="font-size:12px;color:#a1a1aa;margin:0 0 4px;">
        TradeMind · <a href="${BASE_URL}" style="color:#a1a1aa;text-decoration:none;">trademindedge.com</a>
      </p>
      <p style="font-size:12px;color:#a1a1aa;margin:0;">
        You received this because you created a TradeMind account.
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

function emailWrapper(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto 48px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    <div style="background:#070B14;padding:24px 40px;text-align:center;">
      <img src="${BASE_URL}/logo.svg" alt="TradeMind" height="22" style="display:block;margin:0 auto;" />
    </div>
    <div style="padding:36px 40px;">${body}</div>
    <div style="background:#f9f9fb;border-top:1px solid #e4e4e7;padding:18px 40px;text-align:center;">
      <p style="font-size:12px;color:#a1a1aa;margin:0 0 4px;">TradeMind · <a href="${BASE_URL}" style="color:#a1a1aa;text-decoration:none;">trademindedge.com</a></p>
      <p style="font-size:12px;color:#a1a1aa;margin:0;"><a href="${BASE_URL}/unsubscribe" style="color:#a1a1aa;text-decoration:underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

// Day 3 — "Did you take your first check-in?" re-engagement
export async function sendDay3Email(to: string, name?: string, hasCheckedIn = false) {
  const firstName = name?.split(" ")[0] ?? "Trader";
  const subject = hasCheckedIn
    ? `${firstName}, here's what your mental score data is telling you`
    : `${firstName}, most traders skip this — and then wonder why they lose`;

  const body = hasCheckedIn
    ? `<h1 style="font-size:20px;font-weight:700;color:#0a0a0b;margin:0 0 16px;">You've started tracking your mental state. Here's what to watch.</h1>
       <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 16px;">After your first few check-ins, patterns start to emerge. The most important one: <strong style="color:#0a0a0b;">how does your P&amp;L differ between high-score and low-score days?</strong></p>
       <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 24px;">Most traders who track this find that 80% of their losses cluster on days when their mental score was below 60. Not a bad strategy — a bad mental state.</p>
       <div style="text-align:center;margin:0 0 24px;">
         <a href="${BASE_URL}/analytics" style="display:inline-block;background:#070B14;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:8px;">See My Score Patterns →</a>
       </div>
       <p style="font-size:14px;color:#71717a;line-height:1.65;margin:0;">Next up: import your trades from your broker via CSV. TradeMind supports Tradovate, NinjaTrader, Rithmic, MT4/MT5 — one import pulls your full history.</p>`
    : `<h1 style="font-size:20px;font-weight:700;color:#0a0a0b;margin:0 0 16px;">You signed up 3 days ago but haven't taken your first check-in.</h1>
       <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 16px;">That's okay. Most people sign up and then "get to it later." But here's the thing: the traders who use TradeMind most effectively take their <em>first</em> check-in before they understand why it matters. Then they understand.</p>
       <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 8px;">It takes 60 seconds. Here's what it tells you:</p>
       <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 24px;">
         <tr><td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:14px;color:#52525b;">✓ Whether to trade at full size, half size, or not at all today</td></tr>
         <tr><td style="padding:8px 0;border-bottom:1px solid #e4e4e7;font-size:14px;color:#52525b;">✓ Which mental factors are affecting you right now</td></tr>
         <tr><td style="padding:8px 0;font-size:14px;color:#52525b;">✓ Your first data point toward understanding your own patterns</td></tr>
       </table>
       <div style="text-align:center;margin:0 0 16px;">
         <a href="${BASE_URL}/checkin" style="display:inline-block;background:#070B14;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:8px;">Take My First Check-in →</a>
       </div>`;

  await getResend().emails.send({ from: FROM, to, subject, html: emailWrapper(body) });
}

// Day 7 — Feature discovery: import trades + confluence analytics
export async function sendDay7Email(to: string, name?: string, tradeCount = 0) {
  const firstName = name?.split(" ")[0] ?? "Trader";
  const hasData = tradeCount >= 5;

  await getResend().emails.send({
    from: FROM,
    to,
    subject: hasData
      ? `${firstName}, here's what your ${tradeCount} trades are revealing`
      : `${firstName}, one import will unlock everything TradeMind can show you`,
    html: emailWrapper(
      hasData
        ? `<h1 style="font-size:20px;font-weight:700;color:#0a0a0b;margin:0 0 16px;">You have ${tradeCount} trades logged. Here's what to look at next.</h1>
           <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 16px;">With your trade data in place, three analytics tabs are worth checking:</p>
           <div style="background:#f9f9fb;border-radius:10px;padding:20px;margin:0 0 24px;">
             <p style="font-size:13px;font-weight:700;color:#3f3f46;margin:0 0 12px;letter-spacing:0.04em;">UNLOCK THESE INSIGHTS</p>
             <p style="font-size:14px;color:#52525b;margin:0 0 8px;"><strong style="color:#0a0a0b;">Confluence tab</strong> — which setup combinations have your highest win rate (e.g., FVG + OB = 68% WR)</p>
             <p style="font-size:14px;color:#52525b;margin:0 0 8px;"><strong style="color:#0a0a0b;">Psychology tab</strong> — which behavioral tags (FOMO, Revenge, Perfect Setup) are costing you money</p>
             <p style="font-size:14px;color:#52525b;margin:0;"><strong style="color:#0a0a0b;">Heatmap tab</strong> — your best and worst trading hours, which days of the week you should avoid</p>
           </div>
           <div style="text-align:center;">
             <a href="${BASE_URL}/analytics" style="display:inline-block;background:#070B14;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:8px;">View My Analytics →</a>
           </div>`
        : `<h1 style="font-size:20px;font-weight:700;color:#0a0a0b;margin:0 0 16px;">Import your trades in 2 minutes — unlock everything.</h1>
           <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 16px;">TradeMind supports CSV import from Tradovate, NinjaTrader, Rithmic, MT4/MT5, and more. One import and your full trade history is in the system.</p>
           <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 16px;">With your trade history loaded, you'll see:</p>
           <ul style="font-size:14px;color:#52525b;line-height:1.9;margin:0 0 24px;padding-left:20px;">
             <li>Which setups have your highest win rate</li>
             <li>Which behavioral patterns (FOMO, revenge trades) are costing you money</li>
             <li>Your best trading hours and worst trading days</li>
             <li>Your equity curve and drawdown history</li>
           </ul>
           <div style="text-align:center;">
             <a href="${BASE_URL}/import" style="display:inline-block;background:#070B14;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:8px;">Import My Trades →</a>
           </div>`
    ),
  });
}

// Day 14 — Upgrade nudge (Pro features)
export async function sendDay14Email(to: string, name?: string, plan = "free") {
  const firstName = name?.split(" ")[0] ?? "Trader";
  if (plan !== "free") return; // don't send to already-paid users

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `${firstName}, you've been on TradeMind 2 weeks — here's what Pro unlocks`,
    html: emailWrapper(
      `<h1 style="font-size:20px;font-weight:700;color:#0a0a0b;margin:0 0 16px;">Two weeks in. Here's what you're missing on the free plan.</h1>
       <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 20px;">The free plan covers check-ins and basic journaling. Pro unlocks the features that actually build edge:</p>
       <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 24px;">
         <tr>
           <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
             <p style="font-size:14px;font-weight:700;color:#0a0a0b;margin:0 0 3px;">Confluence Combination Analytics</p>
             <p style="font-size:13px;color:#71717a;margin:0;">See win rate for FVG+OB vs FVG alone. Know exactly which setups to take and which to skip.</p>
           </td>
         </tr>
         <tr>
           <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
             <p style="font-size:14px;font-weight:700;color:#0a0a0b;margin:0 0 3px;">AI Pattern Insights</p>
             <p style="font-size:13px;color:#71717a;margin:0;">Weekly analysis of your behavioral patterns — what's costing you money and what's working.</p>
           </td>
         </tr>
         <tr>
           <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
             <p style="font-size:14px;font-weight:700;color:#0a0a0b;margin:0 0 3px;">Multi-Account Prop Firm Dashboard</p>
             <p style="font-size:13px;color:#71717a;margin:0;">Track FTMO, Apex, and TopStep side by side with drawdown bars and status alerts.</p>
           </td>
         </tr>
         <tr>
           <td style="padding:12px 0;">
             <p style="font-size:14px;font-weight:700;color:#0a0a0b;margin:0 0 3px;">Monte Carlo Projections + Execution Quality</p>
             <p style="font-size:13px;color:#71717a;margin:0;">P10/P50/P90 equity curves and SL discipline scoring.</p>
           </td>
         </tr>
       </table>
       <div style="background:#f0f0ff;border-radius:10px;padding:18px;text-align:center;margin:0 0 24px;">
         <p style="font-size:15px;font-weight:700;color:#3f3f46;margin:0 0 4px;">Pro Plan — $39/month</p>
         <p style="font-size:13px;color:#71717a;margin:0;">Less than one bad FTMO trade prevented.</p>
       </div>
       <div style="text-align:center;">
         <a href="${BASE_URL}/pricing" style="display:inline-block;background:#5E6AD2;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:8px;">Upgrade to Pro →</a>
       </div>
       <p style="font-size:13px;color:#a1a1aa;text-align:center;margin:16px 0 0;">Cancel anytime. No lock-in.</p>`
    ),
  });
}

// Day 30 — Churn prevention (inactive users)
export async function sendDay30Email(to: string, name?: string, lastCheckInDays = 30) {
  const firstName = name?.split(" ")[0] ?? "Trader";
  const isInactive = lastCheckInDays > 14;

  if (!isInactive) return; // only send to users who've gone quiet

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `${firstName}, your trading data is waiting for you`,
    html: emailWrapper(
      `<h1 style="font-size:20px;font-weight:700;color:#0a0a0b;margin:0 0 16px;">It's been a while. Your account is still here.</h1>
       <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 16px;">You haven't logged a check-in in over 2 weeks. That's fine — trading takes breaks. But when you come back, TradeMind will be here with everything intact.</p>
       <p style="font-size:15px;color:#52525b;line-height:1.75;margin:0 0 24px;">If you're in a drawdown period or taking a break from trading, this is actually the best time to review what happened. What patterns led to the drawdown? What days were you in the wrong mental state?</p>
       <div style="text-align:center;margin:0 0 16px;">
         <a href="${BASE_URL}/analytics" style="display:inline-block;background:#070B14;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:8px;">Review My Trading History →</a>
       </div>
       <p style="font-size:14px;color:#71717a;text-align:center;">Or <a href="${BASE_URL}/checkin" style="color:#52525b;">take a check-in now</a> if you're back to trading.</p>`
    ),
  });
}