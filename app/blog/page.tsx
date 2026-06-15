import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Psychology & Prop Firm Blog — TradeMind",
  description: "Research-backed articles on trading psychology, prop firm strategies, tilt detection, and mental performance for funded traders.",
  alternates: { canonical: "https://trademindedge.com/blog" },
};

const POSTS = [
  {
    slug: "best-trading-journal-prop-firms",
    title: "The Best Trading Journal for Prop Firm Traders in 2025",
    excerpt: "Most journals track your trades. The best ones track your mind. Here's what separates a good trading journal from one that actually helps funded traders pass challenges.",
    tag: "Prop Firms",
    tagColor: "#5E6AD2",
    readTime: "7 min",
    date: "June 2025",
  },
  {
    slug: "ftmo-challenge-tips",
    title: "7 FTMO Challenge Tips That 90% of Traders Ignore",
    excerpt: "Your strategy might be good enough to pass FTMO. Your mental state on your worst day might not be. Here are the 7 things that separate traders who pass from those who don't.",
    tag: "FTMO",
    tagColor: "#00C896",
    readTime: "9 min",
    date: "June 2025",
  },
  {
    slug: "revenge-trading",
    title: "Revenge Trading: How to Detect It Before It Destroys Your Account",
    excerpt: "Revenge trading is responsible for more funded account failures than any bad strategy. Learn how to recognize the patterns — and how to stop before the damage is done.",
    tag: "Psychology",
    tagColor: "#FF3B5C",
    readTime: "6 min",
    date: "May 2025",
  },
  {
    slug: "why-funded-traders-fail",
    title: "Why 80% of Funded Traders Fail (And How to Be in the Other 20%)",
    excerpt: "Prop firm companies release their data every quarter. The pattern is always the same. It's not the strategy that fails — it's the psychology on bad days.",
    tag: "Prop Firms",
    tagColor: "#5E6AD2",
    readTime: "8 min",
    date: "May 2025",
  },
  {
    slug: "trading-journal-mistakes",
    title: "5 Trading Journal Mistakes That Are Costing You Money",
    excerpt: "Keeping a journal that only logs entry and exit prices is better than nothing — but just barely. Here's what your journal is missing that actually builds edge.",
    tag: "Journaling",
    tagColor: "#FFB020",
    readTime: "5 min",
    date: "April 2025",
  },
  {
    slug: "drawdown-recovery",
    title: "How to Recover From a Drawdown Without Blowing Your Account",
    excerpt: "The drawdown isn't the problem. What you do after is. Most traders make their second-worst mistake immediately after their worst one. Here's the framework to break the cycle.",
    tag: "Risk Management",
    tagColor: "#00C896",
    readTime: "7 min",
    date: "April 2025",
  },
];

export default function BlogIndex() {
  const [featured, ...rest] = POSTS;
  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#e4e4e7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ borderBottom: "1px solid #1a1f2e", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>TradeMind</Link>
        <Link href="/login" style={{ padding: "8px 18px", background: "#5E6AD2", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Try Free</Link>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-1px" }}>Blog</h1>
        <p style={{ fontSize: 16, color: "#71717a", margin: "0 0 48px" }}>Trading psychology, prop firm strategies, and mental performance.</p>

        {/* Featured */}
        <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 32 }}>
          <div style={{ padding: "28px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 18, transition: "border-color 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", background: featured.tagColor + "20", color: featured.tagColor, borderRadius: 20, letterSpacing: "0.06em" }}>{featured.tag}</span>
              <span style={{ fontSize: 11, color: "#52525b" }}>{featured.date} · {featured.readTime} read</span>
              <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(94,106,210,0.15)", color: "#8B96E8", borderRadius: 20, fontWeight: 700 }}>FEATURED</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 12px", lineHeight: 1.25, letterSpacing: "-0.5px" }}>{featured.title}</h2>
            <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.65, margin: "0 0 16px" }}>{featured.excerpt}</p>
            <span style={{ fontSize: 13, color: "#5E6AD2", fontWeight: 600 }}>Read article →</span>
          </div>
        </Link>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ padding: "22px", background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14, height: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", background: post.tagColor + "20", color: post.tagColor, borderRadius: 20, letterSpacing: "0.06em" }}>{post.tag}</span>
                  <span style={{ fontSize: 11, color: "#52525b" }}>{post.readTime}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e4e4e7", margin: "0 0 8px", lineHeight: 1.35 }}>{post.title}</h3>
                <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, margin: "0 0 12px" }}>{post.excerpt}</p>
                <span style={{ fontSize: 12, color: "#5E6AD2", fontWeight: 600 }}>Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
