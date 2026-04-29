import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradeMind for FTMO Traders — Protect Your Funded Account",
  description: "One bad mental day can void weeks of FTMO progress. TradeMind gives funded traders a daily GO/CAUTION/NO-TRADE score so you never breach max drawdown on a day you should have stayed out.",
  openGraph: {
    title: "TradeMind for FTMO Traders — Protect Your Funded Account",
    description: "One bad mental day can void weeks of FTMO progress. TradeMind gives funded traders a daily GO/CAUTION/NO-TRADE score so you never breach max drawdown on a day you should have stayed out.",
    url: "https://trademindedge.com/for-ftmo-traders",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/for-ftmo-traders" },
};

export default function ForFtmoTradersPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" style={{ height: 22, display: "block" }} />
          </Link>
          <Link href="/login?callbackUrl=/checkin">
            <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>Start Free Trial</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, background: "var(--red)", borderRadius: "50%" }} />
          <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, letterSpacing: "0.1em" }}>FOR FTMO · FUNDED TRADERS</span>
        </div>
        <h1 className="font-bebas" style={{ fontSize: "clamp(44px, 7vw, 80px)", lineHeight: 1, marginBottom: 20 }}>
          One bad mental day<br />
          <span style={{ background: "linear-gradient(135deg, var(--red), var(--amber))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            voids your funded account.
          </span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 40, maxWidth: 580, margin: "0 auto 40px" }}>
          You know the rules. Max daily loss: 5%. Max drawdown: 10%. One revenge trade on a stressed morning wipes your challenge. TradeMind tells you — before you open your charts — whether today is safe to trade.
        </p>
        <Link href="/login?callbackUrl=/checkin">
          <button className="btn-primary" style={{ fontSize: 16, padding: "18px 44px", borderRadius: 12 }}>
            Protect My Funded Account — Free Trial →
          </button>
        </Link>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>7-day free trial. Cancel before day 8 — you won&apos;t be charged.</p>
      </section>

      {/* The math */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: 16 }}>The funded trader math is brutal</h2>
          <p style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.8 }}>
            A $100K funded account with 5% daily loss limit. One emotional morning = $5,000 gone. Two bad days = account voided. All the charts, all the strategy — gone.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { stat: "9/9", label: "NO-TRADE days that would have hit drawdown for Lena S.", color: "var(--red)" },
              { stat: "4th", label: "Attempt — the one where she passed FTMO after adding TradeMind", color: "var(--green)" },
              { stat: "$0", label: "Extra cost for 60 seconds of protection before every session", color: "var(--blue)" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 16px", textAlign: "center" }}>
                <div className="font-bebas" style={{ fontSize: 40, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.stat}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for FTMO traders */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
        <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 5vw, 52px)", textAlign: "center", marginBottom: 40 }}>How TradeMind protects your challenge</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              step: "01", color: "var(--blue)",
              title: "Morning check-in before market open",
              desc: "5 questions covering sleep, emotional state, focus, financial stress, and recent performance. Takes 60 seconds. You do it before you even open your broker platform.",
            },
            {
              step: "02", color: "var(--green)",
              title: "Instant GO / CAUTION / NO-TRADE verdict",
              desc: "A 0–100 score and a clear verdict. On NO-TRADE days, you know immediately. No deliberating, no convincing yourself you're fine. The number doesn't lie.",
            },
            {
              step: "03", color: "var(--amber)",
              title: "Trade limit enforcement on CAUTION days",
              desc: "CAUTION doesn't mean stay out — it means cut size and limit exposure. TradeMind enforces your pre-set daily trade limit so you can't over-trade even when the urge hits.",
            },
            {
              step: "04", color: "#8B5CF6",
              title: "Pattern recognition after 30 days",
              desc: "The AI Coach shows you which mental states precede your worst sessions. You'll see your specific warning signs — not generic advice, your actual behavioral data.",
            },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 20px", alignItems: "flex-start" }}>
              <div className="font-bebas" style={{ fontSize: 28, color: item.color, lineHeight: 1, flexShrink: 0, minWidth: 36 }}>{item.step}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 className="font-bebas" style={{ fontSize: "clamp(32px, 5vw, 52px)", textAlign: "center", marginBottom: 36 }}>From funded traders</h2>

          <div style={{ background: "linear-gradient(135deg, rgba(0,232,122,0.04), var(--surface))", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 16, padding: "32px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
              {[...Array(5)].map((_, j) => (
                <svg key={j} width="13" height="13" viewBox="0 0 13 13" fill="var(--amber)"><path d="M6.5 1l1.4 3.2L11 4.6l-2.3 2.3.5 3.2-2.7-1.4L3.8 10l.5-3.2L2 4.6l3.1-.4L6.5 1z"/></svg>
              ))}
            </div>
            <p style={{ fontSize: 17, color: "var(--text)", lineHeight: 1.8, marginBottom: 20 }}>
              &ldquo;Failed FTMO three times. Passed on the fourth. The only thing I changed was TradeMind. I skipped 9 trading days based on my NO-TRADE score. Every single one of those days I would have hit max drawdown. Every one.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,59,92,0.15)", border: "1.5px solid rgba(255,59,92,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--red)" }}>LS</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Lena S.</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Prop Trader · FTMO · Using TradeMind 5 months</div>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 20px" }}>
            <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.8, marginBottom: 16 }}>
              &ldquo;I bought it skeptically. First week: three NO-TRADE days. I was annoyed. Then I went back through my journal — every single one of those days I would have blown up. It doesn&apos;t give you discipline. It makes you honest with yourself.&rdquo;
            </p>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>— David R., Prop Trader · FTMO · 2 months</div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", marginTop: 16, textAlign: "center" }}>Individual results vary. Testimonials reflect personal experiences and are not a guarantee of similar outcomes.</p>
        </div>
      </section>

      {/* Pricing for FTMO context */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <h2 className="font-bebas" style={{ fontSize: 44, marginBottom: 12 }}>Less than one bad trade</h2>
        <p style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 36, lineHeight: 1.7 }}>
          TradeMind: $39/month. A single emotional trade on a funded $100K account can cost $1,000–$5,000. The math isn&apos;t even close.
        </p>

        <div style={{ background: "var(--surface)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 14, padding: "28px 24px", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#8B5CF6", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 16 }}>TRADEMIND · $39/mo · everything included</div>
          <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["Daily mental score + GO/CAUTION/NO-TRADE", "Trade journal + emotion tracking", "90-day analytics + P&L correlation", "AI Coach Alex — daily briefing", "Broker auto-connect (MT4/MT5)", "Behavioral pattern detection", "Trading Playbook & rules engine", "Challenge tracker (FTMO, TopStep & more)"].map((f) => (
              <li key={f} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text-dim)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{f}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/login?callbackUrl=/checkin">
          <button className="btn-primary" style={{ fontSize: 16, padding: "18px 44px", borderRadius: 12, width: "100%" }}>
            Start Free Trial — 7 Days →
          </button>
        </Link>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 20px" }}>
          TradeMind is not affiliated with, endorsed by, or in any way officially connected with FTMO, TopStep, or any other prop trading firm mentioned on this page. All trademarks belong to their respective owners. TradeMind does not guarantee passage of any prop firm challenge. Trading involves substantial risk.
        </p>
        <Link href="/" style={{ color: "var(--blue)", textDecoration: "none" }}>← Back to TradeMind</Link>
        <span style={{ margin: "0 16px" }}>·</span>
        <Link href="/vs-tradezella" style={{ color: "var(--text-muted)", textDecoration: "none" }}>TradeMind vs TradeZella</Link>
        <span style={{ margin: "0 16px" }}>·</span>
        <Link href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms</Link>
      </footer>
    </div>
  );
}