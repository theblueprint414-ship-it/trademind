import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradeMind vs Tradezella — Why Serious Traders Need Both",
  description: "Tradezella shows you beautiful charts of trades you already lost. TradeMind stops the worst ones from happening. See exactly how they compare — and which gap is costing you most.",
  openGraph: {
    title: "TradeMind vs Tradezella — Psychology vs Analytics",
    description: "Tradezella shows you beautiful charts of trades you already lost. TradeMind stops them before they happen. The comparison every serious trader needs to read.",
    url: "https://trademindedge.com/vs-tradezella",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/vs-tradezella" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "TradeMind vs Tradezella — Psychology vs Analytics",
  description: "A detailed comparison of TradeMind (pre-trade psychology) and Tradezella (post-trade analytics) for serious traders.",
  url: "https://trademindedge.com/vs-tradezella",
  publisher: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
};

const GreenCheck = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="9" cy="9" r="8" fill="rgba(0,232,122,0.12)" stroke="rgba(0,232,122,0.4)" strokeWidth="1"/>
    <path d="M5.5 9l2.5 2.5 5-5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RedX = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="9" cy="9" r="8" fill="rgba(255,59,92,0.08)" stroke="rgba(255,59,92,0.25)" strokeWidth="1"/>
    <path d="M6 6l6 6M12 6l-6 6" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const AmberPartial = () => (
  <span style={{ fontSize: 11, color: "var(--amber)", fontWeight: 700, background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.25)", borderRadius: 4, padding: "2px 8px" }}>PARTIAL</span>
);

const COMPARISON_ROWS = [
  { category: "Core Purpose", feature: "Stops bad trades before they happen", tm: true, tz: false },
  { feature: "GO / CAUTION / NO-TRADE daily verdict", tm: true, tz: false },
  { feature: "Pre-trade mental check-in (60 seconds)", tm: true, tz: false },
  { feature: "Trade journal with P&L logging", tm: true, tz: true },
  { category: "Psychology", feature: "Psychology vs P&L correlation chart", tm: true, tz: false },
  { feature: "Behavioral pattern detection (revenge, FOMO, overtrading)", tm: true, tz: false },
  { feature: "Lifestyle tracking (sleep, stress, exercise)", tm: true, tz: false },
  { feature: "Score backed by peer-reviewed research", tm: true, tz: false },
  { category: "Analytics", feature: "90-day performance heatmap", tm: true, tz: true },
  { feature: "Win rate & P&L analytics", tm: true, tz: true },
  { feature: "Trade replay on chart", tm: false, tz: true },
  { feature: "Advanced backtesting", tm: false, tz: true },
  { feature: "MAE/MFE entry/exit analysis", tm: false, tz: "partial" },
  { category: "Prop Traders", feature: "Prop firm challenge tracker (FTMO, TopStep & more)", tm: true, tz: true },
  { feature: "Daily loss limit enforcement + lockout", tm: true, tz: false },
  { feature: "Consistency rule monitoring", tm: true, tz: false },
  { category: "Accountability", feature: "Accountability partner system", tm: true, tz: false },
  { feature: "Team accountability circles", tm: true, tz: false },
  { feature: "AI Coach trained on your history", tm: true, tz: "partial" },
  { category: "Platform", feature: "Broker auto-sync", tm: true, tz: true },
  { feature: "Mobile-first design", tm: true, tz: false },
  { feature: "Streak tracking + gamification", tm: true, tz: false },
];

const PAIN_POINTS = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 17l4-5 3 3.5 4-6.5 4 4.5" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="18" height="14" rx="2" stroke="var(--blue)" strokeWidth="1.5"/></svg>,
    color: "var(--blue)",
    label: "Beautiful charts, zero behavior change",
    detail: "Tradezella's analytics are genuinely excellent. But knowing your win rate is 42% doesn't stop you from taking that impulse trade at 2pm on a Tuesday when you're stressed and down for the week. The insight arrives after the damage.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v5" stroke="var(--amber)" strokeWidth="1.5"/><path d="M9 9h6M9 13h4" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 14v4m0 4v-4m0 0h-4m4 0h4" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    color: "var(--amber)",
    label: "Emotion tagging is a text box",
    detail: "Tradezella lets you add notes and tag emotions to trades. But a notes field isn't a psychology tool — it's Notepad. There's no scoring, no pattern detection, no intervention. Typing \"I was emotional\" after blowing up doesn't help you avoid the next time.",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--red)" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    color: "var(--red)",
    label: "Retrospective by design — always too late",
    detail: "Every feature in Tradezella activates after a trade. Replay, analytics, P&L charts — all rearview mirror. The $800 loss, the blown drawdown limit, the revenge trade sequence — they're already done before the tool has anything to say.",
  },
];

