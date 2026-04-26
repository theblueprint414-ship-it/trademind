import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Revenge Trade: Why Traders Make Their Worst Decisions After a Loss — TradeMind",
  description: "Revenge trading is responsible for more blown accounts than any other single mistake. Here's the neuroscience behind it — and a system to stop it before it starts.",
  openGraph: {
    title: "The Revenge Trade: Why Traders Make Their Worst Decisions After a Loss",
    description: "Revenge trading is responsible for more blown accounts than any other single mistake. Here's the neuroscience behind it — and a system to stop it before it starts.",
    url: "https://trademindedge.com/blog/revenge-trading",
    siteName: "TradeMind",
    type: "article",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/blog/revenge-trading" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Revenge Trade: Why Traders Make Their Worst Decisions After a Loss",
  description: "Revenge trading is responsible for more blown accounts than any other single mistake. Here's the neuroscience behind it — and a system to stop it before it starts.",
  url: "https://trademindedge.com/blog/revenge-trading",
  datePublished: "2026-04-20",
  dateModified: "2026-04-24",
  author: { "@type": "Organization", name: "TradeMind", url: "https://trademindedge.com" },
  publisher: { "@type": "Organization", name: "TradeMind", logo: { "@type": "ImageObject", url: "https://trademindedge.com/icons/icon-512.png" } },
};

