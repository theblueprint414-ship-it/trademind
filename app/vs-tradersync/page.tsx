import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradeMind vs TraderSync — Pre-Trade Psychology vs Post-Trade Analytics",
  description: "TraderSync shows you detailed analytics on trades you already took. TradeMind decides whether you should be trading at all. See how they compare — and which gap is costing you most.",
  openGraph: {
    title: "TradeMind vs TraderSync — The Missing Layer in Your Trading Stack",
    description: "TraderSync is one of the best trade journals available. But it only looks backward. TradeMind looks forward.",
    url: "https://trademindedge.com/vs-tradersync",
    siteName: "TradeMind",
    type: "website",
  },
  alternates: { canonical: "https://trademindedge.com/vs-tradersync" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "TradeMind vs TraderSync — Pre-Trade Psychology vs Post-Trade Analytics",
  description: "A detailed comparison of TradeMind and TraderSync for serious traders.",
  url: "https://trademindedge.com/vs-tradersync",
  publisher: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
};

const GreenCheck = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="9" cy="9" r="8" fill="rgba(0,232,122,0.12)" stroke="rgba(0,232,122,0.4)" strokeWidth="1" />
    <path d="M5.5 9l2.5 2.5 5-5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RedX = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="9" cy="9" r="8" fill="rgba(255,59,92,0.08)" stroke="rgba(255,59,92,0.25)" strokeWidth="1" />
    <path d="M6 6l6 6M12 6l-6 6" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const AmberPartial = () => (
  <span style={{ fontSize: 11, color: "var(--amber)", fontWeight: 700, background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.25)", borderRadius: 4, padding: "2px 8px" }}>PARTIAL</span>
);

type Row = { category: string; feature?: undefined; tm?: undefined; ts?: undefined } | { category?: undefined; feature: string; tm: boolean | "partial"; ts: boolean | "partial" };
const ROWS: Row[] = [
  { category: "Core Purpose" },
  { feature: "Stops bad trades before they happen", tm: true, ts: false },
  { feature: "GO / CAUTION / NO-TRADE daily verdict", tm: true, ts: false },
  { feature: "Pre-trade mental check-in (60 seconds)", tm: true, ts: false },
  { feature: "Post-trade performance analytics", tm: true, ts: true },
  { feature: "Trade journal with P&L logging", tm: true, ts: true },
  { category: "Psychology Layer" },
  { feature: "Pre-trade psychology gate (before opening positions)", tm: true, ts: false },
  { feature: "Emotion tagging — pre-trade (before the trade)", tm: true, ts: false },
  { feature: "Emotion tagging — post-trade (after the trade)", tm: true, ts: true },
  { feature: "Psychology vs P&L correlation", tm: true, ts: "partial" },
  { feature: "Behavioral pattern detection (revenge, FOMO, overtrading)", tm: true, ts: false },
  { feature: "Lifestyle tracking (exercise, sleep, stress)", tm: true, ts: false },
  { feature: "Score backed by peer-reviewed research", tm: true, ts: false },
  { category: "Analytics" },
  { feature: "90-day performance heatmap", tm: true, ts: true },
  { feature: "Win rate, profit factor, avg R", tm: true, ts: true },
  { feature: "Broker auto-import (50+ brokers)", tm: true, ts: true },
  { feature: "Trade replay on chart", tm: false, ts: true },
  { feature: "Detailed MAE/MFE analysis", tm: false, ts: true },
  { feature: "Playback and screenshot tagging", tm: false, ts: true },
  { category: "Accountability" },
  { feature: "Accountability partners (see each other's score)", tm: true, ts: false },
  { feature: "Trading circles (group accountability)", tm: true, ts: false },
  { feature: "Daily loss limit enforcement with lockout", tm: true, ts: false },
  { category: "Prop Traders" },
  { feature: "Prop firm challenge tracker (FTMO, TopStep, etc.)", tm: true, ts: true },
  { feature: "Max drawdown alert system", tm: true, ts: true },
  { feature: "Position size calculator based on mental score", tm: true, ts: false },
  { category: "AI & Coaching" },
  { feature: "AI coach analyzing your behavioral patterns", tm: true, ts: false },
  { feature: "Weekly AI insight based on check-in + P&L data", tm: true, ts: false },
];

export default function VsTraderSyncPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        .comp-row-cat { background: rgba(79,142,247,0.04); }
        .comp-row:hover { background: rgba(255,255,255,0.02); }
        .pain-card { transition: transform 0.2s ease, border-color 0.2s ease; }
        .pain-card:hover { transform: translateY(-3px); }
      `}</style>

      {/* Nav */}
      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" style={{ display: "block", width: 120, height: "auto" }} />
          </Link>
          <Link href="/login?callbackUrl=/checkin">
            <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Start Free Trial</button>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 100px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.2)", marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)" }}>TOOL COMPARISON</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            TradeMind vs TraderSync<br />
            <span style={{ background: "linear-gradient(135deg, var(--blue), var(--purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Two tools solving different problems.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 600, margin: "0 auto" }}>
            TraderSync is one of the most capable trade journals on the market. It excels at post-trade analysis. TradeMind does something TraderSync cannot: it evaluates whether you should be trading today at all.
          </p>
        </div>

        {/* The core gap */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 56 }}>
          <div className="card pain-card" style={{ padding: "28px 28px", border: "1px solid rgba(255,176,32,0.2)", background: "rgba(255,176,32,0.03)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--amber)", marginBottom: 14 }}>TRADERSYNC</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Rearview mirror</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75 }}>
              TraderSync shows you powerful analytics on trades you already took. It helps you learn from past performance, identify what setups work, and track your R-multiple over time. That's genuinely valuable — after the fact.
            </p>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginTop: 12 }}>
              But on the morning of your worst trading day? TraderSync is silent. It has no mechanism to tell you: <em>"Today is not a day to be trading at full size."</em>
            </p>
          </div>
          <div className="card pain-card" style={{ padding: "28px 28px", border: "1px solid rgba(0,232,122,0.2)", background: "rgba(0,232,122,0.03)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)", marginBottom: 14 }}>TRADEMIND</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Windshield</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75 }}>
              TradeMind operates before the market opens. A 60-second mental check-in evaluates your sleep, stress, focus, emotional state, and confidence. The result is a score and a verdict — GO, CAUTION, or NO-TRADE.
            </p>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginTop: 12 }}>
              It doesn't replace your journal. It prevents the trades your journal will later mark as your worst. The two tools are complementary — not competing.
            </p>
          </div>
        </div>

        {/* Pain points */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>What TraderSync cannot do</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                title: "Emotion tagging happens after the damage",
                body: "TraderSync lets you tag emotions on trade entries — but you tag them after the trade is placed. The FOMO, the revenge trade, the oversize position — they're already in your journal. TradeMind catches the emotional state before you open the platform.",
              },
              {
                title: "No daily psychological gate",
                body: "There is no feature in TraderSync that tells you \"don't trade today.\" The assumption is always that you're ready to trade. TradeMind's entire premise is that this assumption is wrong approximately 30% of trading days.",
              },
              {
                title: "Correlation without intervention",
                body: "TraderSync can surface some patterns between emotion tags and performance. But it shows you the pattern on Monday for what happened last week. TradeMind shows you the pattern in real time, on the morning it matters.",
              },
            ].map((p) => (
              <div key={p.title} className="card pain-card" style={{ padding: "20px 24px", border: "1px solid rgba(255,59,92,0.12)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", flexShrink: 0, marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{p.title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature table */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Full feature comparison</h2>
          <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface2)" }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", width: "50%" }}>FEATURE</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--green)" }}>TRADEMIND</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>TRADERSYNC</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => {
                  if ("category" in row) {
                    return (
                      <tr key={i} className="comp-row-cat">
                        <td colSpan={3} style={{ padding: "10px 20px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>{row.category!.toUpperCase()}</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={i} className="comp-row" style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-dim)" }}>{row.feature}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {row.tm === true ? <div style={{ display: "flex", justifyContent: "center" }}><GreenCheck /></div> : row.tm === "partial" ? <AmberPartial /> : <div style={{ display: "flex", justifyContent: "center" }}><RedX /></div>}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {row.ts === true ? <div style={{ display: "flex", justifyContent: "center" }}><GreenCheck /></div> : row.ts === "partial" ? <AmberPartial /> : <div style={{ display: "flex", justifyContent: "center" }}><RedX /></div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            Feature comparison based on publicly available information as of April 2026. TraderSync's feature set may have changed — visit{" "}
            <a href="https://tradersync.com" target="_blank" rel="noopener noreferrer nofollow" style={{ color: "var(--text-muted)" }}>tradersync.com</a> for current details.
          </p>
        </div>

        {/* Who needs what */}
        <div style={{ marginBottom: 72, padding: "36px 36px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Which one do you need?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", marginBottom: 12 }}>TraderSync is right for you if:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "You want deep post-trade analytics and chart replay",
                  "You import trades from 50+ brokers automatically",
                  "You're focused on setup quality and R-multiple optimization",
                  "You want detailed MAE/MFE and win-rate breakdowns",
                ].map((t) => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--amber)", fontSize: 14, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 12 }}>TradeMind is right for you if:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "You know your setups are fine but your execution isn't",
                  "You've had losing streaks you knew were emotional in origin",
                  "You trade a funded account where one bad day has big consequences",
                  "You want to stop the losses before they happen, not analyze them after",
                ].map((t) => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--green)", fontSize: 14, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, background: "rgba(79,142,247,0.05)", border: "1px solid rgba(79,142,247,0.15)" }}>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "var(--text)" }}>The honest recommendation:</strong> most serious traders should use both. TraderSync for post-trade analysis. TradeMind for the pre-trade filter. They operate at different points in your trading day and don't overlap in any meaningful way. Many TradeMind users already use TraderSync or a similar journal alongside it.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "48px 32px", borderRadius: 20, background: "linear-gradient(135deg, rgba(0,232,122,0.05), rgba(79,142,247,0.05))", border: "1px solid rgba(0,232,122,0.15)" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 16 }}>
            Add the layer TraderSync can't provide.
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
            Start free. No card required. Your first check-in takes 60 seconds.
          </p>
          <Link href="/login?callbackUrl=/checkin">
            <button className="btn-primary" style={{ padding: "16px 40px", fontSize: 15 }}>Start Your First Check-in →</button>
          </Link>
          <div style={{ marginTop: 20, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/vs-tradezella" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>TradeMind vs Tradezella →</Link>
            <Link href="/vs-edgewonk" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>TradeMind vs Edgewonk →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}