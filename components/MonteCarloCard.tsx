"use client";

import { useMemo, useState } from "react";

type Props = {
  winRate: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
};

function runSimulation(
  winRate: number,
  avgWin: number,
  avgLoss: number,
  numTrades: number
): number[] {
  const curve: number[] = [0];
  let equity = 0;
  for (let i = 0; i < numTrades; i++) {
    equity += Math.random() * 100 < winRate ? avgWin : -avgLoss;
    curve.push(equity);
  }
  return curve;
}

export default function MonteCarloCard({ winRate, avgWin, avgLoss, totalTrades }: Props) {
  const [simTrades, setSimTrades] = useState(Math.min(Math.max(totalTrades, 20), 100));
  const SIMS = 500;

  const { p10, p50, p90, minFinal, maxFinal } = useMemo(() => {
    const simulations = Array.from({ length: SIMS }, () =>
      runSimulation(winRate, avgWin, Math.abs(avgLoss), simTrades)
    );
    const finals = simulations.map((s) => s[s.length - 1]).sort((a, b) => a - b);
    const idx10 = Math.floor(SIMS * 0.1);
    const idx50 = Math.floor(SIMS * 0.5);
    const idx90 = Math.floor(SIMS * 0.9);
    return {
      p10: Math.round(finals[idx10]),
      p50: Math.round(finals[idx50]),
      p90: Math.round(finals[idx90]),
      minFinal: Math.round(finals[0]),
      maxFinal: Math.round(finals[SIMS - 1]),
    };
  }, [winRate, avgWin, avgLoss, simTrades]);

  // Build 3 representative curves for display (p10, p50, p90 sim)
  const displayCurves = useMemo(() => {
    const runs = Array.from({ length: 200 }, () =>
      runSimulation(winRate, avgWin, Math.abs(avgLoss), simTrades)
    );
    const finals = runs.map((r, i) => ({ i, v: r[r.length - 1] })).sort((a, b) => a.v - b.v);
    const idxs = [
      Math.floor(200 * 0.1),
      Math.floor(200 * 0.5),
      Math.floor(200 * 0.9),
    ];
    return idxs.map((idx) => runs[finals[idx].i]);
  }, [winRate, avgWin, avgLoss, simTrades]);

  // SVG chart
  const W = 600;
  const H = 160;
  const PAD = 20;

  const allValues = displayCurves.flat();
  const minV = Math.min(...allValues, 0);
  const maxV = Math.max(...allValues, 0.001);
  const range = maxV - minV || 1;

  function toSvgX(i: number) {
    return PAD + (i / simTrades) * (W - PAD * 2);
  }
  function toSvgY(v: number) {
    return PAD + (1 - (v - minV) / range) * (H - PAD * 2);
  }

  const colors = ["var(--red)", "var(--blue)", "var(--green)"];
  const labels = ["P10 (bad luck)", "P50 (median)", "P90 (good luck)"];

  const zeroY = toSvgY(0);

  return (
    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            MONTE CARLO PROJECTION
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {SIMS} simulations of {simTrades} trades using your win rate ({winRate}%) and avg
            outcomes
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Trades:</span>
          {[20, 50, 100].map((n) => (
            <button
              key={n}
              onClick={() => setSimTrades(n)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${simTrades === n ? "var(--blue)" : "var(--border)"}`,
                background: simTrades === n ? "rgba(94,106,210,0.12)" : "transparent",
                color: simTrades === n ? "var(--blue)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 280, height: "auto" }}>
          {/* Zero line */}
          {zeroY > PAD && zeroY < H - PAD && (
            <line
              x1={PAD}
              y1={zeroY}
              x2={W - PAD}
              y2={zeroY}
              stroke="var(--border-bright)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          )}
          {displayCurves.map((curve, ci) => {
            const pts = curve.map((v, i) => `${toSvgX(i)},${toSvgY(v)}`).join(" ");
            return (
              <polyline
                key={ci}
                points={pts}
                fill="none"
                stroke={colors[ci]}
                strokeWidth={ci === 1 ? 2 : 1.5}
                opacity={ci === 1 ? 0.9 : 0.6}
              />
            );
          })}
        </svg>
      </div>

      {/* Percentile stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { label: "P10 (worst 10%)", value: p10, color: "var(--red)" },
          { label: "P50 (median)", value: p50, color: "var(--blue)" },
          { label: "P90 (best 10%)", value: p90, color: "var(--green)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{ textAlign: "center", padding: "12px 8px", borderRadius: 10, background: "var(--surface2)" }}
          >
            <div
              className="font-bebas"
              style={{ fontSize: 24, color, lineHeight: 1, marginBottom: 3 }}
            >
              {value >= 0 ? "+" : ""}${Math.abs(value).toLocaleString()}
            </div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Range */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--text-muted)",
          padding: "8px 0",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span>
          Worst case:{" "}
          <strong style={{ color: "var(--red)" }}>
            {minFinal >= 0 ? "+" : ""}${minFinal.toLocaleString()}
          </strong>
        </span>
        <div style={{ display: "flex", gap: 16 }}>
          {labels.map((l, i) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 2,
                  background: colors[i],
                  borderRadius: 1,
                }}
              />
              <span style={{ fontSize: 10 }}>{l}</span>
            </span>
          ))}
        </div>
        <span>
          Best case:{" "}
          <strong style={{ color: "var(--green)" }}>
            +${maxFinal.toLocaleString()}
          </strong>
        </span>
      </div>
    </div>
  );
}
