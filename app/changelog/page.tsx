import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — TradeMind",
  description: "Every update, improvement, and new feature shipped to TradeMind. We build in public and ship fast.",
  alternates: { canonical: "https://trademindedge.com/changelog" },
  openGraph: {
    title: "Changelog — TradeMind",
    description: "Every update, improvement, and new feature shipped to TradeMind. We build in public and ship fast.",
    url: "https://trademindedge.com/changelog",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "Changelog — TradeMind",
    description: "Every update, improvement, and new feature shipped to TradeMind.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
};

type Entry = { date: string; tag: "NEW" | "IMPROVED" | "FIX"; title: string; body: string };

const RELEASES: { version: string; date: string; entries: Entry[] }[] = [
  {
    version: "April 2026 — Week 4",
    date: "Apr 22–26, 2026",
    entries: [
      { date: "Apr 26", tag: "NEW", title: "Morning Brief on Dashboard", body: "The dashboard now surfaces one personalised insight every morning: your 3-day score trend, your historically sharpest day of the week, and your exercise-score correlation. No extra API call — derived from your existing data." },
      { date: "Apr 26", tag: "IMPROVED", title: "Score ring ambient glow", body: "The score ring on the dashboard now emits a pulsing radial glow in your verdict colour — green, amber, or red. Small detail, clear signal." },
      { date: "Apr 26", tag: "IMPROVED", title: "Stat cards upgraded", body: "Each of the four dashboard stat cards (Streak, 7-Day Avg, Monthly, GO Days) now has a directional gradient tinted to its metric colour, hover lift animation, and glow textShadow on the number." },
      { date: "Apr 26", tag: "NEW", title: "Lifestyle correlation strip", body: "The dashboard now shows a live strip comparing your average score on exercise days vs rest days, with the point-lift delta and a link to the full analytics page." },
      { date: "Apr 25", tag: "NEW", title: "Circles — creator management", body: "Circle creators can now rename and delete their circles directly from the Circles page. Rename triggers an inline input; delete requires confirmation. Non-creators still see Invite + Leave." },
      { date: "Apr 25", tag: "FIX", title: "Circles leave bug", body: "The Leave Circle action was calling POST instead of DELETE. Fixed — the API now receives the correct method and the UI updates immediately on success." },
      { date: "Apr 25", tag: "NEW", title: "Circles added to BottomNav", body: "The bottom navigation bar now includes Circles (previously Leaderboard). The icon uses two overlapping person silhouettes." },
    ],
  },
  {
    version: "April 2026 — Week 3",
    date: "Apr 16–22, 2026",
    entries: [
      { date: "Apr 24", tag: "NEW", title: "Lifestyle tracker", body: "After completing your daily result, you can now log whether you exercised and your stress level (1–5). Data is stored alongside your check-in and surfaces in the new correlation analytics." },
      { date: "Apr 24", tag: "NEW", title: "Push notifications (PWA)", body: "TradeMind now supports Web Push notifications. You can enable reminders for your daily check-in from Settings. Works on Android and desktop; iOS support follows Safari's push permission model." },
      { date: "Apr 24", tag: "NEW", title: "Chart upload on journal entries", body: "You can now attach a trade chart screenshot to any journal entry. Images are stored securely and displayed inline in your journal history." },
      { date: "Apr 23", tag: "NEW", title: "EOD Recap", body: "A new End-of-Day recap flow (accessible after 4pm) lets you log P&L, rate your playbook compliance, and capture one lesson from the session. Recap history is tracked separately from your trade journal." },
      { date: "Apr 22", tag: "NEW", title: "Prop Firm Challenge Tracker", body: "TradeMind subscribers can now enable Challenge Mode. Set your account size, daily loss limit, max drawdown, and profit target. The tracker displays live P&L from your connected broker and alerts you as you approach limits." },
      { date: "Apr 22", tag: "NEW", title: "Position sizing calculator", body: "The dashboard and result pages now show a position size recommendation based on your mental score — 100% on GO, 50% on CAUTION, 0% on NO-TRADE — scaled to your account size." },
      { date: "Apr 21", tag: "NEW", title: "Circles (group accountability)", body: "Traders can now create or join accountability circles — private groups where members see each other's daily mental score and streak. Invite via shareable link." },
      { date: "Apr 21", tag: "NEW", title: "Leaderboard", body: "The discipline leaderboard ranks traders by consistency score (check-in streak × GO day rate). Opt-in via Settings → Public Profile." },
    ],
  },
  {
    version: "April 2026 — Launch Week",
    date: "Apr 16–20, 2026",
    entries: [
      { date: "Apr 20", tag: "NEW", title: "AI Coach Alex", body: "TradeMind subscribers get access to Alex, an AI coach that analyses your check-in history, journal entries, and P&L to surface the specific behavioural patterns costing you money — and gives you one concrete thing to change. Weekly insights are cached to avoid repeat questions." },
      { date: "Apr 20", tag: "NEW", title: "Broker auto-sync via MetaAPI", body: "Connect your MetaTrader 4 or 5 broker account via MetaAPI. TradeMind pulls your daily P&L automatically and maps it to your check-in scores to build the psychology/P&L correlation view." },
      { date: "Apr 19", tag: "NEW", title: "90-day analytics heatmap", body: "The analytics page now includes a full 90-day score heatmap, psychology vs P&L scatter plot, win rate by verdict, and estimated losses avoided on NO-TRADE days." },
      { date: "Apr 19", tag: "NEW", title: "Accountability partners", body: "Invite up to 3 trading partners. Each morning, your partners see your mental score and verdict in their dashboard — and vice versa. Mutual visibility drives mutual accountability." },
      { date: "Apr 18", tag: "NEW", title: "Trade journal", body: "Log every trade: symbol, direction, P&L, setup tag, and notes. Your journal is correlated with your mental scores to surface which states make you money and which don't." },
      { date: "Apr 17", tag: "NEW", title: "Trading Playbook", body: "Define your trading rules — entry criteria, risk limits, forbidden setups. The playbook is referenced during your daily check-in and EOD recap to reinforce rule compliance." },
      { date: "Apr 16", tag: "NEW", title: "TradeMind launches", body: "Daily mental check-in (5 questions, 60 seconds). Mental score 0–100. GO / CAUTION / NO-TRADE verdict. 7-day history chart. Streak tracking. Free tier available." },
    ],
  },
];

