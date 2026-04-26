import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trader Stories — TradeMind",
  description: "Real traders share how TradeMind changed their relationship with risk, discipline, and consistency. No fabricated numbers — real stories.",
  openGraph: {
    title: "Trader Stories — TradeMind",
    description: "Real traders. Real results. How TradeMind changes the way you approach every trading day.",
  },
};

const STORIES = [
  {
    initials: "MT",
    name: "Marcus T.",
    role: "NQ Futures Trader",
    context: "Using TradeMind for 4 months",
    color: "#4F8EF7",
    badge: "Analytics Insight",
    badgeColor: "#4F8EF7",
    headline: "Found a pattern that cost him thousands — in week 3.",
    quote: "6 years trading NQ futures. I thought I had my emotions handled. Week 3 with TradeMind I saw it clearly: 80% of my losing trades happened between 2–4 PM on days my sleep score was under 50. That one insight covered a year of subscription in the first month.",
    detail: "Marcus had been trading NQ futures for six years and considered himself an experienced, emotionally controlled trader. He connected his MT5 account via MetaAPI and ran 3 weeks of check-ins before reviewing his analytics. The P&L vs. psychology chart revealed a concentration of losing trades he hadn't noticed: afternoon sessions on low-sleep days. He now checks his sleep score before deciding whether to trade the afternoon session at all.",
    impact: "Eliminated 80% of afternoon losses on low-sleep days within 6 weeks.",
  },
  {
    initials: "DR",
    name: "David R.",
    role: "Prop Trader — FTMO",
    context: "Using TradeMind for 2 months",
    color: "#00E87A",
    badge: "Prop Trading",
    badgeColor: "#00E87A",
    headline: "Three NO-TRADE days that would have blown his account.",
    quote: "I bought it skeptically. First week: three NO-TRADE days. I was annoyed. Then I went back through my journal — every single one of those days I would have blown up. It doesn't give you discipline. It makes you honest with yourself, which is harder and more valuable.",
    detail: "David was on his second FTMO challenge attempt when he started using TradeMind. The first week flagged three NO-TRADE verdicts. He describes being frustrated — 'I needed those trading days.' He sat them out. When he went back and reviewed his journal notes for those sessions, he found that each one had factors that, historically, preceded his worst drawdowns. He passed the challenge.",
    impact: "Passed FTMO challenge on second attempt after avoiding 3 critical sessions.",
  },
  {
    initials: "TW",
    name: "Tom W.",
    role: "Swing Trader — Equities",
    context: "Using TradeMind for 3 months",
    color: "#8B5CF6",
    badge: "Consistency",
    badgeColor: "#8B5CF6",
    headline: "Account up 18%. The reason wasn't what he expected.",
    quote: "Account up 18% since I started. I stopped overtrading on stress days and my average winner got bigger because I'm only pulling the trigger when I'm actually ready. The check-in is annoying some mornings. That's exactly why it works.",
    detail: "Tom trades US equities with a swing approach, holding positions for days to weeks. He describes the check-in as 'friction I didn't know I needed' — the 60-second pause before committing to his trading day forced him to actually assess his state rather than defaulting to 'fine.' His win rate stayed roughly the same, but his average winner-to-loser ratio improved because he stopped forcing trades on CAUTION days.",
    impact: "18% account growth over 3 months. Average winner up, average loser smaller.",
  },
  {
    initials: "LS",
    name: "Lena S.",
    role: "Prop Trader — FTMO",
    context: "Using TradeMind for 5 months",
    color: "#FF3B5C",
    badge: "Challenge Pass",
    badgeColor: "#FF3B5C",
    headline: "Failed three times. Passed the fourth. One change.",
    quote: "Failed FTMO three times. Passed on the fourth. The only thing I changed was TradeMind. I skipped 9 trading days based on my NO-TRADE score. Every single one of those days I would have hit max drawdown. Every one.",
    detail: "Lena had failed three consecutive FTMO challenges. Each failure shared a common structure: a few strong early sessions followed by a cluster of drawdown that wiped the progress. On her fourth attempt, she added TradeMind and committed to following NO-TRADE verdicts strictly. The challenge took longer than her previous attempts — she sat out 9 days — but she passed with days to spare. She describes it as 'the discipline I thought I had but didn't.'",
    impact: "Passed FTMO challenge on 4th attempt after 3 prior failures.",
  },
  {
    initials: "JO",
    name: "James O.",
    role: "Options Trader — US Equities",
    context: "Using TradeMind for 7 weeks",
    color: "#00E87A",
    badge: "Calibration",
    badgeColor: "#00E87A",
    headline: "Expected to be told not to trade. Was wrong about that too.",
    quote: "I expected it to tell me not to trade every day. It doesn't. My GO rate sits around 60% — and those are genuinely my sharpest sessions. The accuracy surprised me. It's not strict, it's calibrated.",
    detail: "James came in skeptical that any scoring system would just flag every day as risky. Seven weeks in, his actual GO rate is around 60% — meaning the system passes him 3 out of 5 days on average. He notes that his options positions entered on GO days have a significantly higher win rate than those entered on CAUTION days, and he's started using CAUTION days to review setups rather than execute them.",
    impact: "Higher win rate on GO-day entries versus CAUTION-day entries confirmed through journal review.",
  },
  {
    initials: "SM",
    name: "Sarah M.",
    role: "Forex Trader",
    context: "Using TradeMind for 10 weeks",
    color: "#4F8EF7",
    badge: "Work-Life Balance",
    badgeColor: "#4F8EF7",
    headline: "The permission to step back she didn't know she needed.",
    quote: "I trade forex and the 24/7 grind was killing me. TradeMind gave me something I didn't know I needed: permission to step back. My NO-TRADE days are now my best days — because I didn't lose anything.",
    detail: "Sarah trades forex across London and New York sessions and describes pre-TradeMind as 'always on, always watching, always making decisions I shouldn't have.' The check-in structure imposed a daily gate that gave her legitimate grounds to walk away — not because she was being lazy, but because her score said the risk wasn't worth it. She now treats NO-TRADE verdicts as mental recovery days and reports her overall stress level dropped in week 3.",
    impact: "Reduced mental fatigue. NO-TRADE days now used as planned recovery sessions.",
  },
  {
    initials: "RP",
    name: "Ryan P.",
    role: "Swing Trader — Options",
    context: "Using TradeMind for 8 weeks",
    color: "#8B5CF6",
    badge: "Accountability",
    badgeColor: "#8B5CF6",
    headline: "Accountability without pressure. The partner feature is underrated.",
    quote: "The accountability partner feature is underrated. My partner can see my morning score. I can't pretend I'm fine when I'm not. We've both improved just from knowing someone is watching.",
    detail: "Ryan paired with another swing trader he knew from a trading Discord. Neither had used accountability structures before. The partner visibility was enough — knowing someone could see his score made him take the check-in seriously every morning rather than skipping it when he felt fine. His partner reported the same effect. Eight weeks in, both have maintained a 90%+ check-in streak and describe the shared data as 'honest accountability without the coaching dynamic.'",
    impact: "90%+ check-in streak maintained over 8 weeks. Both partners improved consistency.",
  },
];

