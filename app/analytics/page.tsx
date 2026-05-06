"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Skeleton, SkeletonCard, SkeletonStat } from "@/components/Skeleton";
import MentalPnL from "@/components/MentalPnL";

type ScoreRangeEntry = {
  label: string;
  checkins: number;
  trades: number;
  winRate: number | null;
  avgPnl: number | null;
};

type DayOfWeekEntry = {
  day: string;
  avgScore: number | null;
  trades: number;
  winRate: number | null;
  avgPnl: number | null;
};

type BehavioralPatterns = {
  revengeTrading: { detected: boolean; days: number; description: string };
  fomoTrades: { detected: boolean; count: number };
  overtradingDays: { detected: boolean; days: number };
};

type BenchmarkData = {
  userAvg: number;
  communityAvg: number;
  percentile: number;
  p25: number;
  p75: number;
  userCheckinRate: number;
  communityCheckinRate: number;
  userGoRate: number;
  communityGoRate: number;
  totalUsers: number;
  insufficient?: boolean;
};

type AnalyticsData = {
  totalCheckins: number;
  avgScore: number | null;
  avg30: number | null;
  currentStreak: number;
  longestStreak: number;
  disciplinePct: number;
  verdictCounts: { GO: number; CAUTION: number; "NO-TRADE": number };
  scoreTrend: { date: string; score: number; verdict: string }[];
  correlation: { date: string; score: number; pnl: number; verdict: string }[];
  estimatedSaved: number;
  respectedNoTradeCount: number;
  tradedOnNoTradeDayCount: number;
  calendarDays: { date: string; score: number | null; verdict: string | null; pnl: number | null }[];
  totalPnl: number;
  winRate: number | null;
  totalTrades: number;
  scoreRangePerformance: { high: ScoreRangeEntry; mid: ScoreRangeEntry; low: ScoreRangeEntry };
  byDayOfWeek: DayOfWeekEntry[];
  behavioralPatterns: BehavioralPatterns;
};

function verdictColor(verdict: string | null) {
  if (verdict === "GO") return "var(--green)";
  if (verdict === "CAUTION") return "var(--amber)";
  if (verdict === "NO-TRADE") return "var(--red)";
  return "var(--surface3)";
}

function scoreColor(score: number | null) {
  if (score === null) return "var(--surface3)";
  if (score >= 70) return "var(--green)";
  if (score >= 45) return "var(--amber)";
  return "var(--red)";
}

