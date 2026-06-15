import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "10 Prop Firm Tips Most Traders Learn the Hard Way — TradeMind",
  description: "Most prop firm traders fail not because their strategy is wrong — but because they ignore the mental and behavioral edge. Here are 10 prop firm tips that separate funded traders from those who keep resetting.",
  openGraph: {
    title: "10 Prop Firm Tips Most Traders Learn the Hard Way",
    description: "The prop firm meta isn't about finding a better strategy. It's about executing your existing strategy under pressure.",
    url: "https://trademindedge.com/blog/prop-firm-tips",
  },
  alternates: { canonical: "https://trademindedge.com/blog/prop-firm-tips" },
};

const TIPS = [
  {
    n: "01",
    title: "Your mindset on day 1 determines your result on day 30",
    color: "#5E6AD2",
    body: `Every prop firm challenge starts the same way: with confidence, optimism, and clean P&L. The mental state at day 1 is rarely the problem. What matters is how you respond when you're down 2.5% on day 8 with the profit target feeling far away.

Experienced funded traders enter a challenge with a documented response plan for their worst scenarios. Not just position sizing — emotional protocols. "If I lose 3 trades in a row, I will close the platform." "If I hit my daily stop, I will not log back in." Write these down before you start. The version of you on a bad day cannot be trusted to make these decisions.`,
  },
  {
    n: "02",
    title: "Trade your normal size, not challenge size",
    color: "#FF3B5C",
    body: `The most common sizing mistake: treating the prop firm capital as different from your own, and therefore taking larger positions than you'd normally take. The logic is "it's not my money anyway." The result is consistent failure.

Your risk per trade during a challenge should be identical to what you'd risk in live trading with your own capital. If you normally risk 0.5% per trade, risk 0.5% here. If the math means it takes longer to hit the profit target — good. That's the discipline the firm is evaluating. Consistency of process is more fundable than an impressive run that required 2% risk per trade.`,
  },
  {
    n: "03",
    title: "Know your worst-case math before you start",
    color: "#FFB020",
    body: `Before your first trade: calculate exactly how many consecutive full-loss trades would end your challenge. If your max daily drawdown is 5% and you risk 1% per trade, you can lose 5 trades in one day and it's over. If you risk 0.5% per trade, that number doubles to 10.

This isn't pessimistic thinking. It's constraint-aware planning. The prop firms that survive long-term are the ones that never have a surprise. Your drawdown limit should feel like a distant guardrail, not a near constant threat. If it feels close every day, you're sized too large.`,
  },
  {
    n: "04",
    title: "The days you don't trade are as important as the days you do",
    color: "#00C896",
    body: `Most challenges give you 30 days or more to hit a 10% profit target. That's roughly 0.33% per day if you trade every day. Alternatively: 3% per week across 4 trading days per week.

The math creates a lot of room to skip bad days — days when the market is choppy, when your mental state is off, when you don't see your setups. Experienced prop traders treat these days as free passes. Novice traders feel compelled to trade every day and manufacture setups that don't exist.

Track which days of the week you trade best. Track market conditions where your strategy outperforms. Trade those. Skip the rest.`,
  },
  {
    n: "05",
    title: "Log your mental state before every session — not just your trades",
    color: "#5E6AD2",
    body: `Standard trade journaling captures what happened after. Mental journaling captures the state that caused it. These are entirely different datasets with entirely different predictive value.

Before you open a chart: rate your sleep (1–5), your stress level (1–5), your focus (1–5). Over 30–60 days of data, patterns emerge. You'll discover that on days when you rated your focus below 3, your average trade was a loser. On days where stress was above 4, you overtraded. This data is worth more than any technical indicator because it tells you when not to trade — before you find out the hard way.`,
  },
  {
    n: "06",
    title: "Set a personal daily stop loss, not just the firm's limit",
    color: "#FF3B5C",
    body: `FTMO's daily limit is 5%. Apex's is typically 3%. TopStep's is 2%. Whatever your firm's number is, your personal daily stop should be lower — usually 50–60% of the firm's limit.

The reason: by the time you're approaching the firm's limit, you're already in a degraded mental state. Trading aggressively in the last 1% of your limit is trading under duress, not under your system. Setting a personal stop at 3% (for a 5% limit) means you always have cushion. It means one bad day doesn't become an account-ending day. And it means you're making your toughest decisions when you're down 3%, not when you're down 4.8%.`,
  },
  {
    n: "07",
    title: "Understand the specific rules of your specific firm",
    color: "#FFB020",
    body: `FTMO, Apex, TopStep, MyFundedFX, and every other firm have different rules. The daily loss limit calculation varies — some are based on balance, some on equity, some on a rolling 24-hour window. The consistency rules differ. The profit split percentages differ. The trading hours and restricted instruments differ.

Read your firm's rules document fully before trading. Not the summary. The full document. Traders fail challenges due to rule violations they didn't know existed. Common surprises: news trading restrictions, overnight holding policies, weekend drawdown rules, and minimum trading day requirements that catch people off guard at the end of a successful challenge.`,
  },
  {
    n: "08",
    title: "Treat your 3 best setups as sacred, ignore everything else",
    color: "#00C896",
    body: `Every consistently funded trader has a short list of setups that drive the bulk of their profits. If you've journaled your trades for any length of time, you already know what they are. The FVG at a key level. The opening range breakout. The specific ICT pattern that works for you. Three to five setups that account for 80% of your edge.

During a challenge, trade only those. Not the "looks interesting" trade. Not the "I think this could work" trade. Only the setups that your historical data says work. This constraint feels limiting until you realize that your worst-performing trade categories are likely costing you more than they're making you.`,
  },
  {
    n: "09",
    title: "Review your losing trades differently from your winning trades",
    color: "#5E6AD2",
    body: `The standard review process: winners get celebrated, losers get analyzed. The problem: you learn equally wrong lessons from both if you're not careful. A winning trade taken impulsively is a lesson in luck. A losing trade taken at a valid setup is a lesson in managing expectancy.

The more useful distinction: was this a "good trade" (taken at a high-quality setup per your plan) or a "bad trade" (taken impulsively, in revenge mode, or deviating from your system)? A good loss and a bad loss are categorically different. A bad win is more dangerous than a good loss. Separate your analysis along this axis and your reviews will actually change your behavior.`,
  },
  {
    n: "10",
    title: "Scaling to a funded account is a separate skill from passing the challenge",
    color: "#FF3B5C",
    body: `Passing a prop firm challenge and consistently profiting as a funded trader are two different skills. The challenge is a 30-day controlled test. The funded account is an ongoing business that requires consistency, drawdown management, and the ability to maintain your edge across changing market conditions.

Traders who pass once and then repeatedly lose their funded accounts usually have this problem: they treated the challenge as the goal. It's not. The challenge is the entrance requirement. The real test is whether your process is sustainable across months and years.

Build journaling, review, and mental check-in habits during the challenge — not because they'll help you pass, but because they're the habits you'll need to stay funded.`,
  },
];

