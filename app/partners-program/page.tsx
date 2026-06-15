import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner Program — Earn 30% Recurring Commission — TradeMind",
  description: "Share TradeMind with your trading community and earn 30% of every subscription, recurring for life. Built for trading educators, YouTubers, Discord communities, and signal providers.",
  alternates: { canonical: "https://trademindedge.com/partners-program" },
};

const TIERS = [
  {
    name: "Affiliate",
    color: "#5E6AD2",
    commission: "30%",
    recurring: true,
    minReferrals: 0,
    perks: ["Unique referral link", "Real-time dashboard", "Monthly payouts via PayPal/crypto", "Marketing assets"],
  },
  {
    name: "Pro Partner",
    color: "#00C896",
    commission: "35%",
    recurring: true,
    minReferrals: 20,
    perks: ["Everything in Affiliate", "35% commission", "Priority support", "Custom landing page", "Co-marketing opportunities"],
    highlight: true,
  },
  {
    name: "Ambassador",
    color: "#FFB020",
    commission: "40%",
    recurring: true,
    minReferrals: 100,
    perks: ["Everything in Pro Partner", "40% commission", "Revenue share on annual plans", "Dedicated partner manager", "Early feature access"],
  },
];

const EARNINGS = [
  { referrals: 10, monthly: "$117", annual: "$1,404", note: "Part-time content creator" },
  { referrals: 50, monthly: "$585", annual: "$7,020", note: "Active trading community" },
  { referrals: 200, monthly: "$2,340", annual: "$28,080", note: "Large YouTube / Discord" },
  { referrals: 500, monthly: "$5,850", annual: "$70,200", note: "Top trading educator" },
];

const PARTNERS = [
  { type: "Trading YouTubers", emoji: "📹", desc: "Review TradeMind in a video and send thousands of traders who already trust you." },
  { type: "Discord Communities", emoji: "💬", desc: "Add TradeMind as a tool your community uses. Earn every time a member subscribes." },
  { type: "Trading Educators", emoji: "🎓", desc: "Include TradeMind in your course or mentorship program as an essential tool." },
  { type: "Signal Providers", emoji: "📊", desc: "Your followers already trust your analysis. Extend that to the tools you recommend." },
  { type: "Prop Firm Communities", emoji: "🏦", desc: "Funded trader groups are our highest-converting audience. Perfect fit." },
  { type: "Trading Coaches", emoji: "🧠", desc: "Use TradeMind with your clients and earn while helping them perform better." },
];

const FAQS = [
  { q: "When do I get paid?", a: "Payouts happen on the 1st of each month for commissions earned the prior month. We support PayPal, bank transfer, and crypto (USDC, BTC)." },
  { q: "How long does the cookie last?", a: "30 days. If someone clicks your link and subscribes any time in the next 30 days, you earn the commission." },
  { q: "Do I earn on renewals?", a: "Yes. You earn 30% on every monthly payment for as long as the subscriber stays active. No expiration." },
  { q: "Is there a minimum payout?", a: "Yes — $50 minimum to trigger a payout. Balances under $50 roll over to the next month." },
  { q: "Can I promote on any platform?", a: "Yes — YouTube, Twitter/X, Discord, newsletters, podcasts, your website. No spam. No incentivized reviews. No false claims." },
];

