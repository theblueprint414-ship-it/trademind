"use client";

import { useState } from "react";
import Link from "next/link";
import { showToast } from "@/components/Toast";

const FAQ_ITEMS = [
  { q: "Can I try TradeMind for free?", a: "Yes. TradeMind includes a 7-day free trial — cancel before day 8 and you won't be charged a thing. No commitment, no risk. The free plan also stays free forever with daily check-ins." },
  { q: "What's included in TradeMind?", a: "Everything: daily mental check-in, GO/CAUTION/NO-TRADE verdict, trade journal with emotion tracking, 90-day analytics, P&L vs. psychology correlation, accountability partners, circle groups, AI Coach Alex, broker auto-connect (MT4/MT5), behavioral pattern detection, Trading Playbook, prop firm challenge tracker, Mental P&L, unlimited history, and priority support." },
  { q: "What's the difference between Free and TradeMind?", a: "Free gives you the daily check-in, score, and 7-day history. TradeMind unlocks everything else — the full analytics, trade journal, AI coach, broker sync, and all the tools that turn your data into decisions." },
  { q: "Is billing monthly or annual?", a: "Both options are available. Annual billing saves you 26% — $348/year instead of $468." },
  { q: "How do I cancel?", a: "Cancel anytime from your dashboard or email support@trademindedge.com. You keep access until the end of your billing period — no questions asked." },
  { q: "Is my trading data private?", a: "Yes. Your journal, check-ins, and scores are private by default. Broker connections use read-only API keys — we never have permission to trade or withdraw." },
  { q: "Do I need to connect my broker?", a: "No. Broker auto-connect (MT4/MT5, TopstepX) is available but optional. You can also import via CSV, or log trades manually. The most important data is your mental score — broker sync just saves you time." },
];

