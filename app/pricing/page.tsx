"use client";

import { useState } from "react";
import Link from "next/link";

const FAQ_ITEMS = [
  { q: "Can I try TradeMind for free?", a: "Yes. TradeMind includes a 7-day free trial — cancel before day 8 and you won't be charged a thing. No commitment, no risk. The free plan also stays free forever with daily check-ins." },
  { q: "What's included in TradeMind?", a: "Everything: daily mental check-in, GO/CAUTION/NO-TRADE verdict, trade journal with emotion tracking, 90-day analytics, P&L vs. psychology correlation, accountability partners, circle groups, AI Coach Alex, broker auto-connect (MT4/MT5), behavioral pattern detection, Trading Playbook, prop firm challenge tracker, Mental P&L, unlimited history, and priority support." },
  { q: "What's the difference between Free and TradeMind?", a: "Free gives you the daily check-in, score, and 7-day history. TradeMind unlocks everything else — the full analytics, trade journal, AI coach, broker sync, and all the tools that turn your data into decisions." },
  { q: "Is billing monthly or annual?", a: "Both options are available. Annual billing saves you 26% — $348/year instead of $468." },
  { q: "How do I cancel?", a: "Cancel anytime from your dashboard or email support@trademindedge.com. You keep access until the end of your billing period — no questions asked." },
  { q: "Is my trading data private?", a: "Yes. Your journal, check-ins, and scores are private by default. Broker connections use read-only API keys — we never have permission to trade or withdraw." },
  { q: "Do I need to connect my broker?", a: "No. Broker auto-connect (MT4/MT5, TopstepX) is available but optional. You can also import via CSV, or log trades manually. The most important data is your mental score — broker sync just saves you time." },
];

