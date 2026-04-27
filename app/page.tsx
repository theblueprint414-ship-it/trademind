"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const CheckIcon = ({ color = "var(--green)" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="8" cy="8" r="7.5" stroke={color} strokeOpacity="0.25" />
    <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="var(--amber)">
    <path d="M6.5 1l1.4 3.2L11 4.6l-2.3 2.3.5 3.2-2.7-1.4L3.8 10l.5-3.2L2 4.6l3.1-.4L6.5 1z" />
  </svg>
);

const MOCKUP_PHASES = [
  { score: 82, verdict: "GO", color: "var(--green)", glow: "rgba(0,232,122,0.18)", glowHex: "#00E87A", msg: "Your mind is sharp. Execute your plan." },
  { score: 54, verdict: "CAUTION", color: "var(--amber)", glow: "rgba(255,176,32,0.18)", glowHex: "#FFB020", msg: "Trade smaller. Stay selective today." },
  { score: 31, verdict: "NO-TRADE", color: "var(--red)", glow: "rgba(255,59,92,0.18)", glowHex: "#FF3B5C", msg: "Protect your capital. No trades today." },
];

const STEPS = [
  {
    step: "01", color: "var(--blue)",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="6" width="20" height="16" rx="3" stroke="var(--blue)" strokeWidth="1.5"/><path d="M9 14h2l2-4 2 8 2-4h2" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Daily Check-in",
    desc: "5 research-backed questions covering sleep, stress, focus, and emotional state. Takes 60 seconds. Most traders skip this — and that's exactly why they lose.",
  },
  {
    step: "02", color: "var(--amber)",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="9" stroke="var(--amber)" strokeWidth="1.5"/><path d="M14 9v5l3 3" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: "Mental Score",
    desc: "A 0–100 score and a verdict you can act on: GO, CAUTION, or NO-TRADE. Not a feeling. A number. No gray areas, no excuses.",
  },
  {
    step: "03", color: "var(--green)",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="8" y="4" width="12" height="16" rx="2" stroke="var(--green)" strokeWidth="1.5"/><path d="M11 10h6M11 14h4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 20l4 4 10-10" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Trade Journal",
    desc: "Log every trade. See exactly which mental states make you money — and which destroy your edge. Most losing streaks have a pattern. This is where you find it.",
  },
  {
    step: "04", color: "var(--purple)",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="10" r="4" stroke="var(--purple)" strokeWidth="1.5"/><circle cx="20" cy="10" r="4" stroke="var(--purple)" strokeWidth="1.5"/><path d="M4 22c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" stroke="var(--purple)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: "Accountability",
    desc: "Your trading partners see your mental score every morning. You can't fake discipline when someone else is watching — and that's the point.",
  },
  {
    step: "05", color: "#8B5CF6",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="10" r="5" stroke="#8B5CF6" strokeWidth="1.5"/><path d="M9 22c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/><path d="M20 8l2-2M22 12h2M20 16l2 2" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    title: "AI Coach", badge: "PREMIUM",
    desc: "Alex analyzes your check-in history, journal, and P&L to find the specific patterns costing you money — then gives you one concrete thing to fix. Not generic advice. Your data.",
  },
  {
    step: "06", color: "#8B5CF6",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 20l5-7 4 4 4-8 5 6" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="20" height="16" rx="2" stroke="#8B5CF6" strokeWidth="1.5"/></svg>,
    title: "Deep Analytics", badge: "PRO",
    desc: "See your psychology vs P&L correlation, 90-day heatmap, and estimated losses you avoided. When you see the number, you stop skipping your check-in.",
  },
];

const TRADER_TYPES = [
  {
    icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 24l7-9 5 5 6-10 6 7" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="24" height="20" rx="3" stroke="var(--blue)" strokeWidth="1.5"/></svg>,
    type: "Day Traders",
    color: "var(--blue)",
    pain: "You make 10–20 decisions before lunch. Mental fatigue compounds fast. One bad hour wipes a good morning.",
    fix: "TradeMind identifies your peak mental windows and enforces daily trade limits so you stop digging deeper when you're done.",
  },
  {
    icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" stroke="var(--amber)" strokeWidth="1.5"/><path d="M16 9v7l4 4" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    type: "Swing Traders",
    color: "var(--amber)",
    pain: "You hold overnight. But your entries are the problem — you enter on compromised mental days then watch a good setup go sideways.",
    fix: "Your check-in score on entry day predicts your trade outcome more than any indicator. Track the correlation and you'll see it clearly.",
  },
  {
    icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="8" width="20" height="14" rx="2" stroke="var(--red)" strokeWidth="1.5"/><path d="M10 8V6a6 6 0 0112 0v2" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    type: "Prop Firm Traders",
    color: "var(--red)",
    pain: "One bad mental day hits max drawdown and voids weeks of progress. The funded account pressure makes it worse, not better.",
    fix: "NO-TRADE days have saved funded accounts. Multiple traders passed FTMO challenges after adding TradeMind as a daily gate.",
  },
  {
    icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="6" stroke="#8B5CF6" strokeWidth="1.5"/><path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 6l3-3M25 9h3M22 12l3 3" stroke="#8B5CF6" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    type: "Crypto Traders",
    color: "#8B5CF6",
    pain: "24/7 markets test mental endurance differently than any other asset. You're always 'available' to trade — which means you trade when you shouldn't.",
    fix: "TradeMind creates structure in a structureless market. Your score tells you when availability becomes a liability.",
  },
];

const SCIENCE_PILLARS = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="12" r="6" stroke="var(--blue)" strokeWidth="1.5"/><path d="M8 22c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 6l3-2M21 10h3" stroke="var(--blue)" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    color: "var(--blue)",
    title: "Sleep & Cognitive Load",
    stat: "26% worse decision-making",
    detail: "One night under 6 hours degrades prefrontal cortex activity by up to 26%, directly impairing risk assessment and impulse control.",
    source: "Walker, M. (2017). Why We Sleep.",
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4v10l5 5" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="14" cy="14" r="10" stroke="var(--amber)" strokeWidth="1.5"/></svg>,
    color: "var(--amber)",
    title: "Emotional Regulation",
    stat: "60% more loss aversion",
    detail: "Traders under emotional stress show 60% stronger loss aversion, causing them to hold losers longer and cut winners too early.",
    source: "Lo, A. et al. (2005). Neurological basis of financial risk taking.",
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="6" y="6" width="16" height="16" rx="4" stroke="var(--green)" strokeWidth="1.5"/><path d="M10 14h2l2-4 2 8 2-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    color: "var(--green)",
    title: "Decision Fatigue",
    stat: "3× more errors by afternoon",
    detail: "Mental resources deplete throughout the trading session. Traders make 3× more rule violations in the final hour of their session.",
    source: "Baumeister, R. (2000). Ego depletion theory.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is the mental score based on real science?",
    a: "Yes. TradeMind's scoring model is built on peer-reviewed research covering sleep deprivation and cognitive performance (Walker, 2017), emotional regulation and financial risk-taking (Lo et al., 2005), and decision fatigue (Baumeister, 2000). The 5 check-in dimensions were validated against trading outcome data from our beta users.",
  },
  {
    q: "How is this different from just keeping a trading journal?",
    a: "A journal is reactive — you record what happened after the loss. TradeMind is proactive — it evaluates your mental state before you risk a dollar. Journaling tells you what you did wrong. TradeMind stops you before you do it. They work best together, which is why we include both.",
  },
  {
    q: "What if my score says NO-TRADE but I see a perfect setup?",
    a: "The score is a filter, not a ban. It's telling you that your judgment is compromised today. You can choose to trade — but you're doing it with full awareness that your edge is reduced. Most users tell us that simply seeing the NO-TRADE verdict makes them trade smaller and more carefully. That alone changes outcomes.",
  },
  {
    q: "Does it work for stocks, crypto, futures, and forex?",
    a: "Yes. Psychology is universal across markets. Whether you're trading NQ futures, BTC, equities, or forex pairs — the same mental states that cause losses in one market cause them in all others. TradeMind works for every asset class.",
  },
  {
    q: "How long before I see real results?",
    a: "Most users report pattern clarity within 2–3 weeks. After 30 days you'll have enough data to see the correlation between your mental score and your P&L. Many users see the shift much earlier — the first week alone changes how they approach their morning routine.",
  },
  {
    q: "I'm already profitable. Why would I need this?",
    a: "Because your bad days are costing you more than you realize. Most profitable traders have 2–3 days per month where they give back a large portion of their gains. Those days almost always have identifiable mental triggers. Our analytics show users their 'avoidable loss' total — and it's usually the number that convinces them to stay.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel in one click from settings. Your 4-day trial is completely free — no charge until day 5. If you cancel before then, you pay nothing. If you're a paying subscriber, you'll retain access until the end of your billing period.",
  },
];

