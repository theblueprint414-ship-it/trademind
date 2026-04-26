import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Real Trading Discipline Looks Like (And How to Build It) — TradeMind",
  description: "Trading discipline isn't willpower. It's the architecture of decisions made in advance that makes the right action the default action. Here's how it actually works.",
  openGraph: {
    title: "What Real Trading Discipline Looks Like (And How to Build It)",
    description: "Trading discipline isn't willpower. It's the architecture of decisions made in advance. Here's how it actually works.",
    url: "https://trademindedge.com/blog/trading-discipline",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/trading-discipline" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What Real Trading Discipline Looks Like (And How to Build It)",
  url: "https://trademindedge.com/blog/trading-discipline",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

export default function TradingDiscipline() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 6, padding: "3px 10px" }}>DISCIPLINE</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 7 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            What Real Trading Discipline Looks Like (And How to Build It)
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            &quot;Just be more disciplined&quot; is the least useful trading advice in existence. Discipline is not a character trait you either have or don&apos;t. It&apos;s an architecture — and you build it deliberately, one system at a time.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>The willpower model of trading discipline says: if you just try harder, want it more, care more about the rules, you will follow them. This model is demonstrably false. Every trader who has ever blown a rule knew the rule. Many of them genuinely tried to follow it. They failed not because they lacked effort but because they were relying on willpower as a substitute for system design.</p>

          <p>The systems model of trading discipline says: design your environment and your decision process so that the right action is the default action, and the wrong action requires deliberate effort to take.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Four Components of Trading Discipline</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, margin: "24px 0 32px" }}>
            {[
              {
                component: "1. Pre-committed rules",
                description: "Discipline is not about what you decide in the moment — it&apos;s about the quality of the decisions you make before the moment. Position size should be decided before the session opens, not while watching a move develop. Daily loss limit should be set in the broker, not held in memory. Stop placement should happen at entry, not managed during the trade. Pre-commitment removes in-the-moment decisions at exactly the times when they&apos;re worst.",
              },
              {
                component: "2. Environmental design",
                description: "Your trading environment should make rule violations structurally difficult. If you shouldn&apos;t trade more than 3 times per day, remove the ability to place a 4th trade automatically — through a broker limit, a platform alert, or a physical rule that requires you to walk away from the screen. If you shouldn&apos;t trade on low-score days, schedule a recurring alarm that asks 'did you check in today?' before you can open the platform.",
              },
              {
                component: "3. Pattern recognition of your own behavior",
                description: "Discipline improves dramatically when you can see the consequences of indiscipline with precision. Traders who can say 'I lose an average of $340 on the days I overtrade versus $85 on days I trade at normal frequency' have a concrete financial argument for discipline that abstract willpower doesn&apos;t produce. Data makes discipline rational rather than aspirational.",
              },
              {
                component: "4. Recovery protocols",
                description: "Every trader will occasionally violate their rules. Real discipline includes a recovery protocol: what do you do after a rule violation to prevent it from cascading? Stop trading for the session. Log the violation and its cause. Re-commit to the rule tomorrow. The goal is not zero violations — it&apos;s that each violation teaches something and is not followed by a second one in the same session.",
              },
            ].map((item, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{item.component}</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>{item.description}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The Mental State Factor</h2>

          <p>Discipline is not uniformly available to you — it fluctuates with your mental state. A well-rested, calm, mentally fresh trader has full access to their prefrontal cortex and therefore full access to their discipline capacity. A tired, stressed, emotionally activated trader has impaired prefrontal cortex function and therefore impaired discipline capacity.</p>

          <p>This means that mental state management is, literally, discipline management. Getting enough sleep is not a wellness habit — it is a trading performance variable. Managing external stressors, maintaining physical routines, completing the pre-session check-in — these directly determine how much discipline is available to you when you sit down to trade. Build the habit, and discipline becomes less effortful over time as the supporting conditions become consistent.</p>

          <div style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)", borderRadius: 12, padding: "20px 24px", margin: "32px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)", marginBottom: 10 }}>The Discipline Audit</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>Every week, answer three questions: (1) How many trades violated my criteria this week? (2) On which days did I violate rules most — and what was my mental state score on those days? (3) What is the one system change that would make the most-violated rule structurally harder to break? The answers, repeated weekly, are the actual discipline-building process.</p>
          </div>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Build Your Discipline Architecture</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind gives you the Playbook (your pre-committed rules), the daily check-in (your mental state gate), and the AI coach (your weekly discipline audit). The three components of a real discipline system — not willpower.</p>
            <Link href="/register" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}