const FEATURES = [
  "Daily mental check-in + GO / CAUTION / NO-TRADE verdict",
  "Trade Journal + emotion tracking, tags & reflection",
  "90-day analytics + P&L vs. psychology correlation",
  "Accountability partners + circle groups",
  "AI coach Alex — daily briefing & personalized insights",
  "Broker auto-connect (MT4/MT5, TopstepX + CSV)",
  "Deep behavioral pattern detection (revenge, FOMO, overtrading)",
  "Trading Playbook & rules engine",
  "Prop firm challenge tracker (FTMO, TopStep & more)",
  "Mental P&L — see what psychology costs you in dollars",
  "Unlimited history + priority support",
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
      <path d="M5 8l2 2 4-4" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [showAll, setShowAll] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const r = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing }),
      });
      const { url, error } = await r.json();
      if (error === "already_premium") { window.location.href = "/dashboard"; return; }
      if (error) { showToast(error, "error"); return; }
      window.location.href = url;
    } catch {
      showToast("Network error — please try again", "error");
    } finally {
      setLoading(false);
    }
  }

  const price = billing === "annual" ? 29 : 39;
  const visibleFeatures = showAll ? FEATURES : FEATURES.slice(0, 5);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "TradeMind",
    "description": "Daily mental check-in protocol for traders. Know your mental state before you trade.",
    "url": "https://trademindedge.com/pricing",
    "brand": { "@type": "Brand", "name": "TradeMind" },
    "offers": [
      { "@type": "Offer", "name": "TradeMind Monthly", "price": "39", "priceCurrency": "USD", "availability": "https://schema.org/InStock", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "39", "priceCurrency": "USD", "unitText": "MONTH" } },
      { "@type": "Offer", "name": "TradeMind Annual", "price": "348", "priceCurrency": "USD", "availability": "https://schema.org/InStock", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "348", "priceCurrency": "USD", "unitText": "YEAR" } },
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

      <style>{`
        @media (max-width: 640px) {
          .sticky-cta { display: flex !important; }
          .pricing-card { padding: 20px 20px 100px !important; }
        }
      `}</style>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/logo.svg" alt="TradeMind" height="24" />
        </Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>Dashboard</Link>
          <button className="btn-primary" onClick={handleCheckout} disabled={loading} style={{ padding: "8px 18px", fontSize: 13 }}>
            {loading ? "Loading…" : "Start free →"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 20px 100px" }}>

        {/* Hero — tight */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)" }}>7-DAY FREE TRIAL</span>
          </div>
          <h1 className="font-bebas" style={{ fontSize: "clamp(40px, 7vw, 60px)", lineHeight: 1, marginBottom: 10 }}>
            Invest In Your Edge
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
            The cost of one bad trade on a NO-TRADE day is more than a year of TradeMind.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, gap: 2 }}>
            {(["monthly", "annual"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: "7px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                background: billing === b ? "var(--blue)" : "transparent",
                color: billing === b ? "white" : "var(--text-muted)",
              }}>
                {b === "monthly" ? "Monthly" : (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Annual
                    <span style={{ fontSize: 10, background: "rgba(0,232,122,0.2)", color: "var(--green)", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>-26%</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* PRICING CARD — CTA first */}
        <div className="pricing-card" style={{
          borderRadius: 18,
          border: "1.5px solid rgba(139,92,246,0.45)",
          background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, var(--surface) 60%)",
          boxShadow: "0 0 60px rgba(139,92,246,0.12)",
          padding: "28px 28px 24px",
          position: "relative",
          marginBottom: 40,
        }}>
          <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 18px", borderRadius: 20, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "white", whiteSpace: "nowrap" }}>
            EVERYTHING INCLUDED
          </div>

          {/* Price */}
          <div style={{ textAlign: "center", marginBottom: 20, paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, marginBottom: 2 }}>
              <span className="font-bebas" style={{ fontSize: 64, lineHeight: 1, color: "var(--text)" }}>${price}</span>
              <span style={{ fontSize: 14, color: "var(--text-muted)", paddingBottom: 10 }}>/mo</span>
            </div>
            {billing === "annual" && (
              <div style={{ fontSize: 12, color: "var(--green)", marginBottom: 2 }}>$348/year — save $120 vs monthly</div>
            )}
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>TradeMind · Everything unlocked</div>
          </div>

          {/* CTA — HIGH UP */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #8B5CF6, #6366f1)",
              color: "white", fontSize: 16, fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginBottom: 8,
              boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
            }}>
            {loading ? "Opening checkout…" : "Start 7-Day Free Trial →"}
          </button>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", margin: "0 0 24px", lineHeight: 1.5 }}>
            No charge for 7 days · Cancel in 30 seconds · No credit card games
          </p>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {visibleFeatures.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckIcon />
                <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{f}</span>
              </div>
            ))}
          </div>

          {!showAll && (
            <button onClick={() => setShowAll(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", marginTop: 12, padding: 0, fontWeight: 600 }}>
              + {FEATURES.length - 5} more features →
            </button>
          )}

          {/* ROI note */}
          <p style={{ fontSize: 11, color: "rgba(139,92,246,0.7)", textAlign: "center", margin: "16px 0 0", fontStyle: "italic" }}>
            Less than the cost of one failed FTMO challenge retry.
          </p>
        </div>

        {/* Social proof strip */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 40 }}>
          {[
            { stat: "26%", label: "Worse decisions after poor sleep" },
            { stat: "60%", label: "More loss aversion under stress" },
            { stat: "3×", label: "More rule breaks late in session" },
          ].map((s) => (
            <div key={s.stat} style={{ textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 32, color: "var(--green)", lineHeight: 1 }}>{s.stat}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, maxWidth: 120 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{ background: "linear-gradient(135deg, rgba(0,232,122,0.04), var(--surface))", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 16, padding: "24px", marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
            {[...Array(5)].map((_, j) => (
              <svg key={j} width="13" height="13" viewBox="0 0 13 13" fill="var(--amber)"><path d="M6.5 1l1.4 3.2L11 4.6l-2.3 2.3.5 3.2-2.7-1.4L3.8 10l.5-3.2L2 4.6l3.1-.4L6.5 1z"/></svg>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.8, marginBottom: 16 }}>
            &ldquo;Failed FTMO three times. Passed on the fourth. The only thing I changed was TradeMind. I skipped 9 trading days based on my NO-TRADE score. Every single one of those days I would have hit max drawdown.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,59,92,0.15)", border: "1.5px solid rgba(255,59,92,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--red)", flexShrink: 0 }}>LS</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Lena S.</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Prop Trader · FTMO · 5 months</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-bebas" style={{ fontSize: 32, textAlign: "center", marginBottom: 24 }}>Common Questions</h2>
          <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", overflow: "hidden" }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{item.q}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 20, lineHeight: 1, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, padding: "0 20px 16px", margin: 0 }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky CTA bar — mobile only */}
      <div className="sticky-cta" style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,14,26,0.96)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(139,92,246,0.3)",
        padding: "12px 20px 20px",
        flexDirection: "column", gap: 8,
        alignItems: "stretch",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="font-bebas" style={{ fontSize: 28, color: "var(--text)" }}>${price}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/mo {billing === "annual" ? "· billed $348/yr" : ""}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["monthly", "annual"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${billing === b ? "#8B5CF6" : "var(--border)"}`, background: billing === b ? "rgba(139,92,246,0.15)" : "transparent", color: billing === b ? "#8B5CF6" : "var(--text-muted)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {b === "monthly" ? "$39/mo" : "$29/mo"}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleCheckout} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", fontSize: 15, fontWeight: 800, cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Loading…" : "Start 7-Day Free Trial →"}
        </button>
        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>No charge for 7 days · Cancel anytime</p>
      </div>
    </div>
  );
}