import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "10 Rules for Passing and Keeping Your First Funded Account — TradeMind",
  description: "The funded account industry is built around a simple reality: most traders fail. Here are 10 rules — from traders who have passed multiple challenges — for passing and keeping yours.",
  openGraph: {
    title: "10 Rules for Passing and Keeping Your First Funded Account",
    description: "Most traders fail the funded account challenge. Here are 10 rules from traders who have passed multiple challenges.",
    url: "https://trademindedge.com/blog/prop-firm-tips",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/prop-firm-tips" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "10 Rules for Passing and Keeping Your First Funded Account",
  url: "https://trademindedge.com/blog/prop-firm-tips",
  datePublished: "2026-04-25",
  dateModified: "2026-04-25",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

const RULES = [
  { n: 1, rule: "Treat the challenge like a normal trading week, not a test", detail: "The moment you start thinking 'I need to perform for this challenge,' your decision quality degrades. Your only job is to execute your trading plan with the same criteria you'd use in any other week. The challenge account doesn't care about your feelings about it." },
  { n: 2, rule: "Calculate your daily loss limit buffer before session 1", detail: "If the firm's daily loss limit is 5%, your personal daily loss limit should be 3-4%. You need to stop trading before hitting the actual limit, not at it. Building this buffer means a bad day doesn't end the challenge — it ends your session." },
  { n: 3, rule: "Front-load your minimum trading days", detail: "Don't leave this until the final week. Minimum day requirements create pressure when you're counting down. Trade consistently from day one so you hit the requirement with days to spare." },
  { n: 4, rule: "Take smaller size than you think you need", detail: "The challenge creates psychological pressure. That pressure affects decisions. The solution is to reduce the financial stakes of each trade to a level where the pressure is manageable. Half your normal risk per trade for the first two weeks, then scale up once the routine is established." },
  { n: 5, rule: "Track your mental state every session", detail: "Challenge pressure affects mental state in predictable patterns: low on days after tough sessions, elevated after wins. Tracking it makes the pattern visible. On days when your score drops significantly, reduce size or sit out. Protecting the account on bad days is more important than making money on good ones." },
  { n: 6, rule: "Write your rules somewhere you see them before every session", detail: "The rules that get broken are the ones that live in your memory rather than on paper. Before every session: your max daily loss, your max trades, your position size, your criteria. Written, visible, reviewed." },
  { n: 7, rule: "Don't try to pass the challenge in two weeks", detail: "A 30-day challenge gives you 30 days. Using all of them lowers the daily target to a manageable level and reduces the urgency that drives bad decisions. Traders who try to pass in 10 days to 'get it over with' take excessive risk. Traders who pace themselves pass at normal risk levels." },
  { n: 8, rule: "After hitting 50% of the profit target, reduce your risk per trade", detail: "You're now protecting the progress you've made. The remaining 50% of the target should be pursued at reduced risk — this means you can withstand a losing streak without giving back what you've earned. Preservation mode, not growth mode." },
  { n: 9, rule: "Have a drawdown protocol before you start", detail: "Write this down before session 1: 'If I lose X% of the account, I will do Y.' Not 'I'll figure it out.' A specific plan. Traders without a drawdown protocol make it up in the moment — usually badly, under pressure, with impaired decision-making." },
  { n: 10, rule: "The funded account is the beginning, not the finish line", detail: "Passing the challenge gets you access to capital. Keeping the account requires the same discipline, every day, indefinitely. The traders who lose funded accounts usually lose them in the first month — when the pressure is still high and the routine isn't established. Treat month one of the funded account like a challenge phase." },
];

export default function PropFirmTips() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#8B5CF6", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 6, padding: "3px 10px" }}>PROP FIRMS</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 8 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            10 Rules for Passing and Keeping Your First Funded Account
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            The funded trading industry has a failure rate above 90%. That&apos;s not a market problem — it&apos;s a psychology problem. The strategy that got you interested in the challenge is usually fine. What isn&apos;t fine is how most traders behave under challenge conditions.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>These rules come from analyzing the patterns of traders who pass multiple challenges versus those who fail repeatedly. The difference is almost never the strategy. It&apos;s consistently in how traders manage their psychology under the specific pressures that a funded challenge creates.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, margin: "32px 0" }}>
            {RULES.map((r) => (
              <div key={r.n} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#8B5CF6", flexShrink: 0 }}>{r.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{r.rule}</div>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>{r.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 12, padding: "20px 24px", margin: "40px 0 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Built for Prop Firm Traders</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: "0 0 14px" }}>TradeMind&apos;s Challenge Tracker keeps your rules visible, tracks your drawdown and profit target progress in real time, and gives you an AI coach that knows your specific challenge rules and mental state every session.</p>
            <Link href="/login?callbackUrl=/checkin" style={{ display: "inline-block", background: "var(--green)", color: "#000", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}