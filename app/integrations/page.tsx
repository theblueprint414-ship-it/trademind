import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — TradeMind",
  description: "Connect your broker, import from CSV, or use TradeMind standalone. TradeMind works with MetaTrader 4 & 5 via MetaAPI, plus CSV import from any broker.",
  alternates: { canonical: "https://trademindedge.com/integrations" },
  openGraph: {
    title: "Integrations — TradeMind",
    description: "MT4, MT5, CSV import, and prop firm support. Connect your broker in seconds — credentials never touch TradeMind servers.",
    url: "https://trademindedge.com/integrations",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "Integrations — TradeMind",
    description: "MT4, MT5, CSV import, and prop firm support. Credentials never touch TradeMind servers.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
};

const BROKER_INTEGRATIONS = [
  { name: "MetaTrader 4", tag: "LIVE", note: "Auto-sync daily P&L via MetaAPI", color: "var(--green)" },
  { name: "MetaTrader 5", tag: "LIVE", note: "Auto-sync daily P&L via MetaAPI", color: "var(--green)" },
  { name: "Any Broker (CSV)", tag: "LIVE", note: "Import trades from any broker that exports CSV", color: "var(--green)" },
  { name: "cTrader", tag: "PLANNED", note: "MetaAPI roadmap — coming soon", color: "var(--amber)" },
  { name: "Interactive Brokers", tag: "PLANNED", note: "Planned via CSV and direct API", color: "var(--amber)" },
  { name: "Tradovate", tag: "PLANNED", note: "Planned via CSV import", color: "var(--amber)" },
];

const PROP_FIRMS = [
  { name: "FTMO", compatible: true },
  { name: "TopStep", compatible: true },
  { name: "MyForexFunds", compatible: true },
  { name: "Funding Pips", compatible: true },
  { name: "E8 Funding", compatible: true },
  { name: "The Funded Trader", compatible: true },
  { name: "Apex Trader Funding", compatible: true },
  { name: "City Traders Imperium", compatible: true },
];

const STACK = [
  {
    category: "Authentication",
    items: [
      { name: "NextAuth.js", role: "Magic-link email authentication — no passwords stored" },
    ],
  },
  {
    category: "Broker Connectivity",
    items: [
      { name: "MetaAPI", role: "OAuth broker connection for MetaTrader 4 & 5 — we never see your credentials" },
    ],
  },
  {
    category: "Payments",
    items: [
      { name: "Paddle", role: "PCI DSS Level 1 compliant billing — card data never touches our servers" },
    ],
  },
  {
    category: "Database",
    items: [
      { name: "Turso (LibSQL)", role: "Distributed SQLite database with encryption at rest" },
    ],
  },
  {
    category: "Hosting & Infrastructure",
    items: [
      { name: "Vercel", role: "SOC 2 Type 2 certified edge infrastructure" },
    ],
  },
  {
    category: "Analytics (opt-out available)",
    items: [
      { name: "PostHog", role: "Anonymous, aggregated product analytics — no PII shared" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .int-card { transition: transform 0.15s ease, border-color 0.2s ease; }
        .int-card:hover { transform: translateY(-2px); border-color: rgba(79,142,247,0.3) !important; }
      `}</style>

      {/* Nav */}
      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" style={{ display: "block", width: 120, height: "auto" }} />
          </Link>
          <Link href="/login?callbackUrl=/checkin">
            <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Start Free Trial</button>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 100px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.2)", marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)" }}>INTEGRATIONS</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>Works with your setup.</h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            TradeMind connects to your broker automatically or accepts CSV imports from any platform. It also works completely standalone — the check-in and journal require no broker connection at all.
          </p>
        </div>

        {/* Important note */}
        <div style={{ padding: "16px 22px", borderRadius: 12, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)", marginBottom: 48, display: "flex", gap: 14, alignItems: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="9" cy="9" r="8" stroke="var(--green)" strokeWidth="1.3" />
            <path d="M9 5v4M9 12v.5" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "var(--green)" }}>No broker required to start.</strong> The mental check-in, score, journal, accountability partners, and AI coach all work without a broker connection. Broker sync is optional — it automates P&L import so you don't have to log it manually.
          </p>
        </div>

        {/* Broker connections */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Broker connections</h2>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 24 }}>
            Connect your broker in Settings → Broker Connect. Your credentials are handled entirely by MetaAPI's OAuth flow — TradeMind never sees your username or password.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {BROKER_INTEGRATIONS.map((b) => (
              <div key={b.name} className="card int-card" style={{ padding: "16px 22px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: b.tag === "LIVE" ? "rgba(0,232,122,0.08)" : "rgba(255,176,32,0.08)", border: `1px solid ${b.tag === "LIVE" ? "rgba(0,232,122,0.2)" : "rgba(255,176,32,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="5" width="14" height="10" rx="2" stroke={b.color} strokeWidth="1.3" />
                    <path d="M6 5V4a3 3 0 016 0v1" stroke={b.color} strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.note}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: b.tag === "LIVE" ? "rgba(0,232,122,0.1)" : "rgba(255,176,32,0.1)", border: `1px solid ${b.tag === "LIVE" ? "rgba(0,232,122,0.25)" : "rgba(255,176,32,0.25)"}`, color: b.color, flexShrink: 0 }}>{b.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prop firm compatibility */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Prop firm compatibility</h2>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 24 }}>
            TradeMind's challenge tracker works with any prop firm that uses MetaTrader 4 or 5, or that allows CSV export. Set your account parameters once and track your challenge progress live.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {PROP_FIRMS.map((f) => (
              <div key={f.name} className="card int-card" style={{ padding: "14px 18px", border: "1px solid rgba(0,232,122,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="6" fill="rgba(0,232,122,0.12)" stroke="rgba(0,232,122,0.4)" strokeWidth="1" />
                  <path d="M4.5 7l2 2 3.5-3.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Built on trusted infrastructure</h2>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 24 }}>
            TradeMind uses best-in-class third-party services for every critical function. We don't build crypto or handle card data ourselves — we integrate with companies that do this at scale and have the certifications to prove it.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STACK.map((section) => (
              <div key={section.category}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8 }}>{section.category.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {section.items.map((item) => (
                    <div key={item.name} className="card int-card" style={{ padding: "14px 20px", border: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", minWidth: 140 }}>{item.name}</span>
                      <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{item.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSV */}
        <div style={{ padding: "28px 32px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 48 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>CSV import — any broker, any platform</h3>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 16 }}>
            If your broker isn't on the MetaAPI list, export your trade history as CSV from your broker's platform and import it directly. TradeMind maps the columns automatically and links trades to your check-in dates.
          </p>
          <Link href="/journal">
            <button className="btn-ghost" style={{ padding: "10px 22px", fontSize: 13 }}>Open Journal → CSV Import</button>
          </Link>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Ready to connect your broker?</h2>
          <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 28 }}>Start free. Broker sync available on Pro and Premium plans.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login?callbackUrl=/settings">
              <button className="btn-primary" style={{ padding: "14px 32px", fontSize: 14 }}>Start Free Trial →</button>
            </Link>
            <Link href="/security">
              <button className="btn-ghost" style={{ padding: "14px 24px", fontSize: 14 }}>How we protect your data →</button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}