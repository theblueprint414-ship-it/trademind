import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Is Revenge Trading? How to Recognize and Stop It — TradeMind",
  description: "Revenge trading is the #1 account killer for prop firm traders. Learn the exact behavioral patterns that lead to revenge trades, how to catch them before they happen, and what to do instead.",
  openGraph: {
    title: "What Is Revenge Trading? How to Recognize and Stop It",
    description: "Revenge trading doesn't feel like emotion — it feels like determination. That's what makes it so dangerous.",
    url: "https://trademindedge.com/blog/revenge-trading",
  },
  alternates: { canonical: "https://trademindedge.com/blog/revenge-trading" },
};

const SECTIONS = [
  {
    n: "01",
    title: "What revenge trading actually is (and isn't)",
    color: "#FF3B5C",
    body: `Revenge trading is placing a trade with the primary motivation of recovering a recent loss — not because a valid setup exists. The key word is motivation. A trade taken 10 minutes after a loss can be a legitimate trade. A trade taken because you feel like you need to "make back" what you lost is revenge trading regardless of the setup quality.

This distinction matters because revenge trading is invisible on a chart. You can't see it in your entry signals. You can only see it in your state of mind — and that's exactly why it destroys accounts while traders insist they're "following their system."

The definition traders actually need: any trade where the primary driver is loss recovery rather than edge exploitation is a revenge trade. The setup that "confirmed it" is rationalization, not reason.`,
  },
  {
    n: "02",
    title: "The neuroscience behind revenge trading",
    color: "#5E6AD2",
    body: `After a loss, your brain undergoes measurable changes. The amygdala — your threat-response center — activates and suppresses activity in the prefrontal cortex, the region responsible for rational decision-making and impulse control.

In plain English: you are literally less capable of making good decisions after a loss than you were before it. This isn't a character flaw. It's a neurological fact. Studies on financial decision-making show that loss aversion spikes by 60% in the hour following a significant loss, making traders hold losing positions longer and cut winners faster.

The revenge trade feels urgent because your brain has registered the loss as a threat that needs to be neutralized immediately. That urgency is the problem, not the solution.`,
  },
  {
    n: "03",
    title: "The 5 warning signs of a revenge trade",
    color: "#FFB020",
    body: `You're in revenge mode if any of these are true before you enter:

1. You're moving to a larger position size than your plan specifies. The "I'll make it back faster" logic.
2. You're looking at your P&L before looking at the chart. Your focus has shifted from setups to outcomes.
3. You entered within 5 minutes of closing a losing trade. There's almost never a genuine A+ setup available that fast.
4. You switched instruments or timeframes because "this one wasn't working." Changing variables mid-session to chase a result.
5. You feel tension, urgency, or the need to act. Valid setups don't generate urgency — they generate patience.

If two or more of these apply, you're not trading your system. You're trading your emotions.`,
  },
  {
    n: "04",
    title: "Why prop firm traders are especially vulnerable",
    color: "#00C896",
    body: `Prop firm challenges create the perfect storm for revenge trading. There's a profit target to hit. There's a deadline. There's a financial cost to failure. And there's the awareness that every trading day counts.

This structure makes normal losses feel higher-stakes than they are. A 1% loss on day 12 of an FTMO challenge doesn't just feel like a 1% loss — it feels like failure, like wasted time, like money thrown away. The emotional amplification is real.

The traders who pass challenges aren't the ones who feel less emotion. They're the ones who have pre-decided their response to a loss before the loss happens. Not in the moment — before the session even starts.`,
  },
  {
    n: "05",
    title: "The 3-loss rule and why it works",
    color: "#5E6AD2",
    body: `The most effective rule against revenge trading isn't "don't revenge trade." That's the equivalent of telling someone with insomnia to just sleep.

The rule that works: after 3 consecutive losses, close your platform. Not a break. Not a few minutes away. Platform closed, trading done for the day.

This works because it removes the decision entirely. You don't have to evaluate whether you're in a good mental state — the rule does that automatically. Three consecutive losses is a behavioral threshold, not an emotional one. It doesn't require self-awareness. It just requires rule-following.

In data from prop firm trading accounts, the win rate on trade #4 after three consecutive losses is dramatically lower than baseline win rate. The market hasn't changed. The trader has.`,
  },
  {
    n: "06",
    title: "How to journal your way out of the pattern",
    color: "#FF3B5C",
    body: `Most traders journal their trades. Very few journal their psychological state at the time of the trade. This gap is why the revenge trading pattern repeats indefinitely.

Effective anti-revenge journaling means recording: your emotional state before entry, the time since your last loss, your position size relative to plan, and — most importantly — your honest assessment of why you entered. Not the technical reason. The real reason.

Over 30 days of honest journaling, the pattern becomes visible. You'll see your win rate on trades taken within 10 minutes of a loss. You'll see what your position size was on those trades. You'll see the specific emotional state that preceded your worst sessions. Once you can see the pattern, you can interrupt it.`,
  },
  {
    n: "07",
    title: "The identity shift that actually stops it",
    color: "#00C896",
    body: `Tactical rules help. Mental health practices help. But the traders who permanently overcome revenge trading undergo an identity shift: they stop defining their worth as a trader by their daily P&L.

When your identity is tied to being a winning trader today, any loss is a threat to your self-image. When your identity is tied to being a trader who follows their process consistently, a loss is just information.

This isn't spiritual advice — it's strategic. The trader who says "I follow my rules regardless of outcome" is immune to revenge trading because revenge requires an outcome to react to. The process-focused trader has already moved on.

Build this identity by committing to one behavioral rule and keeping it perfectly for 30 days. Not 29 days. 30. That's how identity is built: through evidence accumulated about the kind of trader you are.`,
  },
];

