import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Data Privacy — TradeMind",
  description: "How TradeMind protects your trading data, psychology scores, and financial information. No passwords stored, LemonSqueezy PCI-DSS payments, Turso encrypted database.",
  alternates: { canonical: "https://trademindedge.com/security" },
  openGraph: {
    title: "Security & Data Privacy — TradeMind",
    description: "No passwords stored. Broker credentials never touch our servers. AES-256 encrypted database. Here's exactly how we protect your data.",
    url: "https://trademindedge.com/security",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "Security & Data Privacy — TradeMind",
    description: "No passwords stored. Broker credentials never touch our servers. AES-256 encrypted database.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
};

const Shield = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <path d="M10 2L3 5v5c0 4.418 3 8 7 9 4-1 7-4.582 7-9V5l-7-3z" stroke="var(--green)" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 10l2 2 4-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
    <circle cx="8" cy="8" r="7.5" stroke="rgba(0,232,122,0.3)" />
    <path d="M5 8l2 2 4-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const sections = [
  {
    icon: "🔐",
    title: "No Passwords, Ever",
    badge: "Zero-knowledge auth",
    body: "TradeMind uses magic-link authentication only. We never create, store, or transmit a password on your behalf. Your email is used solely to send a one-time login link — after that, your session is managed by a signed, httpOnly cookie that we cannot read the contents of. If someone breaches our database, there are no passwords to steal.",
    points: [
      "Magic-link email auth via NextAuth.js",
      "Session tokens are signed and httpOnly — not accessible via JavaScript",
      "No OAuth tokens stored for social login",
    ],
  },
  {
    icon: "🏦",
    title: "Broker Credentials Never Touch Our Servers",
    badge: "Third-party OAuth",
    body: "When you connect your broker via the MetaAPI integration, your brokerage username and password are entered directly on MetaAPI's encrypted OAuth flow — they are never transmitted to or stored on TradeMind servers. We only receive a read-only access token, scoped to trade data. We never have the ability to place trades on your behalf.",
    points: [
      "MetaAPI handles all broker OAuth — we receive only a scoped read token",
      "Read-only access — TradeMind cannot place, modify, or cancel trades",
      "You can revoke access from your broker portal at any time",
    ],
  },
  {
    icon: "💳",
    title: "Payments via LemonSqueezy — We Never See Your Card",
    badge: "PCI DSS compliant",
    body: "All billing is handled by LemonSqueezy, a PCI DSS Level 1 certified payment processor — the highest standard in payment security. Your card number, CVV, and billing address are entered directly on LemonSqueezy's hosted checkout. TradeMind's servers never receive, process, or store any payment card data.",
    points: [
      "LemonSqueezy is PCI DSS Level 1 certified",
      "Card data is entered on LemonSqueezy's domain, not ours",
      "TradeMind stores only a LemonSqueezy customer ID and subscription status",
      "Invoices and receipts are issued by LemonSqueezy directly",
    ],
  },
  {
    icon: "🗄️",
    title: "Encrypted Database at Rest",
    badge: "Turso / LibSQL",
    body: "Your check-in scores, journal entries, and psychology data are stored in Turso (LibSQL), a distributed SQLite database with encryption at rest enabled by default. Data is replicated across multiple regions for durability. We do not store any data in plaintext on our servers.",
    points: [
      "Turso LibSQL database with encryption at rest",
      "All connections use TLS 1.2+ in transit",
      "No plaintext storage of sensitive data",
      "Database access restricted to authenticated API routes only",
    ],
  },
  {
    icon: "🏗️",
    title: "Hosted on Vercel — SOC 2 Type 2 Infrastructure",
    badge: "Enterprise cloud",
    body: "TradeMind is deployed on Vercel's infrastructure, which maintains SOC 2 Type 2 certification. This means independent auditors have verified Vercel's security controls for availability, confidentiality, and processing integrity. All traffic is served over HTTPS with automatic TLS certificate management.",
    points: [
      "Vercel is SOC 2 Type 2 certified",
      "Automatic HTTPS/TLS for all traffic",
      "Edge network with DDoS protection",
      "No user data stored in Vercel's logs beyond standard access logs",
    ],
  },
  {
    icon: "📦",
    title: "Your Data Belongs to You",
    badge: "Full portability",
    body: "You own your data, full stop. You can export everything — check-in history, scores, journal entries, and P&L — at any time from your Settings page. If you delete your account, all your data is permanently removed from our database within 30 days. We do not archive deleted accounts.",
    points: [
      "Export all data as JSON from Settings → Export Data",
      "Account deletion removes all records permanently",
      "No backup copies of deleted user data retained after 30 days",
      "Data deletion requests honored within 30 days per GDPR",
    ],
  },
  {
    icon: "🚫",
    title: "We Never Sell Your Data",
    badge: "Privacy first",
    body: "TradeMind's business model is subscriptions — not advertising, not data brokerage. Your trading psychology data, P&L figures, journal entries, and behavioral patterns are yours alone. We do not sell, license, or share identifiable user data with any third party, advertiser, or data broker. Period.",
    points: [
      "No advertising network integrations",
      "No data broker partnerships",
      "Anonymous, aggregated analytics only for product improvement (e.g., PostHog)",
      "You can opt out of all analytics from Settings",
    ],
  },
];

export default function SecurityPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .sec-card { transition: border-color 0.2s ease, transform 0.2s ease; }
        .sec-card:hover { border-color: rgba(0,232,122,0.25) !important; transform: translateY(-2px); }
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(0,232,122,0.07)", border: "1px solid rgba(0,232,122,0.2)", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)" }}>SECURITY & PRIVACY</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Your data is yours.<br />
            <span style={{ color: "var(--green)" }}>We take that seriously.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
            TradeMind handles your trading psychology, P&L data, and daily mental scores. Here is exactly how we protect all of it — no marketing language, just facts.
          </p>
          {/* Trust badges row */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "No passwords stored" },
              { label: "PCI DSS (via LemonSqueezy)" },
              { label: "Encrypted at rest" },
              { label: "Vercel SOC 2 infra" },
              { label: "GDPR compliant" },
            ].map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>
                <Check />
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sections.map((s) => (
            <div key={s.title} className="card sec-card" style={{ padding: "28px 28px", border: "1px solid rgba(0,232,122,0.1)" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0, marginTop: -2 }}>{s.icon}</div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{s.title}</h2>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--green)", background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 6, padding: "3px 8px" }}>{s.badge.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 16 }}>{s.body}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {s.points.map((p) => (
                      <div key={p} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <Shield />
                        <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclosure */}
        <div style={{ marginTop: 48, padding: "24px 28px", borderRadius: 14, background: "rgba(255,176,32,0.04)", border: "1px solid rgba(255,176,32,0.15)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", letterSpacing: "0.08em", marginBottom: 8 }}>RESPONSIBLE DISCLOSURE</div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
            If you discover a security vulnerability in TradeMind, please email us at{" "}
            <a href="mailto:security@trademindedge.com" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 600 }}>security@trademindedge.com</a>{" "}
            before disclosing publicly. We will acknowledge your report within 48 hours and work with you to resolve the issue. We genuinely appreciate responsible security research.
          </p>
        </div>

        {/* Footer links */}
        <div style={{ marginTop: 48, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/contact", label: "Contact Us" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}