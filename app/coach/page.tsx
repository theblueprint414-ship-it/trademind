"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Message = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Why do I keep losing on Mondays?",
  "Should I trade today?",
  "What's my biggest pattern holding me back?",
  "How can I improve my win rate?",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        const premium = d.plan === "premium";
        setIsPremium(premium);
        if (!premium) { setReady(true); return; }
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
                <span style={{ color: "#8B5CF6", flexShrink: 0 }}>✓</span>{f}
              </div>
            ))}
            <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>Included in Premium · $45/mo · 4-day free trial</div>
          </div>
          <Link href="/settings" style={{ display: "block" }}>
            <button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", border: "none" }}>Start Premium — 4-Day Free Trial →</button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }} className="has-bottom-nav">

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
                {m.content || (
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 1, 2].map((j) => (
                      <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Starter questions */}
        {messages.length <= 1 && ready && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10, textAlign: "center" }}>SUGGESTED QUESTIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STARTERS.map((q) => (
                <button key={q} onClick={() => send(q)}
                  style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text-dim)", fontSize: 13, cursor: "pointer", transition: "border-color 0.15s" }}>
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