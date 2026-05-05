"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const QUESTION_ICONS: Record<string, React.ReactNode> = {
  sleep: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14 10a6 6 0 01-8-8 7 7 0 108 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  emotion: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 10.5s.8 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="11.5" cy="7.5" r="1" fill="currentColor"/></svg>,
  focus: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.4"/><circle cx="9" cy="9" r="1" fill="currentColor"/></svg>,
  financial_stress: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9 5.5v1M9 11.5v1M6.5 8a1.5 1.5 0 001.5 1.5h2A1.5 1.5 0 0111.5 11a1.5 1.5 0 01-1.5 1.5H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  recent_performance: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2.5 13l3.5-4.5 3 3 4-6 2.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 15.5h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

type PlaybookRule = { id: string; text: string; category: string; enabled: boolean };

const CATEGORY_COLOR: Record<string, string> = {
  Entry: "var(--green)", Exit: "var(--red)", Risk: "var(--amber)", Mindset: "var(--blue)",
};

const QUESTIONS = [
  { id: "sleep", category: "Sleep", icon: "🌙", question: "How many hours did you sleep last night?", type: "scale", options: [{ label: "Less than 5h", value: 0 }, { label: "5–6h", value: 40 }, { label: "6–7h", value: 65 }, { label: "7–8h", value: 85 }, { label: "8h+", value: 100 }], weight: 0.25 },
  { id: "emotion", category: "Emotional State", icon: "🧠", question: "How would you describe your emotional state right now?", type: "scale", options: [{ label: "Anxious / fearful", value: 0 }, { label: "Stressed", value: 25 }, { label: "Neutral", value: 75 }, { label: "Focused", value: 90 }, { label: "In the zone", value: 100 }], weight: 0.3 },
  { id: "focus", category: "Focus", icon: "🎯", question: "How focused are you right now?", type: "slider", min: 0, max: 100, defaultVal: 50, weight: 0.2 },
  { id: "financial_stress", category: "Financial Stress", icon: "💰", question: "Is there any external financial pressure affecting you today?", type: "scale", options: [{ label: "Yes, severe", value: 0 }, { label: "Yes, somewhat", value: 40 }, { label: "Not really", value: 70 }, { label: "None at all", value: 100 }], weight: 0.15 },
  { id: "recent_performance", category: "Recent Performance", icon: "📊", question: "How were your results over the last 3 days?", type: "scale", options: [{ label: "Big losses", value: 0 }, { label: "Small losses", value: 35 }, { label: "Break even ±", value: 65 }, { label: "Small gains", value: 85 }, { label: "Strong gains", value: 100 }], weight: 0.1 },
];

type Answers = Record<string, number>;

