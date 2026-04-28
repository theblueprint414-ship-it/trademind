import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "7 Trading Journal Mistakes That Are Costing You Money — TradeMind",
  description: "Most traders keep a journal but don't improve from it. The problem isn't the journal — it's what they track (and don't track). Here are the 7 mistakes and how to fix each one.",
  openGraph: {
    title: "7 Trading Journal Mistakes That Are Costing You Money",
    description: "Most traders keep a journal but don't improve from it. Here are the 7 mistakes and how to fix each one.",
    url: "https://trademindedge.com/blog/trading-journal-mistakes",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/trading-journal-mistakes" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "7 Trading Journal Mistakes That Are Costing You Money",
  url: "https://trademindedge.com/blog/trading-journal-mistakes",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

const MISTAKES = [
  {
    n: 1,
    title: "Only logging when you feel like it",
    detail: "Consistency is the entire point. A journal with 40 entries spread over 3 months gives you nothing — patterns require sample size. The traders who improve from journaling log every trading day, regardless of how the session went. The bad days are actually the most important ones to capture.",
  },
  {
    n: 2,
    title: "Tracking what, not why",
    detail: "Most journals capture entry price, exit price, and P&L. What they miss is the decision process: Why did you take this trade? Did it meet all your criteria? What was your confidence level? What emotion were you feeling when you entered? P&L tells you what happened. The why tells you whether it was a good trade regardless of outcome.",
  },
  {
    n: 3,
    title: "Skipping the pre-session mental assessment",
    detail: "Your P&L doesn't exist in isolation — it exists in the context of your mental state when you traded. A loss on a 90/100 mental state day means something completely different from a loss on a 35/100 day. Without logging both, you can't distinguish execution errors from variance.",
  },
  {
    n: 4,
    title: "Reviewing trades but never patterns",
    detail: "Individual trade reviews improve execution on the next trade. Pattern reviews improve strategy and behavior permanently. Once a month, analyze your journal in aggregate: what is your win rate by setup type? By time of day? By mental state score? By day of week? The answers will surprise you — and they're where the real edge is.",
  },
  {
    n: 5,
    title: "Writing vague reflections",
    detail: "'Didn't follow my plan' is not a reflection. 'I sized up to 2% risk on this trade because I was feeling confident after the previous winner, which led to a larger loss than my rules allow and drove my account into drawdown territory for the week' — that is a reflection. Specificity is what makes future reading useful.",
  },
  {
    n: 6,
    title: "Not logging rule violations separately",
    detail: "A losing trade that followed your plan is not the same as a losing trade that broke a rule. If you don't track rule violations separately, you'll eventually backtest yourself into believing your strategy is worse than it is — when the real issue is execution consistency. Track every rule violation, even when you 'got away with it' and the trade won.",
  },
  {
    n: 7,
    title: "Never reading it",
    detail: "The journal is not the point. The reading is the point. Commit to a weekly review — every Sunday, 20 minutes, reading the week's entries looking for one pattern. One thing to do more of and one thing to stop. Without the review, the journal is a diary. With the review, it's a performance improvement system.",
  },
];

export default function TradingJournalMistakes() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 6, padding: "3px 10px" }}>JOURNALING</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 7 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            7 Trading Journal Mistakes That Are Costing You Money
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            You keep a journal. You log your trades. You re-read it occasionally and think, roughly, that you&apos;ll do better. Nothing changes. The problem isn&apos;t that you journal — it&apos;s how.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>A trading journal is the highest-leverage improvement tool available to retail traders. Professionals at prop firms and hedge funds use structured journals not because they&apos;re told to — but because the data from systematic self-review compounds over time. The traders who improve the fastest aren&apos;t necessarily the most talented. They&apos;re the most rigorous self-analysts.</p>

          <p>Here are the seven mistakes that prevent most journals from producing that improvement.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, margin: "32px 0" }}>
            {MISTAKES.map((m) => (
              <div key={m.n} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "var(--blue)", flexShrink: 0 }}>{m.n}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{m.title}</div>
                    <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>{m.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>What a Good Journal Actually Looks Like</h2>

          <p>After each trading session, at minimum: date, setups taken, why each trade was taken, whether it met your criteria, mental state score (before the session), P&L, and one sentence on the most important thing you learned. That&apos;s it. Five to ten minutes. The depth comes from the weekly pattern review, not from the daily entry.</p>

          <p>The goal of a journal is not to write — it&apos;s to see. To see who you are as a trader, what patterns your behavior creates, and what the data says about which version of you makes money. The journal is the mirror. Most traders keep it face-down.</p>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Journal + Mental State in One Place</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind combines your trade journal with your daily mental check-in and automatically correlates the two. See your win rate by mental state, find your patterns, and get AI coaching that reads your actual data.</p>
            <Link href="/login?callbackUrl=/checkin" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}