const PLANS = [
  {
    id: "premium",
    name: "TradeMind",
    tagline: "The pre-flight checklist for serious traders.",
    price: { monthly: 39, annual: 29 },
    annualTotal: 348,
    color: "#8B5CF6",
    features: [
      { text: "Daily mental check-in + GO / CAUTION / NO-TRADE verdict", included: true },
      { text: "Trade Journal + emotion tracking, tags & reflection", included: true },
      { text: "90-day analytics + P&L vs. psychology correlation", included: true },
      { text: "Accountability partners + circle groups", included: true },
      { text: "AI coach Alex — daily briefing & personalized insights", included: true },
      { text: "Broker auto-connect (MT4/MT5, TopstepX + CSV)", included: true },
      { text: "Deep behavioral pattern detection (revenge, FOMO, overtrading)", included: true },
      { text: "Trading Playbook & rules engine", included: true },
      { text: "Prop firm challenge tracker (FTMO, TopStep & more)", included: true },
      { text: "Mental P&L — see what psychology costs you in dollars", included: true },
      { text: "Unlimited history + priority support", included: true },
    ],
    cta: "Start Pre-Flight →",
    popular: false,
    roi: "Less than the cost of one failed FTMO challenge retry.",
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill={`${color}18`} stroke={`${color}40`} strokeWidth="1" />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.04)" stroke="var(--border)" strokeWidth="1" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  async function handleCheckout(planId: string) {
    setLoading(planId);
    try {
      const r = await fetch("/api/lemonsqueezy/checkout", { method: "POST" });
      const { url, error } = await r.json();
      if (error) { alert(error); return; }
      window.location.href = url;
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "TradeMind",
    "description": "Daily mental check-in protocol for traders. Know your mental state before you trade.",
    "url": "https://trademindedge.com/pricing",
    "brand": { "@type": "Brand", "name": "TradeMind" },
    "offers": [
      { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD", "availability": "https://schema.org/InStock" },
      { "@type": "Offer", "name": "TradeMind", "price": "39", "priceCurrency": "USD", "availability": "https://schema.org/InStock", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "39", "priceCurrency": "USD", "unitText": "MONTH" } },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "white" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* Nav */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/logo.svg" alt="TradeMind" height="24" />
        </Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>Dashboard</Link>
          <Link href="/checkin">
            <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>Start free →</button>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#5e6ad2" }}>PRICING</span>
          </div>
          <h1 className="font-bebas" style={{ fontSize: "clamp(48px, 8vw, 72px)", lineHeight: 1, marginBottom: 16 }}>
            Invest In Your Edge
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px" }}>
            The cost of one bad trade on a NO-TRADE day is more than a year of TradeMind. Do the math.
          </p>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, gap: 2 }}>
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: "8px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                  background: billing === b ? "var(--blue)" : "transparent",
                  color: billing === b ? "white" : "var(--text-muted)",
                }}>
                {b === "monthly" ? "Monthly" : (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Annual
                    <span style={{ fontSize: 10, background: "rgba(0,232,122,0.2)", color: "var(--green)", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>SAVE 26%</span>
                  </span>
                )}
              </button>
            ))}
          </div>

        </div>

        {/* Plans grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 64 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                borderRadius: 16,
                border: "1.5px solid rgba(139,92,246,0.45)",
                background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, var(--surface) 60%)",
                boxShadow: "0 0 60px rgba(139,92,246,0.10)",
                padding: "28px 28px 24px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 18px", borderRadius: 20, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "white", whiteSpace: "nowrap" }}>
                EVERYTHING INCLUDED
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: plan.color, marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 2 }}>
                  <span className="font-bebas" style={{ fontSize: 48, lineHeight: 1, color: "var(--text)" }}>
                    ${billing === "annual" ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", paddingBottom: 8 }}>/mo</span>
                </div>
                {billing === "annual" && (
                  <div style={{ fontSize: 11, color: "var(--green)", marginBottom: 6 }}>
                    ${plan.annualTotal}/year — save $120/year
                  </div>
                )}
                <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0 }}>{plan.tagline}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {f.included ? <CheckIcon color={plan.color} /> : <XIcon />}
                    <span style={{ fontSize: 13, color: f.included ? "var(--text-dim)" : "var(--text-muted)" }}>{f.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 10,
                  border: plan.popular ? "none" : "1px solid var(--border)",
                  background: plan.id === "premium" ? "linear-gradient(135deg, #8B5CF6, #6366f1)" : plan.color,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading === plan.id ? "wait" : "pointer",
                  transition: "opacity 0.15s",
                  opacity: loading === plan.id ? 0.6 : 1,
                }}>
                {loading === plan.id ? "Opening checkout..." : plan.cta}
              </button>
              {plan.id !== "free" && (
                <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", margin: "10px 0 0", lineHeight: 1.5 }}>
                  7-day trial · Cancel in 30 seconds
                </p>
              )}
              {"roi" in plan && plan.roi && (
                <p style={{ fontSize: 11, color: plan.id === "premium" ? "rgba(139,92,246,0.8)" : "rgba(94,106,210,0.8)", textAlign: "center", margin: "6px 0 0", fontStyle: "italic" }}>
                  {plan.roi}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 40, marginBottom: 12 }}>
            {[
              { stat: "26%", label: "Worse risk decisions after under 6 hours sleep — Walker (2017)" },
              { stat: "60%", label: "More loss aversion under emotional stress — Lo et al. (2005)" },
              { stat: "3×", label: "More rule violations in the final hour of a session — Baumeister (2000)" },
            ].map((s) => (
              <div key={s.stat} style={{ textAlign: "center" }}>
                <div className="font-bebas" style={{ fontSize: 40, color: "var(--green)", lineHeight: 1 }}>{s.stat}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, maxWidth: 160 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 auto", maxWidth: 520, lineHeight: 1.6, fontStyle: "italic" }}>
            Research-backed figures from peer-reviewed studies on trading psychology and cognitive performance.
          </p>
        </div>

        {/* Social proof */}
        <div style={{ maxWidth: 560, margin: "0 auto 64px", background: "linear-gradient(135deg, rgba(0,232,122,0.04), var(--surface))", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 16, padding: "28px 28px 24px" }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
            {[...Array(5)].map((_, j) => (
              <svg key={j} width="13" height="13" viewBox="0 0 13 13" fill="var(--amber)"><path d="M6.5 1l1.4 3.2L11 4.6l-2.3 2.3.5 3.2-2.7-1.4L3.8 10l.5-3.2L2 4.6l3.1-.4L6.5 1z"/></svg>
            ))}
          </div>
          <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.8, marginBottom: 20 }}>
            &ldquo;Failed FTMO three times. Passed on the fourth. The only thing I changed was TradeMind. I skipped 9 trading days based on my NO-TRADE score. Every single one of those days I would have hit max drawdown. Every one.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,59,92,0.15)", border: "1.5px solid rgba(255,59,92,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "var(--red)", flexShrink: 0 }}>LS</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Lena S.</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Prop Trader · FTMO · 5 months</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 className="font-bebas" style={{ fontSize: 36, textAlign: "center", marginBottom: 32 }}>Frequently Asked Questions</h2>
          <div style={{ borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)", overflow: "hidden" }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{item.q}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 20, lineHeight: 1, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, padding: "0 24px 18px", margin: 0 }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
            Still not sure? Start free — cancel before day 8 and pay nothing.
          </p>
          <Link href="/checkin">
            <button className="btn-primary" style={{ padding: "14px 36px", fontSize: 16 }}>
              Start your first check-in →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}