export default function PartnersProgram() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>TradeMind</Link>
        <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
      </nav>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 24px 96px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", padding: "4px 12px", background: "rgba(0,200,150,0.12)", border: "1px solid rgba(0,200,150,0.25)", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#00C896", letterSpacing: "0.06em", marginBottom: 20 }}>PARTNER PROGRAM</span>
          <h1 style={{ fontSize: "clamp(28px,5vw,50px)", fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
            Earn 30% recurring<br />for life.
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.65 }}>
            Share TradeMind with your trading community. Every subscriber you send earns you 30% of their monthly payment — every month, forever.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:partners@trademindedge.com?subject=Partner Program Application" style={{ padding: "14px 32px", background: "#00C896", color: "#070B14", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>Apply Now — Free</a>
            <a href="#earnings" style={{ padding: "14px 32px", background: "transparent", color: "#a1a1aa", border: "1px solid #2a2f3e", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>See Earnings Calculator</a>
          </div>
        </div>

        {/* Why TradeMind converts */}
        <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 16, padding: "24px 28px", marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#71717a", letterSpacing: "0.08em", margin: "0 0 16px" }}>WHY TRADEMIND CONVERTS FOR YOUR AUDIENCE</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { icon: "🎯", title: "Unique product", body: "Real-time tilt detection and mental readiness scoring exist nowhere else. Easy to demo, easy to explain." },
              { icon: "💰", title: "High perceived value", body: "One prevented revenge trade pays for 6 months of subscription. The ROI story sells itself." },
              { icon: "🔁", title: "High retention", body: "Traders who use TradeMind daily build data on themselves. Churn is rare because quitting means losing your data." },
              { icon: "📊", title: "Prop firm niche", body: "FTMO, Apex, TopStep traders are a high-intent, high-paying audience. Perfect for trading communities." },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1.2 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#e4e4e7", margin: "0 0 4px" }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission tiers */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Commission Tiers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 48 }}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                padding: "24px 20px",
                background: tier.highlight ? "rgba(0,200,150,0.06)" : "#0d1117",
                border: `1px solid ${tier.highlight ? "rgba(0,200,150,0.3)" : "#1a1f2e"}`,
                borderRadius: 16,
                position: "relative",
              }}
            >
              {tier.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "3px 12px", background: "#00C896", borderRadius: 20, fontSize: 10, fontWeight: 800, color: "#070B14", whiteSpace: "nowrap" }}>MOST POPULAR</div>
              )}
              <p style={{ fontSize: 13, fontWeight: 700, color: tier.color, letterSpacing: "0.06em", margin: "0 0 8px" }}>{tier.name.toUpperCase()}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{tier.commission}</span>
                <span style={{ fontSize: 14, color: "#71717a" }}>/ sale</span>
              </div>
              <p style={{ fontSize: 12, color: "#00C896", margin: "0 0 16px", fontWeight: 600 }}>Recurring forever</p>
              {tier.minReferrals > 0 && (
                <p style={{ fontSize: 11, color: "#52525b", margin: "0 0 14px" }}>Unlocks at {tier.minReferrals}+ active referrals</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {tier.perks.map((perk) => (
                  <div key={perk} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: tier.color, fontSize: 13, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#a1a1aa" }}>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Earnings calculator */}
        <div id="earnings" style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Earnings Potential</h2>
          <p style={{ fontSize: 14, color: "#71717a", margin: "0 0 20px" }}>Based on 30% commission on $39/mo Pro plan</p>
          <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "12px 20px", background: "#111827", borderBottom: "1px solid #1a1f2e" }}>
              {["Active Referrals", "Monthly Earnings", "Annual Earnings", "Profile"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#71717a", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>
            {EARNINGS.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < EARNINGS.length - 1 ? "1px solid #1a1f2e" : "none" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{row.referrals}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#00C896" }}>{row.monthly}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#00C896" }}>{row.annual}</span>
                <span style={{ fontSize: 13, color: "#71717a" }}>{row.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Who this is for */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Who this is for</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 48 }}>
          {PARTNERS.map((p) => (
            <div key={p.type} style={{ display: "flex", gap: 14, padding: "18px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{p.emoji}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#e4e4e7", margin: "0 0 4px" }}>{p.type}</p>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>FAQ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 56 }}>
          {FAQS.map((faq) => (
            <div key={faq.q} style={{ padding: "18px 20px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#e4e4e7", margin: "0 0 8px" }}>{faq.q}</p>
              <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "52px 24px", background: "linear-gradient(135deg, rgba(0,200,150,0.1), rgba(94,106,210,0.08))", border: "1px solid rgba(0,200,150,0.2)", borderRadius: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>Ready to partner with us?</h2>
          <p style={{ fontSize: 16, color: "#a1a1aa", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>Send an email and we&apos;ll get you set up with a referral link within 24 hours.</p>
          <a
            href="mailto:partners@trademindedge.com?subject=Partner Program Application&body=Hi, I'd like to apply for the TradeMind Partner Program. Here's a bit about my audience:%0A%0AChannel/platform:%0AApproximate audience size:%0AHow I plan to promote TradeMind:"
            style={{ display: "inline-block", padding: "15px 40px", background: "#00C896", color: "#070B14", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none" }}
          >
            Apply to Partner Program →
          </a>
          <p style={{ fontSize: 12, color: "#52525b", marginTop: 12 }}>Free to join · Instant approval · Start earning within 24h</p>
        </div>
      </div>
    </div>
  );
}
