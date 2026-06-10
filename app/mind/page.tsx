"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Bucket = { label: string; count: number; avgPnl: number | null; winRate: number | null };
type ScorePoint = { date: string; score: number; pnl: number; verdict: string };

type MindData = {
  sleepVsPnl: Bucket[];
  sleepHrsVsPnl: Bucket[];
  caffeineVsPnl: Bucket[];
  exerciseVsPnl: Bucket[];
  alcoholVsPnl: Bucket[];
  mentalVsWinRate: Bucket[];
  scoreVsPnl: ScorePoint[];
  insights: string[];
  totalDays: number;
  daysWithTrades: number;
};

function pnlColor(v: number | null) {
  if (v === null) return "var(--text-muted)";
  return v >= 0 ? "#00E87A" : "#FF3B5C";
}

function BarChart({ buckets, metricKey }: { buckets: Bucket[]; metricKey: "avgPnl" | "winRate" }) {
  const values = buckets.map((b) => b[metricKey] ?? 0);
  const max = Math.max(...values.map(Math.abs), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {buckets.map((b) => {
        const val = b[metricKey];
        const pct = val !== null ? (Math.abs(val) / max) * 100 : 0;
        const positive = val !== null && val >= 0;
        const color = metricKey === "avgPnl" ? pnlColor(val) : "#60A5FA";

        return (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 110, fontSize: 11, color: "var(--text-dim)", textAlign: "right", flexShrink: 0 }}>{b.label}</div>
            <div style={{ flex: 1, position: "relative", height: 20, background: "var(--surface3)", borderRadius: 4, overflow: "hidden" }}>
              {val !== null && (
                <div style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: metricKey === "avgPnl" ? (positive ? "50%" : `${50 - pct / 2}%`) : 0,
                  width: metricKey === "avgPnl" ? `${pct / 2}%` : `${pct}%`,
                  background: color, borderRadius: 4,
                }} />
              )}
            </div>
            <div style={{ width: 56, fontSize: 11, fontWeight: 700, color: color, flexShrink: 0, textAlign: "right" }}>
              {val === null ? "—" : metricKey === "avgPnl" ? `${val >= 0 ? "+" : ""}$${val}` : `${val}%`}
            </div>
            <div style={{ width: 30, fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>n={b.count}</div>
          </div>
        );
      })}
    </div>
  );
}

function ScatterPlot({ points }: { points: ScorePoint[] }) {
  if (points.length === 0) return <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>No data yet</div>;

  const maxPnl = Math.max(...points.map((p) => Math.abs(p.pnl)), 1);

  return (
    <div style={{ position: "relative", height: 180, width: "100%", marginTop: 8 }}>
      {/* Axes */}
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border)", opacity: 0.4 }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--border)", opacity: 0.4 }} />

      {/* Points */}
      {points.map((p, i) => {
        const x = (p.score / 100) * 100;
        const y = 50 - (p.pnl / maxPnl) * 45;
        const color = p.verdict === "GO" ? "#00E87A" : p.verdict === "CAUTION" ? "#F59E0B" : "#FF3B5C";

        return (
          <div
            key={i}
            title={`${p.date}: Score ${p.score}, P&L $${p.pnl.toFixed(0)}`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${Math.max(2, Math.min(96, y))}%`,
              width: 7, height: 7,
              borderRadius: "50%",
              background: color,
              opacity: 0.75,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* Labels */}
      <div style={{ position: "absolute", bottom: -18, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--text-muted)" }}>
        <span>Score 0</span><span>50</span><span>100</span>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, right: -28, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 9, color: "var(--text-muted)", textAlign: "right" }}>
        <span>+</span><span>0</span><span>−</span>
      </div>
    </div>
  );
}

function InsightCard({ text }: { text: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(99,102,241,0.06) 100%)",
      border: "1px solid rgba(96,165,250,0.2)",
      borderRadius: 10, padding: "10px 14px",
      fontSize: 13, color: "var(--text)", lineHeight: 1.5,
    }}>
      <span style={{ marginRight: 6, fontSize: 15 }}>💡</span>{text}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14, padding: "16px 16px 18px",
      marginBottom: 14,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

export default function MindPage() {
  const [data, setData] = useState<MindData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"avgPnl" | "winRate">("avgPnl");

  useEffect(() => {
    fetch("/api/mind")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 0" }}>
        <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>← Dashboard</Link>
        <h1 style={{ margin: "8px 0 2px", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Mental Patterns</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>How your lifestyle affects your trading performance</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 14 }}>Loading patterns...</div>
        )}

        {!loading && !data && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 14 }}>
            Could not load data. Make sure you have logged check-ins and trades.
          </div>
        )}

        {data && data.totalDays === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>No patterns yet</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              Complete at least one morning check-in and log a trade to start seeing how your lifestyle affects your performance.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/checkin">
                <button className="btn-primary" style={{ width: "100%", padding: "12px 24px" }}>Do your first check-in →</button>
              </Link>
              <Link href="/journal">
                <button style={{ width: "100%", padding: "12px 24px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Log a trade →</button>
              </Link>
            </div>
          </div>
        )}

        {data && data.totalDays > 0 && (
          <>
            {/* Stats bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Check-in Days", val: data.totalDays },
                { label: "Trading Days", val: data.daysWithTrades },
                { label: "Data Points", val: Math.min(data.totalDays, data.daysWithTrades) },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Insights */}
            {data.insights.length > 0 && (
              <Section title="Key Insights">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.insights.map((ins, i) => <InsightCard key={i} text={ins} />)}
                </div>
              </Section>
            )}

            {/* Metric toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["avgPnl", "winRate"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                    background: tab === k ? "var(--blue)" : "var(--surface2)",
                    color: tab === k ? "#fff" : "var(--text-dim)",
                  }}
                >
                  {k === "avgPnl" ? "Avg P&L" : "Win Rate"}
                </button>
              ))}
            </div>

            {/* Mental score buckets */}
            <Section title="Mental Score vs Performance">
              <BarChart buckets={data.mentalVsWinRate} metricKey={tab} />
            </Section>

            {/* Sleep quality */}
            <Section title="Sleep Quality vs Performance">
              <BarChart buckets={data.sleepVsPnl} metricKey={tab} />
            </Section>

            {/* Sleep hours */}
            <Section title="Sleep Hours vs Performance">
              <BarChart buckets={data.sleepHrsVsPnl} metricKey={tab} />
            </Section>

            {/* Caffeine */}
            <Section title="Caffeine Level vs Performance">
              <BarChart buckets={data.caffeineVsPnl} metricKey={tab} />
            </Section>

            {/* Exercise */}
            <Section title="Exercise vs No Exercise">
              <BarChart buckets={data.exerciseVsPnl} metricKey={tab} />
            </Section>

            {/* Alcohol */}
            <Section title="Alcohol in Last 24h vs Performance">
              <BarChart buckets={data.alcoholVsPnl} metricKey={tab} />
            </Section>

            {/* Score vs P&L scatter */}
            <Section title="Score × P&L Scatter">
              <p style={{ margin: "0 0 16px", fontSize: 11, color: "var(--text-muted)" }}>Each dot = one trading day. X-axis: mental score. Y-axis: P&L.</p>
              <ScatterPlot points={data.scoreVsPnl} />
              <div style={{ marginTop: 24, display: "flex", gap: 14, justifyContent: "center" }}>
                {[["GO", "#00E87A"], ["CAUTION", "#F59E0B"], ["NO-TRADE", "#FF3B5C"]].map(([v, c]) => (
                  <div key={v} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-muted)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    {v}
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}