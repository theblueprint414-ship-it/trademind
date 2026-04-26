import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Actually Measure Your Trading Performance (Beyond Win Rate) — TradeMind",
  description: "Win rate is the most commonly cited trading metric and one of the least useful in isolation. Here are the 7 metrics that actually tell you whether your trading is improving.",
  openGraph: {
    title: "How to Actually Measure Your Trading Performance (Beyond Win Rate)",
    description: "Win rate is one of the least useful trading metrics in isolation. Here are the 7 that actually matter.",
    url: "https://trademindedge.com/blog/measure-trading-performance",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/measure-trading-performance" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Actually Measure Your Trading Performance (Beyond Win Rate)",
  url: "https://trademindedge.com/blog/measure-trading-performance",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

const METRICS = [
  { name: "Expectancy per trade", formula: "(Win rate × Avg win) − (Loss rate × Avg loss)", why: "This is the only number that tells you if your strategy has edge. A 40% win rate with a 2:1 reward-to-risk ratio has higher expectancy than a 60% win rate with a 0.5:1 ratio. Positive expectancy is the prerequisite for everything else." },
  { name: "Plan adherence rate", formula: "Trades within criteria ÷ Total trades", why: "If your backtested strategy has 55% win rate but your actual trades only follow criteria 70% of the time, your live win rate will be lower. This metric reveals the gap between your strategy's theoretical edge and your actual execution." },
  { name: "Win rate by mental state", formula: "W% on high-score days vs low-score days", why: "This is where most performance improvement is hiding. Traders who track this typically find a 15-25% win rate differential between their best and worst mental state sessions. Knowing this threshold tells you when to trade and when to wait." },
  { name: "Avg win / Avg loss ratio (R:R realized)", formula: "Average winning trade ÷ Average losing trade", why: "Your intended R:R is what you planned. Your realized R:R is what happened after emotional exits and held losers. A strategy with 1:2 intended R:R but 1:1.1 realized R:R has had its edge mostly destroyed by execution behavior." },
  { name: "Best-to-average day ratio", formula: "Top 10% of days P&L ÷ Average day P&L", why: "A very high ratio (e.g., 5x) means your P&L is dominated by a small number of exceptional days. This creates significant fragility — miss those days and you're flat or negative for the month." },
  { name: "Days in drawdown vs recovery", formula: "Sessions spent recovering ÷ Total sessions", why: "If you spend 40% of your sessions recovering from the previous 10% of sessions, the drawdown pattern is inefficient. Identifying what causes your drawdowns specifically allows you to address them rather than just waiting them out." },
  { name: "Rule violation cost", formula: "P&L on outside-plan trades (should be negative)", why: "Track every trade that violated a rule — late entry, oversized, held past stop, taken on a criteria miss. Sum their P&L over 60 days. This number is usually a significant negative figure that reveals the cost of execution inconsistency in dollars." },
];

export default function MeasureTradingPerformance() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)", background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 6, padding: "3px 10px" }}>ANALYTICS</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 7 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            How to Actually Measure Your Trading Performance (Beyond Win Rate)
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            &quot;My win rate is 65%&quot; tells you almost nothing about your trading. Whether that 65% is generating profits or losses depends entirely on 6 other variables that most traders don&apos;t track.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>A trader with a 65% win rate who cuts winners at 0.5R and holds losers to 1.5R is consistently losing money. A trader with a 40% win rate who lets winners run to 2.5R and cuts losers at 1R is consistently profitable. Win rate without context is meaningless — it might even be misleading, creating false confidence in a losing approach.</p>

          <p>Here are the 7 metrics that actually reveal whether your trading is working:</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, margin: "32px 0" }}>
            {METRICS.map((m, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{m.name}</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--blue)", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.15)", borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>{m.formula}</div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>{m.why}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Hierarchy of These Metrics</h2>

          <p>Not all metrics are equally urgent. Prioritize in this order: (1) Is expectancy positive? If not, nothing else matters — the strategy needs work. (2) Is plan adherence above 85%? If not, fix execution before strategy. (3) What is the mental state win rate differential? This identifies your highest-leverage behavioral change. The rest are optimization metrics once the first three are healthy.</p>

          <p>Traders who track these metrics for 60+ sessions gain a level of self-knowledge about their trading that is simply unavailable from P&L alone. You can see exactly where your edge is being created and exactly where it&apos;s being destroyed. That precision is the foundation of consistent improvement.</p>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>All 7 Metrics, Automatically Calculated</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind calculates expectancy, realized R:R, mental state win rate differentials, and rule violation costs from your trade journal and check-in data. No spreadsheet required.</p>
            <Link href="/register" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}