import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prop Firm Rules Every Funded Trader Must Know (2025 Guide) — TradeMind",
  description: "Daily loss limits, max drawdown, consistency rules, news trading, weekend holding, lot size restrictions — this is the complete 2025 guide to funded account rules across FTMO, Apex, and TopStep.",
  openGraph: {
    title: "Prop Firm Rules Every Funded Trader Must Know (2025 Guide)",
    description: "Funded traders lose accounts to rule violations they didn't know existed. This guide covers everything.",
    url: "https://trademindedge.com/blog/funded-account-rules",
  },
  alternates: { canonical: "https://trademindedge.com/blog/funded-account-rules" },
};

const RULES = [
  {
    n: "01",
    title: "Daily loss limit: the most misunderstood rule in prop trading",
    color: "#FF3B5C",
    body: `Every prop firm has a daily loss limit, but how it's calculated differs significantly — and the difference can cost you your account.

FTMO uses an equity-based calculation: the limit is 5% of your starting phase balance, calculated from your equity high-water mark within that day. If you start the day at $100,000 and have a trade running at +$2,000 unrealized, your effective daily limit expands — you can lose $7,000 from that equity peak before breaching the rule.

Apex and TopStep use simpler balance-based calculations, but check whether the firm counts unrealized P&L against your daily limit. Some firms count open drawdown (your position is losing $3,000 right now) as an active breach even before you close the trade. This catches traders off guard — you're in a drawdown, the market recovers, but you've already triggered the rule.

Read the exact calculation method in your firm's terms. Then build your personal daily stop 40% inside that limit.`,
  },
  {
    n: "02",
    title: "Maximum drawdown: static vs. trailing — they are not the same thing",
    color: "#5E6AD2",
    body: `Maximum drawdown comes in two forms: static (fixed from starting balance) and trailing (follows your high-water mark). The type determines your entire risk management strategy.

Static max drawdown: FTMO uses a 10% max drawdown from your starting balance. If you start at $100,000, you can never drop below $90,000 — regardless of how high your account goes in between. Simple to track.

Trailing max drawdown: Apex's model trails your profit. If you grow a $100,000 account to $110,000, your trailing stop moves up to $100,000. Then if you drop back to $99,000, you've violated the rule — even though you're back to your starting balance. The trailing model means that profits create risk. Many traders have grown an account to 8% up, given it all back, and lost the account — while still being at their starting balance.

Know which model your firm uses before you trade a single setup.`,
  },
  {
    n: "03",
    title: "Consistency rules: the hidden filter most traders discover too late",
    color: "#FFB020",
    body: `Several prop firms — including FTMO's funded phase — include a consistency rule that requires no single trading day to account for more than a certain percentage of your total profits. Common thresholds: 30% or 50% of total profit on one day triggers a violation.

This rule exists to prevent traders from making 9% in one lucky session, losing 8% over the rest of the month, and withdrawing on a 1% net gain. The firm wants to see consistent profitability, not lottery-style trading.

The practical implication: if you have a monster trading day, be careful. Booking 5% on a single day when your total challenge profit is 6% means that day represents 83% of your gains. Some firms will flag this at withdrawal and request a longer track record.

Track your daily P&L distribution, not just your total. Consistent profits across multiple days are more fundable — and more sustainable — than concentrated single-day gains.`,
  },
  {
    n: "04",
    title: "News trading restrictions: the rules that change by the hour",
    color: "#00C896",
    body: `Most prop firms restrict trading around high-impact news events. The specifics vary: FTMO prohibits opening or closing trades within 2 minutes of red-folder news events. Other firms restrict a wider window or specific instruments.

The consequences are severe: trades placed during restricted windows can be voided, and repeated violations can result in account termination. This matters even if your news trades are profitable.

Practical advice: download an economic calendar integration or maintain a habit of checking before any session. The most common violation pattern is a trader who enters a position during Asia session, holds it overnight, and wakes up to find that NFP was released and their trade was affected. Even if the position was entered hours before — if it was open during the news window, some firms consider this a violation.

When in doubt, close your positions before the news window and re-enter after.`,
  },
  {
    n: "05",
    title: "Weekend holding: when Friday's close is more important than the trade",
    color: "#5E6AD2",
    body: `Many prop firms prohibit holding positions over the weekend. The reasoning is gap risk: markets can open significantly higher or lower than Friday's close, creating uncontrolled drawdown that a trader couldn't have managed.

FTMO allows weekend holding but explicitly warns that gap losses count toward your drawdown limits. Apex prohibits overnight and weekend holds on some account types. TopStep rules vary by contract and account size.

If your firm allows weekend holds, the question isn't whether the rules permit it — it's whether the gap risk is worth it. A position that gaps against you Monday morning by 1.5% on an account you've carefully managed to 4% profit is devastating. Most experienced funded traders adopt a personal rule: close everything by Friday's close, regardless of what the firm's rules say.

Certainty is a trading edge. Weekends eliminate certainty.`,
  },
  {
    n: "06",
    title: "Lot size and position sizing: the compliance rules that catch beginners",
    color: "#FF3B5C",
    body: `Position sizing restrictions are less common than drawdown limits, but they exist — and violating them can invalidate trades.

Some firms restrict maximum lot size per trade relative to account size. Others restrict the number of positions open simultaneously. A few have minimum lot size requirements (relevant for traders who size down during the challenge to play it safe).

More commonly, the practical sizing constraint is self-imposed: at 1% risk per trade, how large a position can you take before a single adverse tick threatens your daily limit? This math should be done before your session, not mid-trade.

The underlying principle: position sizing is where discipline meets execution. The trader who sizes correctly on their first 3 trades but doubles up on trade #4 to "make back" the loss has violated the spirit of every prop firm rule — whether or not a specific rule exists for it.`,
  },
];