export default function TestimonialsPage() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#E8F0FF", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        :root { --bg: #070B14; --surface: #0D1420; --border: #1E2D45; --text: #E8F0FF; --muted: #7A8BA8; --dim: #3D4F6A; }
        .story-card { background: #0D1420; border: 1px solid #1E2D45; border-radius: 20px; overflow: hidden; transition: border-color 0.2s, transform 0.2s; }
        .story-card:hover { transform: translateY(-3px); }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1E2D45", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo.svg" alt="TradeMind" height="20" />
        </Link>
        <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
          <Link href="/login" style={{ color: "#7A8BA8", textDecoration: "none" }}>Sign in</Link>
          <Link href="/login" style={{ background: "linear-gradient(135deg, #4F8EF7, #3a6fd8)", color: "white", textDecoration: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600 }}>Start Free →</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 96px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#4F8EF7", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 24 }}>
            TRADER STORIES
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15 }}>Real traders. Real results.</h1>
          <p style={{ fontSize: 18, color: "#7A8BA8", margin: "0 auto 28px", maxWidth: 520, lineHeight: 1.7 }}>
            No fabricated statistics. No guaranteed returns. These are traders who changed the way they show up every morning.
          </p>
          <p style={{ fontSize: 13, color: "#3D4F6A", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Individual results vary. Trading involves substantial risk of loss. TradeMind is a cognitive performance tool, not financial advice.
          </p>
        </div>

        {/* Stories */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {STORIES.map((s) => (
            <div key={s.name} className="story-card" style={{ borderRadius: 20 }}>
              {/* Card header */}
              <div style={{ padding: "28px 32px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${s.color}22`, border: `2px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: s.color, flexShrink: 0 }}>{s.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                    <div style={{ color: "#7A8BA8", fontSize: 13 }}>{s.role}</div>
                    <div style={{ color: "#3D4F6A", fontSize: 12, marginTop: 2 }}>{s.context}</div>
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", background: `${s.badgeColor}18`, border: `1px solid ${s.badgeColor}30`, borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: s.badgeColor, letterSpacing: "0.07em" }}>
                  {s.badge.toUpperCase()}
                </div>
              </div>

              {/* Headline */}
              <div style={{ padding: "20px 32px 0" }}>
                <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{s.headline}</h2>
              </div>

              {/* Pull quote */}
              <div style={{ margin: "20px 32px", padding: "20px 24px", background: "#070B14", border: `1px solid ${s.color}20`, borderLeft: `3px solid ${s.color}`, borderRadius: "0 12px 12px 0" }}>
                <p style={{ margin: 0, color: "#C8D8F0", fontSize: 15, lineHeight: 1.8, fontStyle: "italic" }}>"{s.quote}"</p>
              </div>

              {/* Detail */}
              <div style={{ padding: "0 32px 28px" }}>
                <p style={{ color: "#7A8BA8", fontSize: 14, lineHeight: 1.85, margin: "0 0 16px" }}>{s.detail}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: `${s.color}0D`, border: `1px solid ${s.color}20`, borderRadius: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#C8D8F0", fontWeight: 600 }}>{s.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal disclaimer */}
        <div style={{ marginTop: 48, padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid #1E2D45", borderRadius: 12, textAlign: "center" }}>
          <p style={{ color: "#3D4F6A", fontSize: 12, lineHeight: 1.7, margin: 0 }}>
            These are individual accounts from real TradeMind users. Results reflect their personal experiences and are not representative of typical outcomes. Trading involves substantial risk of loss. Past performance is not indicative of future results. TradeMind provides a cognitive performance indicator — not financial advice, not a trading signal, and not a guarantee of any outcome.
          </p>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 64, textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px" }}>Start your first check-in today.</h2>
          <p style={{ color: "#7A8BA8", fontSize: 15, margin: "0 0 32px", lineHeight: 1.7 }}>Free forever. No credit card. 60 seconds a morning.</p>
          <Link href="/login" style={{ display: "inline-block", background: "linear-gradient(135deg, #4F8EF7, #3a6fd8)", color: "white", textDecoration: "none", borderRadius: 12, padding: "16px 40px", fontSize: 16, fontWeight: 700 }}>
            Get Started Free →
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1E2D45", padding: "32px 24px", textAlign: "center", color: "#3D4F6A", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/privacy" style={{ color: "#3D4F6A", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "#3D4F6A", textDecoration: "none" }}>Terms</Link>
          <Link href="/security" style={{ color: "#3D4F6A", textDecoration: "none" }}>Security</Link>
          <Link href="/help" style={{ color: "#3D4F6A", textDecoration: "none" }}>Help</Link>
          <Link href="/contact" style={{ color: "#3D4F6A", textDecoration: "none" }}>Contact</Link>
        </div>
        <p>© 2026 TradeMind. All rights reserved.</p>
      </footer>
    </div>
  );
}