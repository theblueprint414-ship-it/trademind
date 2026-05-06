"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

function renderMarkdown(text: string, showCursor = false): React.ReactNode {
  if (!text) return null;

  function inlineStyles(raw: string): React.ReactNode[] {
    const parts = raw.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} style={{ color: "var(--text)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*"))
        return <em key={i}>{p.slice(1, -1)}</em>;
      return p;
    });
  }

  const paragraphs = text.split(/\n\n+/);
  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n");
        const bulletLines = lines.filter(l => l.trim());
        const isBulletList = bulletLines.length > 0 && bulletLines.every(l => /^[-•*]\s/.test(l.trim()));
        const isLastPara = pIdx === paragraphs.length - 1;

        if (isBulletList) {
          return (
            <ul key={pIdx} style={{ margin: pIdx === 0 ? 0 : "8px 0 0", paddingLeft: 0, listStyle: "none" }}>
              {bulletLines.map((line, lIdx) => {
                const content = line.replace(/^[-•*]\s+/, "");
                const isLastItem = lIdx === bulletLines.length - 1;
                return (
                  <li key={lIdx} style={{ display: "flex", gap: 8, marginBottom: 3, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--blue)", flexShrink: 0, marginTop: 6, lineHeight: 1 }}><svg width="5" height="5" viewBox="0 0 5 5" fill="none"><circle cx="2.5" cy="2.5" r="2.5" fill="currentColor"/></svg></span>
                    <span>
                      {inlineStyles(content)}
                      {showCursor && isLastPara && isLastItem && <span className="coach-cursor" />}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} style={{ margin: pIdx === 0 ? 0 : "8px 0 0" }}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {inlineStyles(line)}
              </React.Fragment>
            ))}
            {showCursor && isLastPara && <span className="coach-cursor" />}
          </p>
        );
      })}
    </>
  );
}

type Message = { role: "user" | "assistant"; content: string };

const BASE_STARTERS = [
  "What's my biggest pattern holding me back?",
  "How can I improve my win rate?",
  "Why do I keep losing on Mondays?",
  "How do I handle drawdowns mentally?",
];

