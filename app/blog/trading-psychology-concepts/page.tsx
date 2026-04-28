import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "5 Trading Psychology Concepts That Actually Move the Needle — TradeMind",
  description: "Most trading psychology advice is vague or impractical. These 5 concepts from behavioral research have specific, measurable applications to trading performance.",
  openGraph: {
    title: "5 Trading Psychology Concepts That Actually Move the Needle",
    description: "These 5 concepts from behavioral research have specific, measurable applications to trading performance.",
    url: "https://trademindedge.com/blog/trading-psychology-concepts",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/trading-psychology-concepts" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "5 Trading Psychology Concepts That Actually Move the Needle",
  url: "https://trademindedge.com/blog/trading-psychology-concepts",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

const CONCEPTS = [
  {
    name: "Loss Aversion (Kahneman & Tversky, 1979)",
    application: "Losses feel ~2x more painful than equivalent gains feel good. The practical implication: your trading rules will be violated most often when you're in a losing position. Design systems that don't rely on your willingness to take losses under pressure. Hard stops, maximum daily loss limits, and position sizes that make losses psychologically manageable are all direct countermeasures to loss aversion.",
    keyNumber: "2x",
    keyLabel: "how much more painful losses feel vs equivalent gains",
  },
  {
    name: "Decision Fatigue (Baumeister, 2000s)",
    application: "The quality of decisions degrades with the quantity of decisions made in a session. Trade 1 has your full cognitive resources. Trade 8 has your depleted ones. The practical implication: take your highest-quality setups early in the session. Impose a daily trade limit. Recognize that your judgment at trade 10 is measurably worse than at trade 2 — and act accordingly.",
    keyNumber: "~30%",
    keyLabel: "typical decision quality degradation over a long session",
  },
  {
    name: "Implementation Intentions (Gollwitzer, 1999)",
    application: "Specific if-then plans ('If my score is below 45, then I will not trade') are 2-3x more likely to be executed than general intentions ('I should be more disciplined'). The practical implication: every rule you want to follow should be written as an if-then statement, defined in advance, with a specific trigger. Vague commitments fail under pressure. Specific triggers activate automatically.",
    keyNumber: "2–3x",
    keyLabel: "higher execution rate for if-then plans vs general intentions",
  },
  {
    name: "The Peak-End Rule (Kahneman, 1999)",
    application: "Memory of experiences is dominated by the most intense moment and the final moment — not the average. A session with a significant early loss but a small recovery at the end is remembered as better than a session that was mildly positive throughout. For traders, this means: how you end the session shapes how you remember it and approach the next one. End on your terms — not by chasing recovery.",
    keyNumber: "End",
    keyLabel: "the session experience that most shapes your next-day approach",
  },
  {
    name: "The Somatic Marker Hypothesis (Damasio, 1994)",
    application: "The brain uses physical sensations — an uncomfortable feeling, a sense of dread, a pull of excitement — as rapid evaluative signals for decisions. These somatic markers are neither always wrong nor always right. In trading, learning to recognize and calibrate these signals is useful: the physical excitement of a 'great setup' can signal both a genuine edge and FOMO-driven overconfidence. Training yourself to notice the physical experience of good decisions versus emotional ones is a concrete skill.",
    keyNumber: "Physical",
    keyLabel: "body signals that precede both good and emotional trading decisions",
  },
];

export default function TradingPsychologyConcepts() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--amber, #FFB020)", background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: 6, padding: "3px 10px" }}>SCIENCE</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 8 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            5 Trading Psychology Concepts That Actually Move the Needle
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            The behavioral research behind trading performance is substantial. Most of it never reaches traders in a usable form. Here are 5 concepts with direct, concrete applications to your next trading session.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, margin: "0 0 40px" }}>
            {CONCEPTS.map((c, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 16, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{c.name}</div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--blue)", lineHeight: 1 }}>{c.keyNumber}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", maxWidth: 140, lineHeight: 1.4, textAlign: "right" }}>{c.keyLabel}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, margin: 0 }}>{c.application}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>From Theory to Practice</h2>

          <p>Each of these five concepts points to a specific behavioral change. Loss aversion → hard automated stops. Decision fatigue → daily trade limits. Implementation intentions → if-then rules written before the session. Peak-end rule → ending sessions at pre-defined stopping points. Somatic markers → body-state journaling and awareness training.</p>

          <p>None of these require reading academic papers. They require building systems that account for how the brain actually works under financial pressure — rather than how we wish it would work. That gap, between the rational decision-maker we imagine ourselves to be and the stress-responsive organism we actually are, is where performance lives.</p>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Apply the Research to Your Trading</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind is built on these research foundations: implementation intentions via pre-session check-ins, decision fatigue tracking via trade frequency analysis, and loss aversion countermeasures via behavioral pattern detection.</p>
            <Link href="/login?callbackUrl=/checkin" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}