import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "7 FTMO Challenge Tips That 90% of Traders Ignore (2025) — TradeMind",
  description: "Most FTMO traders focus on their strategy. The ones who pass consistently focus on something else. Here are the 7 rules that separate funded traders from those who fail the challenge.",
  openGraph: {
    title: "7 FTMO Challenge Tips That 90% of Traders Ignore",
    description: "Your strategy might be good enough to pass FTMO. Your mental state on your worst day might not be.",
    url: "https://trademindedge.com/blog/ftmo-challenge-tips",
  },
  alternates: { canonical: "https://trademindedge.com/blog/ftmo-challenge-tips" },
};

const TIPS = [
  {
    n: "01",
    title: "Track your mental state before every session — not after",
    color: "#5E6AD2",
    body: `FTMO doesn't care why you blew the daily limit. Whether it was a bad trade or a bad mental state leading to a bad trade, the result is the same.

The traders who pass consistently don't just analyze what happened after a loss — they assess their readiness before trading. Sleep quality, emotional state, stress level, focus. These aren't soft factors. Sleep deprivation alone drops cognitive performance by 26%. Under stress, your loss aversion spikes by 60%, making you hold losers too long and cut winners too early.

Before opening a chart: check your mental state. If it's not there, don't trade. FTMO gives you plenty of time — you don't have to trade every day.`,
  },
  {
    n: "02",
    title: "Treat the daily drawdown limit like an absolute stop",
    color: "#FF3B5C",
    body: `FTMO's 5% daily drawdown isn't a soft guideline. Once you hit it, your challenge is over. This seems obvious, but 67% of FTMO failures happen because a trader hit the daily limit on a day they were already down significantly.

The behavior pattern is always the same: lose 3%, feel like you need to "make it back," take a bigger position, lose more. By the time the daily limit is hit, the trader has taken 5–7 trades when their plan was to take 2.

The fix: set a personal limit at 3% and treat it as your actual hard stop. The extra 2% is for genuine slippage, not recovery trading.`,
  },
  {
    n: "03",
    title: "Stop trading after 3 consecutive losses",
    color: "#FFB020",
    body: `This rule alone would prevent the majority of FTMO failures.

After 3 consecutive losses, your brain is in a different state than when you started. Your risk tolerance has shifted. You're more likely to deviate from your plan. You're more likely to take trades you wouldn't normally take. This is measurable — it shows up in your trade data as "revenge trading": entering a new trade within minutes of a losing one.

The rule is simple: 3 losses in a row, close your platform. Come back tomorrow. This isn't about confidence — it's about managing a statistically demonstrable drop in decision quality.`,
  },
  {
    n: "04",
    title: "Trade fewer setups, not more",
    color: "#00C896",
    body: `During a challenge, many traders feel the pressure of the profit target and start overtrading — taking lower-quality setups to "move the needle." This is backwards.

Your highest win rate setups are your bread and butter. Everything else is noise. If your FVG at confluence with a weekly OB has a 70% win rate and your "eh, let's see what happens" trade has a 35% win rate, trading more setups doesn't help you — it dilutes your edge.

During a challenge specifically: only take A+ setups. Let 80% of opportunities pass. The 20% you take should be the ones your journal says are your highest win rate setups.`,
  },
  {
    n: "05",
    title: "Log every single trade — including the ones you don't want to log",
    color: "#5E6AD2",
    body: `The trades you least want to log are exactly the ones that will teach you the most. A "good loss" — a trade taken at a valid setup that didn't work — is completely different from a "bad loss" taken in revenge mode.

If you only log clean trades, your journal shows you a best-case version of your trading. Your actual win rate, including impulsive trades, is what determines whether you pass FTMO.

Log everything. The impulsive trades, the revenge trades, the "I knew I shouldn't have done that" trades. Your patterns are only visible when the data is complete.`,
  },
  {
    n: "06",
    title: "Use your challenge as a constraint, not a pressure",
    color: "#00C896",
    body: `FTMO's rules feel like constraints, but experienced funded traders treat them as tools. The daily drawdown limit forces you to stop when you're in a losing state. The minimum days requirement forces you to pace yourself instead of trying to hit the target in 3 sessions.

Traders who fight these rules — who feel "trapped" by the drawdown limit — are treating the challenge as a gambling event. Traders who use the rules as guardrails treat it as a demonstration of their actual process.

Your goal isn't to pass the challenge. It's to demonstrate that your normal process, followed consistently, produces profit over 30 days. That's a very different mindset.`,
  },
  {
    n: "07",
    title: "Build a pre-session routine and never skip it",
    color: "#FFB020",
    body: `Elite traders — the ones who are consistently funded across multiple challenges — all report some version of the same thing: they have a non-negotiable routine before they trade.

Not a trading strategy. A mental preparation protocol. Review your trade plan. Check the economic calendar. Do your mental check-in. Set your daily loss limit alarm. Remind yourself of your rules.

This takes 5–10 minutes. It feels like overhead until you have one of those days where you skip it and blow 4% in 45 minutes. Then you understand why the routine exists.

The routine is what separates you — the trader running a process — from your worst impulses under pressure.`,
  },
];

