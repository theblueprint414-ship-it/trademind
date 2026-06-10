"use client";

import React, { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { showToast } from "@/components/Toast";

type Stats = {
  trades: number;
  totalPnl: number;
  netPnl: number;
  winRate: number | null;
  profitFactor: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  avgR: number | null;
  maxDrawdown: number;
  equityCurve: { date: string; cumPnl: number }[];
};

type BacktestResult = {
  original: Stats;
  simulated: Stats;
  skipped: number;
  skippedPnl: number;
  reasons: Record<string, string[]>;
};

type Rule =
  | { type: "min_score"; value: number }
  | { type: "daily_loss_limit"; value: number }
  | { type: "max_trades_per_day"; value: number }
  | { type: "min_confidence"; value: number }
  | { type: "sessions"; values: string[] }
  | { type: "market_conditions"; values: string[] }
  | { type: "setups"; values: string[] }
  | { type: "sides"; values: string[] }
  | { type: "asset_types"; values: string[] }
  | { type: "timeframes"; values: string[] }
  | { type: "max_loss_per_trade"; value: number };

const PRESETS: { label: string; desc: string; rules: Rule[] }[] = [
  {
    label: "Only GO days",
    desc: "Skip all trades when mental score < 70",
    rules: [{ type: "min_score", value: 70 }],
  },
  {
    label: "No NO-TRADE days",
    desc: "Skip trades when score < 45",
    rules: [{ type: "min_score", value: 45 }],
  },
  {
    label: "Daily $200 stop",
    desc: "Stop trading on a day once you lose $200",
    rules: [{ type: "daily_loss_limit", value: 200 }],
  },
  {
    label: "Max 3 trades/day",
    desc: "Cap at 3 trades per day",
    rules: [{ type: "max_trades_per_day", value: 3 }],
  },
  {
    label: "High conviction only",
    desc: "Only trade when conviction ≥ 7",
    rules: [{ type: "min_confidence", value: 7 }],
  },
  {
    label: "London + NY only",
    desc: "Only trade in London or New York session",
    rules: [{ type: "sessions", values: ["london", "new_york", "overlap_london_ny"] }],
  },
];

function EquityCurveCompare({ original, simulated }: { original: { date: string; cumPnl: number }[]; simulated: { date: string; cumPnl: number }[] }) {
  if (original.length < 2) return null;

  const allDates = Array.from(new Set([...original.map((d) => d.date), ...simulated.map((d) => d.date)])).sort();
  const allValues = [...original.map((d) => d.cumPnl), ...simulated.map((d) => d.cumPnl), 0];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const W = 600; const H = 160; const PAD = 16;

  function buildPath(curve: { date: string; cumPnl: number }[]) {
    if (curve.length < 2) return "";
    const pts = curve.map((d, i) => {
      const xi = allDates.indexOf(d.date);
      const x = PAD + (xi / (allDates.length - 1)) * (W - PAD * 2);
      const y = PAD + (1 - (d.cumPnl - minVal) / range) * (H - PAD * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return pts.join(" ");
  }

  const zeroY = PAD + (1 - (0 - minVal) / range) * (H - PAD * 2);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 11, color: "var(--text-muted)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 16, height: 2, background: "rgba(94,106,210,0.5)", display: "inline-block", borderRadius: 1 }} /> Original
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 16, height: 2, background: "var(--green)", display: "inline-block", borderRadius: 1 }} /> Simulated
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
        {/* Zero line */}
        {zeroY >= PAD && zeroY <= H - PAD && (
          <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        )}
        {/* Original curve */}
        <path d={buildPath(original)} fill="none" stroke="rgba(94,106,210,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Simulated curve */}
        <path d={buildPath(simulated)} fill="none" stroke={simulated[simulated.length - 1]?.cumPnl >= 0 ? "var(--green)" : "var(--red)"} strokeWidth="2" />
      </svg>
    </div>
  );
}

function StatDelta({ label, orig, sim, format = "dollar", lowerIsBetter = false }: {
  label: string;
  orig: number | null;
  sim: number | null;
  format?: "dollar" | "pct" | "ratio" | "number";
  lowerIsBetter?: boolean;
}) {
  const fmt = (v: number | null) => {
    if (v === null) return "—";
    if (format === "dollar") return (v >= 0 ? "+" : "") + "$" + Math.abs(v).toFixed(2);
    if (format === "pct") return v.toFixed(1) + "%";
    if (format === "ratio") return v.toFixed(2);
    return String(Math.round(v));
  };

  const delta = orig !== null && sim !== null ? sim - orig : null;
  const improved = delta !== null ? (lowerIsBetter ? delta < 0 : delta > 0) : null;
  const deltaColor = improved === null ? "var(--text-muted)" : improved ? "var(--green)" : "var(--red)";

  return (
    <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--surface2)", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 15, fontWeight: 700, color: "var(--text-muted)", textDecoration: "line-through" }}>{fmt(orig)}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M6 2l3 3-3 3" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 18, fontWeight: 800, color: sim !== null && sim >= 0 && format === "dollar" ? "var(--green)" : sim !== null && sim < 0 && format === "dollar" ? "var(--red)" : "var(--text)" }}>{fmt(sim)}</span>
        {delta !== null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: deltaColor }}>
            ({delta >= 0 ? "+" : ""}{format === "dollar" ? "$" + Math.abs(delta).toFixed(0) : format === "pct" ? delta.toFixed(1) + "%" : delta.toFixed(2)})
          </span>
        )}
      </div>
    </div>
  );
}

