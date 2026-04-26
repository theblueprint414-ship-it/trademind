"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface RecapEntry {
  id: string;
  date: string;
  mood: number | null;
  pnl: number | null;
  playbookScore: number | null;
  lesson: string | null;
  tradesCount: number | null;
}

const MOODS = [
  { label: "Rough", emoji: "😔", color: "#FF3B5C" },
  { label: "Okay", emoji: "😐", color: "#FFB020" },
  { label: "Good", emoji: "🙂", color: "#4F8EF7" },
  { label: "Great", emoji: "😄", color: "#00E87A" },
];

const PLAYBOOK = [
  { label: "Followed", color: "#00E87A", bg: "rgba(0,232,122,0.1)", border: "rgba(0,232,122,0.25)" },
  { label: "Mostly", color: "#FFB020", bg: "rgba(255,176,32,0.1)", border: "rgba(255,176,32,0.25)" },
  { label: "Ignored", color: "#FF3B5C", bg: "rgba(255,59,92,0.1)", border: "rgba(255,59,92,0.25)" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function RecapHistoryPage() {
  const [recaps, setRecaps] = useState<RecapEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recap/history")
      .then((r) => r.json())
      .then((d) => { if (d.recaps) setRecaps(d.recaps); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPnl = recaps.reduce((s, r) => s + (r.pnl ?? 0), 0);
  const avgMood = recaps.filter((r) => r.mood !== null).length > 0
    ? recaps.filter((r) => r.mood !== null).reduce((s, r) => s + (r.mood ?? 0), 0) / recaps.filter((r) => r.mood !== null).length
    : null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", background: "var(--surface)", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/recap" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Session Recaps</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{recaps.length} {recaps.length === 1 ? "session" : "sessions"} logged</div>
        </div>
        <Link href="/recap" style={{ marginLeft: "auto", textDecoration: "none" }}>
          <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>+ Log Today</button>
        </Link>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* Summary stats */}
        {recaps.length >= 3 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", marginBottom: 4 }}>TOTAL P&L</div>
              <div className="font-bebas" style={{ fontSize: 28, color: totalPnl >= 0 ? "var(--green)" : "var(--red)", lineHeight: 1 }}>
                {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toFixed(0)}
              </div>
            </div>
            <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", marginBottom: 4 }}>SESSIONS</div>
              <div className="font-bebas" style={{ fontSize: 28, color: "var(--blue)", lineHeight: 1 }}>{recaps.length}</div>
            </div>
            <div className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", marginBottom: 4 }}>AVG MOOD</div>
              <div style={{ fontSize: 24, lineHeight: 1 }}>
                {avgMood !== null ? MOODS[Math.round(avgMood)]?.emoji ?? "—" : "—"}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : recaps.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No recaps yet</div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              End-of-day recaps turn your trades into lessons. Log your first one.
            </p>
            <Link href="/recap">
              <button className="btn-primary" style={{ padding: "12px 28px" }}>Log your first recap →</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recaps.map((recap) => {
              const mood = recap.mood !== null ? MOODS[recap.mood] : null;
              const playbook = recap.playbookScore !== null ? PLAYBOOK[recap.playbookScore] : null;
              const hasPnl = recap.pnl !== null;

              return (
                <div key={recap.id} className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{formatDate(recap.date)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {hasPnl && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: (recap.pnl ?? 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                          {(recap.pnl ?? 0) >= 0 ? "+" : ""}${Math.abs(recap.pnl ?? 0).toFixed(0)}
                        </span>
                      )}
                      {mood && <span style={{ fontSize: 20 }}>{mood.emoji}</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: recap.lesson ? 12 : 0 }}>
                    {playbook && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: playbook.bg, border: `1px solid ${playbook.border}`, color: playbook.color, letterSpacing: "0.04em" }}>
                        {playbook.label}
                      </span>
                    )}
                    {recap.tradesCount !== null && recap.tradesCount > 0 && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "3px 8px", borderRadius: 6, background: "var(--surface2)", border: "1px solid var(--border)" }}>
                        {recap.tradesCount} {recap.tradesCount === 1 ? "trade" : "trades"}
                      </span>
                    )}
                    {mood && (
                      <span style={{ fontSize: 11, color: mood.color, padding: "3px 8px", borderRadius: 6, background: `${mood.color}15`, border: `1px solid ${mood.color}30` }}>
                        {mood.label}
                      </span>
                    )}
                  </div>

                  {recap.lesson && (
                    <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                      &ldquo;{recap.lesson}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}