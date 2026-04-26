import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center — TradeMind",
  description: "Answers to the most common questions about TradeMind: scoring, verdicts, journaling, broker connections, and more.",
  openGraph: { title: "Help Center — TradeMind", description: "Everything you need to know about using TradeMind." },
};

const FAQS = [
  {
    id: "score",
    question: "How is my daily score calculated?",
    answer: `Your score (0–100) is computed from 5 morning questions across the dimensions that psychological research most strongly links to decision quality: sleep, emotional state, focus, financial stress, and recent performance perception.

Each dimension is weighted based on its evidence-backed impact on trading outcomes. Sleep carries the highest weight — Walker's 2017 research and Lo et al.'s 2005 trading psychology study both identified it as the dominant cognitive performance factor.

The score is not diagnostic and not financial advice. It is a cognitive performance indicator — a consistent, standardized way to measure where you are mentally before you risk capital.`,
  },
  {
    id: "verdict",
    question: "What do GO, CAUTION, and NO-TRADE mean?",
    answer: `The three verdicts map to score bands:

GO (70–100): Your mental state is dialed in. Your full trading plan applies — execute your setups, trust your edge.

CAUTION (45–69): You can trade, but at reduced size. Stick to A+ setups only. Skip marginal or revenge-motivated plays. One position at a time.

NO-TRADE (0–44): Your cognitive risk is too high. Every trade you take today is made against the odds — not because the market is bad, but because you are compromised. Sitting out IS the trade.

NO-TRADE days are not failures. They are the product doing exactly what it's supposed to do.`,
  },
  {
    id: "no-trade-real",
    question: "Can I still trade on a NO-TRADE day?",
    answer: `Yes. TradeMind doesn't block your broker or lock your positions. You are always in control.

The tool gives you honest information. What you do with it is your choice. That's intentional — discipline built on your own decision to follow through is more durable than any external constraint.

If you ignore NO-TRADE days regularly and your P&L suffers, the journal data will show you the exact cost over time. That feedback loop is more persuasive than any rule.`,
  },
  {
    id: "streak",
    question: "What is a check-in streak and why does it matter?",
    answer: `Your streak counts consecutive calendar days you've completed a morning check-in.

Consistency is the entire point. A single check-in is a snapshot. 30 check-ins is a dataset. After 30+ days, the system can identify your best day of the week, your lowest-score triggers, and the correlation between your mental state and your actual P&L.

Streaks create a social accountability loop — your accountability partners and trading circle can see your streak, which makes stepping away from it feel meaningful. The psychological research on "implementation intentions" (Gollwitzer, 1999) shows that making a daily habit visible dramatically increases follow-through.`,
  },
  {
    id: "broker",
    question: "How do I connect my broker?",
    answer: `Go to Settings → Integrations and connect via MetaAPI OAuth. TradeMind supports MT4 and MT5 live and demo accounts.

Your broker credentials never touch TradeMind servers. The OAuth flow goes directly between your browser and MetaAPI's secure connection layer — TradeMind only receives an encrypted read-only token.

Once connected, trade data is pulled automatically and linked to your morning score, so you can see the P&L vs. psychology correlation without manual logging. CSV import is also available if you prefer not to connect directly or trade on an unsupported platform.`,
  },
  {
    id: "journal",
    question: "Do I have to log trades manually?",
    answer: `No — if you connect your broker via MetaAPI, trades are imported automatically.

If you prefer not to connect, or trade on a platform we don't yet support (cTrader, IBKR, Tradovate — all coming soon), CSV import is available under Journal → Import.

Manual trade entry is also supported for traders who want to add only selective trades, or who trade on platforms without API access.

The most valuable field to fill in is P&L. Once you have at least 10 trades with P&L data linked to check-in scores, your analytics unlock a direct line between your mental state and your profitability.`,
  },
  {
    id: "coach",
    question: "What does the AI Coach do?",
    answer: `Alex, the AI trading psychologist, analyzes your specific pattern data — not generic trading advice.

Every session, Alex looks at your recent check-in history, streak, verdict distribution, and logged trades, then gives you one precise action for the day. Not "sleep more." More like: "Your last four losing days all followed sleep scores under 45. Your streak suggests you're currently consistent, but your sleep score has dropped three days in a row. Today I'd reduce size by 30% regardless of your verdict."

Alex is available on Premium. During your 7-day trial, you have full access to try it.`,
  },
  {
    id: "accountability",
    question: "How do accountability partners work?",
    answer: `Under Partners, you can invite another trader by email. Once they accept, you each see each other's daily score and streak — not the underlying question answers.

This is deliberate. Knowing your partner can see whether you checked in (and what verdict you got) creates honest accountability without exposing the private details of your mental state.

You can also join or create a Trading Circle — a small group (up to 10 traders) that share check-in data. Circles are most used by prop firm challenge groups and trading communities who want shared accountability without a coaching relationship.`,
  },
  {
    id: "privacy",
    question: "Who can see my data?",
    answer: `Only you — and the people you explicitly invite as partners.

TradeMind does not sell data, share it with brokers, or use it for advertising. Your check-in answers are stored encrypted. Your broker token (if connected) is stored using AES-256 encryption and is read-only — TradeMind cannot place trades on your behalf.

You can export all your data or delete your account at any time under Settings. See our Security page for the full technical architecture.`,
  },
  {
    id: "pricing",
    question: "What's the difference between Free, Pro, and Premium?",
    answer: `Free: Daily check-in, score + verdict, 7-day history. No credit card required, forever.

Pro ($19/month): Unlimited check-in history, trade journal, full analytics (P&L vs. psychology correlation, verdict breakdown, best/worst day analysis), broker sync via MetaAPI, CSV import, accountability partners.

Premium ($45/month): Everything in Pro, plus AI Coach (Alex), lifestyle correlation (exercise, sleep depth impact on score), trading circles, weekly performance reports emailed to you, and priority support.

All paid plans start with a 7-day free trial. No charge until day 8 — cancel anytime in Settings before then.`,
  },
  {
    id: "data-delete",
    question: "How do I export or delete my data?",
    answer: `Go to Settings → Account. You'll find two options:

Export All Data: Downloads a JSON file containing all your check-ins, journal entries, and account data.

Delete Account: Permanently removes all your data from TradeMind's servers within 30 days. This action is irreversible.

If you cancel your subscription but don't delete your account, your data is preserved. If you resubscribe later, everything is exactly where you left it.`,
  },
];

