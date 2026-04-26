import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — TradeMind",
  description: "Trading psychology insights, research, and strategies from the TradeMind team.",
  openGraph: {
    title: "Blog — TradeMind",
    description: "Trading psychology insights, research, and strategies from the TradeMind team.",
  },
};

const POSTS = [
  {
    slug: "why-funded-traders-fail",
    title: "Why 73% of Funded Traders Fail (It's Not Your Strategy)",
    description: "The real reason most prop firm traders blow their accounts has nothing to do with their edge, their setup, or their strategy. It's mental state.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Psychology",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "revenge-trading",
    title: "The Revenge Trade: Why Traders Make Their Worst Decisions After a Loss",
    description: "Revenge trading accounts for a disproportionate share of blown accounts. Here's the neuroscience behind it — and a concrete system to stop it before it starts.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Psychology",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "sleep-and-trading",
    title: "Sleep, Stress, and Your Trading P&L: The Science Behind the Check-in",
    description: "How sleep deprivation and emotional stress directly impair trading performance — and why a 60-second morning check-in changes the outcome.",
    date: "April 2026",
    readTime: "8 min read",
    tag: "Science",
    tagColor: "#FFB020",
    tagBg: "rgba(255,176,32,0.1)",
  },
  {
    slug: "overtrading",
    title: "Overtrading: The Silent Account Killer (And How to Stop It)",
    description: "Overtrading is responsible for more blown accounts than bad strategies. Here's the neuroscience behind why traders do it — and the systems that stop it.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Behavior",
    tagColor: "var(--blue)",
    tagBg: "rgba(79,142,247,0.1)",
  },
  {
    slug: "ftmo-challenge-mindset",
    title: "FTMO Challenge Psychology: Why It's 80% Mental and 20% Strategy",
    description: "Thousands of traders with proven strategies fail their FTMO challenge every month. The rules haven't changed. Something else happened — and it starts in the mind.",
    date: "April 2026",
    readTime: "8 min read",
    tag: "Prop Firms",
    tagColor: "#8B5CF6",
    tagBg: "rgba(139,92,246,0.1)",
  },
  {
    slug: "fomo-trading",
    title: "FOMO Trading: The Pattern That Erases Months of Gains in Hours",
    description: "Fear of missing out is one of the most expensive emotions in trading. Learn how to identify FOMO in real time — and build systems to stop it.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Psychology",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "trading-journal-mistakes",
    title: "7 Trading Journal Mistakes That Are Costing You Money",
    description: "Most traders keep a journal but don't improve from it. The problem isn't the journal — it's what they track. Here are the 7 mistakes and how to fix each one.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Journaling",
    tagColor: "var(--blue)",
    tagBg: "rgba(79,142,247,0.1)",
  },
  {
    slug: "drawdown-recovery",
    title: "Drawdown Recovery: How to Come Back Without Making It Worse",
    description: "How you respond to a drawdown determines whether it becomes a temporary setback or a blown account. Here's the psychological framework elite traders use to recover.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Recovery",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "trading-consistency",
    title: "Why Consistency Beats Returns: The Math Every Serious Trader Needs to See",
    description: "A 5% average monthly return with high variance destroys most accounts. A 2% average with low variance builds wealth. The math is counterintuitive — until you see it.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Performance",
    tagColor: "var(--green)",
    tagBg: "rgba(0,232,122,0.1)",
  },
  {
    slug: "funded-account-rules",
    title: "How to Never Break a Prop Firm Rule Again",
    description: "Rule violations end more funded accounts than market losses. Here's the system-based approach that makes rule adherence automatic — not dependent on willpower.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Prop Firms",
    tagColor: "#8B5CF6",
    tagBg: "rgba(139,92,246,0.1)",
  },
  {
    slug: "stress-trading",
    title: "Cortisol, Adrenaline, and Your P&L: The Neuroscience of Trading Under Stress",
    description: "Stress doesn't just feel bad — it measurably degrades the cognitive functions you need most. Here's exactly what happens in your brain during a high-stress session.",
    date: "April 2026",
    readTime: "8 min read",
    tag: "Science",
    tagColor: "#FFB020",
    tagBg: "rgba(255,176,32,0.1)",
  },
  {
    slug: "when-not-to-trade",
    title: "When Not to Trade: The Most Profitable Decision You Can Make",
    description: "Every professional trader has a clear answer to this question. Most retail traders have never thought about it. That gap is expensive.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Strategy",
    tagColor: "var(--green)",
    tagBg: "rgba(0,232,122,0.1)",
  },
  {
    slug: "trading-losses",
    title: "How to Handle a Trading Loss Without Destroying Your Account",
    description: "The way you respond to a loss in the next 20 minutes determines more about your long-term performance than the loss itself. Here's the protocol that works.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Psychology",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "position-sizing-psychology",
    title: "Position Sizing and Fear: Why Scared Money Never Wins",
    description: "The size of your position changes how you trade it. Too large, and fear drives every decision. Here's the psychology of position sizing and how to find your optimal threshold.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Risk",
    tagColor: "var(--blue)",
    tagBg: "rgba(79,142,247,0.1)",
  },
  {
    slug: "best-trading-journal",
    title: "What to Write in Your Trading Journal (Most Traders Miss This)",
    description: "Most trading journals are sophisticated P&L spreadsheets. What you actually need is a system that captures your psychological state alongside your trades.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Journaling",
    tagColor: "var(--blue)",
    tagBg: "rgba(79,142,247,0.1)",
  },
  {
    slug: "emotional-trading-signs",
    title: "9 Signs You're Trading Emotionally (And Don't Know It)",
    description: "Emotional trading doesn't always feel emotional. It feels like analysis, like conviction, like seeing the market clearly. Here are the 9 behavioral signs that reveal it.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Psychology",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "risk-management-mindset",
    title: "Risk Management Alone Won't Save You: The Missing Layer",
    description: "Every trader who blew an account knew the 1% rule. Risk management rules fail exactly when you need them most: under psychological pressure.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Risk",
    tagColor: "var(--blue)",
    tagBg: "rgba(79,142,247,0.1)",
  },
  {
    slug: "trading-mindset",
    title: "Fixed vs Growth Mindset in Trading: How Professional Traders Think",
    description: "Two traders, same strategy, same market — different results. The difference is rarely skill. It's how they interpret losses, setbacks, and feedback.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Psychology",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "pre-market-routine",
    title: "The 15-Minute Pre-Market Routine That Separates Consistent Traders",
    description: "Most traders open their platform and start watching charts. The best traders spend 15 minutes preparing themselves before they open the platform.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Routine",
    tagColor: "var(--green)",
    tagBg: "rgba(0,232,122,0.1)",
  },
  {
    slug: "cutting-losses",
    title: "Why Good Traders Cut Losses Fast — And How to Train Yourself to Do It",
    description: "'Cut losses short.' Every trader knows this. Almost no one does it consistently. The failure is neuroscience, not weakness — and neuroscience has solutions.",
    date: "April 2026",
    readTime: "6 min read",
    tag: "Execution",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "measure-trading-performance",
    title: "How to Actually Measure Your Trading Performance (Beyond Win Rate)",
    description: "Win rate tells you almost nothing in isolation. Here are the 7 metrics that actually reveal whether your trading is improving.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Analytics",
    tagColor: "var(--green)",
    tagBg: "rgba(0,232,122,0.1)",
  },
  {
    slug: "pre-trade-check-in-science",
    title: "The Science Behind Pre-Trade Mental Check-ins",
    description: "Why does rating your mental state before trading actually improve performance? The research is more specific than you'd expect — and it explains exactly why 60 seconds matters.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Science",
    tagColor: "#FFB020",
    tagBg: "rgba(255,176,32,0.1)",
  },
  {
    slug: "prop-firm-tips",
    title: "10 Rules for Passing and Keeping Your First Funded Account",
    description: "The funded account industry has a failure rate above 90%. That's not a market problem — it's a psychology problem. Here are 10 rules from traders who pass repeatedly.",
    date: "April 2026",
    readTime: "8 min read",
    tag: "Prop Firms",
    tagColor: "#8B5CF6",
    tagBg: "rgba(139,92,246,0.1)",
  },
  {
    slug: "trading-psychology-concepts",
    title: "5 Trading Psychology Concepts That Actually Move the Needle",
    description: "Most trading psychology advice is vague. These 5 concepts from behavioral research have specific, measurable applications to your next trading session.",
    date: "April 2026",
    readTime: "8 min read",
    tag: "Science",
    tagColor: "#FFB020",
    tagBg: "rgba(255,176,32,0.1)",
  },
  {
    slug: "day-trading-mistakes",
    title: "The 8 Most Common Day Trading Mistakes (And the Psychology Behind Each)",
    description: "Day trading mistakes are almost never about strategy. Here are the 8 most common ones, the behavioral mechanism behind each, and how to fix them.",
    date: "April 2026",
    readTime: "8 min read",
    tag: "Behavior",
    tagColor: "var(--red)",
    tagBg: "rgba(255,59,92,0.1)",
  },
  {
    slug: "mindful-trading",
    title: "Mindful Trading: Using Self-Awareness as a Technical Edge",
    description: "Mindfulness in trading isn't about being calm — it's about being accurate. Accurate self-assessment produces better trade decisions through clearer pattern recognition.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Mindset",
    tagColor: "var(--green)",
    tagBg: "rgba(0,232,122,0.1)",
  },
  {
    slug: "trading-discipline",
    title: "What Real Trading Discipline Looks Like (And How to Build It)",
    description: "Trading discipline isn't willpower. It's the architecture of decisions made in advance that makes the right action the default action.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Discipline",
    tagColor: "var(--blue)",
    tagBg: "rgba(79,142,247,0.1)",
  },
  {
    slug: "morning-routine-traders",
    title: "The Elite Trader Morning Routine: 5 Habits That Separate Professionals",
    description: "Elite traders don't just trade better — they prepare better. The hour before the market opens shapes the quality of every decision made after it.",
    date: "April 2026",
    readTime: "7 min read",
    tag: "Routine",
    tagColor: "var(--green)",
    tagBg: "rgba(0,232,122,0.1)",
  },
];

export default function BlogPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style>{`
        .blog-card { transition: border-color 0.15s ease, transform 0.15s ease; }
        .blog-card:hover { border-color: rgba(79,142,247,0.4) !important; transform: translateY(-2px); }
      `}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: 40 }}>
          <img src="/logo.svg" alt="TradeMind" height="28" style={{ display: "block" }} />
        </Link>

        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 10 }}>TRADEMIND BLOG</div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
            Trading psychology,<br />by the numbers.
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7 }}>
            Research, insights, and real data on what separates profitable traders from the rest.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div
                className="blog-card"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "28px 28px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: post.tagColor, background: post.tagBg, padding: "3px 8px", borderRadius: 5 }}>{post.tag}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{post.date} · {post.readTime}</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, marginBottom: 10, color: "var(--text)" }}>{post.title}</h2>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.65, margin: 0 }}>{post.description}</p>
                <div style={{ marginTop: 16, fontSize: 13, color: "var(--blue)", fontWeight: 700 }}>Read article →</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← Back to TradeMind</Link>
          <Link href="/checkin" style={{ fontSize: 13, color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Try it free →</Link>
        </div>
      </div>
    </div>
  );
}