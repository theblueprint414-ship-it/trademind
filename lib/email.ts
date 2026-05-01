import { Resend } from "resend";

const resend = new Resend(process.env.AUTH_RESEND_KEY);
const FROM = process.env.AUTH_EMAIL_FROM ?? "TradeMind <noreply@trademindedge.com>";
const BASE_URL = "https://trademindedge.com";

export async function sendWelcomeEmail(to: string, name?: string) {
  const firstName = name?.split(" ")[0] ?? "Trader";
  await resend.emails.send({
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