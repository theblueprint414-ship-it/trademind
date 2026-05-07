"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

type Mood = "focused" | "anxious" | "tired" | "confident" | "frustrated" | "neutral";

const MOODS: { value: Mood; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "focused", label: "Focused", color: "var(--blue)", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/></svg> },
  { value: "confident", label: "Confident", color: "var(--green)", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="9.5" r="1.1" fill="currentColor"/><circle cx="14" cy="9.5" r="1.1" fill="currentColor"/><path d="M7.5 13C8.5 15 13.5 15 14.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { value: "anxious", label: "Anxious", color: "var(--amber)", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 8.5L9 10M9 8.5L7.5 10M13 8.5L14.5 10M14.5 8.5L13 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 14.5C9 13 13 13 14 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { value: "frustrated", label: "Frustrated", color: "var(--red)", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9l2.5 1.5L8 11M14 9l-2.5 1.5L14 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 15c.8-1.2 5.2-1.2 5 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { value: "tired", label: "Tired", color: "#8B7CF6", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 9.5c.5-1 2-1 2 0M12.5 9.5c.5-1 2-1 2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 13.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { value: "neutral", label: "Neutral", color: "var(--text-muted)", icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="9.5" r="1.1" fill="currentColor"/><circle cx="14" cy="9.5" r="1.1" fill="currentColor"/><path d="M8 13.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
];

const SCORE_LABELS: Record<number, string> = { 1: "Terrible", 2: "Poor", 3: "Low", 4: "Okay", 5: "Average", 6: "Decent", 7: "Good", 8: "Great", 9: "Excellent", 10: "Peak" };
const scoreColor = (s: number) => s >= 8 ? "var(--green)" : s >= 6 ? "var(--blue)" : s >= 4 ? "var(--amber)" : "var(--red)";

export default function MidCheckinPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [score, setScore] = useState<number | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!score || !mood) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mid-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, mood, note: note || null }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast("Pulse check saved", "success");
        router.push("/dashboard");
      } else {
        showToast(data.error ?? "Failed to save — try again", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setSaving(false);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ maxWidth: 440, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, color: "var(--blue)" }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2"/><path d="M20 12v8l5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div className="font-bebas" style={{ fontSize: 30, letterSpacing: "0.04em", marginBottom: 6 }}>MID-SESSION PULSE</div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>30 seconds · stays private · helps you see patterns mid-session</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, justifyContent: "center" }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ width: s <= step ? 24 : 8, height: 4, borderRadius: 2, background: s <= step ? "var(--blue)" : "var(--surface3)", transition: "all 0.3s ease" }} />
          ))}
        </div>

        {/* Step 1: Focus score */}
        {step === 1 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 20, textAlign: "center" }}>
              How focused are you right now?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((v) => {
                const isSelected = score === v;
                const c = scoreColor(v);
                return (
                  <button key={v} onClick={() => { setScore(v); setTimeout(() => setStep(2), 180); }}
                    style={{ padding: "11px 16px", borderRadius: 10, border: `1.5px solid ${isSelected ? c : "var(--border)"}`, background: isSelected ? `${c}15` : "var(--surface2)", color: isSelected ? c : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.12s" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, fontFamily: "var(--font-geist-mono)" }}>{v}</span>
                    <span style={{ fontSize: 13, color: isSelected ? c : "var(--text-muted)" }}>{SCORE_LABELS[v]}</span>
                    {isSelected && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Mood */}
        {step === 2 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 20, textAlign: "center" }}>
              How are you feeling emotionally?
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {MOODS.map((m) => {
                const isSelected = mood === m.value;
                return (
                  <button key={m.value} onClick={() => { setMood(m.value); setTimeout(() => setStep(3), 180); }}
                    style={{ padding: "16px 8px", borderRadius: 12, border: `1.5px solid ${isSelected ? m.color : "var(--border)"}`, background: isSelected ? `${m.color}15` : "var(--surface2)", color: isSelected ? m.color : "var(--text-muted)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.12s" }}>
                    <span>{m.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Optional note + submit */}
        {step === 3 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>
              Any quick note? <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginBottom: 20 }}>Anything on your mind that could be affecting your trading?</p>

            {/* Summary badges */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
              {score && <span style={{ padding: "5px 14px", borderRadius: 20, background: `${scoreColor(score)}15`, border: `1px solid ${scoreColor(score)}30`, color: scoreColor(score), fontSize: 13, fontWeight: 700 }}>Focus: {score}/10 · {SCORE_LABELS[score]}</span>}
              {mood && (() => { const m = MOODS.find(x => x.value === mood)!; return <span style={{ padding: "5px 14px", borderRadius: 20, background: `${m.color}15`, border: `1px solid ${m.color}30`, color: m.color, fontSize: 13, fontWeight: 700 }}>{m.label}</span>; })()}
            </div>

            <textarea
              placeholder="e.g. Had a rough loss, feeling impatient..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={3}
              style={{ resize: "vertical", fontSize: 14, marginBottom: 16, width: "100%" }}
            />

            <button className="btn-primary" onClick={handleSubmit} disabled={saving} style={{ width: "100%", padding: 14, fontSize: 15 }}>
              {saving ? "Saving..." : "Save Pulse Check →"}
            </button>
            <button onClick={() => router.push("/dashboard")} style={{ width: "100%", marginTop: 10, padding: 10, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
              Skip for now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}