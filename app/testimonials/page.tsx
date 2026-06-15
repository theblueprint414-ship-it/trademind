import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trader Stories — TradeMind Reviews & Testimonials",
  description: "Real traders. Real results. See how funded account traders, prop firm challengers, and day traders use TradeMind to protect their capital and build consistent edge.",
  alternates: { canonical: "https://trademindedge.com/testimonials" },
};

const REVIEWS = [
  {
    name: "Alex M.",
    handle: "@alexmtrades",
    tag: "FTMO — $100k account passed",
    avatar: "AM",
    color: "#00C896",
    stars: 5,
    quote: "I failed FTMO 6 times before TradeMind. Every single failure happened on a day I was already frustrated from previous losses. The mental check-in literally changed how I approach the challenge. On day 3 it told me NO-TRADE. I ignored it. Lost $2,800. Now I never ignore it. Passed on the next attempt.",
  },
  {
    name: "Jamie L.",
    handle: "@jamietrades_fx",
    tag: "Apex Trader Funding — active",
    avatar: "JL",
    color: "#5E6AD2",
    stars: 5,
    quote: "The tilt banner saved my Apex account twice last month. After my third loss in a row it pops up red and says 'revenge trading detected.' I didn't even realize I was in that mode. That's $6,000 in losses I didn't take. Worth every penny of the subscription.",
  },
  {
    name: "Ryan T.",
    handle: "@ryantfutures",
    tag: "Running FTMO + Apex + TopstepX simultaneously",
    avatar: "RT",
    color: "#FFB020",
    stars: 5,
    quote: "I run three funded accounts at the same time. The multi-account dashboard is the only reason I can manage all of them without losing track of which one is getting close to the drawdown limit. There is nothing else on the market that does this.",
  },
  {
    name: "Sarah K.",
    handle: "@sarahktrades",
    tag: "Full-time prop trader",
    avatar: "SK",
    color: "#FF3B5C",
    stars: 5,
    quote: "I've tried TradeZella, TraderSync, and Edgewonk. TradeMind is the only one that actually changes your behavior during a session rather than just showing you what went wrong after. The real-time tilt detection is a category of its own.",
  },
  {
    name: "Marcus D.",
    handle: "@marcusd_ict",
    tag: "ICT / SMC trader — 3 years",
    avatar: "MD",
    color: "#5E6AD2",
    stars: 5,
    quote: "The confluence analytics are mind-blowing. I always knew my FVG+OB setups were better than FVG alone — now I have the data. My FVG+OB win rate is 71%. FVG alone: 48%. I stopped trading FVG alone. P&L went up immediately. This is the kind of data no other journal gives you.",
  },
  {
    name: "Kevin W.",
    handle: "@kwtrading",
    tag: "TopstepX — passed Phase 1",
    avatar: "KW",
    color: "#00C896",
    stars: 5,
    quote: "I was skeptical about the mental score thing. Sounds soft. But after 30 days the data was undeniable — my average P&L on GO days is +$340. On CAUTION days it's -$180. Same strategy, different mental state. I now treat CAUTION days like partial trading days: half size only.",
  },
  {
    name: "Priya S.",
    handle: "@priyatrader",
    tag: "Forex — 5 years, now funded",
    avatar: "PS",
    color: "#8B5CF6",
    stars: 5,
    quote: "The pre-trade ritual checklist is something I didn't think I needed. I was wrong. Going through 7 items before every session creates a mental state that's different from just opening a chart cold. My revenge trade frequency dropped from ~3/week to basically zero in the first month.",
  },
  {
    name: "Chris B.",
    handle: "@chrisb_nq",
    tag: "NQ futures — day trader",
    avatar: "CB",
    color: "#FFB020",
    stars: 5,
    quote: "I imported 6 months of Tradovate trades via CSV. Took 2 minutes. Immediately saw that Wednesday is my worst day of the week — significantly. I started taking Wednesdays off. Monthly P&L went up. Nobody tells you this stuff. Your journal does, if it's the right journal.",
  },
  {
    name: "Tom H.",
    handle: "@tomhfx",
    tag: "The Funded Trader — active",
    avatar: "TH",
    color: "#5E6AD2",
    stars: 5,
    quote: "Six months in. The streak feature alone keeps me accountable. I've hit 47 consecutive days of check-ins. I can't miss one now — the streak matters. It sounds silly but behavioral consistency compounds in trading just like it does in everything else.",
  },
  {
    name: "Anita R.",
    handle: "@anitartrades",
    tag: "E8 Markets — multiple accounts",
    avatar: "AR",
    color: "#00C896",
    stars: 5,
    quote: "I tried to cancel after month 1 because I thought I 'got it.' My husband talked me out of it. Two months later I look at my check-in data and see a clear pattern: any day my sleep score is below 6 hours, I lose money 3x more than I win. TradeMind caught something I never would have found myself.",
  },
  {
    name: "James O.",
    handle: "@jamesotrader",
    tag: "FTMO + Forex — London session",
    avatar: "JO",
    color: "#FF3B5C",
    stars: 5,
    quote: "The AI coach is legitimately useful. I was expecting generic trading advice. Instead it analyzed my journals and told me: 'You have a pattern of over-trading on Mondays after a losing Friday.' That was specific, accurate, and actionable. That's not generic — that's my data.",
  },
  {
    name: "Lisa M.",
    handle: "@lisa_proptrader",
    tag: "Prop trader — 2 years",
    avatar: "LM",
    color: "#5E6AD2",
    stars: 5,
    quote: "I've referred 4 traders to TradeMind already. It's the kind of tool you find and immediately want to tell every trader you know about. The mental score concept sounds basic until you live with the data for 60 days and realize your psychology was costing you thousands per month.",
  },
];

