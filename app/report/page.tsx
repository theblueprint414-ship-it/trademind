"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CheckinEntry = { date: string; score: number; verdict: string };
type TradeEntry = { date: string; pnl: number | null; checkinScore: number | null };

function verdictColor(score: number) {
  if (score >= 70) return "#00E87A";
  if (score >= 45) return "#FFB020";
  return "#FF3B5C";
}
function verdictLabel(score: number) {
  if (score >= 70) return "GO";
  if (score >= 45) return "CAUTION";
  return "NO-TRADE";
}

export default function ReportPage() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [checkins, setCheckins] = useState<CheckinEntry[]>([]);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setUserName(d.name?.split(" ")[0] ?? "")).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const [yr, mo] = month.split("-").map(Number);
    const start = `${month}-01`;
    const end = `${month}-${new Date(yr, mo, 0).getDate()}`;

    Promise.all([
      fetch(`/api/checkin?date=history&limit=60`).then((r) => r.json()),
      fetch(`/api/journal?date=all&limit=500`).then((r) => r.json()),
    ]).then(([cd, jd]) => {
      const allCheckins: CheckinEntry[] = (cd.history ?? []).filter((c: CheckinEntry) => c.date >= start && c.date <= end);
      setCheckins(allCheckins.sort((a, b) => a.date.localeCompare(b.date)));
      const allTrades: TradeEntry[] = (jd.entries ?? []).filter((e: TradeEntry) => e.date >= start && e.date <= end);
      setTrades(allTrades);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [month]);

  const [yr, mo] = month.split("-").map(Number);
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const firstDow = new Date(yr, mo - 1, 1).getDay();
  const monthName = new Date(yr, mo - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const byDate: Record<string, CheckinEntry> = {};
  for (const c of checkins) byDate[c.date] = c;

  const avg = checkins.length > 0 ? Math.round(checkins.reduce((s, c) => s + c.score, 0) / checkins.length) : null;
  const go = checkins.filter((c) => c.score >= 70).length;
  const caution = checkins.filter((c) => c.score >= 45 && c.score < 70).length;
  const noTrade = checkins.filter((c) => c.score < 45).length;

  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const withPnl = trades.filter((t) => t.pnl !== null);
  const winners = withPnl.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = withPnl.length > 0 ? Math.round((winners / withPnl.length) * 100) : null;

  const goTrades = withPnl.filter((t) => (t.checkinScore ?? 0) >= 70);
  const goPnl = goTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const ntTrades = withPnl.filter((t) => t.checkinScore !== null && t.checkinScore < 45);
  const ntPnl = ntTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .report-card { background: #f8f9fa !important; border-color: #dee2e6 !important; }
          .report-title { color: #1a1a2e !important; }
          .stat-val { color: #1a1a2e !important; }
        }
        @page { margin: 20mm; size: A4; }
      `}</style>

      {/* Nav — hidden on print */}
      <div className="no-print" style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13 }}>← Home</button>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="btn-primary" style={{ fontSize: 13, fontWeight: 700 }}
          >
            Save as PDF
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="https://trademindedge.com/logo.svg" alt="TradeMind" height="24" style={{ display: "block", margin: "0 auto 20px", opacity: 0.7 }} />
          <h1 className="report-title" style={{ fontSize: 32, fontWeight: 800, margin: "0 0 6px", color: "#E8F0FF" }}>
            {userName ? `${userName}'s ` : ""}Monthly Report
          </h1>
          <p style={{ color: "#3D4F6A", fontSize: 14, margin: 0 }}>{monthName}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#3D4F6A" }}>Loading...</div>
        ) : checkins.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ color: "#3D4F6A", fontSize: 15 }}>No check-ins recorded for {monthName}.</p>
          </div>
        ) : (
          <>
            {/* Score summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
              {[
                { val: avg ?? "—", label: "AVG SCORE", color: avg ? verdictColor(avg) : "#3D4F6A" },
                { val: go, label: "GO DAYS", color: "#00E87A" },
                { val: caution, label: "CAUTION", color: "#FFB020" },
                { val: noTrade, label: "NO-TRADE", color: "#FF3B5C" },
              ].map((s) => (
                <div key={s.label} className="report-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 12px", textAlign: "center" }}>
                  <div className="stat-val" style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: "#3D4F6A", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="report-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#3D4F6A", letterSpacing: "0.08em", marginBottom: 16 }}>CHECK-IN CALENDAR</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} style={{ fontSize: 9, color: "#3D4F6A", textAlign: "center", letterSpacing: "0.06em" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {Array.from({ length: firstDow }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${month}-${String(day).padStart(2, "0")}`;
                  const entry = byDate[dateStr];
                  const bg = entry ? verdictColor(entry.score) : "var(--border)";
                  const opacity = entry ? 0.85 : 0.25;
                  return (
                    <div key={day} title={entry ? `${verdictLabel(entry.score)} · ${entry.score}` : undefined}
                      style={{ aspectRatio: "1", borderRadius: 4, background: bg, opacity, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, color: entry ? "rgba(0,0,0,0.7)" : "#3D4F6A", fontWeight: 700 }}>{day}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 14, justifyContent: "center" }}>
                {[["#00E87A", "GO"], ["#FFB020", "CAUTION"], ["#FF3B5C", "NO-TRADE"], ["var(--border)", "No check-in"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: c === "var(--border)" ? 0.5 : 0.85 }} />
                    <span style={{ fontSize: 10, color: "#3D4F6A" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* P&L section (only if trades exist) */}
            {withPnl.length > 0 && (
              <div className="report-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#3D4F6A", letterSpacing: "0.08em", marginBottom: 16 }}>TRADING PERFORMANCE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { val: `${totalPnl >= 0 ? "+" : ""}$${Math.abs(Math.round(totalPnl)).toLocaleString()}`, label: "TOTAL P&L", color: totalPnl >= 0 ? "#00E87A" : "#FF3B5C" },
                    { val: winRate !== null ? `${winRate}%` : "—", label: "WIN RATE", color: winRate !== null && winRate >= 50 ? "#00E87A" : "#FF3B5C" },
                    { val: withPnl.length, label: "TRADES", color: "#5e6ad2" },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                      <div style={{ fontSize: 9, color: "#3D4F6A", letterSpacing: "0.08em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {goTrades.length > 0 && ntTrades.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#00E87A", letterSpacing: "0.06em", marginBottom: 4 }}>GO DAYS ({goTrades.length} trades)</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: goPnl >= 0 ? "#00E87A" : "#FF3B5C" }}>{goPnl >= 0 ? "+" : ""}${Math.abs(Math.round(goPnl)).toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#FF3B5C", letterSpacing: "0.06em", marginBottom: 4 }}>NO-TRADE DAYS ({ntTrades.length} trades)</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: ntPnl >= 0 ? "#00E87A" : "#FF3B5C" }}>{ntPnl >= 0 ? "+" : ""}${Math.abs(Math.round(ntPnl)).toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Score trend */}
            {checkins.length >= 4 && (() => {
              const W = 680; const H = 80; const pad = 10;
              const xs = checkins.map((_, i) => pad + (i / Math.max(checkins.length - 1, 1)) * (W - pad * 2));
              const ys = checkins.map((c) => pad + (1 - c.score / 100) * (H - pad * 2));
              const d = checkins.map((_, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${ys[i]}`).join(" ");
              return (
                <div className="report-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: "#3D4F6A", letterSpacing: "0.08em", marginBottom: 16 }}>SCORE TREND</div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80 }}>
                    <defs>
                      <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#5e6ad2" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={`${d} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`} fill="url(#trend-grad)" />
                    <path d={d} fill="none" stroke="#5e6ad2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {checkins.map((c, i) => (
                      <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill={verdictColor(c.score)} />
                    ))}
                  </svg>
                </div>
              );
            })()}

            {/* Footer */}
            <div style={{ textAlign: "center", paddingTop: 24, borderTop: "1px solid var(--border)" }}>
              <p style={{ color: "#3D4F6A", fontSize: 11, margin: 0 }}>
                Generated by TradeMind · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · trademindedge.com
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}