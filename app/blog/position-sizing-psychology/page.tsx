import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Position Sizing and Fear: Why Scared Money Never Wins — TradeMind",
  description: "The size of your position changes how you trade it. Too large, and fear drives every decision. Here's the psychology of position sizing and how to find your optimal risk threshold.",
  openGraph: {
    title: "Position Sizing and Fear: Why Scared Money Never Wins",
    description: "The size of your position changes how you trade it. Too large, and fear drives every decision.",
    url: "https://trademindedge.com/blog/position-sizing-psychology",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/position-sizing-psychology" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Position Sizing and Fear: Why Scared Money Never Wins",
  url: "https://trademindedge.com/blog/position-sizing-psychology",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

export default function PositionSizingPsychology() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 6, padding: "3px 10px" }}>RISK</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 7 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Position Sizing and Fear: Why Scared Money Never Wins
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            A trader who knows their setup inside out, with perfect discipline and clear criteria, will still trade poorly if their position size triggers fear. Size is not just a risk variable — it&apos;s a psychological variable.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>The phrase &quot;scared money never wins&quot; is usually attributed to poker, but it describes trading perfectly. When a position is too large relative to a trader&apos;s emotional tolerance, it doesn&apos;t just increase the financial risk — it changes the mechanics of every decision made while the position is open.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>How Oversized Positions Corrupt Decisions</h2>

          <p>When a trade is sized at a level that causes stress — typically when the potential loss feels significant relative to the trader&apos;s emotional baseline — several behavioral changes occur:</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "24px 0 32px" }}>
            {[
              { effect: "Early exits on winners", cause: "Fear of giving back the gain overrides the trading plan. The target is still 30 pips away but you close at 12 because the stress of being in the trade is too high. You systematically cut your wins short — the single most damaging habit in trading." },
              { effect: "Held losers past the stop", cause: "The potential loss is too painful to realize. You move the stop, widen it, tell yourself it will come back. The actual loss ends up larger than it would have been with a properly-respected stop." },
              { effect: "Obsessive monitoring", cause: "You refresh the chart every 30 seconds. You read news. You check sentiment indicators. You are doing this because you need to feel in control — but it achieves the opposite, often causing you to interfere with valid setups." },
              { effect: "Second-guessing entries", cause: "In the seconds after entry, you immediately doubt the trade. The move against you feels disproportionately significant because the financial stakes are elevated. You exit the trade before it has time to develop." },
            ].map((item, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{item.effect}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{item.cause}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>Finding Your Emotional Tolerance Threshold</h2>

          <p>Every trader has an emotional tolerance threshold — a maximum dollar loss per trade above which fear begins to dominate decision-making. The exact number is different for each trader and changes as the account grows and confidence builds. The key is to identify it accurately, not aspirationally.</p>

          <p>A practical test: size a trade at 1% risk and monitor your emotional state throughout the trade. Do you feel calm? Can you watch the price move against you without urgency to act? If yes, that&apos;s within your tolerance. Now try 2%. Then 0.5%. The level where you first start to feel compelled to exit the trade before your stop — or where you find yourself constantly checking the position — is your threshold.</p>

          <p>Trade below that threshold. Not at it. Below it. You need some buffer because your emotional tolerance is lower on your bad days than on your good ones — and on bad days, you still need to trade at a size that doesn&apos;t trigger fear responses.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Mental State Multiplier</h2>

          <p>Your emotional tolerance is not fixed. It varies with your mental state. On a day with a high check-in score — well-rested, calm, sharp — you might trade 1% risk and feel completely composed. On a day with a low score — poor sleep, external stressors, recent losses — that same 1% trade might feel overwhelming. This is why static position sizing rules are incomplete without a dynamic mental state component.</p>

          <p>Traders who scale their position size to their mental state — full size on high-score days, reduced size on medium-score days, no trading on low-score days — show significantly better risk-adjusted returns than those with fixed sizing regardless of state. The reduction in bad-day losses more than compensates for the reduction in good-day exposure.</p>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Dynamic Sizing Starts With Daily Awareness</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind&apos;s daily check-in gives you a score each morning. Many traders use it to set their session&apos;s position size: full size above 70, half size 45–70, no trading below 45. Simple, data-driven, effective.</p>
            <Link href="/register" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}