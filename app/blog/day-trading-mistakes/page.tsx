import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The 8 Most Common Day Trading Mistakes (And the Psychology Behind Each) — TradeMind",
  description: "Day trading mistakes are almost never about strategy. They're about psychology. Here are the 8 most common ones, the behavioral mechanism behind each, and how to fix them.",
  openGraph: {
    title: "The 8 Most Common Day Trading Mistakes (And the Psychology Behind Each)",
    description: "Day trading mistakes are almost never about strategy. Here are the 8 most common ones and the psychology behind each.",
    url: "https://trademindedge.com/blog/day-trading-mistakes",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/day-trading-mistakes" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The 8 Most Common Day Trading Mistakes (And the Psychology Behind Each)",
  url: "https://trademindedge.com/blog/day-trading-mistakes",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

const MISTAKES = [
  {
    mistake: "No pre-session plan",
    psychology: "Availability bias — you make decisions based on the most recent information. Without a pre-session plan, every trade decision is reactive to the last 5 minutes of market action rather than a prepared analysis.",
    fix: "Write three things before the session opens: your market bias (bullish/bearish/neutral today), your key levels, and your maximum trades. This takes 5 minutes and provides the structure that prevents reactive trading.",
  },
  {
    mistake: "Trading during low-liquidity periods",
    psychology: "Boredom. Low-liquidity periods feel like lost time. The urge to participate creates trades in unfavorable conditions — wide spreads, erratic moves, poor fill quality.",
    fix: "Define your trading window specifically. If you trade the London open and New York open, close the platform during the lunch lull. Make the temptation window inaccessible rather than relying on discipline to resist it.",
  },
  {
    mistake: "Averaging down on losing positions",
    psychology: "Loss aversion plus sunk cost fallacy. Adding to a losing position feels like 'getting a better price' but is actually the brain trying to avoid realizing a loss. The bigger position makes the loss larger, not smaller.",
    fix: "One simple rule: you may never add to a losing position. Define this as an absolute rule, not a guideline. The one time averaging down 'works' reinforces the behavior for the ten times it doesn't.",
  },
  {
    mistake: "Moving stops to avoid being stopped out",
    psychology: "Same mechanism as above — the physical pain of loss aversion makes accepting the stop feel unbearable. The brain invents reasons why the trade will turn around.",
    fix: "The stop is placed at entry, placed with intention, and not moved against the position under any circumstances. If you move stops, you are managing emotions rather than managing risk.",
  },
  {
    mistake: "Trading after achieving the daily profit target",
    psychology: "House money effect — once you've hit your target, the remaining gains feel like 'free money' and you take more risk. Wins above the target feel less real. The result: giving back gains through post-target overtrading.",
    fix: "The daily profit target is also a stop point. Hitting it means stopping. Not stopping means the target doesn't protect your gains — it just sets a point where you start gambling.",
  },
  {
    mistake: "Increasing size after losses",
    psychology: "Gambler's fallacy plus desperation. The belief that a winning trade is 'due' after losses, combined with urgency to recover, produces dramatically oversized trades in the worst conditions.",
    fix: "Size is fixed or reduces after losses, never increases. If you have a rule that after two consecutive losses your size drops by 50%, the worst session you can have is a contained drawdown rather than an account-threatening one.",
  },
  {
    mistake: "Ignoring transaction costs",
    psychology: "Optimism bias — traders consistently underestimate costs and overestimate edge. A strategy that works on charts has to work after spread, commission, and slippage on every single trade.",
    fix: "Run your last 50 trades through a simple calculation: actual P&L net of all costs divided by number of trades. If this number isn't positive, or barely positive, cost reduction is more urgent than strategy refinement.",
  },
  {
    mistake: "Trading on inadequate sleep",
    psychology: "Not a judgment error but a physiological one. Sleep deprivation measurably impairs prefrontal cortex function — the region responsible for impulse control and rule adherence. You literally cannot trade as well on poor sleep.",
    fix: "Sleep quality is a trading variable, not a lifestyle preference. Track it. Know your threshold. Traders who log sleep as part of their pre-session check-in and correlate it with P&L discover, usually within 30 days, that the correlation is significant and the fix is straightforward.",
  },
];

export default function DayTradingMistakes() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--red)", background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 6, padding: "3px 10px" }}>BEHAVIOR</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 8 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            The 8 Most Common Day Trading Mistakes (And the Psychology Behind Each)
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            Most trading mistake lists tell you what to avoid. This one tells you why you keep making the same mistakes despite knowing what they are — and what actually fixes each one.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>Understanding a mistake intellectually and stopping it behaviorally are different processes. You&apos;ve known for years that you shouldn&apos;t revenge trade. You still do it. That&apos;s not a knowledge problem — it&apos;s a behavioral architecture problem. The fix for each mistake below addresses the mechanism, not just the symptom.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, margin: "32px 0" }}>
            {MISTAKES.map((m, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{m.mistake}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 40 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>WHY IT HAPPENS</div>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{m.psychology}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--green)", marginBottom: 4 }}>THE FIX</div>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{m.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>See Which Mistakes Appear in Your Data</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind&apos;s AI coach detects these specific behavioral patterns in your trading data. Revenge trading, overtrading, post-target overstaying — they all leave measurable signatures. See them before your next session.</p>
            <Link href="/register" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}