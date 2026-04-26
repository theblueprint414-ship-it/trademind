import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Consistency Beats Returns: The Math Every Serious Trader Needs to See — TradeMind",
  description: "A 5% average monthly return with high variance will destroy most traders. A 2% average with low variance builds wealth. Here's why consistency is the actual goal — and how to build it.",
  openGraph: {
    title: "Why Consistency Beats Returns: The Math Every Serious Trader Needs to See",
    description: "A 5% average monthly return with high variance will destroy most traders. Here's why consistency is the actual goal.",
    url: "https://trademindedge.com/blog/trading-consistency",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/trading-consistency" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why Consistency Beats Returns: The Math Every Serious Trader Needs to See",
  url: "https://trademindedge.com/blog/trading-consistency",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

export default function TradingConsistency() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)", background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 6, padding: "3px 10px" }}>PERFORMANCE</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 6 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Why Consistency Beats Returns: The Math Every Serious Trader Needs to See
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            Most traders optimize for maximum returns. The ones who last optimize for consistency. The math is so counterintuitive that most traders never fully believe it — until they see it in their own account.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>Consider two traders over 12 months.</p>

          <p>Trader A averages 5% per month but has huge variance: some months +20%, some months -15%. Trader B averages 3% per month but is remarkably consistent: the worst month is -2%, the best is +7%.</p>

          <p>At first glance, Trader A seems better. 5% average monthly return versus 3%. But the math doesn&apos;t work that way — and understanding why is one of the most important things you can learn about trading.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>Geometric Returns vs Arithmetic Averages</h2>

          <p>Returns compound geometrically, not arithmetically. A 20% gain followed by a 20% loss does not leave you flat — it leaves you down 4%. (1.2 × 0.8 = 0.96.) A 50% gain followed by a 50% loss leaves you down 25%. (1.5 × 0.5 = 0.75.) The average looks like 0%, but the actual result is a significant loss.</p>

          <div style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)", borderRadius: 12, padding: "20px 24px", margin: "32px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", marginBottom: 12 }}>THE MATH</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-dim)" }}>
              <div style={{ display: "flex", gap: 20 }}>
                <span style={{ fontWeight: 700, color: "var(--text)", minWidth: 80 }}>Trader A:</span>
                <span>12 months of 5% avg with ±15% variance → actual compound result: ~42% gain</span>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <span style={{ fontWeight: 700, color: "var(--text)", minWidth: 80 }}>Trader B:</span>
                <span>12 months of 3% avg with ±2% variance → actual compound result: ~43% gain</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-muted)" }}>Variance drag erases the arithmetic difference entirely. The consistent trader keeps more of what they make.</div>
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Psychological Cost of Inconsistency</h2>

          <p>Beyond the math, inconsistency has a psychological cost that rarely appears in backtests. A month with a -15% drawdown does not just cost 15% — it costs weeks of mental recovery, decision-making degradation during the drawdown, potential rule-breaking as you try to recover, and the compounding effect on position sizing psychology. Traders who experience large drawdowns frequently become more risk-averse at exactly the wrong times.</p>

          <p>Consistent traders, by contrast, spend less time and mental energy on recovery cycles. Their confidence is stable because their variance is stable. They can think about improving their strategy rather than surviving the month.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>What Consistency Actually Requires</h2>

          <p><strong style={{ color: "var(--text)" }}>Fixed risk per trade.</strong> Not "1% on small positions, 3% when I really like it." Fixed. 1% every time, regardless of conviction. High conviction is not a reliable predictor of high returns — it&apos;s a reliable predictor of emotional trading.</p>

          <p><strong style={{ color: "var(--text)" }}>Hard daily loss limits.</strong> The single biggest driver of inconsistency is the occasional catastrophic day — a day where you lose 5, 8, or 12% of your account. Hard daily loss limits, enforced by your broker or your own rules, prevent catastrophic days from existing.</p>

          <p><strong style={{ color: "var(--text)" }}>Trading only on high-quality mental state days.</strong> This sounds soft. The data is hard. Traders who skip sessions on their lowest mental state days reduce variance dramatically — with minimal impact on total P&L. The bad days cost more than the good days make up for. Skipping the worst 20% of your days improves both average returns and variance simultaneously.</p>

          <p><strong style={{ color: "var(--text)" }}>Criteria consistency over opportunity chasing.</strong> The temptation to adjust criteria for "obvious" setups is a variance driver. Your criteria exist because they have edge. Adjusting them because a move looks compelling introduces non-edge trades into the sample. The result, over time, is higher variance and lower true edge.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Institutional Perspective</h2>

          <p>Prop firms and hedge funds don&apos;t hire traders with the highest returns — they hire traders with the best Sharpe ratios. The Sharpe ratio measures return relative to variance. A trader with a 40% annual return and 30% volatility is less attractive than a trader with a 25% annual return and 10% volatility. The consistent trader is more scalable, more reliable, and less likely to blow up.</p>

          <p>Retail traders who internalize this shift in focus — from maximizing returns to maximizing consistency — consistently outperform those who don&apos;t. Not because they take less risk, but because they take <em>controlled</em> risk.</p>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Measure Your Consistency</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind&apos;s analytics show your win rate variance, day-of-week consistency, and how your performance changes by mental state. See exactly where your variance is coming from and which behavioral changes would reduce it most.</p>
            <Link href="/register" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}