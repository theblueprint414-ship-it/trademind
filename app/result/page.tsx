"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";

const VerdictIcon = ({ type, color }: { type: "go" | "caution" | "no-trade"; color: string }) => {
  if (type === "go") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M9 14l3.5 3.5 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (type === "caution") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4L25 23H3L14 4z" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" strokeLinejoin="round" />
      <path d="M14 11v5M14 19.5v1" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M9 9l10 10M19 9L9 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const TipIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    plan: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    break: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M9 6v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    journal: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="4" y="2" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7 6h4M7 9h4M7 12h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    size: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 13l4-5 3 3 4-7 3 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    confirm: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    limit: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v7M9 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3"/></svg>,
    stop: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    write: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 3l4 4-8 8H3v-4l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    rest: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 10a5 5 0 009.9-1H6z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M3 7l2-2 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return icons[type] ?? icons.plan;
};

function getVerdict(score: number) {
  if (score >= 70) return {
    label: "GO",
    color: "var(--green)",
    glow: "rgba(0,232,122,0.25)",
    glowHex: "#00E87A",
    bg: "rgba(0,232,122,0.06)",
    border: "rgba(0,232,122,0.25)",
    desc: "Your mind is ready to trade. Stick to your plan and your trade limit.",
    iconType: "go" as const,
    message: "You're in peak state. Execute with precision.",
  };
  if (score >= 45) return {
    label: "CAUTION",
    color: "var(--amber)",
    glow: "rgba(255,176,32,0.25)",
    glowHex: "#FFB020",
    bg: "rgba(255,176,32,0.06)",
    border: "rgba(255,176,32,0.25)",
    desc: "You can trade — A+ setups only. Consider cutting position size in half.",
    iconType: "caution" as const,
    message: "Reduced size. High conviction only.",
  };
  return {
    label: "NO-TRADE",
    color: "var(--red)",
    glow: "rgba(255,59,92,0.25)",
    glowHex: "#FF3B5C",
    bg: "rgba(255,59,92,0.06)",
    border: "rgba(255,59,92,0.25)",
    desc: "Your edge is too low today. Sit out and come back sharper tomorrow.",
    iconType: "no-trade" as const,
    message: "Protecting capital is a win today.",
  };
}

function getTips(score: number): { iconType: string; text: string }[] {
  if (score >= 70) return [
    { iconType: "plan", text: "Stick to your trade plan — no impulsive entries" },
    { iconType: "break", text: "Take a 5-minute break every 90 minutes of screen time" },
    { iconType: "journal", text: "Journal every trade: entry reason, exit reason, emotion" },
  ];
  if (score >= 45) return [
    { iconType: "size", text: "Reduce position size by at least 50%" },
    { iconType: "confirm", text: "Only take setups with 3+ confirmations" },
    { iconType: "limit", text: "Set a tighter daily loss limit — stop early if you hit it" },
  ];
  return [
    { iconType: "stop", text: "Do not open any trades today" },
    { iconType: "write", text: "Write down what caused your low score" },
    { iconType: "rest", text: "Rest, reset, and return stronger tomorrow" },
  ];
}

const MILESTONE_MESSAGES: Record<number, { title: string; sub: string }> = {
  7: { title: "7-Day Streak 🔥", sub: "One week of mental discipline. Most traders never make it this far." },
  14: { title: "14 Days Straight 🔥🔥", sub: "Two weeks. You're building something real. Your data is getting sharper every day." },
  30: { title: "30-Day Streak 🏆", sub: "One month of showing up. This consistency is rare — and it shows in your patterns." },
  60: { title: "60 Days 🏆🏆", sub: "Two months of daily mental discipline. This is elite-level commitment." },
  100: { title: "100-Day Legend 👑", sub: "100 consecutive check-ins. You are what consistency looks like." },
};