const FAQ = [
  {
    q: "Do I have to choose between TradeMind and Tradezella?",
    a: "No — and this is actually the honest answer. They solve completely different problems. Tradezella is excellent at what it does: detailed post-trade analytics, broker import, trade replay. TradeMind handles what Tradezella cannot: your mental state before you ever open Tradezella. Many serious traders use both. TradeMind costs 60 seconds a day and works alongside any journal.",
  },
  {
    q: "If Tradezella already has an emotion/notes field, isn't that enough?",
    a: "No. There's a fundamental difference between recording an emotion after a trade and evaluating your state before you trade. Tradezella's emotion field is retrospective — you tag a trade as 'angry' after you've already acted on that anger. TradeMind's check-in happens before you open any charts. That's where the intervention actually works.",
  },
  {
    q: "TradeMind doesn't have trade replay or backtesting — isn't that a dealbreaker?",
    a: "Depends what's causing your losses. If you're consistently misidentifying setups, yes — you need Tradezella's replay features. But most traders who fail prop challenges and blow accounts aren't failing because they can't identify a good setup. They're failing on days they should have sat out. That's TradeMind's lane.",
  },
  {
    q: "Which tool does FTMO and prop traders actually need more?",
    a: "TradeMind — specifically because prop challenges are won or lost on behavioral consistency, not setup identification. The single biggest failure mode for FTMO traders is taking an outsized loss on a bad mental day, triggering the max drawdown rule. TradeMind's NO-TRADE verdict and daily loss limit enforcement are specifically designed to prevent this.",
  },
  {
    q: "Is TradeMind just a journal with extra steps?",
    a: "No. A journal is retrospective. TradeMind is proactive. The check-in happens before your session, not after. The score is derived from behavioral science research — sleep, stress, focus, emotional state — not from trade data. The verdict (GO/CAUTION/NO-TRADE) is the output. The journal in TradeMind exists to build the psychology-P&L correlation. They're fundamentally different tools with different mechanisms of action.",
  },
];

