import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why We Built TradeMind — No Fake Reviews",
  description: "TradeMind is a new product. Instead of fabricating reviews, here's exactly why we built it and what it actually does — so you can judge it yourself.",
  alternates: { canonical: "https://trademindedge.com/testimonials" },
};

const REASONS = [
  {
    title: "Funded accounts rarely blow on strategy",
    body: "They blow on the trade after three losses in a row — the one taken to get even, not the one in the plan. A journal that only shows you this after the account is gone doesn't help. A check-in before you risk anything might.",
    color: "#FF3B5C",
  },
  {
    title: "Most journals are passive",
    body: "They log what already happened. TradeMind's circuit breaker actually enforces your own daily trade limit on the journal itself — not just a dashboard number you can ignore.",
    color: "#5E6AD2",
  },
  {
    title: "Multi-prop-firm accounts get messy fast",
    body: "If you're running more than one funded account, knowing which one is closest to its drawdown limit shouldn't require switching tabs between three platforms.",
    color: "#00C896",
  },
];

export default function TestimonialsPage() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>TradeMind</Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/pricing" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
          <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 96px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
            We&apos;re early. We won&apos;t fake the rest.
          </h1>
          <p style={{ fontSize: 17, color: "#a1a1aa", margin: "0 auto 0", lineHeight: 1.7 }}>
            TradeMind doesn&apos;t have a stack of five-star reviews yet — it&apos;s a new product. Rather than invent quotes from customers who don&apos;t exist,
            here&apos;s the actual reasoning behind what we built. Try the free check-in and decide for yourself.
          </p>
        </div>

        {/* Why it exists */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 56 }}>
          {REASONS.map((r) => (
            <div key={r.title} style={{ padding: "22px 24px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 16, borderLeft: `3px solid ${r.color}` }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{r.title}</p>
              <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.75, margin: 0 }}>{r.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "52px 24px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.08))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Judge it on what it does, not what we say
          </h2>
          <p style={{ fontSize: 15, color: "#a1a1aa", margin: "0 0 28px" }}>Free account. 60-second check-in. No credit card.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "15px 40px", background: "#5E6AD2", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            Start Free Today →
          </Link>
        </div>
      </div>
    </div>
  );
}
