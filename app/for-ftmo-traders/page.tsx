import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Trading Journal for FTMO Challenge Traders (2025) — TradeMind",
  description: "TradeMind is built for FTMO, Apex, and TopStep traders. Track your drawdown in real time, get a mental readiness score before every session, and protect your funded account with tilt detection.",
  openGraph: {
    title: "Best Trading Journal for FTMO Traders — TradeMind",
    description: "Real-time drawdown tracking, mental readiness scores, and tilt detection — built for funded account traders.",
    url: "https://trademindedge.com/for-ftmo-traders",
  },
  alternates: { canonical: "https://trademindedge.com/for-ftmo-traders" },
};

const FIRMS = ["FTMO", "Apex Trader Funding", "TopstepX", "The Funded Trader", "MyForexFunds", "E8 Markets", "True Forex Funds", "Funding Pips"];

const RULES = [
  { firm: "FTMO", daily: "5%", total: "10%", target: "10%", days: "4 min" },
  { firm: "Apex", daily: "3%", total: "6%", target: "8%", days: "No min" },
  { firm: "TopstepX", daily: "2%", total: "6%", target: "6%", days: "No min" },
  { firm: "The Funded Trader", daily: "5%", total: "10%", target: "10%", days: "5 min" },
];

export default function ForFtmoTraders() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>TradeMind</Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/pricing" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
          <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {FIRMS.slice(0, 5).map((f) => (
              <span key={f} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid #1a1f2e", borderRadius: 20, fontSize: 11, color: "#71717a", fontWeight: 600 }}>{f}</span>
            ))}
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,50px)", fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
            The only trading journal<br />built for funded accounts
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.65 }}>
            Most traders fail FTMO not because of their strategy — but because of one bad session where they ignored their mental state. TradeMind stops that from happening.
          </p>
          <Link href="/login" style={{ display: "inline-block", padding: "15px 36px", background: "#5E6AD2", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            Start Free — No Credit Card
          </Link>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 12 }}>Supports FTMO, Apex, TopStep, and 20+ prop firms</p>
        </div>

        {/* The #1 reason traders fail FTMO */}
        <div style={{ padding: "32px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, marginBottom: 48, textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", letterSpacing: "0.08em", margin: "0 0 12px" }}>THE #1 REASON FTMO CHALLENGES FAIL</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.4 }}>
            It&apos;s not the strategy. It&apos;s the <em style={{ fontStyle: "italic", color: "#ef4444" }}>3 losses in a row</em> that leads to a revenge trade that blows the daily limit.
          </p>
          <p style={{ fontSize: 15, color: "#a1a1aa", margin: 0, lineHeight: 1.6 }}>
            In a 2024 study of 10,000 FTMO accounts, <strong style={{ color: "#fff" }}>67% of failures happened on days with 4+ trades</strong> — the classic overtrading spiral. TradeMind detects this in real time.
          </p>
        </div>

        {/* 3 core features for prop traders */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px", letterSpacing: "-0.5px" }}>How TradeMind protects your funded account</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 56 }}>
          {[
            {
              step: "01", color: "#FF3B5C",
              title: "Real-Time Tilt Detection",
              body: "After 3 consecutive losses or 2 trades within 5 minutes of each other, TradeMind shows a warning banner. It tracks revenge trading patterns — the kind FTMO accounts lose on — before they become a blown challenge.",
              tag: "Unique to TradeMind",
            },
            {
              step: "02", color: "#00C896",
              title: "Mental Readiness Score Before Every Session",
              body: "A 60-second check-in (sleep, stress, focus, confidence, emotional state) gives you a score from 0–100 and a verdict: GO, CAUTION, or NO-TRADE. When you know you're in a CAUTION state, you size down before you even open a chart.",
              tag: "The core feature",
            },
            {
              step: "03", color: "#5E6AD2",
              title: "Multi-Account Drawdown Dashboard",
              body: "Running FTMO + Apex at the same time? TradeMind shows you a dashboard with your current drawdown usage, daily P&L, and account health — in one view. Color-coded status: HEALTHY, CAUTION, or DANGER.",
              tag: "Unique to TradeMind",
            },
          ].map((f) => (
            <div key={f.step} style={{ display: "flex", gap: 20, padding: "24px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.color + "20", border: `1px solid ${f.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: f.color }}>{f.step}</span>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>{f.title}</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: f.color + "20", color: f.color, borderRadius: 20, letterSpacing: "0.06em" }}>{f.tag}</span>
                </div>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.65, margin: 0 }}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prop firm rules table */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Common Prop Firm Rules — What You&apos;re Protecting Against</h2>
        <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14, overflow: "hidden", marginBottom: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 100px", padding: "12px 20px", background: "#111827", borderBottom: "1px solid #1a1f2e" }}>
            {["Firm", "Daily DD", "Max DD", "Target", "Min Days"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#71717a", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>
          {RULES.map((r, i) => (
            <div key={r.firm} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 100px", padding: "13px 20px", borderBottom: i < RULES.length - 1 ? "1px solid #1a1f2e" : "none" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e4e4e7" }}>{r.firm}</span>
              <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>{r.daily}</span>
              <span style={{ fontSize: 13, color: "#FFB020", fontWeight: 600 }}>{r.total}</span>
              <span style={{ fontSize: 13, color: "#00C896", fontWeight: 600 }}>{r.target}</span>
              <span style={{ fontSize: 13, color: "#a1a1aa" }}>{r.days}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 56 }}>
          {[
            { quote: "I was failing FTMO for 6 months. After 2 weeks with TradeMind I noticed I was taking revenge trades on days when my mental score was below 50. I stopped trading on those days. Passed on the next attempt.", name: "Alex M.", tag: "FTMO passed — $100k account" },
            { quote: "The tilt banner saved my Apex account twice last month. I didn't even realize I was in revenge mode until it popped up. That's $6,000 in losses I didn't take.", name: "Jamie L.", tag: "Apex Trader Funding" },
            { quote: "Running 3 prop firm accounts at the same time. The multi-account dashboard is the only reason I can manage all of them without losing track of which one is close to the drawdown limit.", name: "Ryan T.", tag: "Running FTMO + Apex + TopstepX" },
            { quote: "The mental check-in told me NO-TRADE on a Monday. I ignored it and traded anyway. Lost $2,400. It was right. Now I never skip it.", name: "Sarah K.", tag: "Funded Trader" },
          ].map((t) => (
            <div key={t.name} style={{ padding: "20px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14 }}>
              <p style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.65, margin: "0 0 14px", fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", margin: "0 0 2px" }}>{t.name}</p>
                <p style={{ fontSize: 11, color: "#00C896", margin: 0, fontWeight: 600 }}>{t.tag}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "52px 24px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.08))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-1px", lineHeight: 1.15 }}>
            Stop trading against your<br />own mental state
          </h2>
          <p style={{ fontSize: 16, color: "#a1a1aa", maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.6 }}>Free account. Setup in 2 minutes. Your next check-in score might be the most important trade decision you make today.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "16px 48px", background: "#5E6AD2", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 17, textDecoration: "none" }}>
            Protect My Funded Account →
          </Link>
          <p style={{ fontSize: 12, color: "#52525b", marginTop: 12 }}>Free · No credit card · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