function ScoreLineChart({ data, range }: { data: { date: string; score: number; verdict: string }[]; range: 30 | 90 }) {
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; score: number; date: string; verdict: string } | null>(null);
  const sliced = data.slice(-range);
  if (sliced.length < 2) return <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 40 }}>Not enough data yet</div>;

  const W = 600; const H = 120; const PAD = 16;
  const minS = 0; const maxS = 100;
  const xStep = (W - PAD * 2) / (sliced.length - 1);

  const points = sliced.map((d, i) => ({
    x: PAD + i * xStep,
    y: PAD + (1 - (d.score - minS) / (maxS - minS)) * (H - PAD * 2),
    score: d.score,
    verdict: d.verdict,
    date: d.date,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  const tooltipW = 100; const tooltipH = 44;

  return (
    <div style={{ overflowX: "auto", position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", minWidth: 280 }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 45, 70, 100].map((v) => {
          const y = PAD + (1 - v / 100) * (H - PAD * 2);
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray={v === 0 || v === 100 ? "0" : "3,3"} />
              <text x={PAD - 4} y={y + 4} fontSize="8" fill="var(--text-muted)" textAnchor="end">{v}</text>
            </g>
          );
        })}
        <rect x={PAD} y={PAD + (1 - 70 / 100) * (H - PAD * 2)} width={W - PAD * 2} height={(70 - 45) / 100 * (H - PAD * 2)} fill="rgba(255,176,32,0.03)" />
        <rect x={PAD} y={PAD + (1 - 45 / 100) * (H - PAD * 2)} width={W - PAD * 2} height={45 / 100 * (H - PAD * 2)} fill="rgba(255,59,92,0.03)" />
        <path d={areaD} fill="url(#scoreGrad)" />
        <path d={pathD} fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y}
            r={tooltip?.date === p.date ? 5 : 3}
            fill={verdictColor(p.verdict)}
            stroke="var(--bg)" strokeWidth="1.5"
            style={{ cursor: "pointer", transition: "r 0.1s" }}
            onMouseEnter={() => setTooltip({ x: p.x, y: p.y, score: p.score, date: p.date, verdict: p.verdict })}
          />
        ))}
        {tooltip && (() => {
          const tx = Math.min(tooltip.x, W - tooltipW - 4);
          const ty = tooltip.y < tooltipH + 8 ? tooltip.y + 10 : tooltip.y - tooltipH - 8;
          const c = verdictColor(tooltip.verdict);
          return (
            <g>
              <line x1={tooltip.x} y1={PAD} x2={tooltip.x} y2={H - PAD} stroke={c} strokeWidth="0.75" strokeDasharray="3,2" opacity="0.5" />
              <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx="6" fill="#0D1420" stroke={c} strokeWidth="1" opacity="0.97" />
              <text x={tx + tooltipW / 2} y={ty + 14} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{tooltip.date}</text>
              <text x={tx + tooltipW / 2} y={ty + 30} fontSize="13" fontWeight="700" fill={c} textAnchor="middle">{tooltip.score}/100 · {tooltip.verdict}</text>
            </g>
          );
        })()}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", padding: "0 4px", marginTop: 4 }}>
        <span>{sliced[0]?.date}</span>
        <span>{sliced[sliced.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function CorrelationChart({ data }: { data: { date: string; score: number; pnl: number; verdict: string }[] }) {
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; score: number; pnl: number; date: string; verdict: string } | null>(null);

  if (data.length < 2) return (
    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: 40 }}>
      Log trades with P&L to see your psychology-performance correlation
    </div>
  );

  const sliced = data.slice(-60);
  const W = 600; const H = 160; const PAD = 32;
  const chartW = W - PAD * 2; const chartH = H - PAD * 2;

  const maxPnl = Math.max(...sliced.map((d) => Math.abs(d.pnl)), 1);
  const barW = Math.max(4, chartW / sliced.length - 3);
  const tooltipW = 120; const tooltipH = 52;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", minWidth: 300 }}
        onMouseLeave={() => setTooltip(null)}
      >
        <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="var(--border)" strokeWidth="1" />

        {sliced.map((d, i) => {
          const x = PAD + (i / sliced.length) * chartW;
          const barH = Math.max(2, (Math.abs(d.pnl) / maxPnl) * (chartH / 2) * 0.9);
          const isWin = d.pnl >= 0;
          const fill = isWin ? "var(--green)" : "var(--red)";
          const y = isWin ? H / 2 - barH : H / 2;
          const dotCy = PAD + (1 - d.score / 100) * (chartH * 0.3);
          const isActive = tooltip?.date === d.date;
          return (
            <g
              key={i}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltip({ x, y: Math.min(y, dotCy), score: d.score, pnl: d.pnl, date: d.date, verdict: d.verdict })}
            >
              <rect x={x - 2} y={PAD} width={barW + 4} height={H - PAD * 2} fill="transparent" />
              <rect x={x} y={y} width={barW} height={barH} fill={fill} opacity={isActive ? 1 : 0.7} rx="1" />
              <circle cx={x + barW / 2} cy={dotCy} r={isActive ? 4 : 2.5} fill={verdictColor(d.verdict)} opacity="0.9" />
            </g>
          );
        })}
        <text x={PAD - 4} y={PAD + 4} fontSize="8" fill="var(--text-muted)" textAnchor="end">100</text>
        <text x={PAD - 4} y={PAD + chartH * 0.3 + 4} fontSize="8" fill="var(--text-muted)" textAnchor="end">0</text>

        {tooltip && (() => {
          const tx = Math.min(tooltip.x, W - tooltipW - 4);
          const ty = Math.max(4, tooltip.y - tooltipH - 8);
          const c = tooltip.pnl >= 0 ? "var(--green)" : "var(--red)";
          const pnlStr = `${tooltip.pnl >= 0 ? "+" : ""}$${Math.abs(tooltip.pnl).toFixed(2)}`;
          return (
            <g>
              <line x1={tooltip.x + barW / 2} y1={PAD} x2={tooltip.x + barW / 2} y2={H - PAD} stroke="var(--text-muted)" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.4" />
              <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx="6" fill="#0D1420" stroke={c} strokeWidth="1" opacity="0.97" />
              <text x={tx + tooltipW / 2} y={ty + 14} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{tooltip.date}</text>
              <text x={tx + tooltipW / 2} y={ty + 28} fontSize="11" fontWeight="700" fill={c} textAnchor="middle">P&amp;L: {pnlStr}</text>
              <text x={tx + tooltipW / 2} y={ty + 43} fontSize="10" fill={verdictColor(tooltip.verdict)} textAnchor="middle">Score: {tooltip.score} · {tooltip.verdict}</text>
            </g>
          );
        })()}
      </svg>
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text-muted)", marginTop: 4, justifyContent: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", display: "inline-block" }} /> Mental Score</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--green)", display: "inline-block" }} /> Win</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--red)", display: "inline-block" }} /> Loss</span>
      </div>
    </div>
  );
}