export default function HelpPage() {
  return (
    <div style={{ background: "var(--bg, #070B14)", minHeight: "100vh", color: "var(--text, #E8F0FF)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        :root { --bg: #070B14; --surface: #0D1420; --border: #1E2D45; --text: #E8F0FF; --muted: #7A8BA8; --dim: #3D4F6A; --blue: #5e6ad2; --green: #00E87A; --purple: #8B5CF6; }
        .faq-item { border: 1px solid var(--border); border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
        .faq-item:hover { border-color: #2E4A6A; }
        .faq-q { width: 100%; background: none; border: none; color: var(--text); font-size: 15px; font-weight: 600; text-align: left; padding: 22px 24px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; line-height: 1.5; }
        .faq-q:hover { background: rgba(255,255,255,0.02); }
        .faq-body { padding: 0 24px 22px; color: var(--muted); font-size: 14px; line-height: 1.9; white-space: pre-line; }
        .faq-icon { color: var(--blue); font-size: 20px; flex-shrink: 0; }
        details[open] .faq-icon { transform: rotate(45deg); }
        .faq-icon { transition: transform 0.2s; }
        details[open] summary .faq-icon { transform: rotate(45deg); }
        .cat-pill { display: inline-block; background: rgba(94,106,210,0.12); border: 1px solid rgba(94,106,210,0.25); color: var(--blue); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; border-radius: 20px; padding: 4px 12px; margin-right: 8px; margin-bottom: 8px; }
        .help-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; text-decoration: none; color: inherit; display: block; transition: border-color 0.2s, transform 0.2s; }
        .help-card:hover { border-color: var(--blue); transform: translateY(-2px); }
      `}</style>

      {/* Nav */}
      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <img src="/logo.svg" alt="TradeMind" style={{ display: "block", width: 120, height: "auto" }} />
          </Link>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/dashboard" className="nav-link" style={{ fontSize: 13 }}>Dashboard</Link>
            <Link href="/contact" className="nav-link" style={{ fontSize: 13 }}>Contact</Link>
            <Link href="/login?callbackUrl=/settings">
              <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Start Free →</button>
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "72px 24px 96px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "var(--blue)", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 24 }}>
            HELP CENTER
          </div>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15 }}>How can we help?</h1>
          <p style={{ fontSize: 17, color: "var(--muted)", margin: "0 auto", maxWidth: 480, lineHeight: 1.7 }}>
            Everything you need to get the most out of TradeMind — from your first check-in to advanced analytics.
          </p>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 64 }}>
          <a href="#score" className="help-card">
            <div style={{ fontSize: 24, marginBottom: 10 }}>🚀</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Getting Started</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Score, verdicts, streaks</div>
          </a>
          <a href="#journal" className="help-card">
            <div style={{ fontSize: 24, marginBottom: 10 }}>📓</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Trade Journal</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Logging trades, CSV, sync</div>
          </a>
          <a href="#broker" className="help-card">
            <div style={{ fontSize: 24, marginBottom: 10 }}>🔌</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Broker Connection</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>MT4/MT5 via MetaAPI</div>
          </a>
          <a href="#pricing" className="help-card">
            <div style={{ fontSize: 24, marginBottom: 10 }}>💳</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Plans &amp; Pricing</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Free, Pro, Premium</div>
          </a>
        </div>

        {/* FAQ list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq) => (
            <details key={faq.id} id={faq.id} className="faq-item" style={{ background: "var(--surface)" }}>
              <summary className="faq-q" style={{ listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 24px", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                {faq.question}
                <span className="faq-icon" style={{ color: "var(--blue)", fontSize: 20, flexShrink: 0, transition: "transform 0.2s", lineHeight: 1 }}>+</span>
              </summary>
              <div className="faq-body" style={{ padding: "0 24px 22px", color: "var(--muted)", fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-line" }}>
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Still need help */}
        <div style={{ marginTop: 64, background: "linear-gradient(135deg, rgba(94,106,210,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20, padding: "40px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>💬</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>Still need help?</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, margin: "0 0 24px" }}>
            We respond to every message, usually within a few hours.
          </p>
          <a
            href="mailto:support@trademindedge.com"
            style={{ display: "inline-block", background: "linear-gradient(135deg, #5e6ad2, #4a5bbd)", color: "white", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontSize: 14, fontWeight: 600 }}
          >
            Email Support →
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px", textAlign: "center", color: "var(--dim)", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/privacy" style={{ color: "var(--dim)", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "var(--dim)", textDecoration: "none" }}>Terms</Link>
          <Link href="/security" style={{ color: "var(--dim)", textDecoration: "none" }}>Security</Link>
          <Link href="/contact" style={{ color: "var(--dim)", textDecoration: "none" }}>Contact</Link>
        </div>
        <p>© 2026 TradeMind. All rights reserved.</p>
      </footer>
    </div>
  );
}