export default function FundedAccountRulesPage() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18 }}>TradeMind</Link>
        <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
      </nav>

      <article style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px 100px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28, fontSize: 13, color: "#52525b" }}>
          <Link href="/blog" style={{ color: "#52525b", textDecoration: "none" }}>Blog</Link>
          <span>›</span>
          <span style={{ color: "#a1a1aa" }}>Funded Account Rules</span>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", background: "rgba(0,200,150,0.15)", color: "#00C896", borderRadius: 20, letterSpacing: "0.06em" }}>2025 GUIDE</span>
            <span style={{ fontSize: 13, color: "#52525b" }}>June 2025 · 10 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            Prop Firm Rules Every Funded Trader Must Know (2025 Guide)
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
            Traders lose funded accounts to rule violations they didn&apos;t know existed. This guide covers daily loss limits, max drawdown, consistency rules, news restrictions, weekend holding, and position sizing — so you don&apos;t find out the hard way.
          </p>
        </div>

        <div style={{ background: "#0d1117", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: "20px 24px", marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em", margin: "0 0 8px" }}>WHY THIS MATTERS MORE THAN YOUR STRATEGY</p>
          <p style={{ fontSize: 15, color: "#a1a1aa", lineHeight: 1.65, margin: 0 }}>
            A profitable trader with a 60% win rate can still lose their funded account if they violate a rule they didn&apos;t fully understand. <strong style={{ color: "#fff" }}>Rule compliance is a prerequisite to profitability</strong> — not a consequence of it. Know the rules before you trade a single setup.
          </p>
        </div>

        {RULES.map((rule) => (
          <div key={rule.n} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: rule.color + "20", border: `1px solid ${rule.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: rule.color }}>{rule.n}</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.3px" }}>{rule.title}</h2>
            </div>
            <div style={{ paddingLeft: 60, fontSize: 15, color: "#a1a1aa", lineHeight: 1.8 }}>
              {rule.body.split("\n\n").map((para, i) => (
                <p key={i} style={{ margin: "0 0 14px" }}>{para}</p>
              ))}
            </div>
          </div>
        ))}

        <div style={{ padding: "36px 28px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.06))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 16, textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>TradeMind tracks your rules so you don&apos;t have to memorize them</h3>
          <p style={{ fontSize: 15, color: "#a1a1aa", margin: "0 0 24px", lineHeight: 1.6 }}>
            Real-time drawdown tracking, daily loss alerts before you breach, and a pre-session check-in that flags rule risks before your first trade.
          </p>
          <Link href="/login" style={{ display: "inline-block", padding: "13px 32px", background: "#5E6AD2", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Start Free — Stay Compliant →
          </Link>
        </div>

        <div style={{ marginTop: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#52525b", letterSpacing: "0.08em", marginBottom: 16 }}>RELATED ARTICLES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/blog/ftmo-challenge-tips" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>7 FTMO Challenge Tips That 90% of Traders Ignore →</Link>
            <Link href="/blog/prop-firm-tips" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>10 Prop Firm Tips Most Traders Learn the Hard Way →</Link>
            <Link href="/blog/why-funded-traders-fail" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>Why 90% of Funded Traders Fail Their Challenge →</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