const TAG_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  NEW:      { bg: "rgba(0,232,122,0.08)",   border: "rgba(0,232,122,0.25)",   color: "var(--green)" },
  IMPROVED: { bg: "rgba(94,106,210,0.08)",  border: "rgba(94,106,210,0.25)",  color: "var(--blue)"  },
  FIX:      { bg: "rgba(255,176,32,0.08)",  border: "rgba(255,176,32,0.25)",  color: "var(--amber)" },
};

export default function ChangelogPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .cl-entry { transition: border-color 0.2s ease; }
        .cl-entry:hover { border-color: rgba(94,106,210,0.2) !important; }
      `}</style>

      {/* Nav */}
      <nav className="app-header" style={{ position: "sticky" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" style={{ display: "block", width: 120, height: "auto" }} />
          </Link>
          <Link href="/login?callbackUrl=/checkin">
            <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Start Free Trial</button>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(94,106,210,0.07)", border: "1px solid rgba(94,106,210,0.2)", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)", boxShadow: "0 0 6px var(--blue)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)" }}>WE SHIP FAST</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>Changelog</h1>
          <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7 }}>
            Every feature, improvement, and fix shipped to TradeMind. Updated as we build.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {Object.entries(TAG_COLORS).map(([tag, c]) => (
              <div key={tag} style={{ padding: "4px 12px", borderRadius: 6, background: c.bg, border: `1px solid ${c.border}`, fontSize: 11, fontWeight: 700, color: c.color }}>{tag}</div>
            ))}
          </div>
        </div>

        {/* Releases */}
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {RELEASES.map((release) => (
            <div key={release.version}>
              {/* Release header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>{release.version}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{release.date}</div>
                </div>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              {/* Entries */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {release.entries.map((entry) => {
                  const c = TAG_COLORS[entry.tag];
                  return (
                    <div key={entry.title} className="card cl-entry" style={{ padding: "18px 22px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap", marginTop: 3 }}>{entry.date}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, color: c.color, whiteSpace: "nowrap" }}>{entry.tag}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", flex: 1 }}>{entry.title}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{entry.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 64, padding: "24px 28px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 16 }}>
            Have a feature request or found a bug? We read every message.
          </p>
          <Link href="/contact">
            <button className="btn-ghost" style={{ padding: "10px 24px", fontSize: 13 }}>Send feedback →</button>
          </Link>
        </div>

      </div>
    </div>
  );
}