export default function PropFirmTipsPage() {
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
          <span style={{ color: "#a1a1aa" }}>Prop Firm Tips</span>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", background: "rgba(94,106,210,0.15)", color: "#5E6AD2", borderRadius: 20, letterSpacing: "0.06em" }}>PROP FIRMS</span>
            <span style={{ fontSize: 13, color: "#52525b" }}>June 2025 · 11 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            10 Prop Firm Tips Most Traders Learn the Hard Way
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
            Most traders fail prop firm challenges not because their strategy is wrong — but because they ignore the mental and behavioral edge. Here are the 10 lessons that separate consistently funded traders from those who keep resetting.
          </p>
        </div>

        <div style={{ background: "#0d1117", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: "20px 24px", marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em", margin: "0 0 8px" }}>THE UNCOMFORTABLE TRUTH ABOUT PROP FIRM FAILURE</p>
          <p style={{ fontSize: 15, color: "#a1a1aa", lineHeight: 1.65, margin: 0 }}>
            The majority of prop firm failures are not caused by bad strategies. They&apos;re caused by <strong style={{ color: "#fff" }}>good strategies executed badly under pressure.</strong> The mental game isn&apos;t a soft skill. It&apos;s the primary skill.
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

        <div style={{ padding: "36px 28px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.06))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 16, textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>TradeMind was built around every tip on this list</h3>
          <p style={{ fontSize: 15, color: "#a1a1aa", margin: "0 0 24px", lineHeight: 1.6 }}>
            Pre-session mental check-ins, personal daily stop alerts, tilt detection, setup-specific win rate tracking, and a review system that separates good losses from bad ones.
          </p>
          <Link href="/login" style={{ display: "inline-block", padding: "13px 32px", background: "#5E6AD2", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Start Free — Built for Prop Traders →
          </Link>
        </div>

        <div style={{ marginTop: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#52525b", letterSpacing: "0.08em", marginBottom: 16 }}>RELATED ARTICLES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/blog/ftmo-challenge-tips" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>7 FTMO Challenge Tips That 90% of Traders Ignore →</Link>
            <Link href="/blog/funded-account-rules" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>Prop Firm Rules Every Funded Trader Must Know →</Link>
            <Link href="/blog/revenge-trading" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>What Is Revenge Trading? How to Recognize and Stop It →</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