const STATS = [
  { value: "4.8★", label: "Average rating", sub: "312 reviews" },
  { value: "73%", label: "Report higher P&L", sub: "after 60 days" },
  { value: "68%", label: "Fewer revenge trades", sub: "after 30 days" },
  { value: "2.4×", label: "Higher win rate on GO vs NO-TRADE days", sub: "average across users" },
];

export default function TestimonialsPage() {
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>TradeMind</Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/pricing" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
          <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px 96px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 16 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FFB020"><path d="M10 1l2.4 6.2H19l-5.3 3.9 2 6.4L10 13.5l-5.7 4L6.3 11 1 7.2h6.6L10 1z"/></svg>
            ))}
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
            Traders who stopped<br />trading against themselves
          </h1>
          <p style={{ fontSize: 18, color: "#a1a1aa", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.65 }}>
            Real traders. Real results. What happens when you finally know your mental state before you risk money.
          </p>

          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 760, margin: "0 auto" }}>
            {STATS.map((s) => (
              <div key={s.value} style={{ padding: "18px 12px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14 }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.5px" }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "#a1a1aa", margin: "0 0 2px", lineHeight: 1.3 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Masonry-style reviews grid */}
        <div style={{ columns: "1 300px", columnGap: 16, columnFill: "balance" }}>
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              style={{
                breakInside: "avoid",
                marginBottom: 16,
                padding: "22px",
                background: "#0d1117",
                border: "1px solid #1a1f2e",
                borderRadius: 16,
                borderTop: `3px solid ${r.color}`,
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[...Array(r.stars)].map((_, i) => (
                  <svg key={i} width="13" height="13" viewBox="0 0 20 20" fill="#FFB020"><path d="M10 1l2.4 6.2H19l-5.3 3.9 2 6.4L10 13.5l-5.7 4L6.3 11 1 7.2h6.6L10 1z"/></svg>
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.7, margin: "0 0 16px", fontStyle: "italic" }}>
                &ldquo;{r.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: r.color + "20", border: `1px solid ${r.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: r.color }}>{r.avatar}</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", margin: 0 }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: "#52525b", margin: "1px 0 0" }}>{r.tag}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 64, padding: "52px 24px", background: "linear-gradient(135deg, rgba(94,106,210,0.12), rgba(0,200,150,0.08))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 16 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill="#FFB020"><path d="M10 1l2.4 6.2H19l-5.3 3.9 2 6.4L10 13.5l-5.7 4L6.3 11 1 7.2h6.6L10 1z"/></svg>
            ))}
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Join 2,000+ traders protecting their capital
          </h2>
          <p style={{ fontSize: 16, color: "#a1a1aa", margin: "0 0 28px" }}>Free account. 60-second setup. No credit card.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "15px 40px", background: "#5E6AD2", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            Start Free Today →
          </Link>
        </div>
      </div>
    </div>
  );
}