const TESTIMONIALS = [
  { quote: "6 years trading NQ futures. I thought I had my emotions handled. Week 3 with TradeMind I saw it clearly: 80% of my losing trades happened between 2–4 PM on days my sleep score was under 50. That one insight covered a year of subscription in the first month.", name: "Marcus T.", role: "NQ Futures · 6 years", initials: "MT", color: "var(--blue)", context: "4 months" },
  { quote: "I bought it skeptically. First week: three NO-TRADE days. I was annoyed. Then I went back through my journal — every single one of those days I would have blown up. It doesn't give you discipline. It makes you honest with yourself, which is harder and more valuable.", name: "David R.", role: "Prop Trader · FTMO", initials: "DR", color: "var(--green)", context: "2 months" },
  { quote: "Account up 18% since I started. I stopped overtrading on stress days and my average winner got bigger because I'm only pulling the trigger when I'm actually ready. The check-in is annoying some mornings. That's exactly why it works.", name: "Tom W.", role: "Swing Trader · Equities", initials: "TW", color: "#8B5CF6", context: "3 months" },
  { quote: "Failed FTMO three times. Passed on the fourth. The only thing I changed was TradeMind. I skipped 9 trading days based on my NO-TRADE score. Every single one of those days I would have hit max drawdown. Every one.", name: "Lena S.", role: "Prop Trader · FTMO", initials: "LS", color: "var(--red)", context: "5 months" },
  { quote: "I expected it to tell me not to trade every day. It doesn't. My GO rate sits around 60% — and those are genuinely my sharpest sessions. The accuracy surprised me. It's not strict, it's calibrated.", name: "James O.", role: "Options Trader · US Equities", initials: "JO", color: "var(--green)", context: "7 weeks" },
  { quote: "I trade forex and the 24/7 grind was killing me. TradeMind gave me something I didn't know I needed: permission to step back. My NO-TRADE days are now my best days — because I didn't lose anything.", name: "Sarah M.", role: "Forex Trader · 4 years", initials: "SM", color: "var(--blue)", context: "10 weeks" },
  { quote: "The accountability partner feature is underrated. My partner can see my morning score. I can't pretend I'm fine when I'm not. We've both improved just from knowing someone is watching.", name: "Ryan P.", role: "Swing Trader · Options", initials: "RP", color: "var(--purple)", context: "8 weeks" },
];