function CalendarHeatmap({ days }: { days: { date: string; score: number | null; verdict: string | null; pnl: number | null }[] }) {
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [tooltip, setTooltip] = React.useState<{ day: typeof days[0] } | null>(null);

  const today = new Date();
  const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = targetMonth.getFullYear();
  const month = targetMonth.getMonth();
  const monthLabel = targetMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const dayMap: Record<string, typeof days[0]> = {};
  for (const d of days) dayMap[d.date] = d;

  const cells: (typeof days[0] | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(dayMap[dateStr] ?? { date: dateStr, score: null, verdict: null, pnl: null });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const todayStr = today.toISOString().split("T")[0];
  const canGoForward = monthOffset < 0;

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={() => setMonthOffset((o) => o - 1)} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: 13, color: "var(--text-dim)", cursor: "pointer", minHeight: "unset", minWidth: "unset" }}>←</button>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", letterSpacing: "0.04em" }}>{monthLabel}</span>
        <button onClick={() => canGoForward && setMonthOffset((o) => o + 1)} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: 13, color: canGoForward ? "var(--text-dim)" : "var(--surface3)", cursor: canGoForward ? "pointer" : "default", minHeight: "unset", minWidth: "unset" }}>→</button>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, color: "var(--text-muted)", paddingBottom: 2 }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weeks.map((wk, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {wk.map((day, di) => {
              if (!day) return <div key={di} />;
              const isToday = day.date === todayStr;
              const isFuture = day.date > todayStr;
              const bg = day.verdict ? verdictColor(day.verdict) : isFuture ? "transparent" : "var(--surface3)";
              const opacity = day.verdict ? 0.85 : isFuture ? 0 : 0.2;
              const dayNum = parseInt(day.date.split("-")[2]);
              const hasPnl = day.pnl !== null;

              return (
                <div
                  key={di}
                  onMouseEnter={() => setTooltip({ day })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    borderRadius: 6, padding: "5px 3px 4px",
                    background: bg, opacity,
                    border: isToday ? "1.5px solid var(--blue)" : "1px solid transparent",
                    cursor: day.verdict ? "pointer" : "default",
                    textAlign: "center", position: "relative",
                    minHeight: 38,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: isToday ? 800 : 500, color: day.verdict ? "#fff" : "var(--text-muted)", opacity: day.verdict ? 1 : 0.7 }}>{dayNum}</div>
                  {hasPnl && (
                    <div style={{ fontSize: 8, fontWeight: 700, color: day.pnl! >= 0 ? "#00E87A" : "#FF3B5C", marginTop: 1, opacity: 1 }}>
                      {day.pnl! >= 0 ? "+" : ""}${Math.abs(day.pnl!).toFixed(0)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip?.day.verdict && (
        <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span style={{ color: "var(--text-muted)" }}>{tooltip.day.date}</span>
          <span style={{ color: verdictColor(tooltip.day.verdict), fontWeight: 700 }}>{tooltip.day.verdict}</span>
          {tooltip.day.score !== null && <span style={{ color: "var(--text)" }}>Score: <strong>{tooltip.day.score}</strong></span>}
          {tooltip.day.pnl !== null && <span style={{ color: tooltip.day.pnl >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{tooltip.day.pnl >= 0 ? "+" : ""}${tooltip.day.pnl.toFixed(2)}</span>}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 10, color: "var(--text-muted)", flexWrap: "wrap" }}>
        {[["GO", "var(--green)"], ["CAUTION", "var(--amber)"], ["NO-TRADE", "var(--red)"]].map(([label, color]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block", opacity: 0.85 }} /> {label}
          </span>
        ))}
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--surface3)", display: "inline-block", opacity: 0.4 }} /> No check-in</span>
      </div>
    </div>
  );
}

function MentalStatePerformanceCard({ data }: { data: AnalyticsData["scoreRangePerformance"] }) {
  const ranges = [
    { key: "high" as const, color: "var(--green)", borderColor: "rgba(0,232,122,0.2)", bg: "rgba(0,232,122,0.04)" },
    { key: "mid" as const, color: "var(--amber)", borderColor: "rgba(255,176,32,0.2)", bg: "rgba(255,176,32,0.04)" },
    { key: "low" as const, color: "var(--red)", borderColor: "rgba(255,59,92,0.2)", bg: "rgba(255,59,92,0.04)" },
  ];

  const highWr = data.high.winRate;
  const lowWr = data.low.winRate;
  const diff = highWr !== null && lowWr !== null ? highWr - lowWr : null;

  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8 }}>PERFORMANCE BY MENTAL STATE</h3>
      {diff !== null && diff > 0 && (
        <div style={{ fontSize: 13, color: "var(--green)", marginBottom: 16, padding: "8px 14px", background: "rgba(0,232,122,0.06)", borderRadius: 8, border: "1px solid rgba(0,232,122,0.15)" }}>
          You win <strong>{diff}%</strong> more trades on GO days vs NO-TRADE days
        </div>
      )}
      <div className="analytics-verdict-grid">
        {ranges.map(({ key, color, borderColor, bg }) => {
          const r = data[key];
          return (
            <div key={key} style={{ padding: "18px 14px", borderRadius: 12, background: bg, border: `1px solid ${borderColor}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color, marginBottom: 10 }}>{r.label}</div>
              <div className="font-bebas" style={{ fontSize: 36, color, lineHeight: 1, marginBottom: 4 }}>
                {r.winRate !== null ? `${r.winRate}%` : "—"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>WIN RATE</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>{r.trades} trades</div>
              {r.avgPnl !== null && (
                <div style={{ fontSize: 12, fontWeight: 700, color: r.avgPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                  avg {r.avgPnl >= 0 ? "+" : ""}${Math.abs(r.avgPnl).toFixed(2)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BestDaysCard({ data }: { data: DayOfWeekEntry[] }) {
  const maxWr = Math.max(...data.map((d) => d.winRate ?? 0), 1);
  const bestDay = data.reduce<DayOfWeekEntry | null>((best, d) => {
    if (d.winRate === null) return best;
    if (best === null || (best.winRate ?? -1) < d.winRate) return d;
    return best;
  }, null);

  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 20 }}>BEST DAYS TO TRADE</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d) => {
          const isBest = bestDay?.day === d.day && d.winRate !== null;
          const barPct = d.winRate !== null ? (d.winRate / maxWr) * 100 : 0;
          const barColor = (d.winRate ?? 0) >= 50 ? "var(--green)" : "var(--red)";
          return (
            <div key={d.day} style={{
              padding: "12px 16px", borderRadius: 10,
              background: isBest ? "rgba(0,232,122,0.04)" : "var(--surface2)",
              border: isBest ? "1px solid rgba(0,232,122,0.2)" : "1px solid transparent",
              boxShadow: isBest ? "0 0 16px rgba(0,232,122,0.1)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 36, fontSize: 12, fontWeight: 700, color: isBest ? "var(--green)" : "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  {d.day}
                  {isBest && <svg width="9" height="9" viewBox="0 0 9 9" fill="var(--green)"><path d="M4.5 1l.9 2.1 2.1.2-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L1.5 3.3l2.1-.2z"/></svg>}
                </div>
                <div style={{ flex: 1, height: 8, background: "var(--surface3)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: barColor, width: 40, textAlign: "right", flexShrink: 0 }}>
                  {d.winRate !== null ? `${d.winRate}%` : "—"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text-muted)", paddingLeft: 48 }}>
                <span>{d.trades} trades</span>
                {d.avgPnl !== null && (
                  <span style={{ color: d.avgPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                    avg {d.avgPnl >= 0 ? "+" : ""}${Math.abs(d.avgPnl).toFixed(2)}
                  </span>
                )}
                {d.avgScore !== null && (
                  <span>score avg <strong style={{ color: scoreColor(d.avgScore) }}>{d.avgScore}</strong></span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BehavioralPatternsCard({ data }: { data: BehavioralPatterns }) {
  const anyDetected = data.revengeTrading.detected || data.fomoTrades.detected || data.overtradingDays.detected;

  if (!anyDetected) {
    return (
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>BEHAVIORAL PATTERNS</h3>
        <div style={{ padding: "18px 20px", borderRadius: 12, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "var(--green)" }}><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M7 11l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--green)", marginBottom: 2 }}>No harmful patterns detected this period</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Keep up the disciplined execution.</div>
          </div>
        </div>
      </div>
    );
  }

  type PatternItem = { label: string; icon: React.ReactNode; description: string; severity: "amber" | "red"; detected: boolean };

  const patterns: PatternItem[] = ([
    {
      label: "Revenge Trading",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 10a6 6 0 1012 0 6 6 0 00-12 0" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/><path d="M10 3L7 6M10 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      description: data.revengeTrading.description,
      severity: data.revengeTrading.days >= 5 ? "red" : "amber",
      detected: data.revengeTrading.detected,
    },
    {
      label: "FOMO Trades",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.5 4.5H16l-3.7 2.7 1.4 4.3L10 11l-3.7 2.5 1.4-4.3L4 6.5h4.5L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
      description: `${data.fomoTrades.count} trade${data.fomoTrades.count !== 1 ? "s" : ""} entered with high excitement resulted in losses.`,
      severity: "amber",
      detected: data.fomoTrades.detected,
    },
    {
      label: "Overtrading",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 14l3.5-5 3 3 4-7 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
      description: `${data.overtradingDays.days} day${data.overtradingDays.days !== 1 ? "s" : ""} where you exceeded 3 trades.`,
      severity: "amber",
      detected: data.overtradingDays.detected,
    },
  ] as PatternItem[]).filter((p) => p.detected);

  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>BEHAVIORAL PATTERNS</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {patterns.map((p) => {
          const c = p.severity === "red" ? "var(--red)" : "var(--amber)";
          const bg = p.severity === "red" ? "rgba(255,59,92,0.05)" : "rgba(255,176,32,0.05)";
          const border = p.severity === "red" ? "rgba(255,59,92,0.2)" : "rgba(255,176,32,0.2)";
          return (
            <div key={p.label} style={{ padding: "16px 20px", borderRadius: 12, background: bg, border: `1px solid ${border}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0, display: "flex", alignItems: "center", color: c }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{p.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 4, background: c, color: "#000" }}>
                    {p.severity.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{p.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CohortBenchmarkCard({ data }: { data: BenchmarkData }) {
  if (data.insufficient) return null;

  const percentileLabel =
    data.percentile >= 90 ? "Top 10%" :
    data.percentile >= 75 ? "Top 25%" :
    data.percentile >= 50 ? "Above Average" :
    data.percentile >= 25 ? "Below Average" : "Bottom 25%";

  const percentileColor =
    data.percentile >= 75 ? "var(--green)" :
    data.percentile >= 50 ? "var(--blue)" :
    data.percentile >= 25 ? "var(--amber)" : "var(--red)";

  const metrics = [
    {
      label: "Avg Mental Score",
      you: data.userAvg,
      community: data.communityAvg,
      suffix: "/100",
      higherIsBetter: true,
    },
    {
      label: "Consistency Rate",
      you: data.userCheckinRate,
      community: data.communityCheckinRate,
      suffix: "%",
      higherIsBetter: true,
    },
    {
      label: "GO Day Rate",
      you: data.userGoRate,
      community: data.communityGoRate,
      suffix: "%",
      higherIsBetter: true,
    },
  ];

  return (
    <div className="card" style={{ padding: 24, marginBottom: 20, border: "1px solid rgba(94,106,210,0.15)", background: "rgba(94,106,210,0.02)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>YOU VS COMMUNITY</h3>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{data.totalUsers.toLocaleString()} traders</div>
      </div>

      {/* Percentile hero */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 20px", borderRadius: 12, background: `${percentileColor}10`, border: `1px solid ${percentileColor}30`, marginBottom: 20 }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div className="font-bebas" style={{ fontSize: 52, lineHeight: 1, color: percentileColor }}>{data.percentile}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>PERCENTILE</div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: percentileColor, marginBottom: 4 }}>{percentileLabel}</div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0, lineHeight: 1.6 }}>
            {data.percentile >= 75
              ? "You're outperforming most traders on mental consistency. Keep the discipline."
              : data.percentile >= 50
              ? "You're above average. A few more consistent weeks will move you into the top quartile."
              : "Room to grow. The traders ahead of you are checking in more consistently and scoring higher."}
          </p>
        </div>
      </div>

      {/* Metric comparisons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {metrics.map((m) => {
          const youBetter = m.higherIsBetter ? m.you >= m.community : m.you <= m.community;
          const diff = Math.abs(m.you - m.community);
          return (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, letterSpacing: "0.06em" }}>{m.label.toUpperCase()}</span>
                <span style={{ color: youBetter ? "var(--green)" : "var(--red)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">{youBetter ? <path d="M4 1l3.5 6H.5z"/> : <path d="M4 7L.5 1h7z"/>}</svg>
                  {diff}{m.suffix} vs avg
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{ height: 6, background: "var(--surface3)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, m.you)}%`, background: youBetter ? "var(--green)" : "var(--red)", borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ position: "absolute", top: "50%", left: `${Math.min(100, m.community)}%`, transform: "translate(-50%,-50%)", width: 2, height: 12, background: "var(--text-muted)", borderRadius: 1 }} />
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12, flexShrink: 0 }}>
                  <span style={{ color: youBetter ? "var(--green)" : "var(--red)", fontWeight: 700 }}>You: {m.you}{m.suffix}</span>
                  <span style={{ color: "var(--text-muted)" }}>Avg: {m.community}{m.suffix}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopInsightCard({ data }: { data: AnalyticsData }) {
  const go = data.scoreRangePerformance?.high;
  const low = data.scoreRangePerformance?.low;
  const goWr = go?.winRate;
  const lowWr = low?.winRate;

  type Insight = { icon: React.ReactNode; text: string; color: string; bg: string; border: string };

  const insights: Insight[] = [];

  if (goWr !== null && lowWr !== null && goWr !== undefined && lowWr !== undefined && go.trades >= 3 && low.trades >= 3) {
    const diff = goWr - lowWr;
    if (diff >= 15) {
      insights.push({
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>,
        text: `You win ${goWr}% of trades on GO days — but only ${lowWr}% on NO-TRADE days. That's a ${diff}% edge you're leaving on the table every time you override the signal.`,
        color: "var(--green)",
        bg: "rgba(0,232,122,0.05)",
        border: "rgba(0,232,122,0.2)",
      });
    }
  }

  if (data.tradedOnNoTradeDayCount >= 3 && data.totalPnl < 0) {
    insights.push({
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4L22 20H2L12 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 10v4M12 17v1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      text: `You've traded ${data.tradedOnNoTradeDayCount} times on NO-TRADE days. Based on your patterns, sitting those out would have significantly improved your overall P&L.`,
      color: "var(--red)",
      bg: "rgba(255,59,92,0.05)",
      border: "rgba(255,59,92,0.2)",
    });
  }

  if (data.estimatedSaved > 0 && data.respectedNoTradeCount >= 3) {
    insights.push({
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.4 8.7-8 10-4.6-1.3-8-5.5-8-10V7l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8.5 12l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      text: `You've respected your NO-TRADE signal ${data.respectedNoTradeCount} times — saving an estimated $${data.estimatedSaved.toLocaleString()} in losses. That discipline is worth more than any single win.`,
      color: "var(--blue)",
      bg: "rgba(94,106,210,0.05)",
      border: "rgba(94,106,210,0.2)",
    });
  }

  const bestDay = data.byDayOfWeek?.reduce<DayOfWeekEntry | null>((best, d) => {
    if (d.winRate === null || d.trades < 3) return best;
    if (!best || (best.winRate ?? -1) < d.winRate) return d;
    return best;
  }, null);

  if (bestDay && (bestDay.winRate ?? 0) >= 60) {
    insights.push({
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 2v3M8 2v3M3 9h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
      text: `${bestDay.day} is your best day — ${bestDay.winRate}% win rate across ${bestDay.trades} trades. Stack your best setups on your strongest days.`,
      color: "var(--amber)",
      bg: "rgba(255,176,32,0.05)",
      border: "rgba(255,176,32,0.2)",
    });
  }

  if (insights.length === 0) return null;

  const top = insights[0];
  return (
    <div style={{ padding: "18px 22px", marginBottom: 20, borderRadius: 14, background: top.bg, border: `1px solid ${top.border}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ color: top.color, flexShrink: 0, lineHeight: 1.2 }}>{top.icon}</span>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: top.color, marginBottom: 6 }}>YOUR TOP INSIGHT</div>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>{top.text}</p>
      </div>
    </div>
  );
}

function PremiumUpsell() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <div style={{ textAlign: "center" }}>
          <span className="font-bebas" style={{ fontSize: 20, letterSpacing: "0.05em", display: "block", lineHeight: 1.1 }}>ANALYTICS</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>YOUR EDGE IN DATA</span>
        </div>
        <div style={{ width: 80 }} />
      </div>
      <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center", color: "var(--blue)" }}><svg width="56" height="56" viewBox="0 0 56 56" fill="none"><path d="M8 42l12-16 10 10 14-24 10 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 48h40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></div>
        <div className="font-bebas" style={{ fontSize: 44, lineHeight: 1, marginBottom: 12 }}>Deep Analytics</div>
        <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 32 }}>
          See your mental score trend, P&L correlation, 90-day calendar, and estimated losses you avoided — the data no other tool shows.
        </p>
        <div className="card" style={{ padding: 28, marginBottom: 24, border: "1px solid rgba(94,106,210,0.25)", background: "rgba(94,106,210,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#8B5CF6", marginBottom: 16 }}>TRADEMIND INCLUDES</div>
          {["Mental score trend (30/90 day)", "Psychology vs P&L correlation chart", "90-day calendar heatmap", "Estimated saved losses counter", "Discipline % and streak tracking", "AI Coach Alex, broker sync & behavioral pattern detection"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14, color: "var(--text-dim)", textAlign: "left" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--green)", flexShrink: 0 }}><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {f}
            </div>
          ))}
          <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="font-bebas" style={{ fontSize: 48 }}>$39</span>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>/month • 7-day trial • Cancel anytime</span>
          </div>
        </div>
        <Link href="/settings"><button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }}>Start Free Trial — 7 Days Free →</button></Link>
      </div>
      <BottomNav />
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [trendRange, setTrendRange] = useState<30 | 90>(30);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/login"; return null; }
        if (r.status === 403) { setIsPremium(false); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setIsPremium(true);
        setData(d);
        fetch("/api/benchmarks").then((r) => r.json()).then((b) => setBenchmarks(b)).catch(() => {});
      })
      .catch(() => { setNetworkError(true); setIsPremium(true); })
      .finally(() => setLoading(false));
  }, []);

  if (isPremium === false) return <PremiumUpsell />;

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          .analytics-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
          .analytics-verdict-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
          @media(max-width:600px){
            .analytics-kpi-grid { grid-template-columns:repeat(2,1fr); }
            .analytics-verdict-grid { grid-template-columns:1fr; }
          }
        `}</style>
        <div className="app-header">
          <Skeleton width={100} height={24} />
          <Skeleton width={80} height={16} />
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
          <div className="analytics-kpi-grid">
            {[0,1,2,3].map((i) => <SkeletonStat key={i} />)}
          </div>
          <SkeletonCard rows={4} style={{ marginBottom: 20, padding: 24 }} />
          <SkeletonCard rows={3} style={{ marginBottom: 20, padding: 24 }} />
          <SkeletonCard rows={5} style={{ marginBottom: 20, padding: 24 }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!data || data.totalCheckins === 0) {
    const checkins = data?.totalCheckins ?? 0;
    const milestones = [
      { at: 3,  label: "Score trend chart",         done: checkins >= 3  },
      { at: 7,  label: "Behavioral pattern detection", done: checkins >= 7  },
      { at: 14, label: "Psychology vs P&L correlation", done: checkins >= 14 },
      { at: 30, label: "Full 30-day heatmap + AI insights", done: checkins >= 30 },
    ];
    const nextMilestone = milestones.find(m => !m.done);
    const progressPct = nextMilestone ? Math.round((checkins / nextMilestone.at) * 100) : 100;

    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
        <div className="app-header">
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" height="28" style={{ display: "block" }} />
          </Link>
          <span className="font-bebas" style={{ fontSize: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>ANALYTICS</span>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 120px" }}>

          {/* Progress header */}
          <div className="card" style={{ padding: "28px 24px", marginBottom: 20, border: "1px solid rgba(94,106,210,0.2)", background: "linear-gradient(135deg, rgba(94,106,210,0.05), var(--surface))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
              <div>
                <div className="font-bebas" style={{ fontSize: 36, color: "var(--blue)", lineHeight: 1 }}>{checkins} / {nextMilestone?.at ?? 30}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>check-ins completed</div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  {nextMilestone ? `${nextMilestone.at - checkins} more to unlock: ${nextMilestone.label}` : "All patterns unlocked"}
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "var(--blue)", width: `${progressPct}%`, transition: "width 0.6s ease", boxShadow: "0 0 8px rgba(94,106,210,0.6)" }} />
                </div>
              </div>
            </div>
            <Link href="/checkin">
              <button className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: 15 }}>
                {checkins === 0 ? "Do your first check-in →" : "Check in now →"}
              </button>
            </Link>
          </div>

          {/* Milestone unlock list */}
          <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 16 }}>WHAT YOU&apos;LL UNLOCK</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {milestones.map((m, i) => (
                <div key={m.at} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < milestones.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.done ? "rgba(0,232,122,0.12)" : "var(--surface2)", border: `1px solid ${m.done ? "rgba(0,232,122,0.3)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {m.done
                      ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l2.5 2.5 5.5-5.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span className="font-bebas" style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1 }}>{m.at}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: m.done ? "var(--text)" : "var(--text-dim)" }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{m.at} check-ins required</div>
                  </div>
                  {!m.done && checkins > 0 && (
                    <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700 }}>{m.at - checkins} left</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ghost preview of what's coming */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.4 }}>
              {/* Ghost score trend */}
              <div className="card" style={{ padding: 24, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 16 }}>MENTAL SCORE TREND</div>
                <svg viewBox="0 0 600 120" style={{ width: "100%", height: "auto" }}>
                  <path d="M16 88 L80 55 L140 72 L200 40 L260 58 L320 30 L380 48 L440 25 L500 42 L584 35" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 88 L80 55 L140 72 L200 40 L260 58 L320 30 L380 48 L440 25 L500 42 L584 35 L584 104 L16 104 Z" fill="url(#previewGrad)" opacity="0.3"/>
                  <defs><linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--blue)" stopOpacity="0.4"/><stop offset="100%" stopColor="var(--blue)" stopOpacity="0"/></linearGradient></defs>
                </svg>
              </div>
              {/* Ghost verdict breakdown */}
              <div className="card" style={{ padding: 24, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 16 }}>VERDICT BREAKDOWN</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[["GO","var(--green)","68%"],["CAUTION","var(--amber)","24%"],["NO-TRADE","var(--red)","8%"]].map(([l,c,v]) => (
                    <div key={l} style={{ textAlign: "center", padding: "16px 8px", borderRadius: 12, background: "var(--surface2)" }}>
                      <div className="font-bebas" style={{ fontSize: 28, color: c, lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Lock overlay */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "rgba(7,11,20,0.85)", backdropFilter: "blur(2px)", borderRadius: 16, padding: "20px 28px", textAlign: "center", border: "1px solid var(--border)" }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ marginBottom: 8 }}><rect x="7" y="12" width="14" height="11" rx="2" stroke="var(--text-muted)" strokeWidth="1.5"/><path d="M10 12V9a4 4 0 018 0v3" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Unlocks at {nextMilestone?.at ?? 3} check-ins</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{nextMilestone ? `${nextMilestone.at - checkins} more to go` : "Keep going"}</div>
              </div>
            </div>
          </div>

        </div>
        <BottomNav />
      </div>
    );
  }

  const total = data.verdictCounts.GO + data.verdictCounts.CAUTION + data.verdictCounts["NO-TRADE"];
  const goPct = total > 0 ? Math.round((data.verdictCounts.GO / total) * 100) : 0;
  const cautionPct = total > 0 ? Math.round((data.verdictCounts.CAUTION / total) * 100) : 0;
  const noTradePct = total > 0 ? Math.round((data.verdictCounts["NO-TRADE"] / total) * 100) : 0;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">

      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <span className="font-bebas" style={{ fontSize: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>ANALYTICS</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Network error banner */}
        {networkError && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.25)", marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><circle cx="7" cy="7" r="6" stroke="var(--red)" strokeWidth="1.3"/><path d="M7 4v3.5M7 10v.5" stroke="var(--red)" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 13, color: "var(--text-dim)", flex: 1 }}>Couldn&apos;t load analytics — check your connection and <button onClick={() => { setNetworkError(false); window.location.reload(); }} style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13 }}>retry</button></span>
            <button onClick={() => setNetworkError(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
          </div>
        )}

        {/* Top KPI row */}
        <div className="analytics-kpi-grid">
          {[
            { label: "TOTAL CHECK-INS", value: data.totalCheckins, color: "var(--blue)" },
            { label: "AVG SCORE", value: data.avgScore ?? "—", color: scoreColor(data.avgScore), suffix: data.avgScore ? "/100" : "" },
            { label: "CURRENT STREAK", value: data.currentStreak > 0 ? `${data.currentStreak}` : "—", color: data.currentStreak >= 3 ? "var(--amber)" : "var(--text-muted)" },
            { label: "DISCIPLINE", value: `${data.disciplinePct}%`, color: data.disciplinePct >= 80 ? "var(--green)" : data.disciplinePct >= 50 ? "var(--amber)" : "var(--red)" },
          ].map((kpi) => (
            <div key={kpi.label} className="card" style={{ padding: "16px 12px", textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 26, color: kpi.color, lineHeight: 1, marginBottom: 4 }}>
                {kpi.value}{kpi.suffix ?? ""}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.06em", lineHeight: 1.3 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Top Insight */}
        <TopInsightCard data={data} />

        {/* Cohort Benchmarks */}
        {benchmarks && !benchmarks.insufficient && (
          <CohortBenchmarkCard data={benchmarks} />
        )}

        {/* Estimated saved losses — hero card */}
        {data.estimatedSaved > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 20, background: "linear-gradient(135deg, rgba(0,232,122,0.06), rgba(0,232,122,0.02))", border: "1px solid rgba(0,232,122,0.2)", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--green)", marginBottom: 8 }}>ESTIMATED LOSSES AVOIDED</div>
              <div className="font-bebas" style={{ fontSize: 48, color: "var(--green)", lineHeight: 1, textShadow: "0 0 30px rgba(0,232,122,0.4)" }}>
                +${data.estimatedSaved.toLocaleString()}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginTop: 8 }}>
                You respected your NO-TRADE signal on <strong>{data.respectedNoTradeCount}</strong> {data.respectedNoTradeCount === 1 ? "day" : "days"}. Based on your average loss when trading with a low score, that&apos;s roughly ${data.estimatedSaved.toLocaleString()} saved.
              </p>
            </div>
            {data.tradedOnNoTradeDayCount > 0 && (
              <div className="card" style={{ padding: 16, minWidth: 140, textAlign: "center", border: "1px solid rgba(255,59,92,0.2)", background: "rgba(255,59,92,0.04)" }}>
                <div className="font-bebas" style={{ fontSize: 32, color: "var(--red)", lineHeight: 1 }}>{data.tradedOnNoTradeDayCount}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: 4 }}>DAYS IGNORED<br />NO-TRADE</div>
              </div>
            )}
          </div>
        )}

        {/* Score trend */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>MENTAL SCORE TREND</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {([30, 90] as const).map((r) => (
                <button key={r} onClick={() => setTrendRange(r)}
                  style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${trendRange === r ? "var(--blue)" : "var(--border)"}`, background: trendRange === r ? "rgba(94,106,210,0.1)" : "transparent", color: trendRange === r ? "var(--blue)" : "var(--text-muted)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                  {r}D
                </button>
              ))}
            </div>
          </div>
          <ScoreLineChart data={data.scoreTrend} range={trendRange} />
        </div>

        {/* Verdict breakdown */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 20 }}>VERDICT BREAKDOWN</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "GO", count: data.verdictCounts.GO, pct: goPct, color: "var(--green)" },
              { label: "CAUTION", count: data.verdictCounts.CAUTION, pct: cautionPct, color: "var(--amber)" },
              { label: "NO-TRADE", count: data.verdictCounts["NO-TRADE"], pct: noTradePct, color: "var(--red)" },
            ].map((v) => (
              <div key={v.label} style={{ textAlign: "center", padding: "16px 8px", borderRadius: 12, background: "var(--surface2)", border: `1px solid ${v.color}20` }}>
                <div className="font-bebas" style={{ fontSize: 32, color: v.color, lineHeight: 1 }}>{v.pct}%</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: v.color, lineHeight: 1, marginTop: 2 }}>{v.count}</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.08em", marginTop: 4 }}>{v.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 8, borderRadius: 4, overflow: "hidden", display: "flex" }}>
            <div style={{ flex: goPct, background: "var(--green)", transition: "flex 0.5s" }} />
            <div style={{ flex: cautionPct, background: "var(--amber)", transition: "flex 0.5s" }} />
            <div style={{ flex: noTradePct, background: "var(--red)", transition: "flex 0.5s" }} />
          </div>
        </div>

        {/* Mental P&L Calculator */}
        <div className="card" style={{ padding: 24, marginBottom: 20, border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>MENTAL P&L CALCULATOR</h3>
            <span style={{ fontSize: 10, background: "rgba(139,92,246,0.12)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>TRADEMIND</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
            What is your mental state actually costing you — or earning you — in real dollars?
          </p>
          <MentalPnL />
        </div>

        {/* P&L Correlation */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>PSYCHOLOGY vs PERFORMANCE</h3>
            {data.winRate !== null && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Win rate: <strong style={{ color: data.winRate >= 50 ? "var(--green)" : "var(--red)" }}>{data.winRate}%</strong></span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
            Dots = mental score (top zone). Bars = P&L that day. Correlation reveals your psychological edge.
          </p>
          <CorrelationChart data={data.correlation} />
          {data.totalPnl !== 0 && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "var(--surface2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total journaled P&L</span>
              <span className="font-bebas" style={{ fontSize: 22, color: data.totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                {data.totalPnl >= 0 ? "+" : ""}${Math.abs(data.totalPnl).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Calendar heatmap */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>90-DAY CONSISTENCY</h3>
          <CalendarHeatmap days={data.calendarDays} />
          <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 28, color: "var(--amber)" }}>{data.longestStreak}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>LONGEST STREAK</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 28, color: "var(--blue)" }}>{data.totalCheckins}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>TOTAL CHECK-INS</div>
            </div>
            {data.avg30 !== null && (
              <div style={{ textAlign: "center" }}>
                <div className="font-bebas" style={{ fontSize: 28, color: scoreColor(data.avg30) }}>{data.avg30}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>30-DAY AVG</div>
              </div>
            )}
          </div>
        </div>

        {/* NEW: Performance by Mental State */}
        {data.scoreRangePerformance && <MentalStatePerformanceCard data={data.scoreRangePerformance} />}

        {/* NEW: Best Days to Trade */}
        {data.byDayOfWeek && data.byDayOfWeek.some((d) => d.trades > 0) && (
          <BestDaysCard data={data.byDayOfWeek} />
        )}

        {/* NEW: Behavioral Patterns */}
        {data.behavioralPatterns && <BehavioralPatternsCard data={data.behavioralPatterns} />}

        {/* CTA: Playbook */}
        <div className="card" style={{ padding: 24, textAlign: "center", border: "1px solid rgba(94,106,210,0.2)", background: "rgba(94,106,210,0.03)" }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "var(--blue)" }}><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M11 11h10M11 16h10M11 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Define Your Trading Rules</div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20 }}>
            Write your entry rules, exit criteria, and risk limits. TradeMind will show them to you before every check-in.
          </p>
          <Link href="/playbook">
            <button className="btn-primary" style={{ fontSize: 14, padding: "12px 28px" }}>Open Playbook →</button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}