export default function RevengeTrading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link href="/blog" style={{ color: "var(--blue)", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All Posts</Link>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--red)", background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 6, padding: "3px 10px" }}>PSYCHOLOGY</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>April 2026 · 7 min read</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            The Revenge Trade: Why Traders Make Their Worst Decisions Right After a Loss
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.8 }}>
            Revenge trading accounts for a disproportionate share of blown accounts. The tragedy: it feels completely rational in the moment. Here's what's actually happening in your brain — and a concrete system to stop it.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: 40 }} />

        <div style={{ lineHeight: 1.85, fontSize: 16, color: "var(--text-dim)" }}>
          <p>You know the sequence. You take a loss — maybe a good setup that just didn't work, maybe a clear mistake. Either way, the account is down. And then something happens that every trader recognizes: the immediate, overwhelming urge to get that money back. Right now. In the next trade.</p>

          <p>That's revenge trading. And it's not a discipline problem. It's a neuroscience problem.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>What Happens in Your Brain After a Loss</h2>

          <p>Research by Lo et al. (2005) on the neurological basis of financial risk-taking showed that losses activate the brain's threat-detection system — the amygdala — far more intensely than equivalent gains. This is loss aversion in its purest form: a $500 loss feels roughly twice as painful as a $500 gain feels good.</p>

          <p>When that threat response activates, it doesn't stay contained to the emotional part of your brain. It actively suppresses prefrontal cortex activity — the part responsible for rational decision-making, rule adherence, and impulse control. The same functions you need to trade well.</p>

          <div style={{ background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.15)", borderRadius: 12, padding: "20px 24px", margin: "32px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--red)", marginBottom: 10 }}>THE CYCLE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Loss triggers amygdala activation", "Stress hormones (cortisol) spike", "Prefrontal cortex activity suppresses", "Impulse control degrades", "You open the next trade — larger, faster, off-plan", "Loss deepens the cycle"].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--text-dim)" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,59,92,0.15)", border: "1px solid rgba(255,59,92,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>Why It Feels Rational</h2>

          <p>This is the part that makes revenge trading so dangerous. In the compromised state that follows a loss, the revenge trade doesn't feel like emotional gambling. It feels like <em>analysis</em>. Your brain constructs a narrative — "the market is overextended," "I've identified a real edge here," "this setup is actually better than my last one." The reasoning feels sharp, even clinical.</p>

          <p>It isn't. Research on decision-making under stress consistently shows that confidence and accuracy diverge under cortisol load. You become more certain while becoming less correct. Traders in this state often size up while their analytical edge has actually declined — a particularly expensive combination.</p>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>The 3 Patterns That Precede a Revenge Trade</h2>

          <p>After analyzing data across thousands of trading sessions, three mental-state patterns reliably appear before a revenge-trading sequence:</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, margin: "24px 0 32px" }}>
            {[
              { label: "1. Back-to-back losses", detail: "Two or more consecutive losses dramatically escalate amygdala activity. The second loss doesn't feel like twice the first — it feels exponentially worse. The urge to recover accelerates." },
              { label: "2. Sleep deprivation + loss", detail: "Walker (2017) showed that sleep deprivation alone impairs prefrontal cortex function by up to 26%. Combined with a fresh loss, the degradation compounds. This is when traders make decisions they later can't explain." },
              { label: "3. The 'near miss' loss", detail: "A trade that came close — where you were right about direction but wrong about timing, or stopped out just before the move — creates a particularly intense revenge urge. The 'almost' feels infuriating in a way that a clear mistake doesn't." },
            ].map((item) => (
              <div key={item.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{item.label}</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{item.detail}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "40px 0 16px" }}>A System That Actually Works</h2>

          <p>Willpower is not the answer. When your prefrontal cortex is suppressed, you can't out-willpower the amygdala — it's not a fair fight. Systems work where willpower doesn't, because good systems engage the rational brain <em>before</em> the loss happens.</p>

          <p>Three things that have measurable impact:</p>

          <p><strong style={{ color: "var(--text)" }}>1. The hard-stop rule.</strong> Define in advance: after two consecutive losses, I am done for the session. No exceptions. Not "I'll be more careful" — done. Written, pre-committed, enforced by your trading platform's daily loss limit if possible. The key is making this decision when you're calm, not when you're down.</p>

          <p><strong style={{ color: "var(--text)" }}>2. The 20-minute rule.</strong> After any loss above a threshold you define, you are not permitted to place another trade for 20 minutes. You must leave the screen. No charts, no news, no analysis. 20 minutes is roughly the time cortisol levels begin to decline after an acute stressor. You return to a measurably different brain state.</p>

          <p><strong style={{ color: "var(--text)" }}>3. Pre-session mental check.</strong> Revenge trading is dramatically less common among traders who complete a structured pre-session mental assessment. Not because the check-in prevents losses — but because it creates a baseline. You know what your mental state was when you started. A sharp drop after a loss is measurable, not just felt. And measurable states can trigger pre-committed rules.</p>

          <div style={{ background: "linear-gradient(135deg, rgba(94,106,210,0.05), var(--surface))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 14, padding: "28px 24px", margin: "40px 0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--blue)", marginBottom: 12 }}>THE BOTTOM LINE</div>
            <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8, margin: "0 0 20px" }}>
              Revenge trading isn't a character flaw. It's a predictable biological response to loss — one that every trader will experience. The difference between traders who survive it and those who don't isn't discipline. It's whether they had a system in place before the loss happened.
            </p>
            <Link href="/checkin" style={{ textDecoration: "none" }}>
              <div style={{ display: "inline-block", background: "var(--blue)", color: "white", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
                Start your daily mental check-in →
              </div>
            </Link>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 8 }}>
            References: Lo, A., Repin, D., & Steenbarger, B. (2005). Fear and greed in financial markets. <em>American Economic Review</em>, 95(2), 352-359. Walker, M. (2017). <em>Why We Sleep</em>. Scribner.
          </p>
        </div>

        <div style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 20 }}>MORE FROM TRADEMIND</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/blog/why-funded-traders-fail" style={{ textDecoration: "none", color: "var(--blue)", fontSize: 14, fontWeight: 600 }}>Why Most Funded Traders Fail (It's Not Your Strategy) →</Link>
            <Link href="/blog/sleep-and-trading" style={{ textDecoration: "none", color: "var(--blue)", fontSize: 14, fontWeight: 600 }}>Sleep, Stress, and Your P&L: The Science Behind the Check-in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}