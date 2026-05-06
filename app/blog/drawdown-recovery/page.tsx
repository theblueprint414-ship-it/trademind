import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Drawdown Recovery: How to Come Back Without Making It Worse — TradeMind",
  description: "How you respond to a drawdown determines whether it becomes a temporary setback or a blown account. Here's the psychological framework elite traders use to recover correctly.",
  openGraph: {
    title: "Drawdown Recovery: How to Come Back Without Making It Worse",
    description: "How you respond to a drawdown determines whether it becomes a temporary setback or a blown account.",
    url: "https://trademindedge.com/blog/drawdown-recovery",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/drawdown-recovery" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Drawdown Recovery: How to Come Back Without Making It Worse",
  url: "https://trademindedge.com/blog/drawdown-recovery",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

export default function DrawdownRecovery() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--red)", background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 6, padding: "3px 10px" }}>RECOVERY</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 7 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Drawdown Recovery: How to Come Back Without Making It Worse
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            Every trader hits a drawdown. The difference between traders who survive them and traders who don&apos;t has almost nothing to do with the drawdown itself — and everything to do with the response.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>A 10% drawdown requires an 11.1% gain to recover. A 20% drawdown requires 25%. A 50% drawdown requires 100%. This is not a motivational statement — it is arithmetic. The deeper a drawdown goes, the harder recovery becomes, not just mathematically but psychologically.</p>

          <p>Most traders in drawdown do exactly the wrong things. They size up to recover faster. They take more trades to find more opportunities. They relax their criteria because they&apos;re frustrated. Each of these behaviors deepens the drawdown they&apos;re trying to escape.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>Phase 1: Stop the Bleeding</h2>

          <p>The first priority in any drawdown is not recovery — it is stabilization. Before you can start climbing back, you must stop going deeper. This means one thing: size reduction. Not a small adjustment, a significant one. If you normally risk 1% per trade, risk 0.25%. You are buying time and psychological safety, not returns.</p>

          <p>This is counterintuitive. With smaller size, recovery takes longer. But with smaller size, a continued losing streak does not compound the damage. You are preventing the spiral. Once you string together five to ten profitable trades at reduced size — evidence that your strategy is working again — you can scale back up incrementally.</p>

          <div style={{ background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.15)", borderRadius: 12, padding: "20px 24px", margin: "32px 0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", letterSpacing: "0.06em", marginBottom: 12 }}>WHAT NOT TO DO IN A DRAWDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Size up to recover faster — this amplifies losses, not gains",
                "Trade more frequently to find winners — overtrading in a losing state compounds the drawdown",
                "Lower your criteria — you need higher-quality entries, not more entries",
                "Stop journaling — the data you need most is the data from your worst period",
                "Set a 'recovery target' — arbitrary goals create deadline pressure that degrades decisions",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--text-dim)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M3 3l8 8M11 3l-8 8" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>Phase 2: Diagnose Before You Trade</h2>

          <p>Every drawdown has a cause. Sometimes it&apos;s variance — a strategy that works 60% of the time will naturally produce losing streaks. Sometimes it&apos;s execution — you&apos;ve been breaking rules, sizing incorrectly, entering at bad prices. Sometimes it&apos;s the market — your setup doesn&apos;t work in the current regime. These require completely different responses.</p>

          <p>Take a minimum of one full trading day off the market. Review your last 20 trades in detail. Answer three questions: (1) Were these trades within my strategy criteria, or were they outside? (2) Is my mental state data showing a degradation that correlates with the drawdown start? (3) Has the market structure changed in a way that affects my setup?</p>

          <p>The answers tell you whether to fix behavior, fix mental state, or wait for market conditions to return. Trading through a drawdown without this diagnosis is guesswork.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>Phase 3: Rebuild Confidence With Evidence</h2>

          <p>Confidence in trading is not a feeling — it is a statistical belief. "I believe my strategy works because it has worked in these specific conditions with these specific criteria." A drawdown erodes that statistical belief. The only way to rebuild it is with evidence: clean, criteria-meeting trades that confirm the strategy still has edge.</p>

          <p>At reduced size, with high criteria, take your next ten trades. Not to make money — to collect evidence. If seven of ten are profitable, you have confirmation the strategy is intact and your mental state has stabilized. You can begin scaling. If fewer than five of ten are profitable, you have a strategy problem, not a mental state problem, and the diagnosis needs to go deeper.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Mental State Factor</h2>

          <p>Data consistently shows that drawdowns correlate with low mental state scores — not always because the mental state caused the drawdown, but because they reinforce each other. A bad trading week leads to a low mental state score, which leads to worse trading decisions, which deepens the drawdown. The cycle is identifiable and breakable — but only if you&apos;re tracking mental state alongside P&L.</p>

          <p>The traders who recover fastest from drawdowns are usually the ones who recognize the psychological component earliest and address it directly: better sleep, reduced screen time, physical exercise, perspective. The market will still be there when you&apos;re ready to trade it well.</p>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Spot the Drawdown Pattern Before It Deepens</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind correlates your mental state with your P&L in real time. When your score drops and your loss rate rises, the pattern is visible before it becomes catastrophic. Your AI coach alerts you when behavioral patterns associated with drawdowns appear.</p>
            <Link href="/login?callbackUrl=/checkin" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}