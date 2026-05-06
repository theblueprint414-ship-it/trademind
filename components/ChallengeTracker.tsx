"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface ChallengeConfig {
  firm: string | null;
  accountSize: number;
  dailyLimit: number;
  maxDrawdown: number;
  profitTarget: number | null;
  tradingDaysTarget: number | null;
  startDate: string | null;
  endDate: string | null;
}

const FIRM_COLORS: Record<string, string> = {
  ftmo: "#FF3B5C",
  apex: "#FF8C00",
  topstep: "#4F8EF7",
  funded_next: "#00E87A",
  e8: "#8B5CF6",
  mff: "#FFB020",
  custom: "#7A8BA8",
};

const FIRM_NAMES: Record<string, string> = {
  ftmo: "FTMO",
  apex: "Apex Funding",
  topstep: "TopStep",
  funded_next: "Funded Next",
  e8: "E8 Markets",
  mff: "MyForexFunds",
  custom: "Custom",
};

const STORAGE_KEY = "trademind_challenge_pnl";

function ProgressBar({ label, right, filled, color, glow }: { label: string; right: string; filled: number; color: string; glow?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{right}</span>
      </div>
      <div style={{ height: 5, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.min(filled, 100)}%`, background: color, borderRadius: 3,
          transition: "width 0.4s ease",
          boxShadow: glow && filled > 50 ? `0 0 6px ${color}70` : "none",
        }} />
      </div>
    </div>
  );
}

function MiniSparkline({ entries, startDate }: { entries: Record<string, number>; startDate: string | null }) {
  const points = useMemo(() => {
    const filtered = Object.entries(entries)
      .filter(([d]) => !startDate || d >= startDate)
      .sort(([a], [b]) => a.localeCompare(b));
    if (filtered.length < 2) return null;
    let cumPnl = 0;
    return filtered.map(([, v]) => { cumPnl += v; return cumPnl; });
  }, [entries, startDate]);

  if (!points || points.length < 2) return null;

  const W = 200; const H = 36; const PAD = 4;
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 0);
  const range = max - min || 1;
  const xStep = (W - PAD * 2) / (points.length - 1);

  const coords = points.map((v, i) => {
    const x = PAD + i * xStep;
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  const lastVal = points[points.length - 1];
  const lineColor = lastVal >= 0 ? "var(--green)" : "var(--red)";
  const areaPoints = `${PAD},${H - PAD} ${coords.join(" ")} ${PAD + (points.length - 1) * xStep},${H - PAD}`;

  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      <polygon points={areaPoints} fill={lastVal >= 0 ? "rgba(0,232,122,0.08)" : "rgba(255,59,92,0.08)"} />
      <polyline points={coords.join(" ")} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={PAD} y1={H - PAD - ((-min) / range) * (H - PAD * 2)} x2={W - PAD} y2={H - PAD - ((-min) / range) * (H - PAD * 2)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,2" />
    </svg>
  );
}

export default function ChallengeTracker({ config, verdict }: { config: ChallengeConfig; verdict: string | null }) {
  const today = new Date().toISOString().split("T")[0];
  const [pnlEntries, setPnlEntries] = useState<Record<string, number>>({});
  const [inputPnl, setInputPnl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setPnlEntries(stored);
      if (stored[today] !== undefined) setInputPnl(String(stored[today]));
    } catch {}
  }, [today]);

  function savePnl() {
    const val = parseFloat(inputPnl);
    if (isNaN(val)) return;
    const updated = { ...pnlEntries, [today]: val };
    setPnlEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ── Metrics ────────────────────────────────────────────────────────────────
  const todayPnl = pnlEntries[today] ?? 0;
  const dailyLossAmt = config.accountSize * (config.dailyLimit / 100);
  const dailyFilled = todayPnl < 0 ? Math.min((Math.abs(todayPnl) / dailyLossAmt) * 100, 100) : 0;

  const challengeEntries = Object.entries(pnlEntries).filter(([d]) => !config.startDate || d >= config.startDate);
  const totalPnl = challengeEntries.reduce((sum, [, v]) => sum + v, 0);

  const maxDrawdownAmt = config.accountSize * (config.maxDrawdown / 100);
  const drawdownFilled = totalPnl < 0 ? Math.min((Math.abs(totalPnl) / maxDrawdownAmt) * 100, 100) : 0;
  const drawdownPct = totalPnl < 0 ? (Math.abs(totalPnl) / config.accountSize) * 100 : 0;

  // Profit target
  const profitTargetAmt = config.profitTarget ? config.accountSize * (config.profitTarget / 100) : null;
  const profitFilled = profitTargetAmt && totalPnl > 0 ? Math.min((totalPnl / profitTargetAmt) * 100, 100) : 0;

  // Trading days
  const tradingDaysCompleted = new Set(challengeEntries.filter(([, v]) => v !== 0).map(([d]) => d)).size;
  const tradingDaysTarget = config.tradingDaysTarget ?? null;
  const tradingDaysFilled = tradingDaysTarget ? Math.min((tradingDaysCompleted / tradingDaysTarget) * 100, 100) : null;

  // Days left
  let daysLeft: number | null = null;
  if (config.endDate) {
    daysLeft = Math.max(0, Math.ceil((new Date(config.endDate).getTime() - Date.now()) / 86400000));
  }

  const dailyColor = dailyFilled >= 80 ? "var(--red)" : dailyFilled >= 50 ? "var(--amber)" : "var(--green)";
  const drawdownColor = drawdownFilled >= 80 ? "var(--red)" : drawdownFilled >= 50 ? "var(--amber)" : "var(--green)";
  const profitColor = profitFilled >= 100 ? "var(--green)" : profitFilled >= 60 ? "#00C896" : "var(--blue)";
  const tradingDaysColor = tradingDaysFilled !== null && tradingDaysFilled >= 100 ? "var(--green)" : "var(--blue)";

  const isAtRisk = dailyFilled >= 60 || drawdownFilled >= 60;
  const showWarning = (verdict === "NO-TRADE" || verdict === "CAUTION") && isAtRisk;
  const showExtreme = verdict === "NO-TRADE" && isAtRisk;
  const challengePassed = (profitFilled >= 100) && (tradingDaysTarget === null || tradingDaysCompleted >= tradingDaysTarget) && drawdownFilled < 100 && dailyFilled < 100;

  const firmKey = config.firm ?? "custom";
  const firmColor = FIRM_COLORS[firmKey] || "var(--blue)";
  const firmName = FIRM_NAMES[firmKey] || firmKey.toUpperCase();

  return (
    <div className="card" style={{
      padding: "18px 20px",
      border: showExtreme
        ? "1px solid rgba(255,59,92,0.45)"
        : challengePassed
        ? "1px solid rgba(0,232,122,0.4)"
        : showWarning
        ? "1px solid rgba(255,176,32,0.35)"
        : `1px solid ${firmColor}30`,
      background: showExtreme
        ? "linear-gradient(135deg, rgba(255,59,92,0.05), var(--surface))"
        : challengePassed
        ? "linear-gradient(135deg, rgba(0,232,122,0.04), var(--surface))"
        : "var(--surface)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: firmColor, boxShadow: `0 0 8px ${firmColor}` }} />
          <div>
            <div style={{ fontSize: 11, color: firmColor, fontWeight: 700, letterSpacing: "0.1em" }}>
              {firmName} · CHALLENGE MODE
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              ${config.accountSize.toLocaleString()} account
              {daysLeft !== null && (
                <span style={{ marginLeft: 8, color: daysLeft <= 3 ? "var(--red)" : "var(--text-muted)" }}>
                  · {daysLeft}d remaining
                </span>
              )}
            </div>
          </div>
        </div>
        <Link href="/settings#challenge" style={{ textDecoration: "none" }}>
          <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "var(--text-muted)", cursor: "pointer", minHeight: "unset", minWidth: "unset" }}>
            Edit
          </button>
        </Link>
      </div>

      {/* Challenge passed banner */}
      {challengePassed && (
        <div style={{ background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🏆</span>
          <p style={{ fontSize: 12, color: "var(--green)", lineHeight: 1.5, margin: 0, fontWeight: 700 }}>
            Challenge targets met — submit your results to {firmName}.
          </p>
        </div>
      )}

      {/* Mental + challenge warning */}
      {showWarning && !challengePassed && (
        <div style={{ background: showExtreme ? "rgba(255,59,92,0.08)" : "rgba(255,176,32,0.06)", border: `1px solid ${showExtreme ? "rgba(255,59,92,0.3)" : "rgba(255,176,32,0.25)"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <p style={{ fontSize: 12, color: showExtreme ? "var(--red)" : "var(--amber)", lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
            {showExtreme
              ? "NO-TRADE mental score + challenge at risk — do not open your platform today. Protect the account."
              : "Compromised mental state while approaching your limits. Reduce size significantly or stay out."}
          </p>
        </div>
      )}

      {/* Progress bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {/* Profit target */}
        {profitTargetAmt !== null && (
          <ProgressBar
            label={`Profit target (${config.profitTarget}%)`}
            right={`+$${totalPnl > 0 ? totalPnl.toFixed(0) : "0"} / +$${profitTargetAmt.toFixed(0)}`}
            filled={profitFilled}
            color={profitColor}
          />
        )}

        {/* Daily loss */}
        <ProgressBar
          label={`Daily loss limit (${config.dailyLimit}%)`}
          right={`${todayPnl < 0 ? `−$${Math.abs(todayPnl).toFixed(0)}` : todayPnl > 0 ? `+$${todayPnl.toFixed(0)}` : "$0"} / −$${dailyLossAmt.toFixed(0)}`}
          filled={dailyFilled}
          color={dailyColor}
          glow
        />

        {/* Max drawdown */}
        <ProgressBar
          label={`Max drawdown (${config.maxDrawdown}%)`}
          right={`${drawdownPct.toFixed(1)}% used / ${config.maxDrawdown}% limit`}
          filled={drawdownFilled}
          color={drawdownColor}
          glow
        />

        {/* Trading days */}
        {tradingDaysTarget !== null && tradingDaysFilled !== null && (
          <ProgressBar
            label={`Trading days (min ${tradingDaysTarget})`}
            right={`${tradingDaysCompleted} / ${tradingDaysTarget} days`}
            filled={tradingDaysFilled}
            color={tradingDaysColor}
          />
        )}
      </div>

      {/* Equity sparkline */}
      {challengeEntries.length >= 2 && (
        <div style={{ marginBottom: 14, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.07em" }}>EQUITY CURVE</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}
            </span>
          </div>
          <div style={{ width: "100%", overflow: "hidden" }}>
            <MiniSparkline entries={pnlEntries} startDate={config.startDate} />
          </div>
        </div>
      )}

      {/* Today's P&L input */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-muted)", pointerEvents: "none" }}>$</span>
          <input
            type="number"
            placeholder="Today's P&L  e.g. -240 or 380"
            value={inputPnl}
            onChange={(e) => setInputPnl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && savePnl()}
            style={{ paddingLeft: 22, fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, height: 36, width: "100%", color: "var(--text)", outline: "none", boxShadow: "none" }}
          />
        </div>
        <button
          onClick={savePnl}
          style={{ height: 36, padding: "0 14px", background: saved ? "rgba(0,232,122,0.1)" : "var(--surface2)", border: `1px solid ${saved ? "rgba(0,232,122,0.3)" : "var(--border)"}`, borderRadius: 8, fontSize: 12, color: saved ? "var(--green)" : "var(--text-dim)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, minHeight: "unset", minWidth: "unset", transition: "all 0.2s" }}
        >
          {saved ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Saved</span> : "Update"}
        </button>
      </div>
    </div>
  );
}