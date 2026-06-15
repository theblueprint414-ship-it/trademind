import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TradeMind vs Edgewonk — Best Trading Journal for Prop Firm Traders (2025)",
  description: "Honest comparison: TradeMind vs Edgewonk. Edgewonk is desktop software with manual entry only. TradeMind is cloud-based with broker auto-sync, real-time tilt detection, and a multi-prop-firm dashboard built for funded traders.",
  openGraph: {
    title: "TradeMind vs Edgewonk (2025 Comparison)",
    description: "Which trading journal is better for funded traders? Full feature breakdown.",
    url: "https://trademindedge.com/vs-edgewonk",
  },
  alternates: { canonical: "https://trademindedge.com/vs-edgewonk" },
};

const ROWS = [
  { feature: "Web-based (no install, any device)", tm: true, ew: false, note: "" },
  { feature: "Broker auto-sync (Tradovate, Alpaca, Bybit…)", tm: true, ew: false, note: "" },
  { feature: "CSV import (Tradovate, NinjaTrader, Rithmic, MT4/5)", tm: true, ew: true, note: "" },
  { feature: "Real-time tilt detection (consecutive loss alert)", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "GO / CAUTION / NO-TRADE verdict before session", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "Daily mental check-in (mood, sleep, stress)", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "Confluence combination analytics (FVG+OB win rate)", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "Multi-prop-firm account dashboard (FTMO, Apex, TopStep)", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "Drawdown usage tracker per account", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "Pre-trade ritual checklist", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "Execution quality score (SL discipline, profit capture)", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "Monte Carlo equity projection (P10/P50/P90)", tm: true, ew: false, note: "TradeMind exclusive" },
  { feature: "ICT / SMC setup tagging (FVG, OB, BOS, MSS…)", tm: true, ew: false, note: "" },
  { feature: "Behavioral tag analysis (FOMO, revenge trade cost)", tm: true, ew: true, note: "" },
  { feature: "In-depth statistics & analytics", tm: true, ew: true, note: "" },
  { feature: "Mobile app (iOS / Android PWA)", tm: true, ew: false, note: "" },
  { feature: "Free tier available", tm: true, ew: false, note: "" },
  { feature: "Ongoing updates & new features", tm: true, ew: false, note: "" },
  { feature: "Pricing model", tm: "$39/mo", ew: "~$169 one-time", note: "" },
];

export default function VsEdgewonk() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>TradeMind</Link>
        <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", padding: "4px 12px", background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.3)", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#8B96E8", letterSpacing: "0.06em", marginBottom: 20 }}>2025 COMPARISON</span>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-1.5px" }}>
            TradeMind vs Edgewonk
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.65 }}>
            Edgewonk is a solid desktop journal — if you enjoy typing in every trade manually. TradeMind is cloud-based with broker auto-sync, real-time tilt detection, and a multi-prop-firm dashboard built for the modern funded trader.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ padding: "13px 28px", background: "#5E6AD2", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>Start Free — TradeMind</Link>
            <Link href="/pricing" style={{ padding: "13px 28px", background: "transparent", color: "#a1a1aa", border: "1px solid #2a2f3e", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>See Pricing</Link>
          </div>
        </div>

        {/* Score cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
          {[
            { name: "TradeMind", score: "9.4", color: "#00C896", verdict: "Best for prop firm traders", highlights: ["Real-time tilt detection", "Mental readiness GO/CAUTION/NO-TRADE", "Broker auto-sync — no manual entry"] },
            { name: "Edgewonk", score: "6.8", color: "#FFB020", verdict: "Desktop software, manual entry only", highlights: ["Good retrospective analytics", "Behavioral tagging", "One-time purchase (~$169)"] },
          ].map((p) => (
            <div key={p.name} style={{ padding: "24px 20px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#fff", fontSize: 16 }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#71717a" }}>{p.verdict}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: p.color }}>{p.score}</span>
                  <span style={{ fontSize: 12, color: "#71717a" }}>/10</span>
                </div>
              </div>
              {p.highlights.map((h) => (
                <div key={h} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: p.color, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#a1a1aa" }}>{h}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Feature Comparison</h2>
        <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 16, overflow: "hidden", marginBottom: 48 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", padding: "12px 20px", borderBottom: "1px solid #1a1f2e", background: "#111827" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#71717a", letterSpacing: "0.06em" }}>FEATURE</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5E6AD2", letterSpacing: "0.06em", textAlign: "center" }}>TRADEMIND</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#71717a", letterSpacing: "0.06em", textAlign: "center" }}>EDGEWONK</span>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 100px",
                padding: "13px 20px",
                borderBottom: i < ROWS.length - 1 ? "1px solid #1a1f2e" : "none",
                background: row.note.includes("exclusive") ? "rgba(94,106,210,0.04)" : "transparent",
              }}
            >
              <div>
                <span style={{ fontSize: 14, color: "#e4e4e7" }}>{row.feature}</span>
                {row.note && <span style={{ fontSize: 11, color: "#5E6AD2", marginLeft: 8, fontWeight: 600 }}>{row.note}</span>}
              </div>
              <div style={{ textAlign: "center" }}>
                {typeof row.tm === "boolean" ? (
                  <span style={{ fontSize: 16, color: row.tm ? "#00C896" : "#ef4444" }}>{row.tm ? "✓" : "✗"}</span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#00C896" }}>{row.tm}</span>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                {typeof row.ew === "boolean" ? (
                  <span style={{ fontSize: 16, color: row.ew ? "#a1a1aa" : "#ef4444" }}>{row.ew ? "✓" : "✗"}</span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#a1a1aa" }}>{row.ew}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Why traders switch */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Why Prop Traders Switch from Edgewonk</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 48 }}>
          {[
            { icon: "⚡", title: "No more manual entry", body: "Edgewonk requires you to type in every trade by hand. TradeMind connects directly to Tradovate, Alpaca, Bybit, DXTrade, and more — your trades appear automatically." },
            { icon: "🚨", title: "Real-time protection", body: "Edgewonk is purely retrospective — you review yesterday&apos;s mistakes tomorrow. TradeMind detects tilt mid-session and alerts you before consecutive losses destroy your funded account." },
            { icon: "🧠", title: "Pre-session mental readiness", body: "Edgewonk has no concept of whether you&apos;re mentally fit to trade. TradeMind scores your mood, sleep, and stress and gives you a GO, CAUTION, or NO-TRADE verdict every morning." },
            { icon: "🏦", title: "Built for funded traders", body: "Edgewonk was built before prop firms existed as an industry. TradeMind has FTMO, Apex, and TopStep dashboards with live drawdown bars and rule-violation warnings baked in." },
          ].map((item) => (
            <div key={item.title} style={{ padding: "20px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14 }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 10 }}>{item.icon}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "48px 24px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.08))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>Try TradeMind Free</h2>
          <p style={{ fontSize: 16, color: "#a1a1aa", margin: "0 0 28px" }}>No credit card. 60-second setup. Connects to your broker in minutes.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "15px 40px", background: "#5E6AD2", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none", letterSpacing: "-0.2px" }}>
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  );
}
