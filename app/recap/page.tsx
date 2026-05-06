"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Step = "mood" | "playbook" | "pnl" | "lesson" | "done";

const MOODS = [
  { value: 0, label: "Rough", sub: "Hard day, better tomorrow",   color: "var(--red)"        },
  { value: 1, label: "Okay",  sub: "Nothing special",             color: "var(--text-muted)" },
  { value: 2, label: "Good",  sub: "Solid, stayed disciplined",   color: "var(--blue)"       },
  { value: 3, label: "Great", sub: "In the zone all session",     color: "var(--green)"      },
];

function MoodIcon({ value, size = 28 }: { value: number; size?: number }) {
  const s = { width: size, height: size, viewBox: "0 0 28 28", fill: "none" as const };
  if (value === 0) return <svg {...s}><circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.6"/><path d="M9.5 10.5L11.5 12.5M11.5 10.5L9.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16.5 10.5L18.5 12.5M18.5 10.5L16.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9.5 19C11 17 17 17 18.5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (value === 1) return <svg {...s}><circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/><path d="M10 18h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (value === 2) return <svg {...s}><circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/><path d="M10 17C11.5 19.5 16.5 19.5 18 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
  return <svg {...s}><circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="11.5" r="1.6" fill="currentColor"/><circle cx="18" cy="11.5" r="1.6" fill="currentColor"/><path d="M9 16C10.5 20 17.5 20 19 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

const PLAYBOOK_OPTIONS = [
  { value: 2, label: "Followed them",  sub: "Stuck to my rules",      color: "var(--green)",  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9l3.5 3.5 7-7" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { value: 1, label: "Mostly",         sub: "A couple of slips",       color: "var(--amber)",  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 5v5M9 13v.5" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round"/></svg> },
  { value: 0, label: "Ignored them",   sub: "Went off script today",   color: "var(--red)",    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 5l8 8M13 5l-8 8" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"/></svg> },
];

function SlideWrapper({ children, entering }: { children: React.ReactNode; entering: boolean }) {
  return (
    <div style={{
      animation: entering ? "recap-in 0.32s cubic-bezier(0.22,1,0.36,1) both" : undefined,
      width: "100%",
    }}>
      {children}
    </div>
  );
}

export default function RecapPage() {
  const [step, setStep] = useState<Step>("mood");
  const [entering, setEntering] = useState(true);
  const [mood, setMood]               = useState<number | null>(null);
  const [playbookScore, setPlaybook]  = useState<number | null>(null);
  const [pnlSign, setPnlSign]         = useState<1 | -1>(1);
  const [pnlValue, setPnlValue]       = useState("");
  const [lesson, setLesson]           = useState("");
  const [saving, setSaving]           = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`/api/recap?date=${today}`)
      .then(r => r.json())
      .then(d => { if (d.recap) setAlreadyDone(true); })
      .catch(() => {});
  }, [today]);

  function goTo(next: Step) {
    setEntering(false);
    setTimeout(() => { setStep(next); setEntering(true); }, 180);
  }

  async function finish(lessonText: string) {
    setSaving(true);
    const pnlNum = pnlValue ? parseFloat(pnlValue) * pnlSign : null;
    await fetch("/api/recap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, mood, playbookScore, pnl: pnlNum, lesson: lessonText || null }),
    }).catch(() => {});
    setSaving(false);
    goTo("done");
  }

  const moodObj     = mood !== null ? MOODS[mood] : null;
  const playbookObj = playbookScore !== null ? PLAYBOOK_OPTIONS.find(p => p.value === playbookScore) : null;
  const pnlFinal    = pnlValue ? parseFloat(pnlValue) * pnlSign : null;

  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes recap-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes score-pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .recap-opt {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: 12px; cursor: pointer;
          border: 1.5px solid var(--border); background: var(--surface);
          transition: border-color 0.15s, background 0.15s;
          width: 100%;
        }
        .recap-opt:hover { border-color: var(--border-bright); background: var(--surface2); }
        .recap-opt.selected { border-color: currentColor; background: var(--surface2); }
      `}</style>

      {/* Header */}
      <div className="app-header">
        <Link href="/dashboard" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Dashboard
        </Link>
        <div style={{ textAlign: "center" }}>
          <span className="font-bebas" style={{ fontSize: 20, letterSpacing: "0.05em", display: "block", lineHeight: 1.1 }}>RECAP</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>CLOSE YOUR SESSION</span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 20px 120px" }}>

        {/* Already done */}
        {alreadyDone && step !== "done" ? (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,232,122,0.1)", border: "1.5px solid rgba(0,232,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 6.5 11.5-11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <h2 className="font-bebas" style={{ fontSize: 36, marginBottom: 10 }}>Already logged today</h2>
            <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 28 }}>You already closed your session for {dateLabel}.</p>
            <Link href="/dashboard"><button className="btn-primary" style={{ padding: "12px 28px" }}>Back to Dashboard</button></Link>
          </div>
        ) : step === "done" ? (
          <SlideWrapper entering={entering}>
            <div style={{ textAlign: "center", paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, animation: "score-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                {moodObj ? (
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${moodObj.color}18`, border: `1.5px solid ${moodObj.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: moodObj.color }}>
                    <MoodIcon value={moodObj.value} size={40} />
                  </div>
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,232,122,0.1)", border: "1.5px solid rgba(0,232,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6.5 6.5 11.5-11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </div>
              <h2 className="font-bebas" style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>Session closed.</h2>
              <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 32 }}>
                Logging your sessions is how patterns become visible. Keep doing this every day.
              </p>

              {/* Summary card */}
              <div className="card" style={{ padding: "22px 20px", marginBottom: 24, textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>TODAY · {dateLabel.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {moodObj && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Session mood</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: moodObj.color }}>{moodObj.label}</span>
                    </div>
                  )}
                  {playbookObj && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Playbook</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: playbookObj.color }}>{playbookObj.label}</span>
                    </div>
                  )}
                  {pnlFinal !== null && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text-dim)" }}>P&L</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: pnlFinal >= 0 ? "var(--green)" : "var(--red)" }}>
                        {pnlFinal >= 0 ? "+" : ""}${pnlFinal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {lesson && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.06em" }}>LESSON</span>
                      <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{lesson}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Link href="/journal"><button className="btn-ghost" style={{ padding: "11px 20px", fontSize: 14 }}>Log trades →</button></Link>
                <Link href="/dashboard"><button className="btn-primary" style={{ padding: "11px 20px", fontSize: 14 }}>Dashboard</button></Link>
              </div>
            </div>
          </SlideWrapper>

        ) : step === "mood" ? (
          <SlideWrapper entering={entering}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>STEP 1 OF 4 · SESSION RECAP</div>
              <h1 className="font-bebas" style={{ fontSize: "clamp(36px, 8vw, 52px)", lineHeight: 1, marginBottom: 8 }}>How did today go?</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)" }}>{dateLabel}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  className={`recap-opt${mood === m.value ? " selected" : ""}`}
                  style={{ color: mood === m.value ? m.color : "var(--text)" }}
                  onClick={() => { setMood(m.value); setTimeout(() => goTo("playbook"), 220); }}
                >
                  <span style={{ flexShrink: 0, color: mood === m.value ? m.color : "var(--text-muted)" }}><MoodIcon value={m.value} /></span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </SlideWrapper>

        ) : step === "playbook" ? (
          <SlideWrapper entering={entering}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>STEP 2 OF 4</div>
              <h1 className="font-bebas" style={{ fontSize: "clamp(36px, 8vw, 52px)", lineHeight: 1, marginBottom: 8 }}>Did you follow your rules?</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Honest answer. No one is watching.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PLAYBOOK_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  className={`recap-opt${playbookScore === p.value ? " selected" : ""}`}
                  style={{ color: playbookScore === p.value ? p.color : "var(--text)" }}
                  onClick={() => { setPlaybook(p.value); setTimeout(() => goTo("pnl"), 220); }}
                >
                  <span style={{ flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => goTo("pnl")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", marginTop: 16, padding: "8px 0" }}>No playbook yet — skip →</button>
          </SlideWrapper>

        ) : step === "pnl" ? (
          <SlideWrapper entering={entering}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>STEP 3 OF 4</div>
              <h1 className="font-bebas" style={{ fontSize: "clamp(36px, 8vw, 52px)", lineHeight: 1, marginBottom: 8 }}>What was your P&L?</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Optional. Helps Analytics build your full picture.</p>
            </div>
            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--border)" }}>
              <button
                onClick={() => setPnlSign(1)}
                style={{ flex: 1, padding: "14px", fontSize: 16, fontWeight: 700, background: pnlSign === 1 ? "rgba(0,232,122,0.1)" : "var(--surface)", border: "none", color: pnlSign === 1 ? "var(--green)" : "var(--text-dim)", cursor: "pointer", transition: "all 0.15s" }}
              >+ Profit</button>
              <button
                onClick={() => setPnlSign(-1)}
                style={{ flex: 1, padding: "14px", fontSize: 16, fontWeight: 700, background: pnlSign === -1 ? "rgba(255,59,92,0.1)" : "var(--surface)", border: "none", borderLeft: "1.5px solid var(--border)", color: pnlSign === -1 ? "var(--red)" : "var(--text-dim)", cursor: "pointer", transition: "all 0.15s" }}
              >− Loss</button>
            </div>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: pnlSign === 1 ? "var(--green)" : "var(--red)", fontWeight: 700, pointerEvents: "none" }}>$</span>
              <input
                type="number"
                placeholder="0.00"
                value={pnlValue}
                onChange={e => setPnlValue(e.target.value)}
                min="0"
                style={{ width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "16px 16px 16px 36px", fontSize: 22, fontWeight: 700, color: pnlSign === 1 ? "var(--green)" : "var(--red)", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: "14px", fontSize: 15 }}
                disabled={!pnlValue}
                onClick={() => goTo("lesson")}
              >Continue →</button>
              <button
                onClick={() => goTo("lesson")}
                style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 10, color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: "14px 20px" }}
              >Skip</button>
            </div>
          </SlideWrapper>

        ) : step === "lesson" ? (
          <SlideWrapper entering={entering}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>STEP 4 OF 4</div>
              <h1 className="font-bebas" style={{ fontSize: "clamp(36px, 8vw, 52px)", lineHeight: 1, marginBottom: 8 }}>One thing you'd do differently?</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Optional. This is what separates good traders from great ones.</p>
            </div>
            <textarea
              placeholder="e.g. I entered too early on the second trade without waiting for confirmation..."
              value={lesson}
              onChange={e => setLesson(e.target.value)}
              rows={4}
              style={{ width: "100%", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "var(--text)", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", fontFamily: "var(--font-geist-sans)" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: "14px", fontSize: 15 }}
                disabled={saving}
                onClick={() => finish(lesson)}
              >{saving ? "Saving…" : "Close My Session →"}</button>
              <button
                onClick={() => finish("")}
                style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: 10, color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: "14px 20px" }}
              >Skip</button>
            </div>
          </SlideWrapper>
        ) : null}
      </div>

      <BottomNav />
    </div>
  );
}