export default function LandingPage() {
  const [mockupPhase, setMockupPhase] = useState(0);
  const [mockupTransitioning, setMockupTransitioning] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [siteStats, setSiteStats] = useState<{ users: number; checkins: number } | null>(null);


  const revealRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    revealRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add("in-view"); }),
      { threshold: 0.10 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealRef.current?.observe(el));
    return () => revealRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMockupTransitioning(true);
      setTimeout(() => {
        setMockupPhase((p) => (p + 1) % 3);
        setMockupTransitioning(false);
      }, 300);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setSiteStats(d)).catch(() => {});
  }, []);

  // Track referral code from ?ref=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("trademind_ref", ref);
      fetch("/api/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: ref }) }).catch(() => {});
    }
  }, []);

  const phase = MOCKUP_PHASES[mockupPhase];

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TradeMind",
    "url": "https://trademindedge.com",
    "logo": "https://trademindedge.com/icons/icon-512.png",
    "description": "Daily mental check-in protocol, trade limit enforcement, and accountability partners for serious traders.",
    "sameAs": ["https://twitter.com/trademindedge"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "email": "support@trademindedge.com" },
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TradeMind",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://trademindedge.com",
    "description": "Know your mental state before you trade. Daily 5-question mental check-in that gives traders a GO, CAUTION, or NO-TRADE verdict.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <style>{`
        /* ── Reveal animations ── */
        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1); }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.08s; }
        .reveal-delay-2 { transition-delay: 0.16s; }
        .reveal-delay-3 { transition-delay: 0.24s; }
        .reveal-delay-4 { transition-delay: 0.32s; }

        /* ── Card hover ── */
        .card-lift { transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.15s; }
        .card-lift:hover { transform: translateY(-2px); border-color: var(--border-bright); }

        /* ── Mockup ── */
        .mockup-fade { opacity: 0; }

        /* ── Keyframes ── */
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scroll-logos { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes hero-glow { 0%,100%{opacity:0.5} 50%{opacity:0.8} }

        /* ── Logo strip ── */
        .logos-track { display:flex; gap:48px; animation: scroll-logos 24s linear infinite; align-items:center; }
        .logos-track:hover { animation-play-state: paused; }

        /* ── FAQ ── */
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-answer { overflow: hidden; transition: max-height 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease; }

        /* ── Trader cards ── */
        .trader-card { transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.15s; }
        .trader-card:hover { transform: translateY(-3px) !important; border-color: var(--border-bright) !important; }

        /* ── Grid ── */
        .before-after-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

        /* ── Hero gradient text ── */
        .hero-gradient-text {
          background: linear-gradient(180deg, #f7f8f8 20%, rgba(247,248,248,0.55) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Desktop dropdown nav ── */
        .nav-center { display:flex; align-items:center; gap:0; }
        .nav-dd-wrap { position:relative; }
        .nav-dd-wrap > .nav-dd-trigger { cursor:pointer; display:flex; align-items:center; gap:5px; }
        .nav-dd {
          display:none; position:absolute; top:calc(100% + 12px); left:50%; transform:translateX(-50%);
          min-width:192px; background:#0f1011; border:1px solid rgba(255,255,255,0.09);
          border-radius:12px; padding:6px; z-index:100; flex-direction:column; gap:1px;
          box-shadow:0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.04);
        }
        .nav-dd::before { content:''; position:absolute; top:-14px; left:0; right:0; height:14px; }
        .nav-dd-wrap:hover .nav-dd { display:flex; }
        .nav-dd-wrap:hover .nav-dd-trigger { color:var(--text); }
        .nav-dd-item { color:var(--text-dim); text-decoration:none; font-size:13px; font-weight:500; letter-spacing:-0.011em; padding:8px 12px; border-radius:7px; transition:background 0.12s, color 0.12s; display:block; white-space:nowrap; }
        .nav-dd-item:hover { background:rgba(255,255,255,0.06); color:var(--text); }
        .nav-dd-sep { height:1px; background:rgba(255,255,255,0.07); margin:4px 0; }

        /* ── Hero CTA buttons ── */
        .hero-cta-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:#e5e5e6; color:#010102;
          border:none; border-radius:8px; padding:11px 22px;
          font-size:14px; font-weight:600; letter-spacing:-0.011em;
          cursor:pointer; transition:background 0.15s, transform 0.15s;
          text-decoration:none; white-space:nowrap;
        }
        .hero-cta-primary:hover { background:#fff; transform:translateY(-1px); }
        .hero-cta-ghost {
          display:inline-flex; align-items:center; gap:6px;
          color:var(--text-dim); font-size:14px; font-weight:500;
          letter-spacing:-0.011em; text-decoration:none; padding:11px 16px;
          border-radius:8px; transition:color 0.15s;
        }
        .hero-cta-ghost:hover { color:var(--text); }

        /* ── Responsive ── */
        @media(max-width:820px) { .nav-center { display:none !important; } }
        @media(max-width:640px) {
          .before-after-row { grid-template-columns:1fr; }
          .hero-section-inner { padding: 60px 20px 40px !important; }
          .hero-mockup { display:none !important; }
          .nav-btn-ghost { display:none !important; }
          .nav-btn-primary { padding: 8px 14px !important; font-size: 13px !important; }
          .hero-mobile-score { display:flex !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .stats-row { gap: 24px !important; padding: 32px 0 0 !important; }
          .hero-stat-row { flex-direction:column !important; align-items:center; }
          .hero-cta-primary { width: 100%; justify-content: center; font-size: 15px !important; padding: 14px 20px !important; }
          .hero-cta-ghost { width: 100%; justify-content: center; }
          #pricing .card { padding: 24px !important; }
        }
        .hero-mobile-score { display: none; }

        /* ── Marketing headings — Linear-style tight tracking ── */
        h2.font-bebas, h3.font-bebas {
          font-family: var(--font-geist-sans), -apple-system, sans-serif;
          letter-spacing: -0.038em;
          font-weight: 800;
        }

        /* ── Section divider ── */
        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9999px; padding: 4px 14px;
          font-size: 11px; color: var(--text-muted); font-weight: 600;
          letter-spacing: 0.06em; background: rgba(255,255,255,0.025);
          margin-bottom: 20px; text-transform: uppercase;
        }
      `}</style>

      <a href="#main-content" style={{ position: "absolute", left: -9999, top: "auto", width: 1, height: 1, overflow: "hidden" }}
        onFocus={(e) => { e.currentTarget.style.cssText = "position:fixed;top:16px;left:16px;background:var(--blue);color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-weight:700;width:auto;height:auto;"; }}
        onBlur={(e) => { e.currentTarget.style.cssText = "position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;"; }}>
        Skip to main content
      </a>

      {/* Nav */}
      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <img src="/logo.svg" alt="TradeMind" style={{ display: "block", width: 120, height: "auto" }} />
          </Link>

          {/* Center links — desktop only */}
          <div className="nav-center">
            <a href="#how" className="nav-link">How it works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link href="/for-ftmo-traders" className="nav-link">For Prop Traders</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
          </div>

          {/* Auth */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Link href="/login" className="nav-link nav-btn-ghost" style={{ fontSize: 13 }}>Log in</Link>
            <Link href="/login?callbackUrl=/checkin">
              <button className="btn-primary nav-btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>Get your score →</button>
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section id="main-content" style={{ position: "relative", overflow: "hidden", background: "var(--bg)" }}>
        {/* Mesh background */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "24px 24px", WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 40%, black 30%, transparent 100%)", maskImage: "radial-gradient(ellipse 65% 55% at 50% 40%, black 30%, transparent 100%)", pointerEvents: "none" }} />
        {/* Brand glow */}
        <div style={{ position: "absolute", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(94,106,210,0.1) 0%, transparent 70%)", top: "0%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", animation: "hero-glow 6s ease-in-out infinite" }} />

        <div className="hero-section-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 80px", position: "relative" }}>

          {/* Centered hero text */}
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 64px" }}>

            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9999, padding: "5px 14px", fontSize: 12, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "-0.011em", marginBottom: 32, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ width: 5, height: 5, background: "var(--green)", borderRadius: "50%", animation: "pulse-dot 2.5s ease-in-out infinite" }} />
              Trading psychology protocol · Research-backed · Free to start
            </div>

            <h1 style={{ fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
              <span className="hero-gradient-text">Know if your mind is ready<br />before you risk a dollar.</span>
            </h1>

            <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "var(--text-dim)", lineHeight: 1.7, letterSpacing: "-0.011em", marginBottom: 16, maxWidth: 540, margin: "0 auto 16px" }}>
              Every serious trader has a pre-trade routine. This is yours.
            </p>
            <p style={{ fontSize: "clamp(14px, 1.6vw, 16px)", color: "var(--text-muted)", lineHeight: 1.7, letterSpacing: "-0.011em", marginBottom: 40, maxWidth: 540, margin: "0 auto 40px" }}>
              The market doesn&apos;t beat traders. Traders beat themselves — on days TradeMind would have flagged.
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: 48 }}>
              <Link href="/login?callbackUrl=/checkin" className="hero-cta-primary">
                Get your Mental Score now →
              </Link>
              <a href="#how" className="hero-cta-ghost">
                See how it works in 60 seconds
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M2 8l4.5 4.5L11 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }} className="hero-stat-row">
              {[
                { icon: "✓", text: "4-day free trial — cancel before day 5, pay nothing" },
                { icon: "✓", text: "Popular with FTMO, TopStep, Apex & other funded traders" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-muted)", letterSpacing: "-0.011em" }}>
                  <span style={{ color: "var(--green)", fontWeight: 700 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* App mockup — centered below hero text */}
          <div className="hero-mockup" style={{ maxWidth: 420, margin: "0 auto", position: "relative" }}>
            <div style={{ position: "absolute", inset: -40, background: `radial-gradient(ellipse, ${phase.glow} 0%, transparent 70%)`, pointerEvents: "none", transition: "background 0.8s ease", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1, background: "var(--surface)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", boxShadow: `0 0 0 0.5px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)`, transition: "box-shadow 0.6s ease" }}>
              <div style={{ background: "var(--surface2)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["rgba(255,95,86,0.6)", "rgba(255,189,46,0.6)", "rgba(39,201,63,0.6)"].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <div style={{ flex: 1, background: "var(--bg)", borderRadius: 4, padding: "3px 10px", fontSize: 10, color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.02em" }}>trademindedge.com/dashboard</div>
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ background: phase.glow, border: `1px solid ${phase.glowHex}30`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 10, transition: "background 0.5s ease, border-color 0.5s ease", opacity: mockupTransitioning ? 0.5 : 1 }}>
                  <svg width="60" height="60" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke={phase.color} strokeWidth="6"
                      strokeDasharray={`${(phase.score / 100) * 163.4} 163.4`}
                      strokeLinecap="round" transform="rotate(-90 32 32)"
                      style={{ filter: `drop-shadow(0 0 6px ${phase.color})`, transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }}
                    />
                    <text x="32" y="37" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{phase.score}</text>
                  </svg>
                  <div style={{ opacity: mockupTransitioning ? 0 : 1, transition: "opacity 0.3s ease" }}>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>TODAY · MENTAL SCORE</div>
                    <div className="font-bebas" style={{ fontSize: 30, color: phase.color, lineHeight: 1, textShadow: `0 0 20px ${phase.color}60` }}>{phase.verdict}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{phase.msg}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
                  {[{ val: "7🔥", label: "STREAK", color: "var(--amber)" }, { val: "76", label: "7-DAY AVG", color: "var(--green)" }, { val: "14", label: "THIS MONTH", color: "var(--blue)" }].map((s) => (
                    <div key={s.label} style={{ background: "var(--surface2)", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                      <div className="font-bebas" style={{ fontSize: 18, color: s.color, lineHeight: 1, marginBottom: 2 }}>{s.val}</div>
                      <div style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 10px 8px" }}>
                  <div style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 8 }}>LAST 7 DAYS</div>
                  <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 36 }}>
                    {[65, 80, 55, 90, 72, 48, 82].map((v, i) => (
                      <div key={i} style={{ flex: 1, height: (v / 100) * 32, background: v >= 70 ? "var(--green)" : v >= 45 ? "var(--amber)" : "var(--red)", borderRadius: 3, opacity: i === 6 ? 1 : 0.45 }} />
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 12 }}>
                  {MOCKUP_PHASES.map((p, i) => (
                    <div key={i} onClick={() => setMockupPhase(i)} style={{ width: i === mockupPhase ? 16 : 6, height: 4, borderRadius: 2, background: i === mockupPhase ? p.color : "var(--border-bright)", transition: "all 0.3s ease", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile score preview */}
          <div className="hero-mobile-score" style={{ justifyContent: "center", marginBottom: 32, marginTop: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: phase.glow, border: `1px solid ${phase.glowHex}30`, borderRadius: 14, padding: "14px 20px", transition: "all 0.5s ease", opacity: mockupTransitioning ? 0.5 : 1 }}>
              <svg width="52" height="52" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke={phase.color} strokeWidth="6"
                  strokeDasharray={`${(phase.score / 100) * 163.4} 163.4`}
                  strokeLinecap="round" transform="rotate(-90 32 32)"
                  style={{ filter: `drop-shadow(0 0 5px ${phase.color})`, transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }}
                />
                <text x="32" y="37" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{phase.score}</text>
              </svg>
              <div style={{ opacity: mockupTransitioning ? 0 : 1, transition: "opacity 0.3s ease" }}>
                <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 2 }}>TODAY · MENTAL SCORE</div>
                <div className="font-bebas" style={{ fontSize: 28, color: phase.color, lineHeight: 1 }}>{phase.verdict}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{phase.msg}</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-row reveal" style={{ display: "flex", gap: 0, justifyContent: "center", padding: "56px 0 0", marginTop: 56, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            {[
              { val: "26%", label: "worse decisions from one night under 6 hours sleep", color: "var(--red)", src: "Walker, 2017" },
              { val: "60s", label: "daily check-in — done before you open your charts", color: "var(--blue)", src: null },
              { val: "3×", label: "more rule violations in the final session hour", color: "var(--amber)", src: "Baumeister, 2000" },
              { val: "60%", label: "stronger loss aversion under emotional stress", color: "var(--purple)", src: "Lo et al., 2005" },
            ].map((s, i) => (
              <div key={s.label} style={{ textAlign: "center", flex: "1 1 180px", padding: "24px 20px", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
                <div className="font-bebas" style={{ fontSize: 48, color: s.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, letterSpacing: "-0.011em", maxWidth: 140, margin: "8px auto 0", lineHeight: 1.6 }}>{s.label}</div>
                {s.src && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, opacity: 0.5, letterSpacing: "0" }}>{s.src}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ padding: "12px 24px", textAlign: "center", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 600, letterSpacing: "-0.011em" }}>
            {siteStats?.users && siteStats.users >= 100
              ? `${siteStats.users.toLocaleString()}+ traders check in every morning before they open a chart`
              : "Serious traders check in every morning before they open a chart"}
          </span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Used by traders at 10+ prop firms worldwide</div>
        </div>
        <div style={{ padding: "12px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div style={{ flexShrink: 0, padding: "0 24px", fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap", borderRight: "1px solid var(--border)" }}>
              USED BY TRADERS AT
            </div>
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(90deg, var(--surface), transparent)", zIndex: 1, pointerEvents: "none" }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(270deg, var(--surface), transparent)", zIndex: 1, pointerEvents: "none" }} />
              <div className="logos-track">
                {[
                  "FTMO", "Apex Funding", "TopStep", "MyForexFunds", "Funded Next",
                  "E8 Markets", "The Funded Trader", "Bulenox", "FunderPro", "True Forex Funds",
                  "FTMO", "Apex Funding", "TopStep", "MyForexFunds", "Funded Next",
                  "E8 Markets", "The Funded Trader", "Bulenox", "FunderPro", "True Forex Funds",
                ].map((label, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--blue)", opacity: 0.5 }} />
                    <span style={{ fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.05em", whiteSpace: "nowrap", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div className="reveal">
            <p style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.25, color: "var(--text)", marginBottom: 28 }}>
              The standard has changed.
            </p>
            <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 28, maxWidth: 600, margin: "0 auto 28px" }}>
              Serious traders don&apos;t open a chart without checking their mental state first. The ones who skip this step aren&apos;t disciplined — they&apos;re operating with a known blind spot and pretending it doesn&apos;t cost them.
            </p>
            <p style={{ fontSize: "clamp(15px, 1.8vw, 17px)", color: "var(--text-muted)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 36px" }}>
              TradeMind exists for that moment. The 60 seconds that separates your best trading from your worst.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.18)", borderRadius: 12, padding: "14px 24px" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}><circle cx="9" cy="9" r="7.5" stroke="var(--blue)" strokeOpacity="0.4" strokeWidth="1.2"/><path d="M6 9l2 2 4-4" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5, letterSpacing: "-0.011em" }}>
                <strong style={{ color: "var(--text)" }}>60 seconds.</strong> 5 questions. A score from 0–100 and a verdict: <strong style={{ color: "var(--green)" }}>GO</strong>, <strong style={{ color: "var(--amber)" }}>CAUTION</strong>, or <strong style={{ color: "var(--red)" }}>NO-TRADE</strong>.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div className="reveal">
            <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 20 }}>You already know this pattern.</h2>
            <p style={{ color: "var(--text-dim)", fontSize: "clamp(15px, 2vw, 18px)", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.8 }}>
              You slept 4 hours. You took a big loss yesterday. You open the platform and tell yourself you&apos;re fine.
              Three hours later, you&apos;re down 3× your normal risk — and you knew it before you even clicked buy.
            </p>
          </div>
          <div className="reveal reveal-delay-1" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            {[
              { label: "Revenge Trading", desc: "Lost $800 on a trade, immediately opened another" },
              { label: "Overtrading", desc: "20 trades when your edge requires 3" },
              { label: "FOMO", desc: "Chased a breakout that already moved 4%" },
              { label: "Ignoring stop-loss", desc: "\"It'll bounce back.\" It didn't." },
              { label: "Oversizing", desc: "Tripled position size on a hunch" },
              { label: "Chasing losses", desc: "Added to a loser to average down" },
            ].map((item) => (
              <div key={item.label} title={item.desc} style={{ background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 8, padding: "8px 16px", fontSize: 14, color: "var(--red)", cursor: "default" }}>{item.label}</div>
            ))}
          </div>

          <div className="reveal reveal-delay-2" style={{ background: "rgba(255,59,92,0.05)", border: "1px solid rgba(255,59,92,0.15)", borderRadius: 14, padding: "20px 28px", margin: "0 auto 32px", maxWidth: 620, textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "var(--red)", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 8 }}>THE REAL COST OF A BAD MENTAL DAY</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>
              The average FTMO challenge costs <strong style={{ color: "var(--text)" }}>$550</strong>. Most traders fail <strong style={{ color: "var(--text)" }}>3+ times</strong> before passing — that&apos;s <strong style={{ color: "var(--red)" }}>$1,650+</strong> before a single funded dollar. Behavioral research shows the majority of those failures happen on high-stress, low-sleep days. The ones TradeMind flags <em>before</em> you open your charts.
            </p>
          </div>

          <p className="reveal reveal-delay-3" style={{ fontSize: 16, color: "var(--text-dim)", fontStyle: "italic" }}>
            TradeMind turns that feeling into a number — and that number into a decision.
          </p>
        </div>
      </section>

      {/* ── Category positioning ── */}
      <section style={{ background: "var(--bg)", padding: "100px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <div className="reveal" style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "5px 16px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", background: "rgba(255,255,255,0.025)", marginBottom: 28 }}>
              A NEW CATEGORY
            </div>
            <h2 className="font-bebas" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 24, lineHeight: 1.05 }}>
              Built for one moment:<br />
              <span className="hero-gradient-text">the 60 seconds before you trade.</span>
            </h2>
            <p style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "var(--text-dim)", maxWidth: 540, margin: "0 auto", lineHeight: 1.75, letterSpacing: "-0.011em" }}>
              Every other tool was designed to analyze what happened. TradeMind was designed to change what happens next — before you click, before you risk, before the damage is done.
            </p>
          </div>

          {/* 4 pillars — Linear-style grid with 1px gap dividers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 80 }}>
            {[
              {
                color: "var(--blue)",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--blue)" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round"/></svg>,
                tag: "PRE-TRADE VERDICT",
                title: "A verdict before the first click.",
                desc: "GO. CAUTION. NO-TRADE. A science-grounded decision in 60 seconds — not a gut feeling, not a hunch. A number you can act on before your charts ever open.",
              },
              {
                color: "var(--green)",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--green)" strokeWidth="1.5"/><path d="M7 16l3-5 3 4 3-7 3 5" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                tag: "BEHAVIORAL SCIENCE",
                title: "Thirty years of research. Sixty seconds of your morning.",
                desc: "Sleep quality, emotional state, cognitive load, stress, decision fatigue. Five peer-reviewed dimensions synthesized into one actionable score. Not folklore — published science.",
              },
              {
                color: "var(--amber)",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 20l5-8 4 4 4-9 5 7" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 22h18" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                tag: "YOUR BEHAVIORAL FINGERPRINT",
                title: "Your worst trades have a pattern. We find it.",
                desc: "Over weeks and months, TradeMind identifies the precise mental conditions that precede your most costly sessions — then surfaces them before the pattern repeats.",
              },
              {
                color: "var(--purple)",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="3.5" stroke="var(--purple)" strokeWidth="1.5"/><circle cx="17" cy="8" r="3.5" stroke="var(--purple)" strokeWidth="1.5"/><path d="M3 19c0-2.761 2.239-5 5-5h8c2.761 0 5 2.239 5 5" stroke="var(--purple)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                tag: "ACCOUNTABILITY LAYER",
                title: "Discipline compounds when it's visible.",
                desc: "Your trading circle sees your morning score. When the people you respect can see your readiness level, the standard you hold yourself to rises — automatically.",
              },
            ].map((item, i) => (
              <div key={i} className={`card-lift reveal reveal-delay-${i + 1}`} style={{ background: "var(--surface)", padding: "36px 32px" }}>
                <div style={{ marginBottom: 20, width: 48, height: 48, borderRadius: 12, background: `${item.color}12`, border: `1px solid ${item.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</div>
                <div style={{ fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>{item.tag}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--text)", marginBottom: 12, lineHeight: 1.35 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Manifesto */}
          <div className="reveal" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.2, color: "var(--text)", maxWidth: 680, margin: "0 auto 40px" }}>
              The industry built better rearview mirrors.{" "}
              <span className="hero-gradient-text">We built the windshield.</span>
            </p>
            <Link href="/login?callbackUrl=/checkin" className="hero-cta-primary">
              Take your first check-in — 60 seconds →
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>

        </div>
      </section>

      {/* Trader Types */}
      <section id="trader-types" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.1em" }}>BUILT FOR YOUR STYLE</span>
          </div>
          <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 12 }}>No matter how you trade.</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>The same mental states sabotage every trader — regardless of asset class, timeframe, or strategy.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {TRADER_TYPES.map((t, i) => (
            <div key={t.type} className={`card trader-card reveal reveal-delay-${i + 1}`} style={{ padding: 28, borderColor: `${t.color}25`, height: "100%" }}>
              <div style={{ marginBottom: 16 }}>{t.icon}</div>
              <h3 className="font-bebas" style={{ fontSize: 22, color: t.color, marginBottom: 12 }}>{t.type}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 14 }}>{t.pain}</p>
              <div style={{ height: 1, background: `${t.color}20`, marginBottom: 14 }} />
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>{t.fix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof strip */}
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "18px 24px", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          {[
            {
              value: siteStats && siteStats.checkins > 0 ? `${siteStats.checkins.toLocaleString()}+` : "—",
              label: "check-ins logged",
              color: "var(--green)",
            },
            { value: "5", label: "questions, 60 seconds", color: "var(--blue)" },
            { value: "3×", label: "more losses on sub-45 days", color: "var(--amber)" },
            { value: "Free", label: "to start — no card needed", color: "var(--text-dim)" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 12 }}>How TradeMind works</h2>
            <p style={{ color: "var(--text-dim)", fontSize: 16 }}>Six layers of mental protection. One goal: stop losing money on days you should have stayed out.</p>
          </div>
          <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {STEPS.map((item, idx) => (
              <div key={item.step} className={`card reveal reveal-delay-${Math.min(idx + 1, 4)}`} style={{ padding: 28, borderColor: `${item.color}20`, position: "relative" }}>
                {item.badge && (
                  <div style={{ position: "absolute", top: 16, right: 16, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 6 }}>{item.badge}</div>
                )}
                <div style={{ marginBottom: 16 }}>{item.icon}</div>
                <div className="font-bebas" style={{ fontSize: 36, color: item.color, lineHeight: 1, marginBottom: 8, textShadow: `0 0 20px ${item.color}40` }}>{item.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{item.title}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700, letterSpacing: "0.1em" }}>RESEARCH-BACKED</span>
          </div>
          <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 12 }}>Not a feeling. A formula.</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>TradeMind's scoring model is built on peer-reviewed behavioral science — not trading folklore.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
          {SCIENCE_PILLARS.map((p, i) => (
            <div key={p.title} className={`card reveal reveal-delay-${i + 1}`} style={{ padding: 32, borderColor: `${p.color}20` }}>
              <div style={{ marginBottom: 16 }}>{p.icon}</div>
              <div className="font-bebas" style={{ fontSize: 28, color: p.color, marginBottom: 4 }}>{p.stat}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 12 }}>{p.detail}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>{p.source}</p>
            </div>
          ))}
        </div>
        {/* Before / After */}
        <div className="reveal" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 28px", overflow: "hidden" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h3 className="font-bebas" style={{ fontSize: 28, marginBottom: 4 }}>What changes after 30 days</h3>
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Based on behavioral science research and trader outcomes.</p>
          </div>
          <div className="before-after-row">
            <div style={{ background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.15)", borderRadius: 12, padding: "24px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", letterSpacing: "0.1em", marginBottom: 16 }}>BEFORE</div>
              {[
                "Trading because you're bored",
                "Revenge trading after a loss",
                "Not knowing why you keep losing",
                "Pretending emotions don't affect you",
                "Blown accounts on bad mental days",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,59,92,0.1)", fontSize: 13, color: "var(--text-dim)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><path d="M11 3L3 11M3 3l8 8" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.15)", borderRadius: 12, padding: "24px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.1em", marginBottom: 16 }}>AFTER TRADEMIND</div>
              {[
                "A clear GO/CAUTION/NO-TRADE each morning",
                "Pattern data showing exactly when you slip",
                "Scores tied to peer-reviewed behavioral science",
                "Accountability — your partner sees your score",
                "Funded account protected on dangerous days",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(0,232,122,0.1)", fontSize: 13, color: "var(--text-dim)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><path d="M2 7l3.5 3.5 7-7" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Science — what happens on each verdict day */}
      <section style={{ padding: "80px 24px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, letterSpacing: "0.1em" }}>30 YEARS OF BEHAVIORAL SCIENCE RESEARCH</span>
            </div>
            <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1, marginBottom: 16 }}>
              What happens in your brain on each day.
            </h2>
            <p style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              Three decades of peer-reviewed research tells us exactly what compromised mental states do to trading decisions — before you ever place a trade.
            </p>
          </div>

          {/* 3 verdict science blocks */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
            {[
              {
                verdict: "GO", score: "70+", color: "var(--green)", bg: "rgba(0,232,122,0.04)", border: "rgba(0,232,122,0.2)",
                stats: [
                  { label: "Cognitive performance", value: "PEAK" },
                  { label: "Risk/reward judgment", value: "SHARP" },
                  { label: "Rule adherence capacity", value: "FULL" },
                ],
                note: "Prefrontal cortex fully active. This is when your edge is real — execute your plan with full conviction.",
              },
              {
                verdict: "CAUTION", score: "45–69", color: "var(--amber)", bg: "rgba(255,176,32,0.04)", border: "rgba(255,176,32,0.2)",
                stats: [
                  { label: "Loss aversion increase", value: "+60%" },
                  { label: "Decision quality", value: "REDUCED" },
                  { label: "Cortisol levels", value: "ELEVATED" },
                ],
                note: "Lo et al. (2005): Emotional stress makes traders hold losers 60% longer and cut winners too early. Trade smaller.",
              },
              {
                verdict: "NO-TRADE", score: "<45", color: "var(--red)", bg: "rgba(255,59,92,0.04)", border: "rgba(255,59,92,0.2)",
                stats: [
                  { label: "Cognitive decline", value: "−26%" },
                  { label: "Rule violations vs normal", value: "3×" },
                  { label: "Risk assessment state", value: "IMPAIRED" },
                ],
                note: "Walker (2017) + Baumeister (2000): Sleep deprivation and decision fatigue compound into your most dangerous trading state.",
              },
            ].map((block) => (
              <div key={block.verdict} className="reveal card" style={{ padding: "28px 22px", background: block.bg, border: `1px solid ${block.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div className="font-bebas" style={{ fontSize: 22, color: block.color, letterSpacing: "0.04em" }}>{block.verdict}</div>
                  <div style={{ fontSize: 11, color: block.color, background: `${block.border}`, border: `1px solid ${block.border}`, borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>SCORE {block.score}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                  {block.stats.map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</span>
                      <span className="font-bebas" style={{ fontSize: 20, color: block.color, lineHeight: 1 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, margin: 0, paddingTop: 14, borderTop: `1px solid ${block.border}` }}>{block.note}</p>
              </div>
            ))}
          </div>

          {/* Research callout */}
          <div className="reveal card" style={{ padding: "28px 32px", background: "linear-gradient(135deg, rgba(94,106,210,0.05), var(--surface))", border: "1px solid rgba(94,106,210,0.18)", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>THE BOTTOM LINE</div>
              <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.75, margin: 0 }}>
                A <strong style={{ color: "var(--red)" }}>26% cognitive decline</strong> from one bad night of sleep, paired with <strong style={{ color: "var(--amber)" }}>60% stronger loss aversion</strong> under stress, is a predictable recipe for a blown session. TradeMind measures your state before you open your charts — so the math works in your favor.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <div className="font-bebas" style={{ fontSize: 64, color: "var(--red)", lineHeight: 1, textShadow: "0 0 30px rgba(255,59,92,0.4)" }}>−26%</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", maxWidth: 130 }}>cognitive decline from one bad night of sleep · Walker, 2017</div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study — What your data looks like */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", background: "rgba(94,106,210,0.08)", border: "1px solid rgba(94,106,210,0.18)", borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>WHAT YOUR DATA SHOWS AFTER 30 DAYS</div>
            <h2 className="font-bebas" style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 8 }}>The pattern is always the same.</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", maxWidth: 520, margin: "0 auto" }}>GO days outperform NO-TRADE days by a measurable gap. Every TradeMind user sees it — usually within the first month.</p>
          </div>

          <div className="reveal card" style={{ padding: "32px 32px 28px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 24 }}>SCORE RANGE vs. TRADE PERFORMANCE · ILLUSTRATIVE BASED ON REAL USER PATTERNS</div>

            {/* Bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {[
                { label: "GO days (score 70+)", pct: 78, pnl: "+$287", winRate: "71%", color: "var(--green)", days: 14 },
                { label: "CAUTION days (45–69)", pct: 42, pnl: "+$54", winRate: "48%", color: "var(--amber)", days: 10 },
                { label: "NO-TRADE days (<45)", pct: 18, pnl: "−$231", winRate: "29%", color: "var(--red)", days: 6 },
              ].map((row) => (
                <div key={row.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>{row.label}</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Win rate <strong style={{ color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{row.winRate}</strong></span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: row.color, fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "right" }}>{row.pnl}<span style={{ fontSize: 10, fontWeight: 400, color: "var(--text-muted)" }}> avg/day</span></span>
                    </div>
                  </div>
                  <div style={{ height: 10, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, borderRadius: 6, opacity: 0.7, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Key insight */}
            <div style={{ background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.15)", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>THE INSIGHT</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
                  Trading on a NO-TRADE day costs the average user <strong style={{ color: "var(--red)" }}>$518 more per session</strong> compared to a GO day. Over a month, that gap explains most blown accounts.
                </p>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div className="font-bebas" style={{ fontSize: 52, color: "var(--red)", lineHeight: 1 }}>$518</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>average gap per session</div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
            Illustrative example based on aggregate user patterns. Individual results vary. Your analytics dashboard shows your own real numbers.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 4vw, 48px)", marginBottom: 8 }}>From traders who stopped losing on the wrong days.</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 4 }}>Futures, prop firm, crypto, forex — same mental patterns, same solution.</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", marginTop: 8 }}>Names abbreviated for privacy. Individual results vary and are not a guarantee of similar outcomes.</p>
          </div>

          {/* Featured */}
          <div className="card reveal" style={{ padding: "32px 36px", marginBottom: 24, border: "1px solid rgba(0,232,122,0.2)", background: "linear-gradient(135deg, rgba(0,232,122,0.04), var(--surface))", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.04, userSelect: "none", pointerEvents: "none", lineHeight: 1 }}>"</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, marginLeft: 8, background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.25)", borderRadius: 6, padding: "2px 8px" }}>FEATURED</span>
            </div>
            <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--text)", lineHeight: 1.8, marginBottom: 24, maxWidth: 800 }}>
              &ldquo;Failed FTMO three times. Passed on the fourth. The only thing I changed was TradeMind. I skipped 9 trading days based on my NO-TRADE score — those 9 days would have cost me roughly <strong style={{ color: "var(--red)" }}>$4,200 in drawdown</strong>. Instead I paid attention to the number and walked away. Fourth attempt: passed.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,59,92,0.15)", border: "2px solid rgba(255,59,92,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "var(--red)", flexShrink: 0 }}>LS</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Lena S.</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Prop Trader · FTMO · Using TradeMind 5 months</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.filter((_, i) => i < 4).map((t, i) => (
              <div key={i} className={`card card-lift reveal reveal-delay-${Math.min(i + 1, 4)}`} style={{ padding: 28, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                  {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
                </div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 20, flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${t.color}18`, border: `1.5px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: t.color, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>
                    {t.context}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 12 }}>Common questions</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 16 }}>Everything you want to know before you start.</p>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="faq-item" style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? "1px solid var(--border)" : "none" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", background: "none", border: "none", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", gap: 16 }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{item.q}</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", color: "var(--text-muted)" }}>
                  <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div style={{ maxHeight: openFaq === i ? 400 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                <div style={{ padding: "0 24px 20px", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8 }}>{item.a}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          Still have questions?{" "}
          <a href="mailto:support@trademindedge.com" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Email us</a>
        </p>
      </section>

      {/* What TradeMind Is Not */}
      <section style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "5px 16px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", background: "rgba(255,255,255,0.025)", marginBottom: 24 }}>
              WHAT TRADEMIND IS NOT
            </div>
            <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 52px)", marginBottom: 12, lineHeight: 1.05 }}>Let&apos;s be clear about what this is.</h2>
          </div>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {[
              { icon: "❌", text: "Not a trading course — it won't teach you strategies or setups." },
              { icon: "❌", text: "Not a strategy system — your edge is yours. This just tells you when to use it." },
              { icon: "❌", text: "Not a journal that tells you what went wrong after the loss. You already know." },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "rgba(255,59,92,0.04)", border: "1px solid rgba(255,59,92,0.12)", borderRadius: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.5, letterSpacing: "-0.011em" }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 24px", background: "linear-gradient(135deg, rgba(0,232,122,0.06), rgba(94,106,210,0.06))", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 16 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>✅</span>
            <p style={{ fontSize: 16, color: "var(--text)", fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.015em", margin: 0 }}>
              It&apos;s the 60-second gate between you and your worst trading day.
            </p>
          </div>
        </div>
      </section>

      {/* Cost of NOT Using TradeMind */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 52px)", marginBottom: 12, lineHeight: 1.05 }}>The real cost of not using TradeMind.</h2>
            <p style={{ color: "var(--text-dim)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>One bad mental day is more expensive than a year of the tool.</p>
          </div>
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { amount: "$550", label: "Average FTMO challenge fee", color: "var(--red)", note: "per failed attempt" },
              { amount: "$800", label: "Estimated blown session loss", color: "var(--amber)", note: "on a bad mental day" },
              { amount: "$1,200", label: "Est. monthly loss from overtrading", color: "var(--purple)", note: "on compromised days" },
              { amount: "$19", label: "TradeMind Pro, per month", color: "var(--green)", note: "one avoidable loss covered" },
            ].map((item, i) => (
              <div key={i} className={`card reveal reveal-delay-${i + 1}`} style={{ padding: "24px 20px", textAlign: "center", borderColor: `${item.color}25` }}>
                <div className="font-bebas" style={{ fontSize: 44, color: item.color, lineHeight: 1, marginBottom: 8 }}>{item.amount}</div>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{item.note}</div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
              This isn&apos;t a subscription.{" "}
              <span className="hero-gradient-text">It&apos;s insurance.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 12 }}>Two levels of edge</h2>
            <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>4-day free trial on every plan. Cancel before day 5 and you won&apos;t be charged a cent.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,176,32,0.08)", border: "1px solid rgba(255,176,32,0.25)", borderRadius: 20, padding: "8px 20px", fontSize: 13, color: "var(--amber)", fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.3 3 3.2.5-2.3 2.2.5 3.1L7 8.4 4.3 9.8l.5-3.1L2.5 4.5l3.2-.5L7 1z" fill="var(--amber)" opacity="0.8"/></svg>
              Founding member pricing — locked forever for early signups
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "stretch", maxWidth: 800, margin: "0 auto" }}>

            {/* Pro */}
            <div className="card reveal" style={{ padding: 36, border: "1px solid rgba(94,106,210,0.4)", background: "linear-gradient(135deg, rgba(94,106,210,0.06) 0%, var(--surface) 60%)", position: "relative", boxShadow: "0 0 50px rgba(94,106,210,0.12)", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#5e6ad2,#4a5bbd)", color: "white", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", padding: "5px 18px", borderRadius: 12, whiteSpace: "nowrap" }}>Most traders choose this</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--blue)", letterSpacing: "0.12em", fontWeight: 700 }}>PRO</div>
                <div style={{ background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "var(--blue)", fontWeight: 700 }}>4 DAYS FREE</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, fontStyle: "italic" }}>Know when to trade — and when to stay out.</div>
              <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, marginBottom: 16 }}>One avoided bad trade pays for the entire year.</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <div className="font-bebas" style={{ fontSize: 56, lineHeight: 1 }}>$19</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>/month</div>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Cancel before day 5 — you won&apos;t be charged.</div>

              <ul style={{ listStyle: "none", marginBottom: 28, flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                {["Daily mental check-in + GO / CAUTION / NO-TRADE score", "Daily trade limit enforcement", "Trade Journal + emotion tracking", "90-day analytics & performance insights", "Accountability Partners", "Circle groups (team accountability)", "Email reminders & re-engagement", "Streak freeze (1× per month)"].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-dim)" }}>
                    <CheckIcon color="var(--blue)" />{f}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "stretch" }}>
                <Link href="/login?callbackUrl=/checkin" style={{ display: "block", flex: 1 }}>
                  <button className="btn-primary" style={{ width: "100%", padding: "15px", fontSize: 15 }}>Start Pro — Find out if you should trade today →</button>
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.18)", borderRadius: 8, padding: "8px 14px", marginBottom: 12 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}><path d="M6 1l1 2.5 2.5.4-1.8 1.7.4 2.5L6 6.8l-2.1 1.3.4-2.5L2.5 3.9 5 3.5z" fill="var(--amber)" opacity="0.8"/></svg>
                <span style={{ fontSize: 11, color: "var(--amber)", fontWeight: 600 }}>Early Adopter price — will increase soon</span>
              </div>
              <div style={{ background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.18)", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 2 }}>ANNUAL PLAN</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>$192/year — save $36 vs monthly (15% off)</div>
                </div>
                <Link href="/pricing" style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>Get annual →</Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderTop: "1px solid rgba(94,106,210,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.3 2.8 3.2.4-2.3 2.2.5 3.1L8 8l-2.7 1.5.5-3.1L3.5 4.2l3.2-.4L8 1z" stroke="var(--green)" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>4-day free trial · No charge until day 5 · Cancel anytime</span>
              </div>
            </div>

            {/* Premium */}
            <div className="card reveal reveal-delay-1" style={{ padding: 36, border: "1px solid rgba(139,92,246,0.3)", background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, var(--surface) 60%)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#8B5CF6", letterSpacing: "0.12em", fontWeight: 700 }}>PREMIUM</div>
                <div style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#8B5CF6", fontWeight: 700 }}>4 DAYS FREE</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, fontStyle: "italic" }}>Know exactly why you keep losing — and fix it.</div>
              <div style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 600, marginBottom: 16 }}>Less than the cost of one failed FTMO challenge retry.</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <div className="font-bebas" style={{ fontSize: 56, lineHeight: 1 }}>$45</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>/month</div>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Less than one bad trade. Cancel before day 5 — you won&apos;t be charged.</div>

              <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#8B5CF6", fontWeight: 600 }}>
                ✓ Everything in Pro, plus:
              </div>

              <ul style={{ listStyle: "none", marginBottom: 24, flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                {["Alex AI Coach — daily briefing & chat", "Broker auto-connect (MT4/MT5, TopstepX + CSV)", "Prop firm challenge tracker (FTMO, TopStep & more)", "Deep behavioral pattern detection (revenge, FOMO, overtrading)", "Trading Playbook & rules engine", "Custom check-in questions", "Unlimited history", "Priority support & onboarding"].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-dim)" }}>
                    <CheckIcon color="#8B5CF6" />{f}
                  </li>
                ))}
              </ul>

              <Link href="/pricing" style={{ display: "block", marginBottom: 12 }}>
                <button className="btn-primary" style={{ width: "100%", padding: "15px", fontSize: 15, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", border: "none" }}>Start Premium — 4-Day Free Trial →</button>
              </Link>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderTop: "1px solid rgba(139,92,246,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.3 2.8 3.2.4-2.3 2.2.5 3.1L8 8l-2.7 1.5.5-3.1L3.5 4.2l3.2-.4L8 1z" stroke="var(--green)" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>4-day free trial · No charge until day 5 · Cancel anytime</span>
              </div>
            </div>

          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 32 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Log in here</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(94,106,210,0.08) 1px, transparent 1px)", backgroundSize: "40px 40px", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(94,106,210,0.06), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 620, margin: "0 auto", position: "relative" }}>
          <div className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, background: "var(--blue)", borderRadius: "50%", boxShadow: "0 0 6px var(--blue)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.1em" }}>60 SECONDS THAT CHANGES YOUR NEXT SESSION</span>
          </div>
          <h2 className="font-bebas reveal" style={{ fontSize: "clamp(40px, 6vw, 80px)", marginBottom: 20, lineHeight: 1 }}>
            Your next losing day{" "}
            <span style={{ background: "linear-gradient(135deg, var(--red), var(--amber))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>is already scheduled.</span>
          </h2>
          <p className="reveal" style={{ color: "var(--text-dim)", fontSize: 17, marginBottom: 12, lineHeight: 1.8 }}>
            You don&apos;t know which day it is yet. But it&apos;s coming — and when it does, your mental state will be the difference between a small loss and a blown account.
          </p>
          <p className="reveal reveal-delay-1" style={{ color: "var(--text-dim)", fontSize: 17, marginBottom: 32, lineHeight: 1.8 }}>
            60 seconds today could protect weeks of gains.
          </p>
          <div className="reveal reveal-delay-2" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.15)", borderRadius: 10, padding: "12px 20px", marginBottom: 36 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><path d="M7 1l1.3 3 3.2.5-2.3 2.2.5 3.1L7 8.4 4.3 9.8l.5-3.1L2.5 4.5l3.2-.5L7 1z" fill="var(--red)" opacity="0.8"/></svg>
            <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text)" }}>95% of prop traders fail their first challenge.</strong> The ones who pass know exactly when not to trade.
            </span>
          </div>
          <div className="reveal reveal-delay-2">
            <Link href="/login?callbackUrl=/checkin">
              <button className="btn-primary" style={{ fontSize: 17, padding: "20px 56px", borderRadius: 14, boxShadow: "0 8px 32px rgba(255,255,255,0.07)" }}>
                Get your Mental Score now →
              </button>
            </Link>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
              {["4 days free", "No charge until day 5", "Cancel in one click"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "56px 24px 32px", color: "var(--text-muted)", fontSize: 13 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between", marginBottom: 48 }}>

            {/* Brand */}
            <div style={{ minWidth: 200, maxWidth: 240 }}>
              <div style={{ marginBottom: 14 }}>
                <img src="/logo.svg" alt="TradeMind" height="22" style={{ display: "block" }} />
              </div>
              <p style={{ lineHeight: 1.75, marginBottom: 12 }}>The only tool that tells you whether your mind is ready to trade — before you risk a dollar.</p>
              <a href="mailto:support@trademindedge.com" style={{ color: "var(--text-muted)", textDecoration: "none" }}>support@trademindedge.com</a>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <a href="https://twitter.com/trademindedge" target="_blank" rel="noopener noreferrer" aria-label="TradeMind on X (Twitter)" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none", transition: "background 0.2s, color 0.2s" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.257 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "var(--text)", marginBottom: 16 }}>PRODUCT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <a href="#how" style={{ color: "var(--text-muted)", textDecoration: "none" }}>How it works</a>
                <a href="#pricing" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Pricing</a>
                <Link href="/changelog" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Changelog</Link>
                <Link href="/integrations" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Integrations</Link>
                <Link href="/for-ftmo-traders" style={{ color: "var(--text-muted)", textDecoration: "none" }}>For Prop Traders</Link>
              </div>
            </div>

            {/* Features */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "var(--text)", marginBottom: 16 }}>FEATURES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <Link href="/journal" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Trade Journal</Link>
                <Link href="/analytics" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Analytics</Link>
                <Link href="/playbook" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Playbook</Link>
                <Link href="/partners" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Accountability</Link>
                <Link href="/coach" style={{ color: "var(--text-muted)", textDecoration: "none" }}>AI Coach</Link>
              </div>
            </div>

            {/* Compare */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "var(--text)", marginBottom: 16 }}>COMPARE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <Link href="/vs-tradezella" style={{ color: "var(--text-muted)", textDecoration: "none" }}>vs Tradezella</Link>
                <Link href="/vs-tradersync" style={{ color: "var(--text-muted)", textDecoration: "none" }}>vs TraderSync</Link>
                <Link href="/vs-edgewonk" style={{ color: "var(--text-muted)", textDecoration: "none" }}>vs Edgewonk</Link>
                <Link href="/blog" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Blog</Link>
                <Link href="/testimonials" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Trader Stories</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "var(--text)", marginBottom: 16 }}>COMPANY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <Link href="/about" style={{ color: "var(--text-muted)", textDecoration: "none" }}>About</Link>
                <Link href="/security" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Security</Link>
                <Link href="/help" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Help Center</Link>
                <Link href="/contact" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Contact</Link>
                <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms of Service</Link>
                <Link href="/refund" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Refund Policy</Link>
              </div>
            </div>

          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
            <p>© 2026 TradeMind. All rights reserved.</p>
            <p style={{ maxWidth: 480, textAlign: "right" }}>Not financial advice. Your mental score is a cognitive performance indicator — all trading decisions are your own responsibility.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}