function RuleBuilder({ rules, onChange }: { rules: Rule[]; onChange: (r: Rule[]) => void }) {
  function add(rule: Rule) { onChange([...rules, rule]); }
  function remove(i: number) { onChange(rules.filter((_, idx) => idx !== i)); }

  const [scoreVal, setScoreVal] = useState("70");
  const [dllVal, setDllVal] = useState("200");
  const [maxTrades, setMaxTrades] = useState("3");
  const [minConf, setMinConf] = useState("7");
  const [maxLossPerTrade, setMaxLossPerTrade] = useState("300");
  const [sessions, setSessions] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [sides, setSides] = useState<string[]>([]);
  const [timeframes, setTimeframes] = useState<string[]>([]);

  function toggle<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  const ruleTypes = rules.map((r) => r.type);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Min mental score */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Mental score filter</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Skip trading days below this check-in score</div>
          </div>
          {ruleTypes.includes("min_score") && (
            <button type="button" onClick={() => onChange(rules.filter((r) => r.type !== "min_score"))}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="range" min={0} max={100} step={5} value={scoreVal}
            onChange={(e) => setScoreVal(e.target.value)}
            style={{ flex: 1, accentColor: "var(--blue)" }} />
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, fontWeight: 700, minWidth: 36 }}>{scoreVal}</span>
          <button type="button" onClick={() => { if (!ruleTypes.includes("min_score")) add({ type: "min_score", value: parseInt(scoreVal) }); }}
            disabled={ruleTypes.includes("min_score")}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: ruleTypes.includes("min_score") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("min_score") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("min_score") ? "var(--text-muted)" : "var(--blue)", opacity: ruleTypes.includes("min_score") ? 0.5 : 1 }}>
            {ruleTypes.includes("min_score") ? "Added" : "Add"}
          </button>
        </div>
      </div>

      {/* Daily loss limit */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Daily loss limit</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Stop trading on a day once loss reaches $X</div>
          </div>
          {ruleTypes.includes("daily_loss_limit") && (
            <button type="button" onClick={() => onChange(rules.filter((r) => r.type !== "daily_loss_limit"))}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>$</span>
          <input type="number" min={0} step={50} value={dllVal} onChange={(e) => setDllVal(e.target.value)}
            style={{ flex: 1, fontFamily: "var(--font-geist-mono)", fontSize: 14 }} />
          <button type="button" onClick={() => { const v = parseFloat(dllVal); if (!isNaN(v) && v > 0 && !ruleTypes.includes("daily_loss_limit")) add({ type: "daily_loss_limit", value: v }); }}
            disabled={ruleTypes.includes("daily_loss_limit")}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: ruleTypes.includes("daily_loss_limit") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("daily_loss_limit") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("daily_loss_limit") ? "var(--text-muted)" : "var(--blue)", opacity: ruleTypes.includes("daily_loss_limit") ? 0.5 : 1 }}>
            {ruleTypes.includes("daily_loss_limit") ? "Added" : "Add"}
          </button>
        </div>
      </div>

      {/* Max trades / day */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Max trades per day</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Cap the number of trades taken daily</div>
          </div>
          {ruleTypes.includes("max_trades_per_day") && (
            <button type="button" onClick={() => onChange(rules.filter((r) => r.type !== "max_trades_per_day"))}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="number" min={1} max={20} value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)}
            style={{ flex: 1, fontFamily: "var(--font-geist-mono)", fontSize: 14 }} />
          <button type="button" onClick={() => { const v = parseInt(maxTrades); if (!isNaN(v) && v > 0 && !ruleTypes.includes("max_trades_per_day")) add({ type: "max_trades_per_day", value: v }); }}
            disabled={ruleTypes.includes("max_trades_per_day")}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: ruleTypes.includes("max_trades_per_day") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("max_trades_per_day") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("max_trades_per_day") ? "var(--text-muted)" : "var(--blue)", opacity: ruleTypes.includes("max_trades_per_day") ? 0.5 : 1 }}>
            {ruleTypes.includes("max_trades_per_day") ? "Added" : "Add"}
          </button>
        </div>
      </div>

      {/* Conviction filter */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Minimum conviction level</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Skip trades logged with conviction below this (1–10)</div>
          </div>
          {ruleTypes.includes("min_confidence") && (
            <button type="button" onClick={() => onChange(rules.filter((r) => r.type !== "min_confidence"))}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="range" min={1} max={10} value={minConf}
            onChange={(e) => setMinConf(e.target.value)}
            style={{ flex: 1, accentColor: "var(--blue)" }} />
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, fontWeight: 700, minWidth: 24 }}>{minConf}</span>
          <button type="button" onClick={() => { if (!ruleTypes.includes("min_confidence")) add({ type: "min_confidence", value: parseInt(minConf) }); }}
            disabled={ruleTypes.includes("min_confidence")}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: ruleTypes.includes("min_confidence") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("min_confidence") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("min_confidence") ? "var(--text-muted)" : "var(--blue)", opacity: ruleTypes.includes("min_confidence") ? 0.5 : 1 }}>
            {ruleTypes.includes("min_confidence") ? "Added" : "Add"}
          </button>
        </div>
      </div>

      {/* Max loss per trade */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Max loss per trade</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Exclude trades that lost more than $X (simulate stop-loss discipline)</div>
          </div>
          {ruleTypes.includes("max_loss_per_trade") && (
            <button type="button" onClick={() => onChange(rules.filter((r) => r.type !== "max_loss_per_trade"))}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>$</span>
          <input type="number" min={0} step={50} value={maxLossPerTrade} onChange={(e) => setMaxLossPerTrade(e.target.value)}
            style={{ flex: 1, fontFamily: "var(--font-geist-mono)", fontSize: 14 }} />
          <button type="button" onClick={() => { const v = parseFloat(maxLossPerTrade); if (!isNaN(v) && v > 0 && !ruleTypes.includes("max_loss_per_trade")) add({ type: "max_loss_per_trade", value: v }); }}
            disabled={ruleTypes.includes("max_loss_per_trade")}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: ruleTypes.includes("max_loss_per_trade") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("max_loss_per_trade") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("max_loss_per_trade") ? "var(--text-muted)" : "var(--blue)", opacity: ruleTypes.includes("max_loss_per_trade") ? 0.5 : 1 }}>
            {ruleTypes.includes("max_loss_per_trade") ? "Added" : "Add"}
          </button>
        </div>
      </div>

      {/* Sessions filter */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Session filter</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Only include trades logged in selected sessions</div>
          </div>
          {ruleTypes.includes("sessions") && (
            <button type="button" onClick={() => { onChange(rules.filter((r) => r.type !== "sessions")); setSessions([]); }}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {[["asian", "Asian"], ["london", "London"], ["new_york", "New York"], ["overlap_london_ny", "Overlap"]] .map(([val, lbl]) => {
            const active = sessions.includes(val);
            return (
              <button key={val} type="button" onClick={() => setSessions((s) => toggle(s, val))}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${active ? "#8B5CF6" : "var(--border)"}`, background: active ? "rgba(139,92,246,0.12)" : "transparent", color: active ? "#8B5CF6" : "var(--text-muted)", transition: "all 0.15s" }}>
                {lbl}
              </button>
            );
          })}
        </div>
        <button type="button" disabled={sessions.length === 0 || ruleTypes.includes("sessions")}
          onClick={() => { if (sessions.length > 0 && !ruleTypes.includes("sessions")) add({ type: "sessions", values: sessions }); }}
          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: sessions.length === 0 || ruleTypes.includes("sessions") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("sessions") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("sessions") ? "var(--text-muted)" : "var(--blue)", opacity: sessions.length === 0 || ruleTypes.includes("sessions") ? 0.5 : 1 }}>
          {ruleTypes.includes("sessions") ? "Added" : sessions.length === 0 ? "Select sessions first" : `Add (${sessions.length} selected)`}
        </button>
      </div>

      {/* Market conditions */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Market condition filter</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Only include trades in these market conditions</div>
          </div>
          {ruleTypes.includes("market_conditions") && (
            <button type="button" onClick={() => { onChange(rules.filter((r) => r.type !== "market_conditions")); setConditions([]); }}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {["trending", "ranging", "breakout", "reversal"].map((c) => {
            const active = conditions.includes(c);
            return (
              <button key={c} type="button" onClick={() => setConditions((s) => toggle(s, c))}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${active ? "var(--amber)" : "var(--border)"}`, background: active ? "rgba(245,158,11,0.1)" : "transparent", color: active ? "var(--amber)" : "var(--text-muted)", textTransform: "capitalize", transition: "all 0.15s" }}>
                {c}
              </button>
            );
          })}
        </div>
        <button type="button" disabled={conditions.length === 0 || ruleTypes.includes("market_conditions")}
          onClick={() => { if (conditions.length > 0 && !ruleTypes.includes("market_conditions")) add({ type: "market_conditions", values: conditions }); }}
          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: conditions.length === 0 || ruleTypes.includes("market_conditions") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("market_conditions") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("market_conditions") ? "var(--text-muted)" : "var(--blue)", opacity: conditions.length === 0 || ruleTypes.includes("market_conditions") ? 0.5 : 1 }}>
          {ruleTypes.includes("market_conditions") ? "Added" : conditions.length === 0 ? "Select conditions first" : `Add (${conditions.length} selected)`}
        </button>
      </div>

      {/* Side filter */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Side filter</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Only long, only short, or both</div>
          </div>
          {ruleTypes.includes("sides") && (
            <button type="button" onClick={() => { onChange(rules.filter((r) => r.type !== "sides")); setSides([]); }}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[["long", "Long"], ["short", "Short"]].map(([val, lbl]) => {
            const active = sides.includes(val);
            return (
              <button key={val} type="button" onClick={() => setSides((s) => toggle(s, val))}
                style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${active ? (val === "long" ? "var(--green)" : "var(--red)") : "var(--border)"}`, background: active ? (val === "long" ? "rgba(0,232,122,0.1)" : "rgba(255,59,92,0.1)") : "transparent", color: active ? (val === "long" ? "var(--green)" : "var(--red)") : "var(--text-muted)", transition: "all 0.15s" }}>
                {lbl}
              </button>
            );
          })}
        </div>
        <button type="button" disabled={sides.length === 0 || ruleTypes.includes("sides")}
          onClick={() => { if (sides.length > 0 && !ruleTypes.includes("sides")) add({ type: "sides", values: sides }); }}
          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: sides.length === 0 || ruleTypes.includes("sides") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("sides") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("sides") ? "var(--text-muted)" : "var(--blue)", opacity: sides.length === 0 || ruleTypes.includes("sides") ? 0.5 : 1 }}>
          {ruleTypes.includes("sides") ? "Added" : sides.length === 0 ? "Select sides first" : `Add (${sides.length} selected)`}
        </button>
      </div>

      {/* Timeframe filter */}
      <div style={{ padding: 14, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Timeframe filter</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Only include trades on these timeframes</div>
          </div>
          {ruleTypes.includes("timeframes") && (
            <button type="button" onClick={() => { onChange(rules.filter((r) => r.type !== "timeframes")); setTimeframes([]); }}
              style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {["1m", "5m", "15m", "1h", "4h", "1D"].map((tf) => {
            const active = timeframes.includes(tf);
            return (
              <button key={tf} type="button" onClick={() => setTimeframes((s) => toggle(s, tf))}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${active ? "var(--amber)" : "var(--border)"}`, background: active ? "rgba(245,158,11,0.1)" : "transparent", color: active ? "var(--amber)" : "var(--text-muted)", transition: "all 0.15s" }}>
                {tf}
              </button>
            );
          })}
        </div>
        <button type="button" disabled={timeframes.length === 0 || ruleTypes.includes("timeframes")}
          onClick={() => { if (timeframes.length > 0 && !ruleTypes.includes("timeframes")) add({ type: "timeframes", values: timeframes }); }}
          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: timeframes.length === 0 || ruleTypes.includes("timeframes") ? "not-allowed" : "pointer", border: "1.5px solid var(--blue)", background: ruleTypes.includes("timeframes") ? "var(--surface2)" : "rgba(94,106,210,0.12)", color: ruleTypes.includes("timeframes") ? "var(--text-muted)" : "var(--blue)", opacity: timeframes.length === 0 || ruleTypes.includes("timeframes") ? 0.5 : 1 }}>
          {ruleTypes.includes("timeframes") ? "Added" : timeframes.length === 0 ? "Select timeframes first" : `Add (${timeframes.length} selected)`}
        </button>
      </div>

      {/* Active rules summary */}
      {rules.length > 0 && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.2)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", letterSpacing: "0.07em", marginBottom: 8 }}>ACTIVE RULES ({rules.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {rules.map((rule, i) => {
              let label = "";
              if (rule.type === "min_score") label = `Score ≥ ${rule.value}`;
              else if (rule.type === "daily_loss_limit") label = `Daily stop $${rule.value}`;
              else if (rule.type === "max_trades_per_day") label = `Max ${rule.value}/day`;
              else if (rule.type === "min_confidence") label = `Conviction ≥ ${rule.value}`;
              else if (rule.type === "max_loss_per_trade") label = `Max loss $${rule.value}`;
              else if ("values" in rule) label = `${rule.type.replace(/_/g, " ")}: ${rule.values.join(", ")}`;
              return (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.2)", fontSize: 11, fontWeight: 700, color: "var(--blue)" }}>
                  {label}
                  <button type="button" onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--blue)", display: "flex", alignItems: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BacktestPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  React.useEffect(() => {
    fetch("/api/me")
      .then((r) => { if (r.status === 401) { window.location.href = "/login"; return null; } return r.json(); })
      .then((d) => { if (d) setIsPro(d.plan === "pro" || d.plan === "premium"); })
      .catch(() => setIsPro(false));
  }, []);

  async function runBacktest() {
    if (rules.length === 0) { showToast("Add at least one rule to simulate", "error"); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules, startDate: startDate || undefined, endDate: endDate || undefined }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast(data.error ?? "Backtest failed", "error");
      } else {
        setResult(data as BacktestResult);
      }
    } catch {
      showToast("Network error — try again", "error");
    }
    setLoading(false);
  }

  if (isPro === null) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} className="has-bottom-nav">
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <BottomNav />
      </div>
    );
  }

  if (isPro === false) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
        <div className="app-header">
          <Link href="/analytics" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Stats</button>
          </Link>
          <span className="font-bebas" style={{ fontSize: 20, letterSpacing: "0.05em" }}>BACKTEST</span>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ marginBottom: 20, display: "flex", justifyContent: "center", color: "var(--blue)" }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><path d="M8 42l12-14 10 8 14-22 10 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="44" cy="16" r="3" fill="currentColor" opacity="0.3"/></svg>
          </div>
          <div className="font-bebas" style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }}>Strategy Backtester</div>
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28 }}>
            Replay your trade history under different rules — skip NO-TRADE days, apply a daily loss limit, filter by session — and see exactly how much your P&amp;L would improve.
          </p>
          <Link href="/settings" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ padding: "14px 36px", fontSize: 15 }}>Upgrade to TradeMind →</button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const pnlDelta = result ? result.simulated.totalPnl - result.original.totalPnl : null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <div className="app-header">
        <Link href="/analytics" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Stats</button>
        </Link>
        <div style={{ textAlign: "center" }}>
          <span className="font-bebas" style={{ fontSize: 20, color: "var(--text)", letterSpacing: "0.05em", display: "block", lineHeight: 1.1 }}>BACKTEST</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>WHAT-IF SIMULATOR</span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 100px", width: "100%" }}>

        {/* Hero explanation */}
        <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.18)", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--text)" }}>Replay your past trades under new rules.</strong> Add filters below — like &ldquo;only trade on GO days&rdquo; or &ldquo;stop at $200 daily loss&rdquo; — and see how your historical P&amp;L, win rate, and drawdown would have changed.
          </div>
        </div>

        {/* Quick presets */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>QUICK PRESETS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PRESETS.map((p) => (
              <button key={p.label} type="button"
                onClick={() => { setRules(p.rules); setResult(null); showToast(`Loaded: ${p.label}`, "success"); }}
                title={p.desc}
                style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1.5px solid var(--border)", background: "var(--surface2)", color: "var(--text-muted)", transition: "all 0.15s" }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 12 }}>DATE RANGE (optional)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13 }} />
            </div>
          </div>
        </div>

        {/* Rule builder */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 14 }}>BUILD YOUR RULES</div>
          <RuleBuilder rules={rules} onChange={setRules} />
        </div>

        {/* Run button */}
        <button
          className="btn-primary"
          onClick={runBacktest}
          disabled={loading || rules.length === 0}
          style={{ width: "100%", padding: 16, fontSize: 16, marginBottom: 24, opacity: rules.length === 0 ? 0.5 : 1 }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 16" strokeLinecap="round"/></svg>
              Simulating...
            </span>
          ) : rules.length === 0 ? "Add rules to simulate →" : `Run Simulation (${rules.length} rule${rules.length !== 1 ? "s" : ""}) →`}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Summary banner */}
            <div style={{ padding: "18px 20px", borderRadius: 14, background: pnlDelta !== null && pnlDelta >= 0 ? "rgba(0,232,122,0.06)" : "rgba(255,59,92,0.06)", border: `1.5px solid ${pnlDelta !== null && pnlDelta >= 0 ? "rgba(0,232,122,0.3)" : "rgba(255,59,92,0.3)"}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>SIMULATED P&amp;L IMPACT</div>
              <div className="font-bebas" style={{ fontSize: 44, lineHeight: 1, marginBottom: 6, color: pnlDelta !== null && pnlDelta >= 0 ? "var(--green)" : "var(--red)" }}>
                {pnlDelta !== null && pnlDelta >= 0 ? "+" : ""}{pnlDelta !== null ? "$" + Math.abs(pnlDelta).toFixed(2) : "—"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                {result.skipped} trades skipped
                {result.skippedPnl !== 0 && <> · {result.skippedPnl < 0 ? "avoided" : "missed"} ${Math.abs(result.skippedPnl).toFixed(0)}</>}
              </div>
            </div>

            {/* Stat comparison grid */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 14 }}>STAT COMPARISON</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <StatDelta label="TOTAL P&L" orig={result.original.totalPnl} sim={result.simulated.totalPnl} format="dollar" />
                <StatDelta label="TRADES" orig={result.original.trades} sim={result.simulated.trades} format="number" lowerIsBetter={false} />
                <StatDelta label="WIN RATE" orig={result.original.winRate} sim={result.simulated.winRate} format="pct" />
                <StatDelta label="PROFIT FACTOR" orig={result.original.profitFactor} sim={result.simulated.profitFactor} format="ratio" />
                <StatDelta label="MAX DRAWDOWN" orig={result.original.maxDrawdown} sim={result.simulated.maxDrawdown} format="dollar" lowerIsBetter={true} />
                <StatDelta label="AVG R" orig={result.original.avgR} sim={result.simulated.avgR} format="ratio" />
              </div>
            </div>

            {/* Equity curve overlay */}
            {result.original.equityCurve.length >= 2 && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>EQUITY CURVE</div>
                <EquityCurveCompare original={result.original.equityCurve} simulated={result.simulated.equityCurve} />
              </div>
            )}

            {/* Insight callout */}
            {pnlDelta !== null && Math.abs(pnlDelta) > 0 && (
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.2)", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
                {pnlDelta > 0
                  ? <>If you had applied {rules.length === 1 ? "this rule" : "these rules"} to your past {result.original.trades} trades, you would have made an additional <strong style={{ color: "var(--green)" }}>${pnlDelta.toFixed(2)}</strong> — a {result.original.totalPnl !== 0 ? Math.round((pnlDelta / Math.abs(result.original.totalPnl)) * 100) : "∞"}% improvement with {result.skipped} fewer trades.</>
                  : <>Applying {rules.length === 1 ? "this rule" : "these rules"} to your past {result.original.trades} trades would have <strong style={{ color: "var(--red)" }}>reduced P&amp;L by ${Math.abs(pnlDelta).toFixed(2)}</strong>. These filters may be too restrictive for your strategy — consider adjusting them.</>
                }
              </div>
            )}

            {/* Reset */}
            <button type="button"
              onClick={() => { setResult(null); setRules([]); }}
              style={{ padding: "10px 0", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Reset &amp; start over
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