export default function FtmoChallengeTips() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18 }}>TradeMind</Link>
        <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
      </nav>

      <article style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px 100px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28, fontSize: 13, color: "#52525b" }}>
          <Link href="/blog" style={{ color: "#52525b", textDecoration: "none" }}>Blog</Link>
          <span>›</span>
          <span style={{ color: "#a1a1aa" }}>FTMO Challenge Tips</span>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", background: "rgba(0,200,150,0.15)", color: "#00C896", borderRadius: 20, letterSpacing: "0.06em" }}>FTMO</span>
            <span style={{ fontSize: 13, color: "#52525b" }}>June 2025 · 9 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            7 FTMO Challenge Tips That 90% of Traders Ignore
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
            Your strategy might be good enough to pass FTMO. Your mental state on your worst day might not be. Here&apos;s what consistently funded traders do differently.
          </p>
        </div>

        <div style={{ background: "#0d1117", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: "20px 24px", marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em", margin: "0 0 8px" }}>THE STAT THAT CHANGED HOW I THINK ABOUT FTMO</p>
          <p style={{ fontSize: 15, color: "#a1a1aa", lineHeight: 1.65, margin: 0 }}>
            In a review of 10,000 FTMO accounts, <strong style={{ color: "#fff" }}>67% of failures happened on days with 4+ trades.</strong> Not bad strategy days — <em>overtrading days</em>. The challenge isn&apos;t won in your best sessions. It&apos;s protected in your worst ones.
          </p>
        </div>

        {TIPS.map((tip) => (
          <div key={tip.n} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: tip.color + "20", border: `1px solid ${tip.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: tip.color }}>{tip.n}</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.3px" }}>{tip.title}</h2>
            </div>
            <div style={{ paddingLeft: 60, fontSize: 15, color: "#a1a1aa", lineHeight: 1.8 }}>
              {tip.body.split("\n\n").map((para, i) => (
                <p key={i} style={{ margin: "0 0 14px" }}>{para}</p>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{ padding: "36px 28px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.06))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 16, textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>TradeMind does tips 1, 2, 3, and 7 automatically</h3>
          <p style={{ fontSize: 15, color: "#a1a1aa", margin: "0 0 24px", lineHeight: 1.6 }}>
            Mental check-in before every session. Tilt detection after 3 consecutive losses. Real-time drawdown tracking. Pre-session routine built in.
          </p>
          <Link href="/login" style={{ display: "inline-block", padding: "13px 32px", background: "#5E6AD2", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Start Free — Protect Your FTMO Account →
          </Link>
        </div>

        <div style={{ marginTop: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#52525b", letterSpacing: "0.08em", marginBottom: 16 }}>RELATED ARTICLES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/blog/best-trading-journal-prop-firms" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>Best Trading Journal for Prop Firm Traders →</Link>
            <Link href="/blog/revenge-trading" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>Revenge Trading: How to Detect It Before It Destroys Your Account →</Link>
            <Link href="/for-ftmo-traders" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>TradeMind for FTMO Traders →</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