function getContextStarters(context: { score: number; verdict: string } | null): string[] {
  if (!context) return BASE_STARTERS;
  const { score, verdict } = context;
  if (verdict === "NO-TRADE") return [
    "What should I do today instead of trading?",
    "How do I reset after a low mental score day?",
    "What's my biggest pattern holding me back?",
    "How do I stop revenge trading?",
  ];
  if (verdict === "CAUTION") return [
    `My score is ${score} — what's the best way to trade CAUTION days?`,
    "How do I pick only A+ setups and ignore the rest?",
    "What position size should I use today?",
    "How do I know when to stop for the day?",
  ];
  return [
    `Score is ${score} — GO day. What should I prioritize today?`,
    "How do I execute my best trades without second-guessing?",
    "What's my biggest pattern holding me back?",
    "How do I protect a good run from overtrading?",
  ];
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [context, setContext] = useState<{ score: number; verdict: string; color: string; history: Array<{ score: number }> } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        const premium = d.plan === "pro" || d.plan === "premium";
        setIsPremium(premium);
        if (!premium) { setReady(true); return; }
        fetch("/api/checkin?date=history&limit=7")
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d.history) && d.history.length > 0) {
              const todayEntry = d.history[0] as { score: number };
              const s = todayEntry.score;
              const verdict = s >= 70 ? "GO" : s >= 45 ? "CAUTION" : "NO-TRADE";
              const color = s >= 70 ? "var(--green)" : s >= 45 ? "var(--amber)" : "var(--red)";
              setContext({ score: s, verdict, color, history: d.history.slice(0, 7) });
            }
          })
          .catch(() => {});

        return fetch("/api/ai-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "daily" }),
        }).then((r) => r.json()).then((d) => {
          setMessages([{ role: "assistant", content: d.message ?? "I'm your TradeMind coach. Ask me anything about your trading patterns, today's game plan, or what to focus on this week." }]);
        }).catch(() => {
          setMessages([{ role: "assistant", content: "I'm your TradeMind coach. Ask me anything about your trading patterns." }]);
        });
      })
      .catch(() => { setIsPremium(false); })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const updated: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    // Add empty assistant message we'll stream into
    const withPlaceholder: Message[] = [...updated, { role: "assistant", content: "" }];
    setMessages(withPlaceholder);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "chat", messages: updated, stream: true }),
      });

      if (!res.ok || !res.body) throw new Error("stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages([...updated, { role: "assistant", content: accumulated }]);
      }
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Try again." }]);
    }
    setLoading(false);
  }

  if (isPremium === false) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
        <div className="app-header">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
          </Link>
          <span className="font-bebas" style={{ fontSize: 18, color: "var(--text-muted)", letterSpacing: "0.05em" }}>AI COACH</span>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(139,92,246,0.1)", border: "1.5px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#8B5CF6" }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.8"/><path d="M5 28c0-5 4.477-9 10-9s10 4 10 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M22 8l2-2M24 12h2M22 16l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="font-bebas" style={{ fontSize: 44, lineHeight: 1, marginBottom: 12 }}>Meet Alex</div>
          <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 32 }}>
            Your personal trading psychology coach. Alex knows your check-in history, P&L, and behavioral patterns — and tells you exactly what&apos;s holding you back.
          </p>
          <div className="card" style={{ padding: 24, marginBottom: 24, border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.04)", textAlign: "left" }}>
            {["Reads your full check-in + P&L history", "Identifies the ONE pattern costing you most", "Gives you a specific, actionable focus for today", "Available 24/7 — ask anything"].map((f) => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14, color: "var(--text-dim)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#8B5CF6", flexShrink: 0 }}><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {f}
              </div>
            ))}
            <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>Included in TradeMind · $39/mo · 7-day free trial</div>
          </div>
          <Link href="/settings" style={{ display: "block" }}>
            <button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", border: "none" }}>Start Free Trial — 7 Days Free →</button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }} className="has-bottom-nav">
      <style>{`
        @keyframes coach-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .coach-cursor { display:inline-block; width:2px; height:1em; background:currentColor; margin-left:2px; vertical-align:text-bottom; animation:coach-blink 0.75s step-end infinite; border-radius:1px; }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
      `}</style>

      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
          <span className="font-bebas" style={{ fontSize: 18, color: "white", letterSpacing: "0.05em" }}>AI COACH</span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 16px", maxWidth: 680, margin: "0 auto", width: "100%" }}>

        {/* Context strip */}
        {context && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, background: "var(--surface2)", border: "1px solid var(--border)", marginBottom: 20 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div className="font-bebas" style={{ fontSize: 30, color: context.color, lineHeight: 1 }}>{context.score}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em" }}>TODAY</div>
            </div>
            <div style={{ width: 1, height: 32, background: "var(--border)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: context.color, letterSpacing: "0.1em", marginBottom: 6 }}>{context.verdict}</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {context.history.map((h, i) => {
                  const c = h.score >= 70 ? "var(--green)" : h.score >= 45 ? "var(--amber)" : "var(--red)";
                  return <div key={i} title={`${h.score}`} style={{ width: i === 0 ? 8 : 6, height: i === 0 ? 8 : 6, borderRadius: "50%", background: c, opacity: i === 0 ? 1 : 0.55, boxShadow: i === 0 ? `0 0 6px ${c}` : "none", flexShrink: 0 }} />;
                })}
                <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 2 }}>last {context.history.length} check-ins</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right", flexShrink: 0 }}>
              Alex has<br />your data
            </div>
          </div>
        )}

        {/* Intro */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(139,92,246,0.12)", border: "1.5px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#8B5CF6" }}><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="10" r="5" stroke="currentColor" strokeWidth="1.6"/><path d="M4 24c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M19 7l2-2M21 10.5h2M19 14l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Your coach knows your check-in history, P&L, and behavioral patterns.<br />Ask anything about your trading psychology.
          </p>
        </div>

        {/* Message list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!ready && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 15c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 4.5l1.2-1.2M13.5 6.5h1M12 8.5l1.2 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg></div>
              <div style={{ padding: "12px 16px", borderRadius: "0 14px 14px 14px", background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                  <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              {m.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2 15c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 4.5l1.2-1.2M13.5 6.5h1M12 8.5l1.2 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg></div>
              )}
              <div style={{
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "14px 0 14px 14px" : "0 14px 14px 14px",
                background: m.role === "user" ? "rgba(94,106,210,0.12)" : "var(--surface2)",
                border: m.role === "user" ? "1px solid rgba(94,106,210,0.25)" : "1px solid var(--border)",
                fontSize: 14,
                color: "var(--text-dim)",
                lineHeight: 1.7,
              }}>
                {m.content
                  ? renderMarkdown(m.content, loading && m.role === "assistant" && i === messages.length - 1)
                  : (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map((j) => (
                        <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          ))}
        </div>

        {/* Starter questions */}
        {messages.length <= 1 && ready && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10, textAlign: "center" }}>
              {context ? `SUGGESTED FOR ${context.verdict} DAY` : "SUGGESTED QUESTIONS"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {getContextStarters(context).map((q) => (
                <button key={q} onClick={() => send(q)}
                  style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text-dim)", fontSize: 13, cursor: "pointer", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-dim)"; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px 16px", background: "var(--surface)", maxWidth: 680, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask your coach..."
            style={{ flex: 1, padding: "12px 16px", borderRadius: 12, fontSize: 14, background: "var(--surface2)", border: "1px solid var(--border)" }}
            disabled={loading || !ready}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading || !ready}
            className="btn-primary"
            style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, flexShrink: 0 }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Cross-link to journal */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px", background: "var(--surface)", maxWidth: 680, margin: "0 auto", width: "100%" }}>
        <Link href="/journal" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-muted)" }}><rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Log today&apos;s trades in your Journal</span>
          <span style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700 }}>→</span>
        </Link>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "8px 16px 16px" }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7, textAlign: "center" }}>
          Alex is an AI assistant, not a licensed financial advisor, therapist, or investment professional. Nothing Alex says constitutes financial advice. All trading decisions are solely your responsibility.{" "}
          <a href="/terms" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Terms</a>
        </p>
      </div>

      <BottomNav />
    </div>
  );
}