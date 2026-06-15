"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "annual";

// ─── Score ring (SVG animated) ────────────────────────────────────────────────

function ScoreRing({ score, color, size = 120 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s ease" }}
      />
    </svg>
  );
}

// ─── Hero mockup ──────────────────────────────────────────────────────────────

const PHASES = [
  { score: 84, verdict: "GO",       color: "#00E87A", msg: "Peak state. Execute your plan.",          bg: "rgba(0,232,122,0.08)",   border: "rgba(0,232,122,0.2)"  },
  { score: 52, verdict: "CAUTION",  color: "#FFB020", msg: "A+ setups only. Half position size.",     bg: "rgba(255,176,32,0.08)",  border: "rgba(255,176,32,0.2)" },
  { score: 28, verdict: "NO-TRADE", color: "#FF3B5C", msg: "Protect your capital. Sit this one out.", bg: "rgba(255,59,92,0.08)",   border: "rgba(255,59,92,0.2)"  },
];

function HeroMockup() {
  const [phase, setPhase] = useState(0);
  const p = PHASES[phase];

  useEffect(() => {
    const t = setInterval(() => setPhase((x) => (x + 1) % PHASES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      width: "100%", maxWidth: 340,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${p.border}`,
      borderRadius: 24,
      padding: "32px 28px",
      backdropFilter: "blur(20px)",
      boxShadow: `0 0 80px ${p.color}20, 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
      transition: "border-color 0.5s ease, box-shadow 0.5s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow blob */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 200, height: 200, borderRadius: "50%", background: p.color, filter: "blur(80px)", opacity: 0.12, transition: "background 0.5s ease", pointerEvents: "none" }} />

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", margin: "0 0 20px", textAlign: "center" }}>TRADEMIND · MENTAL SCORE</p>

      {/* Ring + score */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", margin: "0 0 16px" }}>
        <ScoreRing score={p.score} color={p.color} size={110} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>{p.score}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>/100</span>
        </div>
      </div>

      {/* Verdict */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          display: "inline-block", padding: "8px 20px",
          background: p.bg, border: `1px solid ${p.border}`,
          borderRadius: 30,
          fontSize: 18, fontWeight: 800, color: p.color,
          letterSpacing: "0.12em",
          transition: "all 0.4s ease",
        }}>
          {p.verdict}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>{p.msg}</p>

      {/* Mini bars */}
      {[
        { label: "Sleep", val: 78 },
        { label: "Focus", val: p.score > 70 ? 85 : p.score > 45 ? 55 : 30 },
        { label: "Stress", val: p.score > 70 ? 20 : p.score > 45 ? 55 : 82 },
      ].map((b) => (
        <div key={b.label} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{b.label}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{b.val}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${b.val}%`, background: p.color, borderRadius: 2, opacity: 0.7, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Counter animation ────────────────────────────────────────────────────────

function CountUp({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1600;
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(ease * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Cost Calculator ──────────────────────────────────────────────────────────

function CostCalculator() {
  const [badDays, setBadDays] = useState(4);
  const [avgLoss, setAvgLoss] = useState(300);
  const yearlyLoss = badDays * avgLoss * 12;
  const preventable = Math.round(yearlyLoss * 0.6);
  const tmCost = 468;
  const roi = preventable - tmCost;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: 24, marginBottom: 32 }}>
        {[
          { label: "Avoidable losing days per month", value: badDays, min: 1, max: 20, onChange: setBadDays, suffix: `${badDays} days`, title: "Avoidable losing days per month" },
          { label: "Average loss per bad day", value: avgLoss, min: 50, max: 2000, step: 50, onChange: setAvgLoss, suffix: `$${avgLoss}`, title: "Average loss per bad day in dollars" },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a1a1aa" }}>{s.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.suffix}</span>
            </div>
            <input
              type="range" min={s.min} max={s.max} step={s.step ?? 1} value={s.value}
              title={s.title}
              onChange={(e) => s.onChange(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#5E6AD2", cursor: "pointer" }}
            />
          </div>
        ))}
      </div>

      <div className="calc-3">
        {[
          { label: "Yearly losses on bad days", value: `$${yearlyLoss.toLocaleString()}`, color: "#FF3B5C", sub: "without intervention" },
          { label: "Preventable with TradeMind", value: `$${preventable.toLocaleString()}`, color: "#FFB020", sub: "~60% stopped by mental gating" },
          { label: "Net ROI vs $468/yr", value: roi > 0 ? `+$${roi.toLocaleString()}` : `-$${Math.abs(roi).toLocaleString()}`, color: roi > 0 ? "#00E87A" : "#FF3B5C", sub: roi > 0 ? "TradeMind pays for itself" : "needs fewer bad days" },
        ].map((c) => (
          <div key={c.label} style={{ padding: "20px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: c.color, margin: "0 0 6px", letterSpacing: "-0.5px" }}>{c.value}</p>
            <p style={{ fontSize: 11, color: "#71717a", margin: "0 0 4px", lineHeight: 1.4 }}>{c.label}</p>
            <p style={{ fontSize: 10, color: "#52525b" }}>{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Is this just a trading journal?", a: "No. TradeMind is a mental performance system for traders. The journal is one component. The core is the daily mental check-in, real-time tilt detection, and behavioral analytics that no other journal offers." },
  { q: "What prop firms does TradeMind support?", a: "All of them — FTMO, Apex, TopStep, The Funded Trader, E8 Markets, Funding Pips, MyForexFunds, and any other firm you can name. The multi-account dashboard works with any account you set up." },
  { q: "Can I import my trade history from Tradovate / NinjaTrader?", a: "Yes. TradeMind supports CSV import from Tradovate, NinjaTrader, Rithmic, MT4/MT5, and most major platforms. Upload once and your full history is instantly analyzed." },
  { q: "What is tilt detection?", a: "TradeMind monitors your live session for revenge trading patterns: 3+ consecutive losses, trades entered within 5 minutes of a losing trade, or unusual trade frequency. When detected, a real-time banner appears before you make a costly mistake." },
  { q: "How is this different from TradeZella or Edgewonk?", a: "TradeZella is a solid general journal. Edgewonk is desktop-only with no broker sync. Neither has real-time tilt detection, mental readiness scoring, or a multi-prop-firm dashboard. TradeMind is the only journal built specifically for the psychology of prop trading." },
  { q: "Is billing monthly or annual?", a: "Both. Annual billing is $348/year — saves you $120 vs monthly. Monthly is $39/mo with no commitment. Cancel any time, no questions asked." },
  { q: "Do you offer a free trial?", a: "Yes — the free plan is genuinely useful: unlimited check-ins, up to 50 trades, and basic analytics. Upgrade to Pro when you want confluence analytics, AI coaching, and the full behavioral dashboard." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {FAQS.map((f, i) => (
        <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", textAlign: "left", padding: "20px 0",
              background: "none", border: "none", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
              color: "#fff", fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{f.q}</span>
            <span style={{ color: "#5E6AD2", fontSize: 20, flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none", display: "inline-block" }}>+</span>
          </button>
          <div style={{ maxHeight: open === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)", paddingBottom: open === i ? 20 : 0 }}>
            <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.75, margin: 0 }}>{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const orgJsonLd = {
    "@context": "https://schema.org", "@type": "Organization",
    name: "TradeMind", url: "https://trademindedge.com",
    logo: "https://trademindedge.com/icons/icon-512.png",
    description: "The best trading journal for prop firm traders. Real-time tilt detection, mental readiness scores, multi-account drawdown tracking.",
    sameAs: ["https://twitter.com/trademindedge"],
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "support@trademindedge.com" },
  };

  const softwareJsonLd = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: "TradeMind", applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android", url: "https://trademindedge.com",
    description: "The best trading journal for FTMO, Apex, and TopStep traders.",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: "39", priceCurrency: "USD", billingDuration: "P1M" },
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "312", bestRating: "5" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const price = billing === "annual" ? 29 : 39;

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-geist-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)", overflowX: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: rgba(94,106,210,0.3); }

        @keyframes float-y { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes aurora { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.1)} 66%{transform:translate(-40px,30px) scale(0.95)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes aurora2 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,60px) scale(1.08)} 66%{transform:translate(70px,-20px) scale(0.97)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }

        .fade-up { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }

        .glow-text {
          background: linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.55) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feature-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px;
          background: #fff; color: #000;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700; font-family: inherit;
          cursor: pointer; text-decoration: none;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 4px 24px rgba(255,255,255,0.06);
        }
        .btn-primary:hover { background: #e8e8e8; transform: translateY(-1px); box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(255,255,255,0.1); }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #fff;
          font-size: 15px; font-weight: 600; font-family: inherit;
          cursor: pointer; text-decoration: none;
          transition: all 0.15s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.16); }

        .nav-link {
          font-size: 14px; color: #a1a1aa; text-decoration: none;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #fff; }

        .stat-border { border-right: 1px solid rgba(255,255,255,0.07); }
        @media (max-width: 640px) { .stat-border { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); } }

        .testimonial-card {
          break-inside: avoid;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 14px;
        }

        input[type=range]::-webkit-slider-thumb { background: #5E6AD2; }
        input[type=range]::-moz-range-thumb { background: #5E6AD2; border: none; }

        /* ── RESPONSIVE ──────────────────────────────────────────── */
        .hero-grid { display: grid; grid-template-columns: 1fr 340px; gap: 80px; align-items: center; }
        .stats-4 { display: grid; grid-template-columns: repeat(4,1fr); }
        .problem-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .how-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; background: rgba(255,255,255,0.07); border-radius: 24px; overflow: hidden; }
        .feature-split { display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: #000; }
        .comparison-row { display: grid; grid-template-columns: 1fr 100px 100px 100px 100px; }
        .pricing-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .footer-5 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 32px; margin-bottom: 48px; }
        .calc-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .nav-links { display: flex; gap: 28px; align-items: center; }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .feature-split { grid-template-columns: 1fr; }
          .feature-split.rev > div:first-child { order: 2; }
          .feature-split.rev > div:last-child { order: 1; }
          .footer-5 { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        }
        @media (max-width: 700px) {
          .how-3 { grid-template-columns: 1fr; border-radius: 16px; }
          .pricing-2 { grid-template-columns: 1fr; }
          .footer-5 { grid-template-columns: 1fr 1fr; gap: 20px; }
          .comparison-outer { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .comparison-row { grid-template-columns: 140px 72px 72px 72px 72px; min-width: 520px; }
          .nav-links { display: none; }
          .calc-3 { grid-template-columns: 1fr; }
          .problem-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stats-4 { grid-template-columns: repeat(2,1fr); }
          .stats-4 > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .stats-4 > div:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.07) !important; }
          .footer-5 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px",
        background: navSolid ? "rgba(0,0,0,0.85)" : "transparent",
        backdropFilter: navSolid ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: navSolid ? "1px solid rgba(255,255,255,0.07)" : "none",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: "#fff", textDecoration: "none", letterSpacing: "-0.5px" }}>TradeMind</Link>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div className="nav-links">
              {[
                { href: "/for-ftmo-traders", label: "Prop Traders" },
                { href: "/pricing", label: "Pricing" },
                { href: "/blog", label: "Blog" },
                { href: "/vs-tradezella", label: "Compare" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link href="/login" className="nav-link" style={{ fontSize: 14 }}>Sign in</Link>
              <Link href="/login" className="btn-primary" style={{ padding: "9px 18px", fontSize: 14 }}>
                Start free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 64 }}>
        {/* Aurora background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(94,106,210,0.2) 0%, transparent 70%)", filter: "blur(80px)", animation: "aurora 18s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "30%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,232,122,0.12) 0%, transparent 70%)", filter: "blur(80px)", animation: "aurora2 22s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "10%", left: "35%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(157,111,255,0.1) 0%, transparent 70%)", filter: "blur(80px)", animation: "aurora 26s ease-in-out infinite reverse" }} />
          {/* Grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)" }} />
        </div>

        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1, width: "100%" }}>
          <div className="hero-grid">

            {/* Left: Text */}
            <div>
              {/* Badge */}
              <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.25)", borderRadius: 30, marginBottom: 32 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5E6AD2", animation: "blink 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#8B96E8", letterSpacing: "0.06em" }}>USED BY 2,400+ PROP TRADERS</span>
              </div>

              {/* Headline */}
              <h1 className="fade-up delay-1 glow-text" style={{ fontSize: "clamp(44px,6vw,80px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-3px", margin: "0 0 24px" }}>
                Know if you should<br />trade today.
              </h1>

              <p className="fade-up delay-2" style={{ fontSize: "clamp(16px,1.8vw,20px)", color: "#71717a", lineHeight: 1.7, margin: "0 0 40px", maxWidth: 500 }}>
                A 60-second mental check-in gives funded account traders a real verdict — <strong style={{ color: "#a1a1aa" }}>GO, CAUTION, or NO-TRADE</strong> — before they risk a dollar. The only tool that protects your drawdown from yourself.
              </p>

              <div className="fade-up delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/login" className="btn-primary">
                  Start free — no card
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/for-ftmo-traders" className="btn-ghost">Built for prop traders</Link>
              </div>

              {/* Stars */}
              <div className="fade-up delay-4" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#FFB020"><path d="M7 1l1.6 3.4 3.7.5-2.7 2.6.6 3.7L7 9.5 3.8 11.2l.6-3.7L1.7 4.9l3.7-.5L7 1z"/></svg>)}
                </div>
                <span style={{ fontSize: 13, color: "#71717a" }}>4.8/5 from 312 traders</span>
              </div>
            </div>

            {/* Right: Mockup */}
            <div className="fade-up delay-2" style={{ display: "flex", justifyContent: "center" }}>
              <HeroMockup />
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="stats-4">
            {[
              { value: 2400, suffix: "+", label: "Active traders" },
              { value: 68, suffix: "%", label: "Fewer revenge trades", prefix: "" },
              { value: 4.8, suffix: "★", label: "Average rating", fixed: 1 },
              { value: 312, suffix: " reviews", label: "On App Store & web" },
            ].map((s, i, arr) => (
              <div key={s.label} className={i < arr.length - 1 ? "stat-border" : ""} style={{ padding: "36px 32px", textAlign: "center" }}>
                <p style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-1px", fontVariantNumeric: "tabular-nums" }}>
                  {s.prefix ?? ""}<CountUp target={s.value} suffix={s.suffix} />
                </p>
                <p style={{ fontSize: 13, color: "#52525b", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 20 }}>THE PATTERN</p>
          <h2 className="glow-text" style={{ fontSize: "clamp(28px,5vw,56px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: "0 0 28px" }}>
            67% of funded accounts blow<br />on days with 4+ trades.
          </h2>
          <p style={{ fontSize: 18, color: "#71717a", lineHeight: 1.75, margin: "0 0 40px" }}>
            It&apos;s never the strategy that fails. It&apos;s the 3 losses in a row that leads to a revenge trade that hits the daily limit. TradeMind stops that pattern before it starts — every single morning.
          </p>
          <div className="problem-3">
            {[
              { n: "−26%", desc: "cognitive performance after one bad night of sleep", color: "#FF3B5C" },
              { n: "+60%", desc: "loss aversion under stress — you hold losers too long", color: "#FFB020" },
              { n: "3×",   desc: "more rule violations when mentally fatigued", color: "#5E6AD2" },
            ].map((s) => (
              <div key={s.n} style={{ padding: "24px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
                <p style={{ fontSize: 32, fontWeight: 800, color: s.color, margin: "0 0 8px", letterSpacing: "-1px" }}>{s.n}</p>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 16 }}>HOW IT WORKS</p>
            <h2 className="glow-text" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: 0 }}>Three steps. Sixty seconds.</h2>
          </div>

          <div className="how-3">
            {[
              { n: "01", color: "#5E6AD2", title: "Morning Check-in", desc: "5 research-backed questions: sleep, stress, focus, emotional state, recent performance. Takes 60 seconds. You can't lie to your own data.", icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="4" stroke="#5E6AD2" strokeWidth="1.5"/><path d="M10 16h3l2-5 3 10 2-5h2" stroke="#5E6AD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { n: "02", color: "#00E87A", title: "Get Your Verdict", desc: "A 0–100 score and a clear directive: GO (full size), CAUTION (half size, A+ only), or NO-TRADE (sit out). One number. No ambiguity.", icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" stroke="#00E87A" strokeWidth="1.5"/><path d="M11 16l3.5 3.5 7-7" stroke="#00E87A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { n: "03", color: "#FFB020", title: "Build Your Edge", desc: "Every check-in + every trade builds your mental fingerprint. After 30 days, you'll see exactly which mental states are costing you money.", icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 24l8-9 5 5 6-10 5 6" stroke="#FFB020" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="24" height="20" rx="3" stroke="#FFB020" strokeWidth="1.5"/></svg> },
            ].map((s) => (
              <div key={s.n} style={{ padding: "44px 36px", background: "#000" }}>
                <div style={{ marginBottom: 24 }}>{s.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: s.color }}>{s.n}</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "10px 0 14px", lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIQUE FEATURES ─────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 16 }}>WHAT ONLY TRADEMIND HAS</p>
            <h2 className="glow-text" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: 0 }}>
              Built for funded accounts.<br />Not general trading.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "rgba(255,255,255,0.07)", borderRadius: 24, overflow: "hidden" }}>

            {/* Feature 1: Tilt Detection */}
            <div className="feature-split">
              <div style={{ padding: "60px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 20, marginBottom: 24, width: "fit-content" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FF3B5C", letterSpacing: "0.08em" }}>UNIQUE TO TRADEMIND</span>
                </div>
                <h3 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>Real-Time Tilt Detection</h3>
                <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.8, margin: "0 0 24px" }}>
                  After 3 consecutive losses, or two trades within 5 minutes of each other, TradeMind interrupts you with a warning banner. Not a retrospective report — a live intervention, before the fourth trade ends your challenge.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Detects consecutive loss spirals", "Flags revenge trading timing patterns", "30-minute dismissal with escalation logic"].map((t) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF3B5C", flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: "#a1a1aa" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "60px 40px", background: "rgba(255,59,92,0.02)", borderLeft: "1px solid rgba(255,59,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 320, padding: "20px", background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.25)", borderRadius: 18, boxShadow: "0 0 60px rgba(255,59,92,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF3B5C", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#FF3B5C" }}>TILT DETECTED</span>
                  </div>
                  <p style={{ fontSize: 14, color: "#e4e4e7", lineHeight: 1.6, margin: "0 0 14px" }}>3 consecutive losses detected. You are in a high-risk mental state. Your next trade has a 78% chance of being a revenge trade.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "10px", background: "#FF3B5C", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Stop Trading</button>
                    <button style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#a1a1aa", fontSize: 13, cursor: "pointer" }}>Dismiss (30m)</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Multi-Account */}
            <div className="feature-split rev">
              <div style={{ padding: "60px 40px", background: "rgba(94,106,210,0.02)", borderRight: "1px solid rgba(94,106,210,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 320 }}>
                  {[
                    { name: "FTMO — $100k", pnl: "+$1,240", dd: 3.2, status: "HEALTHY", color: "#00E87A" },
                    { name: "Apex — $50k", pnl: "-$820", dd: 7.8, status: "CAUTION", color: "#FFB020" },
                    { name: "TopstepX — $50k", pnl: "+$340", dd: 1.5, status: "HEALTHY", color: "#00E87A" },
                  ].map((acc) => (
                    <div key={acc.name} style={{ padding: "16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${acc.color}25`, borderRadius: 14, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", margin: "0 0 4px" }}>{acc.name}</p>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: acc.color + "15", color: acc.color, borderRadius: 10 }}>{acc.status}</span>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: acc.pnl.startsWith("+") ? "#00E87A" : "#FF3B5C" }}>{acc.pnl}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${acc.dd * 10}%`, background: acc.color, borderRadius: 2, opacity: 0.8 }} />
                      </div>
                      <p style={{ fontSize: 10, color: "#52525b", margin: "4px 0 0" }}>Drawdown: {acc.dd}%</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "60px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20, marginBottom: 24, width: "fit-content" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#8B96E8", letterSpacing: "0.08em" }}>UNIQUE TO TRADEMIND</span>
                </div>
                <h3 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>Multi-Prop-Firm Dashboard</h3>
                <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.8, margin: "0 0 24px" }}>
                  Running FTMO, Apex, and TopStep simultaneously? See all your funded accounts in one view with real-time drawdown bars, today&apos;s P&L, and risk status. Know which account needs protecting before it&apos;s too late.
                </p>
                <Link href="/accounts" style={{ fontSize: 14, color: "#5E6AD2", fontWeight: 600, textDecoration: "none" }}>View multi-account demo →</Link>
              </div>
            </div>

            {/* Feature 3: Confluence Analytics */}
            <div className="feature-split">
              <div style={{ padding: "60px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 20, marginBottom: 24, width: "fit-content" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#00C896", letterSpacing: "0.08em" }}>UNIQUE TO TRADEMIND</span>
                </div>
                <h3 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>Confluence Combination Analytics</h3>
                <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.8, margin: "0 0 24px" }}>
                  The only journal that calculates win rate for your ICT/SMC setup combinations. FVG alone: 48% WR. FVG + OB: 71% WR. BOS + OB + FVG: 79% WR. Now you know which combos to take and which to skip.
                </p>
                <Link href="/analytics" style={{ fontSize: 14, color: "#00C896", fontWeight: 600, textDecoration: "none" }}>See confluence analytics →</Link>
              </div>
              <div style={{ padding: "60px 40px", background: "rgba(0,232,122,0.02)", borderLeft: "1px solid rgba(0,232,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 300 }}>
                  {[
                    { combo: "FVG + OB", wr: 71, trades: 47, color: "#00E87A" },
                    { combo: "BOS + OB", wr: 64, trades: 38, color: "#00E87A" },
                    { combo: "FVG only", wr: 48, trades: 82, color: "#FFB020" },
                    { combo: "OB only",  wr: 41, trades: 29, color: "#FF3B5C" },
                  ].map((row) => (
                    <div key={row.combo} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7", margin: "0 0 5px" }}>{row.combo}</p>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${row.wr}%`, background: row.color, borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: row.color, margin: 0 }}>{row.wr}%</p>
                        <p style={{ fontSize: 10, color: "#52525b", margin: 0 }}>{row.trades} trades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 16 }}>TRADER STORIES</p>
            <h2 className="glow-text" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: 0 }}>Real traders. Real results.</h2>
          </div>

          <div style={{ columns: "1 320px", columnGap: 14 }}>
            {[
              { name: "Alex M.", tag: "FTMO $100k — passed", color: "#00E87A", quote: "I failed FTMO 6 times before TradeMind. Every single failure happened on a day I was already frustrated. The mental check-in caught it. Passed on the next attempt." },
              { name: "Jamie L.", tag: "Apex Trader Funding", color: "#5E6AD2", quote: "The tilt banner saved my Apex account twice last month. After my third loss in a row it pops up red. I didn't realize I was in revenge mode. That's $6,000 in losses I didn't take." },
              { name: "Ryan T.", tag: "Running FTMO + Apex + TopstepX", color: "#FFB020", quote: "The multi-account dashboard is the only reason I can manage three funded accounts without losing track of which one is close to the drawdown limit. Nothing else does this." },
              { name: "Marcus D.", tag: "ICT/SMC trader — 3 years", color: "#00E87A", quote: "The confluence analytics showed me my FVG+OB win rate is 71%. FVG alone: 48%. I stopped taking FVG-only setups. P&L went up immediately. This data exists nowhere else." },
              { name: "Sarah K.", tag: "Full-time prop trader", color: "#FF3B5C", quote: "I've tried TradeZella, TraderSync, and Edgewonk. TradeMind is the only one that changes your behavior during a session instead of showing you what went wrong after." },
              { name: "Kevin W.", tag: "TopstepX — Phase 1 passed", color: "#5E6AD2", quote: "Skeptical about the mental score thing. But after 30 days the data was undeniable — my GO days average +$340. CAUTION days: -$180. Same strategy, different mental state." },
            ].map((t) => (
              <div key={t.name} className="testimonial-card" style={{ borderTop: `2px solid ${t.color}` }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="12" height="12" viewBox="0 0 14 14" fill="#FFB020"><path d="M7 1l1.6 3.4 3.7.5-2.7 2.6.6 3.7L7 9.5 3.8 11.2l.6-3.7L1.7 4.9l3.7-.5L7 1z"/></svg>)}
                </div>
                <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.7, margin: "0 0 16px", fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", margin: "0 0 2px" }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: t.color, margin: 0, fontWeight: 600 }}>{t.tag}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/testimonials" style={{ fontSize: 14, color: "#5E6AD2", fontWeight: 600, textDecoration: "none" }}>Read all 312 reviews →</Link>
          </div>
        </div>
      </section>

      {/* ── COST CALCULATOR ─────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 16 }}>ROI CALCULATOR</p>
            <h2 className="glow-text" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: "0 0 16px" }}>How much are bad mental days costing you?</h2>
            <p style={{ fontSize: 16, color: "#71717a" }}>Drag the sliders to personalize your number.</p>
          </div>
          <CostCalculator />
        </div>
      </section>

      {/* ── COMPARISON ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 16 }}>COMPARISON</p>
            <h2 className="glow-text" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: 0 }}>Built for prop traders.<br />Not retrofitted for them.</h2>
          </div>

          <div className="comparison-outer" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
            <div className="comparison-row" style={{ padding: "14px 24px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#52525b" }}>FEATURE</span>
              {["TRADEMIND", "TRADEZELLA", "TRADERSYNC", "EDGEWONK"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: h === "TRADEMIND" ? "#5E6AD2" : "#52525b", textAlign: "center" }}>{h}</span>
              ))}
            </div>
            {[
              ["Mental readiness score (GO/CAUTION/NO-TRADE)", true, false, false, false],
              ["Real-time tilt detection", true, false, false, false],
              ["Multi-prop-firm dashboard", true, false, false, false],
              ["Confluence combination analytics", true, false, false, false],
              ["ICT/SMC setup tagging", true, true, false, true],
              ["Broker auto-sync", true, true, true, false],
              ["CSV import", true, true, true, true],
              ["AI coach", true, true, false, false],
              ["Mobile app (PWA)", true, true, true, false],
              ["Price (Pro)", "$39/mo", "$49/mo", "$29.95/mo", "~$169 once"],
            ].map((row, i, arr) => (
              <div key={i} className="comparison-row" style={{ padding: "13px 24px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <span style={{ fontSize: 14, color: "#a1a1aa" }}>{row[0]}</span>
                {row.slice(1).map((v, j) => (
                  <div key={j} style={{ textAlign: "center" }}>
                    {typeof v === "boolean" ? (
                      <span style={{ fontSize: 16, color: v ? (j === 0 ? "#00E87A" : "#52525b") : "#2a2a2a" }}>{v ? "✓" : "—"}</span>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: j === 0 ? "#00E87A" : "#52525b" }}>{v}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 16 }}>PRICING</p>
            <h2 className="glow-text" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: "0 0 32px" }}>Less than one bad trade prevented.</h2>

            {/* Toggle */}
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 30, padding: 4, gap: 4 }}>
              {(["monthly", "annual"] as BillingCycle[]).map((b) => (
                <button key={b} onClick={() => setBilling(b)} style={{
                  padding: "9px 20px", borderRadius: 24, border: "none", cursor: "pointer", fontFamily: "inherit",
                  background: billing === b ? "#fff" : "transparent",
                  color: billing === b ? "#000" : "#71717a",
                  fontSize: 14, fontWeight: 600,
                  transition: "all 0.2s ease",
                }}>
                  {b === "monthly" ? "Monthly" : "Annual"}{b === "annual" && <span style={{ fontSize: 11, color: billing === "annual" ? "#00C896" : "#52525b", marginLeft: 6 }}>−26%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="pricing-2">
            {/* Free */}
            <div className="feature-card" style={{ padding: "36px 32px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#a1a1aa", margin: "0 0 16px", letterSpacing: "0.04em" }}>FREE</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-2px" }}>$0</span>
              </div>
              <p style={{ fontSize: 14, color: "#52525b", margin: "0 0 28px" }}>Forever. No credit card.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {["Unlimited daily check-ins", "GO / CAUTION / NO-TRADE verdict", "Up to 50 trades in journal", "Basic analytics", "Tilt detection (free)"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#52525b" strokeWidth="1.2"/><path d="M5 7.5l2 2 3.5-3.5" stroke="#52525b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 14, color: "#71717a" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-ghost" style={{ display: "block", textAlign: "center", width: "100%" }}>Get started free</Link>
            </div>

            {/* Pro */}
            <div style={{ padding: "36px 32px", background: "rgba(94,106,210,0.08)", border: "1px solid rgba(94,106,210,0.3)", borderRadius: 20, position: "relative" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", background: "#5E6AD2", borderRadius: 20, fontSize: 11, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>MOST POPULAR</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#8B96E8", margin: "0 0 16px", letterSpacing: "0.04em" }}>PRO</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-2px" }}>${price}</span>
                <span style={{ fontSize: 16, color: "#71717a" }}>/mo</span>
              </div>
              <p style={{ fontSize: 14, color: "#52525b", margin: "0 0 28px" }}>
                {billing === "annual" ? "$348/year — save $120" : "Billed monthly · cancel anytime"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {[
                  "Everything in Free",
                  "Confluence combination analytics",
                  "AI Pattern Insights (weekly)",
                  "Multi-prop-firm dashboard",
                  "Monte Carlo projections (P10/P50/P90)",
                  "Execution quality scoring",
                  "Unlimited trades",
                  "Full analytics suite",
                  "Priority support",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#5E6AD2" strokeWidth="1.2"/><path d="M5 7.5l2 2 3.5-3.5" stroke="#5E6AD2" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 14, color: "#a1a1aa" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-primary" style={{ display: "block", textAlign: "center", width: "100%" }}>
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#5E6AD2", marginBottom: 16 }}>FAQ</p>
            <h2 className="glow-text" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", margin: 0 }}>Common questions</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "160px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* Aurora behind CTA */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(94,106,210,0.15) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 24 }}>
              {[...Array(5)].map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 14 14" fill="#FFB020"><path d="M7 1l1.6 3.4 3.7.5-2.7 2.6.6 3.7L7 9.5 3.8 11.2l.6-3.7L1.7 4.9l3.7-.5L7 1z"/></svg>)}
            </div>
            <h2 className="glow-text" style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-3px", margin: "0 0 24px" }}>
              Your edge starts with<br />knowing yourself.
            </h2>
            <p style={{ fontSize: 18, color: "#71717a", margin: "0 0 40px", lineHeight: 1.7 }}>
              Free account. Your first check-in takes 60 seconds.<br />Most traders wish they had started this sooner.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" className="btn-primary" style={{ padding: "16px 36px", fontSize: 16 }}>
                Start free — no card needed
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
            <p style={{ fontSize: 13, color: "#3f3f46", marginTop: 16 }}>2,400+ traders · 4.8★ rating · cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="footer-5">
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, color: "#fff", margin: "0 0 12px" }}>TradeMind</p>
              <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.7, margin: 0 }}>The mental performance system for prop firm traders.</p>
            </div>
            {[
              { title: "Product", links: [{ href: "/pricing", label: "Pricing" }, { href: "/changelog", label: "Changelog" }, { href: "/for-ftmo-traders", label: "For FTMO" }, { href: "/partners-program", label: "Partners" }] },
              { title: "Compare", links: [{ href: "/vs-tradezella", label: "vs TradeZella" }, { href: "/vs-tradersync", label: "vs TraderSync" }, { href: "/vs-edgewonk", label: "vs Edgewonk" }] },
              { title: "Resources", links: [{ href: "/blog", label: "Blog" }, { href: "/testimonials", label: "Testimonials" }, { href: "/help", label: "Help Center" }] },
              { title: "Legal", links: [{ href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }, { href: "/refund", label: "Refund Policy" }, { href: "/contact", label: "Contact" }] },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#52525b", margin: "0 0 14px" }}>{col.title.toUpperCase()}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l) => (
                    <Link key={l.href} href={l.href} style={{ fontSize: 14, color: "#71717a", textDecoration: "none", transition: "color 0.15s" }} className="nav-link">{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#3f3f46", margin: 0 }}>© 2025 TradeMind. All rights reserved.</p>
            <p style={{ fontSize: 13, color: "#3f3f46", margin: 0 }}>Built for traders who take their edge seriously.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