function AnimatedScoreRing({ score, color, glowHex }: { score: number; color: string; glowHex: string }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (displayed / 100) * circumference;

  useEffect(() => {
    const start = Date.now();
    const duration = 1400;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const frame = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      setDisplayed(Math.round(easeOut(t) * score));
      if (t < 1) requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      <circle cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ filter: `drop-shadow(0 0 10px ${glowHex}) drop-shadow(0 0 20px ${glowHex}80)`, transition: "none" }}
      />
      <text x="64" y="60" textAnchor="middle" fill="white" fontSize="26" fontWeight="800">{displayed}</text>
      <text x="64" y="78" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11">/100</text>
    </svg>
  );
}

function ShareCardModal({ score, verdict, onClose }: { score: number; verdict: ReturnType<typeof getVerdict>; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function copyText() {
    const text = `My TradeMind score today: ${score}/100 — ${verdict.label}\n\nKnow your mental edge before you trade → trademindedge.com`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function nativeShare() {
    const text = `My TradeMind score today: ${score}/100 — ${verdict.label}\nKnow your mental edge before you trade → trademindedge.com`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else copyText();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* The shareable card */}
        <div ref={cardRef} style={{
          background: "linear-gradient(135deg, #070B14 0%, #0D1526 50%, #070B14 100%)",
          border: `1px solid ${verdict.border}`,
          borderRadius: 20,
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: `0 0 60px ${verdict.glow}, 0 40px 80px rgba(0,0,0,0.6)`,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Background glow */}
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 280, height: 280, borderRadius: "50%", background: verdict.glow, filter: "blur(80px)", pointerEvents: "none", opacity: 0.35 }} />
          {/* Dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 20, fontWeight: 700 }}>TRADEMIND · MENTAL SCORE</div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <AnimatedScoreRing score={score} color={verdict.color} glowHex={verdict.glowHex} />
            </div>

            <div className="font-bebas" style={{
              fontSize: 64,
              color: verdict.color,
              lineHeight: 1,
              letterSpacing: "0.05em",
              textShadow: `0 0 40px ${verdict.color}, 0 0 80px ${verdict.glow}`,
              marginBottom: 8,
            }}>
              {verdict.label}
            </div>

            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>{verdict.message}</p>

            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${verdict.border}, transparent)`, marginBottom: 20 }} />

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>trademindedge.com</p>
          </div>
        </div>

        {/* Share actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={nativeShare}
            style={{ padding: "14px", background: verdict.color, border: "none", borderRadius: 12, color: "#070B14", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Share →
          </button>
          <button
            onClick={copyText}
            style={{ padding: "14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            {copied ? "✓ Copied!" : "Copy text"}
          </button>
        </div>

        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: 8 }}>
          Close
        </button>
      </div>
    </div>
  );
}

function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ["#FFB020", "#00E87A", "#5e6ad2", "#FF3B5C", "#8B5CF6", "#ffffff"];
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 40,
    vx: (Math.random() - 0.5) * 5,
    vy: 2 + Math.random() * 4,
    size: 5 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.2,
    shape: Math.random() > 0.5 ? "rect" : "circle" as "rect" | "circle",
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += 0.08;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / 120);
      if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    frame++;
    if (frame < 140) requestAnimationFrame(draw);
    else canvas.remove();
  }
  requestAnimationFrame(draw);
}

const SCAN_LABELS = ["Sleep Quality", "Emotional State", "Focus Level", "Financial Stress", "Recent Performance"];
const SCAN_TOTAL_MS = SCAN_LABELS.length * 240 + 500; // ~1700ms

function ResultContent() {
  const params = useSearchParams();
  const score = Number(params.get("score") ?? 0);
  const verdict = getVerdict(score);
  const tips = getTips(score);
  const [tradesLeft, setTradesLeft] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showStreakShare, setShowStreakShare] = useState(false);
  const [coaching, setCoaching] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [milestone, setMilestone] = useState<{ title: string; sub: string } | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [revealPhase, setRevealPhase] = useState(0); // 0=hidden, 1=ring, 2=verdict, 3=rest
  const [typedCoach, setTypedCoach] = useState("");
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [scanDone, setScanDone] = useState(false);

  // Lifestyle quick-add
  const [lifestyleSubmitted, setLifestyleSubmitted] = useState(false);
  const [lifestyleExercise, setLifestyleExercise] = useState<boolean | null>(null);
  const [lifestyleStress, setLifestyleStress] = useState<number | null>(null);
  const [lifestyleSaving, setLifestyleSaving] = useState(false);

  async function submitLifestyle() {
    if (lifestyleExercise === null || lifestyleStress === null) return;
    setLifestyleSaving(true);
    try {
      await fetch("/api/lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise: lifestyleExercise, stress: lifestyleStress }),
      });
      setLifestyleSubmitted(true);
    } catch {}
    setLifestyleSaving(false);
  }

  // Inline trade logging
  const [showLogForm, setShowLogForm] = useState(false);
  const [qlSymbol, setQlSymbol] = useState("");
  const [qlSide, setQlSide] = useState<"long" | "short">("long");
  const [qlPnl, setQlPnl] = useState("");
  const [qlSaving, setQlSaving] = useState(false);
  const [qlSaved, setQlSaved] = useState(false);
  const [qlError, setQlError] = useState<string | null>(null);
  const [satOut, setSatOut] = useState(false);
  const [satOutSaving, setSatOutSaving] = useState(false);

  useEffect(() => {
    // Pre-flight scan: check each dimension then reveal result
    SCAN_LABELS.forEach((_, i) => {
      setTimeout(() => setScanStep(i + 1), (i + 1) * 240);
    });
    setTimeout(() => setScanDone(true), SCAN_TOTAL_MS);

    // Staggered reveal — offset by scan duration
    setTimeout(() => { setVisible(true); setRevealPhase(1); }, SCAN_TOTAL_MS + 80);
    setTimeout(() => setRevealPhase(2), SCAN_TOTAL_MS + 600);
    setTimeout(() => setRevealPhase(3), SCAN_TOTAL_MS + 1000);

    try {
      const limit = Number(localStorage.getItem("trademind_trade_limit") || 5);
      const today = new Date().toISOString().split("T")[0];
      const trades = JSON.parse(localStorage.getItem(`trademind_trades_${today}`) || "[]");
      setTradesLeft(limit - trades.length);

      const hist: { date: string; score: number }[] = JSON.parse(localStorage.getItem("trademind_history") || "[]");
      let s = 0;
      const now = new Date();
      for (let i = 0; i < hist.length; i++) {
        const diff = Math.round((now.getTime() - new Date(hist[i].date).getTime()) / 86400000);
        if (diff === i) s++; else break;
      }
      setStreak(s);

      // Haptic feedback on verdict reveal
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        const pattern = score >= 70 ? [10, 50, 10] : score >= 45 ? [20] : [30, 20, 30];
        setTimeout(() => navigator.vibrate(pattern), 700);
      }

      // Check for milestone
      const milestoneKey = Object.keys(MILESTONE_MESSAGES).map(Number).find((k) => s === k);
      if (milestoneKey) {
        setMilestone(MILESTONE_MESSAGES[milestoneKey]);
        setTimeout(() => {
          setShowMilestone(true);
          // Pure-JS canvas confetti burst
          if (typeof window !== "undefined") launchConfetti();
        }, 2000);
      }
    } catch {}

    const today = new Date().toISOString().split("T")[0];
    const cached = localStorage.getItem(`trademind_coach_${today}`);
    if (cached) {
      setCoachLoading(false);
      startTyping(cached);
      return;
    }

    fetch("/api/ai-coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "daily" }) })
      .then((r) => r.json())
      .then((d) => {
        if (d.message) {
          localStorage.setItem(`trademind_coach_${today}`, d.message);
          startTyping(d.message);
        }
      })
      .catch(() => {})
      .finally(() => setCoachLoading(false));
  }, []);

  function startTyping(text: string) {
    setCoaching(text);
    setTypedCoach("");
    let i = 0;
    const speed = 18;
    const type = () => {
      if (i < text.length) {
        setTypedCoach(text.slice(0, i + 1));
        i++;
        typingRef.current = setTimeout(type, speed);
      }
    };
    setTimeout(type, 1200);
  }

  useEffect(() => () => { if (typingRef.current) clearTimeout(typingRef.current); }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes milestone-in { 0%{opacity:0;transform:scale(0.85) translateY(20px)} 60%{transform:scale(1.03) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes card-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card-stagger-1 { animation: card-in 0.5s ease 0.3s both; }
        .card-stagger-2 { animation: card-in 0.5s ease 0.5s both; }
        .card-stagger-3 { animation: card-in 0.5s ease 0.7s both; }
        .card-stagger-4 { animation: card-in 0.5s ease 0.9s both; }
        .tip-row { transition: background 0.15s ease, padding-left 0.15s ease; border-radius: 8px; }
        .tip-row:hover { background: var(--surface2); padding-left: 8px; }
        @keyframes scan-line { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes scan-fade-out { 0%{opacity:1} 100%{opacity:0;pointer-events:none} }
      `}</style>

      {/* Pre-flight scan overlay */}
      {!scanDone && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000, background: "var(--bg)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 40,
        }}>
          <div style={{ width: "100%", maxWidth: 340 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: verdict.color, marginBottom: 28, textAlign: "center" }}>
              PRE-FLIGHT ANALYSIS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {SCAN_LABELS.map((label, i) => {
                const done = scanStep > i;
                const active = scanStep === i;
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, opacity: done || active ? 1 : 0.25, transition: "opacity 0.2s ease" }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      border: `1.5px solid ${done ? verdict.color : "var(--border)"}`,
                      background: done ? `${verdict.color}20` : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}>
                      {done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5 4-4" stroke={verdict.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {active && (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: verdict.color, animation: "glow-pulse 0.8s ease-in-out infinite" }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: done ? "var(--text)" : "var(--text-muted)", fontWeight: done ? 600 : 400, transition: "color 0.2s" }}>
                        {label}
                      </div>
                      {/* Scan bar for active item */}
                      {active && (
                        <div style={{ marginTop: 4, height: 2, background: "var(--surface3)", borderRadius: 1, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: verdict.color, width: "100%", transformOrigin: "left", animation: "scan-line 0.22s linear forwards" }} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: done ? verdict.color : "transparent", fontWeight: 700, transition: "color 0.2s", letterSpacing: "0.06em" }}>
                      {done ? "OK" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
            {scanStep >= SCAN_LABELS.length && (
              <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: verdict.color, animation: "card-in 0.3s ease both" }}>
                ANALYSIS COMPLETE — GENERATING VERDICT
              </div>
            )}
          </div>
        </div>
      )}


      {/* Milestone overlay */}
      {showMilestone && milestone && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowMilestone(false)}>
          <div style={{ maxWidth: 380, width: "100%", background: "var(--surface)", border: "1px solid rgba(255,176,32,0.4)", borderRadius: 20, padding: "48px 32px", textAlign: "center", boxShadow: "0 0 80px rgba(255,176,32,0.2)", animation: "milestone-in 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔥</div>
            <div className="font-bebas" style={{ fontSize: 40, color: "var(--amber)", marginBottom: 12, lineHeight: 1, textShadow: "0 0 30px rgba(255,176,32,0.6)" }}>{milestone.title}</div>
            <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28 }}>{milestone.sub}</p>
            <button onClick={() => setShowMilestone(false)} style={{ background: "linear-gradient(135deg, var(--amber), #FF8C00)", border: "none", borderRadius: 12, padding: "14px 32px", color: "#070B14", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Keep the streak →
            </button>
          </div>
        </div>
      )}

      {showShareCard && <ShareCardModal score={score} verdict={verdict} onClose={() => setShowShareCard(false)} />}

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 24px", background: "rgba(7,11,20,0.9)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
        </span>
      </div>

      <div style={{
        flex: 1,
        maxWidth: 580,
        margin: "0 auto",
        width: "100%",
        padding: "32px 20px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Main verdict card */}
        <div style={{
          padding: "44px 32px",
          textAlign: "center",
          border: `1px solid ${verdict.border}`,
          background: verdict.bg,
          borderRadius: 20,
          boxShadow: `0 0 60px ${verdict.glow}, 0 0 120px ${verdict.glow}40`,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, height: 320, borderRadius: "50%", background: verdict.glow, filter: "blur(80px)", pointerEvents: "none", opacity: 0.4, animation: "glow-pulse 3s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "20px 20px", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            {/* Animated ring */}
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center", opacity: revealPhase >= 1 ? 1 : 0, transform: revealPhase >= 1 ? "scale(1)" : "scale(0.7)", transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
              {revealPhase >= 1 && <AnimatedScoreRing score={score} color={verdict.color} glowHex={verdict.glowHex} />}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, opacity: revealPhase >= 2 ? 1 : 0, transition: "opacity 0.4s ease 0.2s" }}>
              <VerdictIcon type={verdict.iconType} color={verdict.color} />
            </div>

            <div className="font-bebas" style={{
              fontSize: "clamp(56px, 14vw, 88px)",
              color: verdict.color,
              lineHeight: 1,
              marginBottom: 12,
              textShadow: `0 0 40px ${verdict.color}, 0 0 80px ${verdict.glow}`,
              letterSpacing: "0.04em",
              opacity: revealPhase >= 2 ? 1 : 0,
              transform: revealPhase >= 2 ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
            }}>
              {verdict.label}
            </div>

            <p style={{ color: "var(--text-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 340, margin: "0 auto", opacity: revealPhase >= 2 ? 1 : 0, transition: "opacity 0.5s ease 0.5s" }}>
              {verdict.desc}
            </p>
          </div>
        </div>

        {/* Trade limit + score */}
        {tradesLeft !== null && (
          <div className="card-stagger-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="card" style={{ padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 6 }}>TRADES LEFT TODAY</div>
              <div className="font-bebas" style={{ fontSize: 36, color: tradesLeft > 0 ? "var(--green)" : "var(--red)", lineHeight: 1 }}>
                {tradesLeft > 0 ? tradesLeft : "LOCKED"}
              </div>
            </div>
            <div className="card" style={{ padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 6 }}>MENTAL SCORE</div>
              <div className="font-bebas" style={{ fontSize: 36, color: verdict.color, lineHeight: 1 }}>{score}<span style={{ fontSize: 18, color: "var(--text-muted)" }}>/100</span></div>
            </div>
          </div>
        )}

        {/* AI Coach with typing effect */}
        {(coachLoading || coaching) && (
          <div className="card card-stagger-2" style={{ padding: "22px 24px", border: `1px solid ${verdict.border}`, background: verdict.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${verdict.color}20`, border: `1px solid ${verdict.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke={verdict.color} strokeWidth="1.3"/><path d="M1.5 12.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke={verdict.color} strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: verdict.color }}>ALEX · YOUR COACH</span>
              {coachLoading && (
                <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: verdict.color, opacity: 0.6, animation: `spin 1s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
            </div>
            {coachLoading ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>Analyzing your patterns...</div>
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>
                {typedCoach}
                {typedCoach.length < (coaching?.length ?? 0) && (
                  <span style={{ display: "inline-block", width: 2, height: 14, background: verdict.color, marginLeft: 2, animation: "spin 0.8s linear infinite", borderRadius: 1 }} />
                )}
              </p>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="card card-stagger-2" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>TODAY&apos;S PROTOCOL</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {tips.map((tip, i) => (
              <div key={i} className="tip-row" style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 4px", borderBottom: i < tips.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ color: verdict.color, flexShrink: 0 }}><TipIcon type={tip.iconType} /></span>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5, margin: 0 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Trade Log */}
        <div className="card-stagger-3">
          {score < 45 ? (
            /* NO-TRADE: one-tap "sat out" */
            satOut ? (
              <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>Discipline logged</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>You honored your NO-TRADE day</div>
                </div>
                <Link href="/journal" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 700 }}>View →</Link>
              </div>
            ) : (
              <div style={{ padding: "16px 20px", borderRadius: 14, background: verdict.bg, border: `1px solid ${verdict.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: verdict.color, letterSpacing: "0.08em", marginBottom: 8 }}>TRACK YOUR DISCIPLINE</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 14px", lineHeight: 1.6 }}>Sitting out on a NO-TRADE day is a win. Record it.</p>
                <button
                  onClick={async () => {
                    setSatOutSaving(true);
                    try {
                      await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: new Date().toISOString().split("T")[0], checkinScore: score, notes: "Honored NO-TRADE day — sat out." }) });
                      setSatOut(true);
                      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
                    } catch {}
                    setSatOutSaving(false);
                  }}
                  disabled={satOutSaving}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, background: "transparent", border: `1.5px solid ${verdict.color}`, color: verdict.color, fontSize: 14, fontWeight: 700, cursor: satOutSaving ? "not-allowed" : "pointer", opacity: satOutSaving ? 0.6 : 1 }}
                >
                  {satOutSaving ? "Saving..." : "I sat out today ✓"}
                </button>
              </div>
            )
          ) : (
            /* GO / CAUTION: expandable inline trade form */
            qlSaved ? (
              <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>Trade logged</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>Mental score attached automatically</div>
                </div>
                <Link href="/journal" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 700 }}>View →</Link>
              </div>
            ) : !showLogForm ? (
              <button
                onClick={() => setShowLogForm(true)}
                className="card"
                style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: `1px solid ${verdict.border}`, background: verdict.bg, textAlign: "left" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: verdict.color, flexShrink: 0 }}><rect x="4" y="2" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: verdict.color }}>Log a trade</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Your mental score ({score}) will be attached</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)" }}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ) : (
              <div className="card" style={{ padding: "18px 20px", border: `1px solid ${verdict.border}`, background: verdict.bg }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: verdict.color, letterSpacing: "0.08em", marginBottom: 14 }}>LOG A TRADE</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 5 }}>SYMBOL</label>
                    <input type="text" value={qlSymbol} onChange={(e) => setQlSymbol(e.target.value.toUpperCase())} placeholder="NQ, AAPL..." style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", width: "100%", color: "var(--text)", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 5 }}>P&L</label>
                    <input type="number" value={qlPnl} onChange={(e) => setQlPnl(e.target.value)} placeholder="+250" style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", width: "100%", color: "var(--text)", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {(["long", "short"] as const).map((s) => (
                    <button key={s} onClick={() => setQlSide(s)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1.5px solid ${qlSide === s ? (s === "long" ? "var(--green)" : "var(--red)") : "var(--border)"}`, background: qlSide === s ? (s === "long" ? "rgba(0,232,122,0.08)" : "rgba(255,59,92,0.08)") : "var(--surface2)", color: qlSide === s ? (s === "long" ? "var(--green)" : "var(--red)") : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.15s" }}>
                      {s === "long" ? "↑ Long" : "↓ Short"}
                    </button>
                  ))}
                </div>
                {qlError && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 10 }}>{qlError}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowLogForm(false)} style={{ padding: "12px 16px", borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                  <button
                    onClick={async () => {
                      setQlSaving(true);
                      setQlError(null);
                      try {
                        const res = await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: new Date().toISOString().split("T")[0], symbol: qlSymbol.trim() || undefined, side: qlSide, pnl: qlPnl ? parseFloat(qlPnl) : undefined, checkinScore: score }) });
                        const d = await res.json();
                        if (res.ok) { setQlSaved(true); if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10); }
                        else setQlError(d.error ?? "Failed to save");
                      } catch { setQlError("Network error"); }
                      setQlSaving(false);
                    }}
                    disabled={qlSaving}
                    style={{ flex: 1, padding: "12px", borderRadius: 8, background: verdict.color, border: "none", color: "#070B14", fontSize: 14, fontWeight: 700, cursor: qlSaving ? "not-allowed" : "pointer", opacity: qlSaving ? 0.7 : 1 }}
                  >
                    {qlSaving ? "Saving..." : "Log Trade →"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Lifestyle quick-add */}
        <div className="card-stagger-3">
          {lifestyleSubmitted ? (
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l4 4 8-8" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>Lifestyle logged — improves your pattern analysis</span>
            </div>
          ) : (
            <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 12 }}>LIFESTYLE TRACKER · 20 SECONDS</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Did you exercise today?</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[{ label: "Yes", val: true }, { label: "No", val: false }].map(({ label, val }) => (
                      <button key={label} onClick={() => setLifestyleExercise(val)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${lifestyleExercise === val ? "var(--blue)" : "var(--border)"}`, background: lifestyleExercise === val ? "rgba(94,106,210,0.1)" : "var(--surface2)", color: lifestyleExercise === val ? "var(--blue)" : "var(--text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>External stress level?</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setLifestyleStress(n)} style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: `1.5px solid ${lifestyleStress === n ? (n <= 2 ? "var(--green)" : n <= 3 ? "var(--amber)" : "var(--red)") : "var(--border)"}`, background: lifestyleStress === n ? (n <= 2 ? "rgba(0,232,122,0.1)" : n <= 3 ? "rgba(255,176,32,0.1)" : "rgba(255,59,92,0.1)") : "var(--surface2)", color: lifestyleStress === n ? (n <= 2 ? "var(--green)" : n <= 3 ? "var(--amber)" : "var(--red)") : "var(--text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={submitLifestyle}
                disabled={lifestyleSaving || lifestyleExercise === null || lifestyleStress === null}
                style={{ width: "100%", padding: "10px", borderRadius: 8, background: lifestyleExercise !== null && lifestyleStress !== null ? "var(--blue)" : "var(--surface2)", border: "none", color: lifestyleExercise !== null && lifestyleStress !== null ? "#fff" : "var(--text-muted)", fontSize: 13, fontWeight: 700, cursor: lifestyleExercise !== null && lifestyleStress !== null ? "pointer" : "not-allowed", opacity: lifestyleSaving ? 0.7 : 1, transition: "all 0.2s" }}
              >
                {lifestyleSaving ? "Saving..." : "Add to my patterns →"}
              </button>
            </div>
          )}
        </div>

        {/* Secondary links */}
        <div className="card-stagger-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Link href="/coach" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ color: "#8B5CF6", flexShrink: 0 }}><circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 16c0-2.761 2.91-5 6.5-5s6.5 2.239 6.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M13 4.5l1.2-1.2M14.5 6.5h1.2M13 8.5l1.2 1.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Ask coach</span>
            </div>
          </Link>
          <Link href="/journal" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(94,106,210,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ color: "var(--blue)", flexShrink: 0 }}><rect x="4" y="2" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7 6h4M7 9h4M7 12h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Full journal</span>
            </div>
          </Link>
        </div>

        {/* EOD Recap CTA */}
        <div className="card-stagger-3" style={{ marginTop: 4 }}>
          <Link href="/recap" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "border-color 0.15s", background: "rgba(0,232,122,0.03)", borderColor: "rgba(0,232,122,0.12)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,232,122,0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,232,122,0.12)")}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "var(--green)", flexShrink: 0 }}><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M9 5v4l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>End-of-day session recap</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>P&L · Playbook compliance · One lesson</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)", marginLeft: "auto" }}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="card-stagger-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Link href="/dashboard" style={{ display: "block" }}>
            <button className="btn-primary" style={{ width: "100%", padding: "14px" }}>Go to Dashboard</button>
          </Link>
          <button
            className="btn-ghost"
            style={{ width: "100%", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={() => setShowShareCard(true)}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="12" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="2.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 7.5l6.5-4M10.5 11.5L4 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Share Score
          </button>
        </div>

        {/* Streak card */}
        {streak > 0 ? (
          <div
            style={{ padding: "20px", borderRadius: 14, background: streak >= 30 ? "rgba(139,92,246,0.06)" : streak >= 14 ? "rgba(94,106,210,0.05)" : streak >= 7 ? "rgba(255,176,32,0.06)" : "rgba(255,176,32,0.04)", border: `1px solid ${streak >= 30 ? "rgba(139,92,246,0.3)" : streak >= 14 ? "rgba(94,106,210,0.25)" : streak >= 7 ? "rgba(255,176,32,0.3)" : "rgba(255,176,32,0.15)"}`, cursor: "pointer", transition: "border-color 0.15s" }}
            onClick={() => setShowStreakShare(true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: streak >= 30 ? "rgba(139,92,246,0.15)" : streak >= 7 ? "rgba(255,176,32,0.15)" : "rgba(255,176,32,0.1)", border: `1px solid ${streak >= 30 ? "rgba(139,92,246,0.3)" : "rgba(255,176,32,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 26 }}>{streak >= 30 ? "🏆" : streak >= 14 ? "⚡" : streak >= 7 ? "🔥" : "🔥"}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span className="font-bebas" style={{ fontSize: 28, color: streak >= 30 ? "#8B5CF6" : "var(--amber)", lineHeight: 1 }}>{streak}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>DAY STREAK</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  {streak >= 30 ? "30 days of mental clarity. You're in elite territory." : streak >= 14 ? "Two weeks of discipline. Top 5% for consistency." : streak >= 7 ? "One week down. The habit is forming." : "Keep it going — patterns reveal themselves over time."}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        ) : (
          <div style={{ padding: "18px 20px", borderRadius: 14, background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>📅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>Come back tomorrow</div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>Consecutive check-ins reveal patterns that single days can&apos;t show.</p>
            </div>
          </div>
        )}

        {/* Streak share modal */}
        {showStreakShare && streak > 0 && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setShowStreakShare(false)}>
            <div style={{ background: "var(--surface)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 340, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }} onClick={(e) => e.stopPropagation()}>
              {/* Streak card preview */}
              <div style={{ borderRadius: 16, padding: "28px 24px", background: streak >= 30 ? "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.1))" : streak >= 14 ? "linear-gradient(135deg,rgba(94,106,210,0.15),rgba(99,102,241,0.08))" : "linear-gradient(135deg,rgba(255,176,32,0.12),rgba(255,59,92,0.06))", border: `1px solid ${streak >= 30 ? "rgba(139,92,246,0.35)" : streak >= 14 ? "rgba(94,106,210,0.3)" : "rgba(255,176,32,0.3)"}`, textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 8 }}>{streak >= 30 ? "🏆" : streak >= 14 ? "⚡" : "🔥"}</div>
                <div className="font-bebas" style={{ fontSize: 72, lineHeight: 1, color: streak >= 30 ? "#8B5CF6" : streak >= 14 ? "#5e6ad2" : "var(--amber)", textShadow: `0 0 30px ${streak >= 30 ? "rgba(139,92,246,0.5)" : streak >= 14 ? "rgba(94,106,210,0.5)" : "rgba(255,176,32,0.5)"}` }}>{streak}</div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", color: "var(--text)", marginBottom: 8 }}>DAY STREAK</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {streak >= 30 ? "30 days of mental discipline." : streak >= 14 ? "Two weeks of trading with clarity." : streak >= 7 ? "One week — the habit is real." : `${streak} days building the edge.`}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, opacity: 0.6 }}>trademindedge.com</div>
              </div>

              {/* Share buttons */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${streak >= 30 ? "🏆" : streak >= 14 ? "⚡" : "🔥"} ${streak}-day mental check-in streak on TradeMind. Know your state before you trade.\n\ntrademindedge.com`)}`}
                target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", padding: "13px", borderRadius: 10, background: "#000", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M15 1L9.5 7.5 15.5 15H12L8.5 10.5 4.5 15H2L7.5 8.5 1.5 1H5L8 5 11.5 1H15Z" fill="white"/></svg>
                  Share on X
                </button>
              </a>
              <button
                onClick={() => {
                  const text = `${streak >= 30 ? "🏆" : streak >= 14 ? "⚡" : "🔥"} ${streak}-day streak on TradeMind — knowing your mental state before you trade changes everything. trademindedge.com`;
                  if (navigator.share) navigator.share({ title: "TradeMind Streak", text });
                  else { navigator.clipboard.writeText(text); }
                }}
                style={{ width: "100%", padding: "13px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Share / Copy
              </button>
              <button onClick={() => setShowStreakShare(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: 4 }}>
                Close
              </button>
            </div>
          </div>
        )}

        <Link href="/checkin" style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
          Re-do check-in
        </Link>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}