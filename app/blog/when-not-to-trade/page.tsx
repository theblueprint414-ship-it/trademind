import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "When Not to Trade: The Most Profitable Decision You Can Make — TradeMind",
  description: "The decision to not trade on certain days is one of the highest-return decisions a trader can make. Here's how to identify those days before you sit down at the charts.",
  openGraph: {
    title: "When Not to Trade: The Most Profitable Decision You Can Make",
    description: "The decision to not trade on certain days is one of the highest-return decisions a trader can make.",
    url: "https://trademindedge.com/blog/when-not-to-trade",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/when-not-to-trade" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "When Not to Trade: The Most Profitable Decision You Can Make",
  url: "https://trademindedge.com/blog/when-not-to-trade",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

export default function WhenNotToTrade() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)", background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 6, padding: "3px 10px" }}>STRATEGY</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 6 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            When Not to Trade: The Most Profitable Decision You Can Make
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            Every professional trader has a clear answer to this question: &quot;Under what conditions do you not trade?&quot; Most retail traders have never thought about it. That gap is expensive.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>Trading is unique among performance disciplines in that not performing is often the highest-performance action available. A surgeon who doesn&apos;t feel well postpones elective procedures. An athlete who is injured doesn&apos;t play. The performance risk of showing up compromised exceeds the benefit. This logic applies directly to trading — and most retail traders ignore it entirely.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Asymmetry of Bad Days</h2>

          <p>Trading P&L is not symmetric. Your best days don&apos;t offset your worst days — they offset your average days, and your worst days require extraordinary work to recover from. A trader who has one catastrophic session per month — one day where everything goes wrong and they lose 8% — needs to make approximately 8.7% in the remaining days just to break even. The math makes the occasional bad day the single most expensive event in a trader&apos;s month.</p>

          <p>Now: what are bad trading days characterized by? Almost always, some combination of poor mental state, elevated stress, fatigue, or emotional disturbance. These are predictable conditions. They can be identified in advance — not always, but often enough to prevent the worst sessions.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The No-Trade Conditions</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, margin: "24px 0 32px" }}>
            {[
              { trigger: "Mental state score below your threshold", detail: "If you track your morning mental state and have data showing that your win rate drops below 40% when your score is under 45, then a sub-45 day is a no-trade day. Not a lower-size day. Not a one-trade day. No trading. Your data tells you when your edge disappears." },
              { trigger: "Fewer than 6 hours of sleep", detail: "Walker's (2017) research on sleep deprivation shows that prefrontal cortex function — impulse control, rule adherence, risk assessment — is measurably impaired after fewer than 6 hours of sleep. This impairment is equivalent to being mildly intoxicated. You would not trade drunk. Same rule applies." },
              { trigger: "Within 24 hours of a significant personal stressor", detail: "Relationship conflict, major life news (positive or negative), financial stress outside of trading — these all elevate baseline cortisol and impair the calm, long-horizon thinking that trading requires. Give your nervous system 24 hours to return to baseline." },
              { trigger: "After two consecutive losing sessions", detail: "Not as punishment — as data. Two consecutive losing sessions often indicate either a degraded mental state (which makes a third losing session likely) or a market condition that doesn't favor your setup (which makes it worth waiting rather than persisting)." },
              { trigger: "Major unscheduled news events", detail: "Surprise central bank announcements, geopolitical events, unexpected data releases — these produce market conditions that invalidate most retail trading setups. The edge in your strategy was probably backtested in normal market conditions. Abnormal conditions require staying out." },
            ].map((item, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{item.trigger}</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{item.detail}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>What to Do on No-Trade Days</h2>

          <p>The biggest psychological barrier to taking no-trade days is the feeling of wasted opportunity. The market is open. Things are moving. You&apos;re a trader — shouldn&apos;t you be trading?</p>

          <p>Reframe it: a no-trade day is not a day you didn&apos;t trade. It&apos;s a day you made a high-quality decision to preserve capital and decision capacity for tomorrow. You can still watch the market, note setups you would have taken (mark them in your journal), and analyze what happened without a position on. This builds pattern recognition without risk.</p>

          <p>Over a year, a trader who eliminates their 20 worst sessions — by identifying and skipping them through mental state awareness — will almost always have a better P&L than a trader who pushed through all 250 trading days. The sessions they skipped cost zero. The ones they should have skipped cost real money.</p>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Know Your No-Trade Conditions</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind calculates your actual P&L by mental state score and tells you where your trading edge disappears. It makes your no-trade threshold a data-driven number, not a guess.</p>
            <Link href="/register" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}