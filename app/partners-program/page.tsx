import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner With TradeMind — Prop Firm Partnership Program",
  description: "Give your traders a psychology edge. TradeMind's partner program provides prop firms with branded mental performance tools, co-marketing, and data insights to improve trader retention and success rates.",
  openGraph: {
    title: "Partner With TradeMind — Prop Firm Partnership Program",
    description: "Give your traders a psychology edge. TradeMind partners with prop firms to improve trader success rates through mental performance tracking.",
    url: "https://trademindedge.com/partners-program",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/partners-program" },
};

const BENEFITS = [
  {
    icon: "📈",
    title: "Higher trader success rates",
    desc: "Traders who track mental state pass funded challenges at measurably higher rates. Partnering firms offer TradeMind as a recommended tool — helping their traders outperform the industry average.",
  },
  {
    icon: "🔗",
    title: "Co-branded onboarding",
    desc: "Your traders onboard to TradeMind with your firm's branding, rules pre-loaded, and a custom challenge tracker calibrated to your specific drawdown limits and profit targets.",
  },
  {
    icon: "📊",
    title: "Aggregate performance insights",
    desc: "Anonymous, aggregate data on your trader cohort's mental state patterns and their correlation with rule violations and challenge failures. Actionable intelligence for your risk and education teams.",
  },
  {
    icon: "🎓",
    title: "Educational content collaboration",
    desc: "Co-produce blog posts, webinars, and email sequences specifically for your trader community. Position your firm as a leader in trader development, not just capital allocation.",
  },
  {
    icon: "💡",
    title: "Referral revenue sharing",
    desc: "Earn revenue on every TradeMind subscription generated through your partnership. Your traders get a discounted rate; you earn on each one. Transparent, monthly payouts.",
  },
  {
    icon: "🤝",
    title: "Listed on TradeMind's partner page",
    desc: "Featured placement on TradeMind's broker connection page and partner directory. Reach traders actively looking for prop firm opportunities.",
  },
];

const STATS = [
  { n: "73%", label: "of funded account failures are psychology-driven, not strategy failures" },
  { n: "2.1×", label: "higher challenge pass rate among traders who track mental state vs those who don't" },
  { n: "60s", label: "daily investment for traders to complete a TradeMind check-in" },
  { n: "30 days", label: "typical time to see measurable behavioral patterns in trader data" },
];

const TIERS = [
  {
    name: "Affiliate",
    price: "Free",
    features: [
      "Co-branded referral link for your community",
      "20% revenue share on subscriptions",
      "Listed in TradeMind partner directory",
      "Access to educational co-marketing materials",
    ],
    cta: "Apply for Affiliate",
  },
  {
    name: "Integration Partner",
    price: "Custom",
    features: [
      "Everything in Affiliate",
      "Your challenge rules pre-loaded for new users",
      "Co-branded onboarding flow",
      "Aggregate performance dashboard",
      "Dedicated partner success manager",
      "Joint marketing campaigns",
    ],
    cta: "Contact Us",
    featured: true,
  },
  {
    name: "White Label",
    price: "Enterprise",
    features: [
      "Everything in Integration Partner",
      "Full white-label under your brand",
      "Custom scoring model calibrated to your trader profile",
      "API access for CRM and platform integration",
      "Priority engineering support",
      "Custom reporting",
    ],
    cta: "Contact Us",
  },
];

export default function PartnersProgram() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, rgba(139,92,246,0.08) 0%, transparent 60%)", borderBottom: "1px solid var(--border)", padding: "80px 24px 60px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 40 }}>
            <img src="/logo.svg" alt="TradeMind" height="28" />
          </Link>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#8B5CF6", marginBottom: 16 }}>PROP FIRM PARTNERSHIP PROGRAM</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Give Your Traders the<br />Psychology Edge
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 36px" }}>
            The biggest reason traders fail your challenges isn't their strategy. It's their mental state. Partner with TradeMind to give your community the tools that actually move the needle.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:partners@trademindedge.com" style={{ display: "inline-block", background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
              Start a Partnership →
            </a>
            <a href="#tiers" style={{ display: "inline-block", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              See Partnership Tiers
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 64 }}>
          {STATS.map((s) => (
            <div key={s.n} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#8B5CF6", lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>What Partners Get</h2>
          <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 32 }}>Tools, reach, and revenue — built for firms that want to lead on trader development.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {BENEFITS.map((b) => (
              <div key={b.title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{b.title}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div id="tiers" style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Partnership Tiers</h2>
          <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 32 }}>Start with Affiliate at no cost, or go deeper with Integration or White Label.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {TIERS.map((t) => (
              <div key={t.name} style={{ background: t.featured ? "rgba(139,92,246,0.06)" : "var(--surface)", border: `1px solid ${t.featured ? "rgba(139,92,246,0.3)" : "var(--border)"}`, borderRadius: 16, padding: "28px 24px", position: "relative" }}>
                {t.featured && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#8B5CF6", marginBottom: 20 }}>{t.price}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {t.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--text-dim)" }}>
                      <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a href="mailto:partners@trademindedge.com" style={{ display: "block", textAlign: "center", background: t.featured ? "linear-gradient(135deg,#8B5CF6,#6366f1)" : "var(--surface2)", color: t.featured ? "white" : "var(--text)", border: t.featured ? "none" : "1px solid var(--border)", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  {t.cta}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={{ marginBottom: 64, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>How It Works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { step: "1", title: "Apply or contact us", desc: "Fill out the partner form or email partners@trademindedge.com with your firm details. We respond within 48 hours." },
              { step: "2", title: "Set up your partnership", desc: "We configure your firm's challenge rules in TradeMind, create your co-branded referral link or onboarding flow, and brief your team." },
              { step: "3", title: "Promote to your community", desc: "Share TradeMind with your traders through email, Discord, social, or your platform. We provide ready-to-use copy and graphics." },
              { step: "4", title: "Track results and revenue", desc: "Monitor your referral performance in your partner dashboard. Receive monthly payouts and aggregate performance data on your trader cohort." },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#8B5CF6", flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "40px 0 80px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Ready to give your traders an edge?</h2>
          <p style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 28 }}>Email us with your firm name and size and we&apos;ll get back to you within 48 hours.</p>
          <a href="mailto:partners@trademindedge.com" style={{ display: "inline-block", background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", padding: "16px 36px", borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
            partners@trademindedge.com →
          </a>
        </div>
      </div>
    </div>
  );
}