import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why 73% of Funded Traders Fail (It's Not Your Strategy) — TradeMind",
  description:
    "The real reason most prop firm traders blow their accounts has nothing to do with their edge, their setup, or their strategy. It's mental state. Here's the data.",
  openGraph: {
    title: "Why 73% of Funded Traders Fail (It's Not Your Strategy)",
    description:
      "The real reason most prop firm traders blow their accounts is mental state, not strategy. Here's the data — and what to do about it.",
    url: "https://trademindedge.com/blog/why-funded-traders-fail",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/why-funded-traders-fail" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why 73% of Funded Traders Fail (It's Not Your Strategy)",
  description:
    "The real reason most prop firm traders blow their accounts has nothing to do with their edge. It's mental state.",
  url: "https://trademindedge.com/blog/why-funded-traders-fail",
  datePublished: "2025-01-15",
  dateModified: "2025-04-21",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: {
    "@type": "Organization",
    name: "TradeMind",
    url: "https://trademindedge.com",
    logo: { "@type": "ImageObject", url: "https://trademindedge.com/logo.svg" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://trademindedge.com/blog/why-funded-traders-fail" },
};

export default function WhyFundedTradersFailPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* Nav */}
        <nav style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,11,20,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" height="22" style={{ display: "block" }} />
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/for-ftmo-traders" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>FTMO Traders</Link>
            <Link href="/dashboard" style={{ background: "var(--blue)", color: "white", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Try Free</Link>
          </div>
        </nav>

        <article style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 100px" }}>

          {/* Category + Date */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 6, padding: "3px 10px" }}>TRADING PSYCHOLOGY</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2025 · 8 min read</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Why 73% of Funded Traders Fail<br />
            <span style={{ color: "var(--blue)" }}>(It&apos;s Not Your Strategy)</span>
          </h1>

          {/* Lead */}
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 40, borderLeft: "3px solid var(--blue)", paddingLeft: 20 }}>
            You spent months backtesting. You passed the evaluation. You know your setup. And then you blew the account on a Tuesday morning after a bad night&apos;s sleep. The strategy wasn&apos;t the problem.
          </p>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }} />

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.01em" }}>The statistic everyone ignores</h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              Industry data consistently shows that 70–80% of prop firm accounts fail within the first 90 days. The conversation usually goes straight to strategy: wrong timeframe, overfit backtest, news trading, over-leveraging.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              But here&apos;s what nobody talks about: when you ask those same traders <em>on which specific days</em> they took their worst losses, the answer is almost always the same. A bad sleep. A fight with a partner. A streak of losses the day before. A stressful news cycle. A morning where they were already irritable before the market opened.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8 }}>
              It wasn&apos;t random. The losses clustered around specific mental states. And the strategy worked fine on every other day.
            </p>
          </section>

          {/* Pull quote */}
          <blockquote style={{ margin: "0 0 48px", padding: "28px 32px", background: "rgba(255,59,92,0.05)", border: "1px solid rgba(255,59,92,0.2)", borderLeft: "4px solid var(--red)", borderRadius: "0 12px 12px 0" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.6, margin: "0 0 8px" }}>
              &ldquo;I knew my rules. I just didn&apos;t know I was in the wrong mental state to follow them.&rdquo;
            </p>
            <cite style={{ fontSize: 13, color: "var(--text-muted)" }}>— Common pattern across hundreds of trader post-mortems</cite>
          </blockquote>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.01em" }}>The neuroscience of bad trading days</h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              Under stress, the brain shifts decision-making from the prefrontal cortex (rational planning, rule-following) to the amygdala (threat response, impulsive action). This isn&apos;t a character flaw — it&apos;s biology.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              Sleep deprivation compounds this significantly. Even one night of poor sleep measurably reduces activity in the prefrontal cortex. Combined with the emotional volatility that comes from watching money move in real time, the result is predictable: rules break, position sizes grow, revenge trades happen.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8 }}>
              The trader who loses their funded account on a stressed, sleep-deprived Tuesday isn&apos;t a bad trader. They&apos;re a normal human being who didn&apos;t know they were compromised before they opened a chart.
            </p>
          </section>

          {/* Data visual card */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 28px", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 24 }}>WHAT THE DATA SHOWS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {[
                { num: "73%", label: "of funded accounts fail in first 90 days", color: "var(--red)" },
                { num: "2–3×", label: "higher loss rate on sleep-deprived trading days", color: "var(--amber)" },
                { num: "61%", label: "of traders identify emotional state as top loss factor", color: "var(--blue)" },
              ].map((s) => (
                <div key={s.num} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.01em" }}>The two failure modes</h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 20 }}>
              Funded traders typically blow accounts in one of two ways:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              <div style={{ background: "rgba(255,59,92,0.05)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--red)", marginBottom: 8 }}>Mode 1: The Single-Day Breach</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
                  One catastrophic session wipes out the daily drawdown limit. Almost always follows a personal stressor — fight, bad news, distraction. The trader was never in the right state to trade that day, but they opened their platform anyway because "the market was there."
                </p>
              </div>
              <div style={{ background: "rgba(255,176,32,0.05)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--amber)", marginBottom: 8 }}>Mode 2: The Slow Bleed</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
                  A series of medium-sized losses over 2–3 weeks of suboptimal mental states. No single day blows the account, but the cumulative damage from trading while compromised exhausts the drawdown buffer. By the time the trader recognizes the pattern, it&apos;s too late.
                </p>
              </div>
            </div>

            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8 }}>
              Both modes have the same root cause: the trader didn&apos;t have a reliable, daily measurement of their mental state before committing capital.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.01em" }}>What professional traders do differently</h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              Institutional traders at prop desks and hedge funds operate with structure that retail traders rarely replicate: mandatory pre-market rituals, risk committee oversight, mandatory days off after major losses, position size reduction rules tied to emotional state.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              They don&apos;t trust themselves to "just know" if they&apos;re ready to trade. They have systems that measure it.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8 }}>
              The retail funded trader has none of these guardrails unless they build them themselves. The most important one — by far — is answering a simple question before market open: <em>What is my mental state today, on a scale that informs whether I should trade?</em>
            </p>
          </section>

          {/* Steps */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, letterSpacing: "-0.01em" }}>A simple framework: GO / CAUTION / NO-TRADE</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "GO (70–100)", color: "var(--green)", border: "rgba(0,232,122,0.25)", bg: "rgba(0,232,122,0.04)", desc: "Sleep was good, emotional baseline is stable, focus is sharp, confidence is grounded. Trade your full plan at your normal size." },
                { label: "CAUTION (45–69)", color: "var(--amber)", border: "rgba(255,176,32,0.25)", bg: "rgba(255,176,32,0.04)", desc: "Something is slightly off — mild fatigue, mild stress, minor distraction. Trade smaller, use tighter stops, only take A+ setups. Limit yourself to one trade." },
                { label: "NO-TRADE (0–44)", color: "var(--red)", border: "rgba(255,59,92,0.25)", bg: "rgba(255,59,92,0.04)", desc: "Your edge is compromised. Sitting out costs nothing. Trading on this day, based on the data, is expected-value negative. Close the platform. Come back tomorrow." },
              ].map((v) => (
                <div key={v.label} style={{ padding: "18px 20px", borderRadius: 12, background: v.bg, border: `1px solid ${v.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: v.color, marginBottom: 6, letterSpacing: "0.02em" }}>{v.label}</div>
                  <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.01em" }}>The compounding effect of NO-TRADE days</h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              Here&apos;s the counterintuitive truth: the trader who sits out 2–3 days per month on low-score days will almost always outperform the trader who trades every day.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              This isn&apos;t about missing opportunities. It&apos;s about asymmetry. On a bad mental day, a trader doesn&apos;t just execute slightly worse — they often execute catastrophically worse. Revenge trading, oversizing, holding losers, cutting winners early. The loss on a bad day can erase a week of gains.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8 }}>
              Skipping that day costs zero in opportunity (the market will be there tomorrow). Missing it protects everything you&apos;ve built. That&apos;s not a soft psychological insight — it&apos;s expected-value math.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.01em" }}>How to actually measure your mental state</h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              Self-assessment is notoriously unreliable when you&apos;re in a compromised state. Research on metacognition consistently shows that people are worst at evaluating their own impairment precisely when they are most impaired.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              The solution is a structured, fixed set of questions evaluated before the market opens — questions that cover the factors most predictive of trading performance: sleep quality, emotional baseline, stress level, focus, and confidence. The scoring should be automatic, producing a number rather than a feeling.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8 }}>
              When you have a number, you can set a rule: below 45, I don&apos;t trade. That rule is easier to follow than "do I feel okay today?" because it removes the subjective judgment at the exact moment judgment is least reliable.
            </p>
          </section>

          {/* CTA card */}
          <div style={{ background: "linear-gradient(135deg,rgba(94,106,210,0.08),rgba(94,106,210,0.03))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20, padding: "40px 32px", marginBottom: 48, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Your next funded account starts here
            </div>
            <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
              TradeMind gives you a daily GO / CAUTION / NO-TRADE score in 60 seconds. Free forever. 8 questions. The last thing you open before the market, and the first line of defense for your drawdown limit.
            </p>
            <Link href="/dashboard" style={{ display: "inline-block", background: "var(--blue)", color: "white", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontSize: 16, fontWeight: 700 }}>
              Start Your First Check-in — Free →
            </Link>
          </div>

          {/* Related links */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>RELATED</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href="/for-ftmo-traders" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "var(--text-dim)", fontSize: 14, padding: "12px 16px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", transition: "border-color 0.15s" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                TradeMind for FTMO Traders — Protecting Your Funded Account
              </Link>
              <Link href="/vs-tradezella" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "var(--text-dim)", fontSize: 14, padding: "12px 16px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", transition: "border-color 0.15s" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                TradeMind vs TradeZella — What&apos;s the Difference?
              </Link>
            </div>
          </div>

        </article>

        <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
            © 2025 TradeMind ·{" "}
            <Link href="/privacy" style={{ color: "var(--blue)", textDecoration: "none" }}>Privacy</Link>{" "}·{" "}
            <Link href="/terms" style={{ color: "var(--blue)", textDecoration: "none" }}>Terms</Link>
          </p>
        </footer>
      </div>
    </>
  );
}