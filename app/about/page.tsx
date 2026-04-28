import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TradeMind — Built by Traders, for Traders",
  description: "TradeMind was built to solve the problem no trading journal addresses: the trader, not the trade. Our mission is to give every serious trader the mental edge that separates profitable consistency from emotional chaos.",
  alternates: { canonical: "https://trademindedge.com/about" },
  openGraph: {
    title: "About TradeMind — Built by Traders, for Traders",
    description: "Our mission: give every serious trader the mental edge that separates profitable consistency from emotional chaos.",
    url: "https://trademindedge.com/about",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "About TradeMind — Built by Traders, for Traders",
    description: "Our mission: give every serious trader the mental edge that separates profitable consistency from emotional chaos.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
};

const VALUES = [
  {
    icon: "🧠",
    title: "Psychology first",
    body: "Every feature we build starts with a behavioral question: what mental state causes this mistake, and how can we catch it before the market does?",
  },
  {
    icon: "📊",
    title: "Evidence over feeling",
    body: "Our check-in model is grounded in peer-reviewed research on sleep deprivation, decision fatigue, and emotional regulation — not trading folklore.",
  },
  {
    icon: "🔒",
    title: "Privacy by design",
    body: "Your psychology scores and trading data are the most personal financial information you produce. We treat them that way. No ads. No data brokerage. Ever.",
  },
  {
    icon: "⚡",
    title: "Proactive, not reactive",
    body: "Every other trading tool tells you what went wrong. TradeMind tells you when something is likely to go wrong — before you risk a dollar.",
  },
];

const TIMELINE = [
  {
    date: "Early 2026",
    title: "The problem becomes obvious",
    body: "After analyzing hundreds of losing trades, one pattern kept emerging: the market wasn't the problem. The mental state of the trader was. Most losses happened on days that were identifiable in advance — if anyone had been paying attention.",
  },
  {
    date: "April 2026",
    title: "TradeMind launches",
    body: "The first version: a 5-question daily check-in that takes 60 seconds and produces a single number — the mental score — with a clear verdict: GO, CAUTION, or NO-TRADE. Simple. Actionable. Nothing like it existed.",
  },
  {
    date: "April 2026",
    title: "Trade Journal + Analytics",
    body: "Users needed to close the loop — to see whether honoring their verdict actually changed outcomes. The trade journal and psychology vs P&L correlation chart made the pattern undeniable.",
  },
  {
    date: "April 2026",
    title: "Accountability Partners + Circles",
    body: "Solo discipline is hard. Mutual visibility changes behavior. Partners see your morning score. You can't pretend you're fine. The data got better; the trading did too.",
  },
  {
    date: "April 2026",
    title: "Prop Firm Mode + AI Coach",
    body: "Funded traders face unique pressure. Challenge tracker, daily loss limits, and AI Coach Alex — which analyzes your specific patterns and gives you one concrete thing to change — were built for serious traders with capital on the line.",
  },
  {
    date: "Today",
    title: "The mission continues",
    body: "Most of your losses weren't about the market. They were about a day you should have sat out. We exist to help you know the difference — and act on it — every single trading day.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .timeline-dot { width:12px; height:12px; border-radius:50%; background:var(--blue); border:2px solid var(--bg); box-shadow:0 0 0 2px var(--blue); flex-shrink:0; margin-top:4px; }
        .value-card { transition:transform 0.2s ease,border-color 0.2s ease; }
        .value-card:hover { transform:translateY(-3px); border-color:rgba(94,106,210,0.3) !important; }
      `}</style>

      {/* Nav */}
      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" style={{ display: "block", width: 120, height: "auto" }} />
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/login"><button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }}>Log in</button></Link>
            <Link href="/login?callbackUrl=/checkin"><button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Start Free</button></Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(94,106,210,0.07)", border: "1px solid rgba(94,106,210,0.2)", marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)" }}>OUR STORY</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.08, marginBottom: 24 }}>
            Built because the market<br />
            <span style={{ background: "linear-gradient(135deg, var(--blue), var(--purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>wasn't the real problem.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8, maxWidth: 640, marginBottom: 16 }}>
            TradeMind exists because of a simple, uncomfortable truth that most traders already know but haven't found a tool to address: <strong style={{ color: "var(--text)" }}>most of your worst losses were preventable.</strong>
          </p>
          <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, maxWidth: 640 }}>
            Not because of a bad setup. Not because the market moved against you. Because you weren't in the right mental state to be trading that day — and no one, including you, was tracking that.
          </p>
        </div>

        {/* Mission statement */}
        <div style={{ padding: "40px 40px", borderRadius: 20, background: "linear-gradient(135deg, rgba(94,106,210,0.07), rgba(139,92,246,0.05))", border: "1px solid rgba(94,106,210,0.2)", marginBottom: 72, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(94,106,210,0.1), transparent)", pointerEvents: "none" }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--blue)", marginBottom: 16 }}>OUR MISSION</div>
          <p style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, lineHeight: 1.4, color: "var(--text)", margin: 0, position: "relative" }}>
            "Give every serious trader the mental edge to know — before they open a position — whether today is a day to trade at full size, trade smaller, or protect their capital entirely."
          </p>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>What we stand for</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {VALUES.map((v) => (
              <div key={v.title} className="card value-card" style={{ padding: "24px 24px", border: "1px solid rgba(94,106,210,0.12)" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{v.title}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>How we got here</h2>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: "linear-gradient(180deg, var(--blue), var(--purple))", opacity: 0.3, borderRadius: 2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              {TIMELINE.map((t) => (
                <div key={t.title} style={{ position: "relative" }}>
                  <div className="timeline-dot" style={{ position: "absolute", left: -31, top: 4 }} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", marginBottom: 6 }}>{t.date.toUpperCase()}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{t.title}</div>
                  <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The research foundation */}
        <div style={{ padding: "32px 36px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 72 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>BUILT ON RESEARCH</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>The science behind the score</h3>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 16 }}>
            TradeMind's 5-question check-in is grounded in peer-reviewed research on how mental state affects financial decision-making:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { ref: "Walker, 2017", finding: "Sleep deprivation of even 2 hours reduces cognitive performance by 26% and increases emotional reactivity — directly affecting trading judgment." },
              { ref: "Lo et al., 2005", finding: "Emotions are not the enemy of good trading — but unregulated emotions are. Traders who track emotional states make systematically better position-sizing decisions." },
              { ref: "Baumeister, 2000", finding: "Decision fatigue is real and measurable. Traders make 3× more rule violations in the final hour of a session compared to their first — judgment degrades with each decision made." },
            ].map((r) => (
              <div key={r.ref} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 16px", borderRadius: 10, background: "rgba(94,106,210,0.04)", border: "1px solid rgba(94,106,210,0.1)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", whiteSpace: "nowrap", marginTop: 1 }}>{r.ref}</span>
                <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{r.finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Ready to trade with your best mind?</h2>
          <p style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 32 }}>Start free. No card required.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login?callbackUrl=/checkin">
              <button className="btn-primary" style={{ padding: "16px 36px", fontSize: 15 }}>Start Your First Check-in →</button>
            </Link>
            <Link href="/contact">
              <button className="btn-ghost" style={{ padding: "16px 28px", fontSize: 15 }}>Get in touch</button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}