export default function CheckinPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [sliderVal, setSliderVal] = useState(50);
  const [slideState, setSlideState] = useState<"idle" | "out-left" | "in-right">("idle");
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [playbookRules, setPlaybookRules] = useState<PlaybookRule[]>([]);
  const [playbookChecked, setPlaybookChecked] = useState(false);
  const [customQ, setCustomQ] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const sliderDragging = useRef(false);

  function updateSliderFromPointer(e: React.PointerEvent) {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSliderVal(Math.round(pct * 100));
  }

  useEffect(() => {
    const cq = localStorage.getItem("trademind_custom_q") ?? "";
    setCustomQ(cq);
    fetch("/api/playbook")
      .then((r) => r.json())
      .then((d) => {
        const enabled = (d.rules ?? []).filter((r: PlaybookRule) => r.enabled);
        if (enabled.length > 0) { setPlaybookRules(enabled); setShowPlaybook(true); }
      })
      .catch(() => {})
      .finally(() => setPlaybookChecked(true));
  }, []);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / (QUESTIONS.length + (customQ ? 1 : 0))) * 100;

  function slideToNext(callback: () => void) {
    setSlideState("out-left");
    setSelectedOption(null);
    setTimeout(() => {
      callback();
      setSlideState("in-right");
      setTimeout(() => setSlideState("idle"), 320);
    }, 200);
  }

  function advanceOrSubmit(finalAnswers: Answers) {
    if (customQ) {
      setAnswers(finalAnswers);
      setStep(QUESTIONS.length);
    } else {
      submitCheckin(finalAnswers);
    }
  }

  function handleSelect(value: number) {
    setSelectedOption(value);
    const newAnswers = { ...answers, [question.id]: value };
    if (isLast) {
      setTimeout(() => advanceOrSubmit(newAnswers), 280);
    } else {
      setTimeout(() => slideToNext(() => { setAnswers(newAnswers); setStep((s) => s + 1); }), 280);
    }
  }

  function handleSliderNext() {
    const newAnswers = { ...answers, [question.id]: sliderVal };
    if (isLast) advanceOrSubmit(newAnswers);
    else slideToNext(() => { setAnswers(newAnswers); setStep((s) => s + 1); });
  }

  async function submitCheckin(finalAnswers: Answers) {
    let score = 0;
    QUESTIONS.forEach((q) => { score += (finalAnswers[q.id] ?? 50) * q.weight; });
    const rounded = Math.round(score);
    const today = new Date().toISOString().split("T")[0];

    try {
      const history = JSON.parse(localStorage.getItem("trademind_history") || "[]");
      const existing = history.findIndex((h: { date: string }) => h.date === today);
      const entry = { date: today, score: rounded, answers: finalAnswers };
      if (existing >= 0) history[existing] = entry; else history.unshift(entry);
      localStorage.setItem("trademind_history", JSON.stringify(history.slice(0, 90)));
      localStorage.setItem("trademind_today", JSON.stringify({ date: today, score: rounded }));
    } catch {}

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, score: rounded, date: today }),
      });
      if (!res.ok) console.error("Check-in save failed:", res.status);
    } catch (err) {
      console.error("Check-in network error:", err);
    }

    router.push(`/result?score=${rounded}`);
  }

  const sliderColor = sliderVal >= 70 ? "var(--green)" : sliderVal >= 40 ? "var(--amber)" : "var(--red)";

  const slideStyle: React.CSSProperties = {
    opacity: slideState === "out-left" ? 0 : 1,
    transform: slideState === "out-left" ? "translateX(-32px)" : slideState === "in-right" ? "translateX(24px)" : "translateX(0)",
    transition: slideState === "idle" ? "opacity 0.3s ease, transform 0.3s ease" : slideState === "in-right" ? "opacity 0.28s ease, transform 0.28s ease" : "opacity 0.18s ease, transform 0.18s ease",
  };

  // Playbook screen
  if (playbookChecked && showPlaybook) {
    const byCategory: Record<string, PlaybookRule[]> = {};
    for (const r of playbookRules) {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    }
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="app-header">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
          </Link>
          <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 700 }}>YOUR RULES</span>
        </div>
        <div style={{ flex: 1, maxWidth: 600, margin: "0 auto", width: "100%", padding: "32px 20px 100px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "var(--blue)" }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="8" y="5" width="24" height="30" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M14 14h12M14 20h12M14 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <h2 className="font-bebas" style={{ fontSize: 36, lineHeight: 1, marginBottom: 8 }}>Review Your Playbook</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>Before you check in — remind yourself of your rules.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            {Object.entries(byCategory).map(([cat, catRules]) => (
              <div key={cat}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: CATEGORY_COLOR[cat] ?? "var(--text-muted)", marginBottom: 8 }}>{cat.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {catRules.map((r) => (
                    <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", borderRadius: 10, background: "var(--surface2)", border: `1px solid ${CATEGORY_COLOR[r.category] ?? "var(--border)"}20` }}>
                      <span style={{ color: CATEGORY_COLOR[r.category] ?? "var(--text-muted)", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{r.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }} onClick={() => setShowPlaybook(false)}>
            I&apos;ve reviewed my rules — Start Check-in →
          </button>
          <button onClick={() => setShowPlaybook(false)} style={{ display: "block", width: "100%", marginTop: 12, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, padding: 8 }}>
            Skip
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Custom question step
  if (step === QUESTIONS.length && customQ) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="app-header">
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
          </Link>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)" }}>{QUESTIONS.length + 1} / {QUESTIONS.length + 1}</span>
        </div>
        <div style={{ height: 3, background: "var(--surface2)" }}>
          <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, var(--blue), var(--green))", boxShadow: "0 0 10px rgba(0,232,122,0.5)" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "6px 16px", marginBottom: 36 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "#8B5CF6" }}><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 8.5s.7 1.5 2 1.5 2-1.5 2-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="5.5" cy="6.5" r=".8" fill="currentColor"/><circle cx="10.5" cy="6.5" r=".8" fill="currentColor"/></svg>
            <span style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.1em" }}>YOUR CUSTOM QUESTION</span>
          </div>
          <h2 className="font-bebas" style={{ fontSize: "clamp(28px, 5vw, 44px)", textAlign: "center", marginBottom: 48, lineHeight: 1.2 }}>
            {customQ}
          </h2>
          <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 360 }}>
            {([{ label: "Yes", color: "var(--green)" }, { label: "No", color: "var(--red)" }] as const).map(({ label, color }) => (
              <button key={label} onClick={() => submitCheckin(answers)}
                style={{ flex: 1, padding: "20px 0", borderRadius: 14, border: `2px solid ${color}40`, background: `${color}08`, color, fontSize: 18, fontWeight: 800, cursor: "pointer", transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => submitCheckin(answers)} style={{ marginTop: 20, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>Skip</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", animation: "page-in 0.28s cubic-bezier(0.16,1,0.3,1) both" }}>
      <style>{`
        @keyframes option-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .opt-btn { animation: option-in 0.25s ease both; }
        .opt-btn:active { transform: scale(0.97) !important; }
        @keyframes ripple { 0%{transform:scale(0);opacity:0.4} 100%{transform:scale(3);opacity:0} }
        .has-ripple { position:relative; overflow:hidden; }
      `}</style>

      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)" }}>{step + 1} / {QUESTIONS.length + (customQ ? 1 : 0)}</span>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>{question.category.toUpperCase()}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--surface2)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, var(--blue), var(--purple))", width: `${progress}%`, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 0 10px rgba(94,106,210,0.6)" }} />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingTop: 20 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 28 : 8, height: 8, borderRadius: 4,
            background: i < step ? "var(--green)" : i === step ? "var(--blue)" : "var(--surface3)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: i === step ? "0 0 8px var(--blue)" : i < step ? "0 0 6px var(--green)" : "none",
          }} />
        ))}
      </div>

      {/* Question content with slide animation */}
      <div
        ref={containerRef}
        style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "40px 24px", maxWidth: 640, margin: "0 auto", width: "100%",
          ...slideStyle,
        }}
      >
        {/* Category tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(94,106,210,0.08)", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 20, padding: "6px 16px", marginBottom: 36 }}>
          <span style={{ color: "var(--blue)" }}>{QUESTION_ICONS[question.id]}</span>
          <span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, letterSpacing: "0.1em" }}>{question.category.toUpperCase()}</span>
        </div>

        <h2 className="font-bebas" style={{ fontSize: "clamp(28px, 5vw, 44px)", textAlign: "center", marginBottom: 48, lineHeight: 1.2, color: "var(--text)" }}>
          {question.question}
        </h2>

        {/* Scale options */}
        {question.type === "scale" && question.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.value;
              const optColor = opt.value >= 70 ? "var(--green)" : opt.value >= 35 ? "var(--amber)" : "var(--red)";
              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.value)}
                  className="opt-btn has-ripple"
                  style={{
                    background: isSelected ? "rgba(94,106,210,0.14)" : "var(--surface)",
                    border: isSelected ? "1.5px solid var(--blue)" : "1.5px solid var(--border)",
                    borderRadius: 14,
                    padding: "17px 22px",
                    color: isSelected ? "var(--text)" : "var(--text-dim)",
                    fontSize: 15,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: isSelected ? "0 0 20px rgba(94,106,210,0.2)" : "none",
                    transform: isSelected ? "translateX(6px)" : "translateX(0)",
                    transition: "all 0.18s ease",
                    animationDelay: `${idx * 55}ms`,
                    fontFamily: "inherit",
                  }}
                >
                  <span>{opt.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l4 4 6-6" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: optColor, opacity: isSelected ? 1 : 0.5, boxShadow: isSelected ? `0 0 6px ${optColor}` : "none", transition: "all 0.2s" }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Slider */}
        {question.type === "slider" && (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div className="font-bebas" style={{ fontSize: 72, color: sliderColor, lineHeight: 1, textShadow: `0 0 30px ${sliderColor}50`, transition: "color 0.3s, text-shadow 0.3s" }}>
                {sliderVal}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                {sliderVal >= 70 ? "High focus" : sliderVal >= 40 ? "Moderate" : "Low focus"}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              {/* Custom slider track */}
              <div
                ref={sliderTrackRef}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={sliderVal}
                tabIndex={0}
                style={{ position: "relative", height: 36, cursor: "grab", userSelect: "none", touchAction: "none", padding: "0 2px" }}
                onPointerDown={(e) => {
                  sliderDragging.current = true;
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  updateSliderFromPointer(e);
                }}
                onPointerMove={(e) => { if (sliderDragging.current) updateSliderFromPointer(e); }}
                onPointerUp={() => { sliderDragging.current = false; }}
                onPointerCancel={() => { sliderDragging.current = false; }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") setSliderVal((v) => Math.min(100, v + 1));
                  if (e.key === "ArrowLeft" || e.key === "ArrowDown") setSliderVal((v) => Math.max(0, v - 1));
                }}
              >
                {/* Background track */}
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 6, transform: "translateY(-50%)", borderRadius: 99, background: "var(--surface3)" }} />
                {/* Filled track */}
                <div style={{ position: "absolute", top: "50%", left: 0, width: `${sliderVal}%`, height: 6, transform: "translateY(-50%)", borderRadius: 99, background: `linear-gradient(90deg, rgba(255,59,92,0.8), ${sliderColor})`, boxShadow: sliderVal > 5 ? `0 0 10px ${sliderColor}55` : "none", transition: "background 0.3s, box-shadow 0.3s" }} />
                {/* Thumb */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: `${sliderVal}%`,
                  transform: "translate(-50%, -50%)",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: sliderColor,
                  boxShadow: `0 0 22px ${sliderColor}80, 0 2px 8px rgba(0,0,0,0.5)`,
                  border: "2.5px solid rgba(255,255,255,0.18)",
                  transition: "background 0.3s, box-shadow 0.3s",
                  pointerEvents: "none",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>
                <span>Very low</span>
                <span>Very high</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 3fr", gap: 6, marginBottom: 32 }}>
              {[
                { label: "LOW", color: "var(--red)", active: sliderVal < 40 },
                { label: "MID", color: "var(--amber)", active: sliderVal >= 40 && sliderVal < 70 },
                { label: "HIGH", color: "var(--green)", active: sliderVal >= 70 },
              ].map((zone) => (
                <div key={zone.label} style={{ height: 5, borderRadius: 3, background: zone.active ? zone.color : "var(--surface3)", boxShadow: zone.active ? `0 0 8px ${zone.color}` : "none", transition: "all 0.3s" }} />
              ))}
            </div>

            <button className="btn-primary" onClick={handleSliderNext} style={{ width: "100%", fontSize: 16, padding: 16 }}>
              {isLast ? "Finish ✓" : "Continue →"}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}