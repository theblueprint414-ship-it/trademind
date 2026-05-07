"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type SessionData = {
  tradeCount: number;
  tradeLimit: number;
  totalPnl: number;
  checkin: { score: number; verdict: string } | null;
  circuitBreaker?: { isActive: boolean; tradeCountToday: number } | null;
};

export default function LiveSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchSession() {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) return;
      const data = await res.json();
      setSession({
        tradeCount: data.tradeCount ?? 0,
        tradeLimit: data.tradeLimit ?? 5,
        totalPnl: data.totalPnl ?? 0,
        checkin: data.checkin ?? null,
      });
    } catch {}
  }

  useEffect(() => {
    fetchSession();
    intervalRef.current = setInterval(fetchSession, 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (!session || (session.tradeCount === 0 && !session.checkin)) return null;

  const { tradeCount, tradeLimit, totalPnl, checkin } = session;
  const pnlColor = totalPnl > 0 ? "var(--green)" : totalPnl < 0 ? "var(--red)" : "var(--text-muted)";
  const cbPct = Math.min(100, (tradeCount / tradeLimit) * 100);
  const cbColor = cbPct >= 100 ? "var(--red)" : cbPct >= 67 ? "var(--amber)" : "var(--green)";
  const verdictColor = checkin?.verdict === "GO" ? "var(--green)" : checkin?.verdict === "CAUTION" ? "var(--amber)" : "var(--red)";

  return (
    <div style={{
      position: "fixed", bottom: 80, right: 16, zIndex: 200,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      minWidth: minimized ? "auto" : 200, maxWidth: 240,
      transition: "all 0.2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: minimized ? "8px 12px" : "10px 14px 0", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", boxShadow: "0 0 6px var(--green)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>LIVE SESSION</span>
        </div>
        <button onClick={() => setMinimized((m) => !m)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            {minimized
              ? <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>
        </button>
      </div>

      {!minimized && (
        <div style={{ padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* P&L */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: pnlColor, fontFamily: "var(--font-geist-mono)", lineHeight: 1 }}>
              {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toFixed(2)}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>today</span>
          </div>

          {/* Trade counter + CB bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
              <span style={{ color: "var(--text-muted)" }}>Trade {tradeCount} / {tradeLimit}</span>
              <span style={{ color: cbColor, fontWeight: 700 }}>{tradeLimit - tradeCount} left</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${cbPct}%`, background: cbColor, borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Mental score */}
          {checkin && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: `${verdictColor}10`, border: `1px solid ${verdictColor}25` }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1C3.3 1 1.5 2.8 1.5 5c0 1.2.6 2.2 1.5 2.9V9a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V7.9C7.9 7.2 9.5 6.2 9.5 5c0-2.2-1.8-4-4-4z" stroke={verdictColor} strokeWidth="1.2"/><path d="M4.5 10.5h2" stroke={verdictColor} strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: verdictColor }}>{checkin.verdict}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{checkin.score}/100</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/mid-checkin" style={{ flex: 1, textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "6px 0", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text-muted)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}>
                PULSE CHECK
              </button>
            </Link>
            <Link href="/session" style={{ flex: 1, textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "6px 0", borderRadius: 7, border: "1px solid rgba(94,106,210,0.3)", background: "rgba(94,106,210,0.08)", color: "var(--blue)", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}>
                REVIEW
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}