export default function VsTradezellaPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" style={{ height: 22, display: "block" }} />
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/pricing" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Pricing</Link>
            <Link href="/login?callbackUrl=/checkin">
              <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>Start Free Trial</button>
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.25)", borderRadius: 20, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.12em" }}>IN-DEPTH COMPARISON</span>
          </div>

          <h1 className="font-bebas" style={{ fontSize: "clamp(44px, 7vw, 80px)", lineHeight: 0.95, marginBottom: 20 }}>
            TradeMind vs Tradezella:<br />
            <span style={{ background: "linear-gradient(135deg, var(--green), #00b8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Windshield vs Rearview Mirror
            </span>
          </h1>

          <p style={{ fontSize: 18, color: "var(--text-dim)", maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.8 }}>
            Tradezella is one of the best trading journals on the market. It shows you beautiful charts of everything that went wrong — after the fact. TradeMind is built to prevent the worst trades before you ever click buy.
          </p>

          {/* Quick verdict cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 700, margin: "0 auto" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px", textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 12 }}>TRADEZELLA IS</div>
              <div className="font-bebas" style={{ fontSize: 26, color: "var(--blue)", marginBottom: 10 }}>The Rearview Mirror</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
                World-class post-trade analytics. Shows you patterns, replays trades, visualizes your edge — after the session ends. Exceptional at what it does.
              </p>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(0,232,122,0.06), var(--surface))", border: "1px solid rgba(0,232,122,0.3)", borderRadius: 16, padding: "28px 24px", textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "var(--green)", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 12 }}>TRADEMIND IS</div>
              <div className="font-bebas" style={{ fontSize: 26, color: "var(--green)", marginBottom: 10 }}>The Windshield</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
                Pre-trade psychology protocol. Evaluates your mental state before you risk a dollar — and gives you a verdict: GO, CAUTION, or NO-TRADE.
              </p>
            </div>
          </div>
        </div>

        {/* What Tradezella can't do — the pain points */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 4vw, 52px)", marginBottom: 12, lineHeight: 1 }}>
              What Tradezella doesn&apos;t cover — and why it matters
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              This isn&apos;t a criticism — Tradezella is excellent at what it&apos;s built for. But there&apos;s a layer it fundamentally cannot touch.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PAIN_POINTS.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 28px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color}12`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {p.icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{p.label}</div>
                  <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The core gap — visual */}
        <div style={{ background: "linear-gradient(135deg, rgba(255,59,92,0.04), rgba(94,106,210,0.04))", border: "1px solid var(--border)", borderRadius: 20, padding: "40px 36px", marginBottom: 80, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 20 }}>THE MISSING LAYER IN EVERY TRADING TOOL</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "center", maxWidth: 700, margin: "0 auto 28px" }}>
            <div style={{ background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 12, padding: "20px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--red)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>BEFORE</div>
              <div style={{ fontSize: 24 }}>😤</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>Slept 5h. Down yesterday. Stressed. Open charts anyway.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>the gap</div>
              <div style={{ fontSize: 28, color: "var(--text-muted)" }}>→</div>
              <div style={{ fontSize: 10, color: "var(--red)", fontWeight: 700 }}>UNPROTECTED</div>
            </div>
            <div style={{ background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 12, padding: "20px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--red)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>AFTER</div>
              <div style={{ fontSize: 24 }}>📉</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>Tradezella shows you the chart of what you did. The damage is done.</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "center", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.25)", borderRadius: 12, padding: "20px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>BEFORE</div>
              <div style={{ fontSize: 24 }}>😤</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>Slept 5h. Down yesterday. Stressed.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>TradeMind</div>
              <div style={{ fontSize: 28, color: "var(--green)" }}>→</div>
              <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>PROTECTED</div>
            </div>
            <div style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.25)", borderRadius: 12, padding: "20px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>VERDICT</div>
              <div className="font-bebas" style={{ fontSize: 32, color: "var(--red)", lineHeight: 1 }}>NO-TRADE</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>Score: 38/100. Capital protected. Come back sharper tomorrow.</div>
            </div>
          </div>
        </div>

        {/* Feature comparison table */}
        <div style={{ marginBottom: 80 }}>
          <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 4vw, 48px)", textAlign: "center", marginBottom: 32 }}>Feature comparison</h2>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "16px 24px", background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em" }}>FEATURE</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--green)", textAlign: "center" }}>TradeMind</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dim)", textAlign: "center" }}>Tradezella</div>
            </div>

            {COMPARISON_ROWS.map((row, i) => (
              <div key={i}>
                {row.category && (
                  <div style={{ padding: "10px 24px 6px", background: "rgba(255,255,255,0.02)", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)" }}>{row.category.toUpperCase()}</span>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "13px 24px", borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.4 }}>{row.feature}</span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {row.tm === true ? <GreenCheck /> : row.tm === false ? <RedX /> : <AmberPartial />}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {row.tz === true ? <GreenCheck /> : row.tz === false ? <RedX /> : <AmberPartial />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, fontStyle: "italic", textAlign: "center" }}>
            Feature comparison reflects our understanding of both products. Tradezella is not affiliated with TradeMind and may update features independently.
          </p>
        </div>

        {/* When to use each */}
        <div style={{ marginBottom: 80 }}>
          <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 4vw, 48px)", textAlign: "center", marginBottom: 8 }}>Which one do you need?</h2>
          <p style={{ fontSize: 16, color: "var(--text-dim)", textAlign: "center", marginBottom: 36 }}>Honest answer below — we&apos;re not trying to sell you on ditching Tradezella.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div style={{ background: "rgba(0,232,122,0.04)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>USE TRADEMIND IF...</div>
              {[
                "You already know your strategy — you just don't execute it consistently",
                "Revenge trading, overtrading, or FOMO are recurring patterns",
                "You're protecting a prop firm account (FTMO, TopStep, Apex)",
                "You need a pre-market protocol and daily mental structure",
                "Your worst days financially coincide with your worst days mentally",
              ].map((t) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                  <GreenCheck />{t}
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(94,106,210,0.04)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>USE TRADEZELLA IF...</div>
              {[
                "You need advanced entry/exit analysis (MAE/MFE)",
                "Trade replay on chart is essential to your review process",
                "You trade across many brokers and need unified import",
                "Setup-by-setup edge analysis is your priority",
                "You want a trading community built into your journal",
              ].map((t) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                  <GreenCheck />{t}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ fontSize: 14, color: "var(--text-dim)", margin: 0, lineHeight: 1.75, textAlign: "center" }}>
              <strong style={{ color: "var(--text)" }}>The real answer: many serious traders use both.</strong> Tradezella handles post-session analysis. TradeMind handles pre-session readiness. They don&apos;t compete — they fill the same day at different ends. TradeMind costs 60 seconds a day alongside any journal you already use.
            </p>
          </div>
        </div>

        {/* Real trader testimonial */}
        <div style={{ background: "var(--surface)", border: "1px solid rgba(0,232,122,0.25)", borderRadius: 20, padding: "40px 36px", marginBottom: 80, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: 140, opacity: 0.04, userSelect: "none", lineHeight: 1, color: "var(--green)" }}>&ldquo;</div>
          <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 13 13" fill="var(--amber)"><path d="M6.5 1l1.4 3.2L11 4.6l-2.3 2.3.5 3.2-2.7-1.4L3.8 10l.5-3.2L2 4.6l3.1-.4L6.5 1z"/></svg>
            ))}
          </div>
          <p style={{ fontSize: "clamp(15px, 2vw, 19px)", color: "var(--text)", lineHeight: 1.8, marginBottom: 28, maxWidth: 740, position: "relative" }}>
            &ldquo;I used Tradezella for a year and understood my stats cold. I knew my win rate, my best setup, my average R. But I kept repeating the same emotional mistakes — revenge trades on Tuesdays, oversizing after losses. TradeMind solved the part Tradezella couldn&apos;t touch: what I did <em>before</em> I ever opened my charts. Once I started getting NO-TRADE days, I stopped blowing my weekly gains in one session. That&apos;s the gap.&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,232,122,0.12)", border: "2px solid rgba(0,232,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "var(--green)", flexShrink: 0 }}>DR</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>David R.</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Prop Trader · FTMO · Using TradeMind 2 months alongside Tradezella</div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", marginTop: 20, marginBottom: 0 }}>Individual results vary. This testimonial reflects one user&apos;s personal experience and is not a guarantee of similar outcomes.</p>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 80 }}>
          <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 4vw, 48px)", textAlign: "center", marginBottom: 40 }}>Common questions</h2>
          <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            {FAQ.map((item, i) => (
              <details key={i} style={{ borderBottom: i < FAQ.length - 1 ? "1px solid var(--border)" : "none" }}>
                <summary style={{ padding: "20px 24px", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "var(--text)", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  {item.q}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, color: "var(--text-muted)" }}><path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </summary>
                <div style={{ padding: "0 24px 20px", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8 }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: "center", background: "linear-gradient(135deg, rgba(94,106,210,0.05), rgba(0,232,122,0.05))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20, padding: "56px 32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", boxShadow: "0 0 6px var(--green)" }} />
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, letterSpacing: "0.1em" }}>60 SECONDS BEFORE YOUR NEXT SESSION</span>
          </div>
          <h2 className="font-bebas" style={{ fontSize: "clamp(36px, 5vw, 60px)", marginBottom: 16, lineHeight: 1 }}>
            The windshield costs less than one blown trade.
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 32, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
            7-day free trial. Works alongside Tradezella or any journal you already use. Takes 60 seconds a day. Cancel before day 8 and you won&apos;t be charged a cent.
          </p>
          <Link href="/login?callbackUrl=/checkin">
            <button className="btn-primary" style={{ fontSize: 16, padding: "18px 48px", borderRadius: 14, boxShadow: "0 8px 32px rgba(94,106,210,0.35)" }}>
              Start Free — 4 Days On Us →
            </button>
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {["7 days free", "No charge until day 8", "Works alongside Tradezella"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <GreenCheck />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            Already use Tradezella? TradeMind runs alongside it — no setup conflict.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 20px" }}>
          TradeMind is not affiliated with, endorsed by, or in any way officially connected with Tradezella or any other company mentioned on this page. All product names and trademarks belong to their respective owners. Feature comparisons reflect our understanding of each product as of the publication date and may not reflect recent updates to either product.
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>← TradeMind Home</Link>
          <Link href="/for-ftmo-traders" style={{ color: "var(--text-muted)", textDecoration: "none" }}>For FTMO Traders</Link>
          <Link href="/pricing" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Pricing</Link>
          <Link href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}