export default function RevengeTradingPage() {
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
          <span style={{ color: "#a1a1aa" }}>Revenge Trading</span>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", background: "rgba(255,59,92,0.15)", color: "#FF3B5C", borderRadius: 20, letterSpacing: "0.06em" }}>PSYCHOLOGY</span>
            <span style={{ fontSize: 13, color: "#52525b" }}>June 2025 · 8 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#fff", margin: "0 0 20px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            What Is Revenge Trading? How to Recognize and Stop It
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
            Revenge trading doesn&apos;t feel like emotion — it feels like determination. That&apos;s what makes it the most dangerous pattern in prop firm trading.
          </p>
        </div>

        <div style={{ background: "#0d1117", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: "20px 24px", marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em", margin: "0 0 8px" }}>THE NUMBER THAT EXPLAINS MOST BLOWN CHALLENGES</p>
          <p style={{ fontSize: 15, color: "#a1a1aa", lineHeight: 1.65, margin: 0 }}>
            In prop firm account analysis, <strong style={{ color: "#fff" }}>67% of all daily limit breaches happen on days with 4 or more trades.</strong> The average trader&apos;s A+ setup appears 1–2 times per session. Every trade after that is statistically a lower-quality entry — often driven by the need to recover.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.n} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: section.color + "20", border: `1px solid ${section.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: section.color }}>{section.n}</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.3px" }}>{section.title}</h2>
            </div>
            <div style={{ paddingLeft: 60, fontSize: 15, color: "#a1a1aa", lineHeight: 1.8 }}>
              {section.body.split("\n\n").map((para, i) => (
                <p key={i} style={{ margin: "0 0 14px" }}>{para}</p>
              ))}
            </div>
          </div>
        ))}

        <div style={{ padding: "36px 28px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.06))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 16, textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>TradeMind detects revenge trading before you place the trade</h3>
          <p style={{ fontSize: 15, color: "#a1a1aa", margin: "0 0 24px", lineHeight: 1.6 }}>
            Pre-session mood check-in, automatic 3-loss rule alerts, time-since-last-loss tracking, and honest trade journaling built for prop firm traders.
          </p>
          <Link href="/login" style={{ display: "inline-block", padding: "13px 32px", background: "#5E6AD2", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Start Free — Stop Revenge Trading →
          </Link>
        </div>

        <div style={{ marginTop: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#52525b", letterSpacing: "0.08em", marginBottom: 16 }}>RELATED ARTICLES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/blog/ftmo-challenge-tips" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>7 FTMO Challenge Tips That 90% of Traders Ignore →</Link>
            <Link href="/blog/why-funded-traders-fail" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>Why 90% of Funded Traders Fail Their Challenge →</Link>
            <Link href="/blog/best-trading-journal" style={{ textDecoration: "none", color: "#5E6AD2", fontSize: 15, fontWeight: 600 }}>The Best Trading Journal for Prop Traders in 2025 →</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
