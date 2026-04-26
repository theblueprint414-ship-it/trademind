import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradeMind vs Edgewonk — Pre-Trade Psychology vs Trading Process Journal",
  description: "Edgewonk is a powerful process-focused trading journal. TradeMind is the pre-trade gate that determines whether you should be following your process today at all. Here's how they compare.",
  openGraph: {
    title: "TradeMind vs Edgewonk — Two Different Problems, Two Different Tools",
    description: "Edgewonk tracks your trading process. TradeMind protects it from your worst days.",
    url: "https://trademindedge.com/vs-edgewonk",
    siteName: "TradeMind",
    type: "website",
  },
  alternates: { canonical: "https://trademindedge.com/vs-edgewonk" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "TradeMind vs Edgewonk — Pre-Trade Psychology vs Trading Process Journal",
  description: "A detailed comparison of TradeMind and Edgewonk for serious traders.",
  url: "https://trademindedge.com/vs-edgewonk",
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

type Row = { category: string; feature?: undefined; tm?: undefined; ew?: undefined } | { category?: undefined; feature: string; tm: boolean | "partial"; ew: boolean | "partial" };
const ROWS: Row[] = [
  { category: "Core Purpose" },
  { feature: "Stops bad trades before they happen", tm: true, ew: false },
  { feature: "GO / CAUTION / NO-TRADE daily verdict", tm: true, ew: false },
  { feature: "Pre-trade mental check-in (60 seconds)", tm: true, ew: false },
  { feature: "Post-trade process journal", tm: true, ew: true },
  { feature: "Trade journaling with R-multiple tracking", tm: true, ew: true },
  { category: "Psychology Layer" },
  { feature: "Pre-trade psychological gate", tm: true, ew: false },
  { feature: "Daily mental state tracking", tm: true, ew: false },
  { feature: "Tilt detection / emotional warning system", tm: true, ew: "partial" },
  { feature: "Psychology vs P&L correlation", tm: true, ew: false },
  { feature: "Behavioral pattern detection (revenge, FOMO)", tm: true, ew: false },
  { feature: "Lifestyle correlation (exercise, sleep)", tm: true, ew: false },
  { feature: "Score grounded in peer-reviewed research", tm: true, ew: false },
  { category: "Analytics & Process" },
  { feature: "90-day performance heatmap", tm: true, ew: true },
  { feature: "Win rate, profit factor analysis", tm: true, ew: true },
  { feature: "R-multiple tracking and distribution", tm: false, ew: true },
  { feature: "Setup type tagging and performance breakdown", tm: true, ew: true },
  { feature: "Trading simulator / backtesting", tm: false, ew: true },
  { feature: "Custom trading routine builder", tm: false, ew: true },
  { category: "Platform" },
  { feature: "Web app (browser-based)", tm: true, ew: true },
  { feature: "Mobile app (iOS / Android)", tm: true, ew: false },
  { feature: "Broker auto-import", tm: true, ew: false },
  { feature: "CSV import", tm: true, ew: true },
  { category: "Accountability" },
  { feature: "Accountability partners", tm: true, ew: false },
  { feature: "Trading circles (group accountability)", tm: true, ew: false },
  { feature: "Daily loss limit enforcement", tm: true, ew: false },
  { category: "Prop Traders" },
  { feature: "Prop firm challenge tracker", tm: true, ew: false },
  { feature: "Position size calculator by mental score", tm: true, ew: false },
  { category: "AI & Coaching" },
  { feature: "AI coach analyzing your behavioral patterns", tm: true, ew: false },
  { feature: "Weekly AI insight from your data", tm: true, ew: false },
];

export default function VsEdgewonkPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        .comp-row-cat { background: rgba(79,142,247,0.04); }
        .comp-row:hover { background: rgba(255,255,255,0.02); }
        .split-card { transition: transform 0.2s ease, border-color 0.2s ease; }
        .split-card:hover { transform: translateY(-3px); }
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
            TradeMind vs Edgewonk<br />
            <span style={{ background: "linear-gradient(135deg, var(--blue), var(--purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Protecting your process vs tracking it.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 620, margin: "0 auto" }}>
            Edgewonk is one of the most rigorous process-focused trading journals available. It helps you track whether you followed your rules. TradeMind answers the question Edgewonk never asks: <em>should you be following your rules today, or sitting out entirely?</em>
          </p>
        </div>

        {/* The Edgewonk angle — respectful, accurate */}
        <div style={{ padding: "32px 36px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>WHAT EDGEWONK DOES EXTREMELY WELL</div>
          <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 12 }}>
            Edgewonk's strength is process adherence. The Tilt Meter, custom trade categorization, and simulator help traders understand whether they're executing their strategy correctly. For traders who want deep statistical analysis of their process, it's one of the most serious tools available.
          </p>
          <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.8 }}>
            If you're using Edgewonk, you're already a more disciplined trader than most. But here's the gap: Edgewonk's Tilt Meter is a trailing indicator — it reflects tilt you're already experiencing based on recent trade history. TradeMind catches the tilt before the first trade of the day.
          </p>
        </div>

        {/* Core gap */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 56 }}>
          <div className="card split-card" style={{ padding: "28px 28px", border: "1px solid rgba(255,176,32,0.2)", background: "rgba(255,176,32,0.03)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--amber)", marginBottom: 14 }}>EDGEWONK'S APPROACH</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Did you follow your process?</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75 }}>
              Edgewonk asks: given that you traded, did you trade correctly? It tracks rule compliance, tags setups, scores your process quality, and helps you improve your execution over time.
            </p>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginTop: 12 }}>
              It's a powerful retrospective feedback loop. But it assumes you should have been trading in the first place.
            </p>
          </div>
          <div className="card split-card" style={{ padding: "28px 28px", border: "1px solid rgba(0,232,122,0.2)", background: "rgba(0,232,122,0.03)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)", marginBottom: 14 }}>TRADEMIND'S APPROACH</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Should you be trading today?</div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75 }}>
              TradeMind asks: given your current mental state — sleep, stress, focus, emotional stability — is today a day to trade at full size, reduced size, or not at all?
            </p>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginTop: 12 }}>
              The best process in the world underperforms when the person executing it isn't mentally equipped to execute it. That's what TradeMind measures.
            </p>
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
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>EDGEWONK</th>
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
                        {row.ew === true ? <div style={{ display: "flex", justifyContent: "center" }}><GreenCheck /></div> : row.ew === "partial" ? <AmberPartial /> : <div style={{ display: "flex", justifyContent: "center" }}><RedX /></div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
            Feature comparison based on publicly available information as of April 2026. Visit{" "}
            <a href="https://edgewonk.com" target="_blank" rel="noopener noreferrer nofollow" style={{ color: "var(--text-muted)" }}>edgewonk.com</a>{" "}
            for current Edgewonk features.
          </p>
        </div>

        {/* Who needs what */}
        <div style={{ marginBottom: 72, padding: "36px 36px", borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Which one fits your situation?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", marginBottom: 12 }}>Edgewonk is right for you if:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "You want deep R-multiple and process compliance tracking",
                  "You trade desktop-first and prefer a one-time purchase",
                  "Statistical analysis of setup types is your priority",
                  "You want a detailed trading simulator and scenario planner",
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
                  "You already have a solid process but struggle to execute it consistently",
                  "Your losses cluster on high-stress or low-sleep days",
                  "You trade funded accounts where emotional mistakes have outsized consequences",
                  "You want a daily pre-market habit that actively protects your capital",
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
              <strong style={{ color: "var(--text)" }}>The most complete stack:</strong> Use Edgewonk to track whether you followed your rules. Use TradeMind to decide whether you should be following them today at all. They operate at different times in your trading day and serve genuinely different purposes. Several TradeMind users run Edgewonk alongside it for exactly this reason.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            {[
              {
                q: "I already journal in Edgewonk — do I need another tool?",
                a: "TradeMind and Edgewonk don't overlap in any meaningful way. Edgewonk captures what happened after trades. TradeMind operates before you open your platform. If you're using Edgewonk seriously, you're already more process-disciplined than most traders. TradeMind adds the one layer Edgewonk skips: the pre-market mental filter.",
              },
              {
                q: "Does Edgewonk's Tilt Meter do what TradeMind does?",
                a: "Edgewonk's Tilt Meter is a trailing indicator — it reflects emotional state based on your recent P&L performance. TradeMind's check-in captures mental state independently of your recent trading results: sleep quality, stress, focus, and emotional readiness. You can be in perfect shape after a losing week, or mentally compromised after a winning one. The Tilt Meter won't catch that. The check-in will.",
              },
              {
                q: "Is TradeMind web-based or desktop?",
                a: "TradeMind is fully web-based and works as a Progressive Web App (PWA) — you can add it to your phone's home screen for a native app experience. There's no installation required, and your data is available on any device.",
              },
            ].map((item, i) => (
              <details key={i} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                <summary style={{ padding: "18px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {item.q}
                  <span style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0, marginLeft: 16 }}>+</span>
                </summary>
                <div style={{ padding: "0 24px 20px", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75 }}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "48px 32px", borderRadius: 20, background: "linear-gradient(135deg, rgba(0,232,122,0.05), rgba(79,142,247,0.05))", border: "1px solid rgba(0,232,122,0.15)" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 16 }}>
            Your process is only as good as the mind executing it.
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
            Start free. No card required. One check-in, 60 seconds.
          </p>
          <Link href="/login?callbackUrl=/checkin">
            <button className="btn-primary" style={{ padding: "16px 40px", fontSize: 15 }}>Start Your First Check-in →</button>
          </Link>
          <div style={{ marginTop: 20, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/vs-tradezella" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>TradeMind vs Tradezella →</Link>
            <Link href="/vs-tradersync" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>TradeMind vs TraderSync →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}