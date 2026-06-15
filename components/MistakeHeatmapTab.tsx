"use client";

import { useEffect, useState } from "react";

type Cell = { hour: number; dow: number; losses: number; total: number; lossRate: number };
type HeatmapData = {
  ok: boolean;
  cells: Cell[];
  totalTrades: number;
  worstHour: { hour: number; losses: number; total: number; lossRate: number } | null;
  worstDow: { dow: number; losses: number; total: number; lossRate: number } | null;
};

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtHour(h: number) {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

function cellColor(lossRate: number, total: number) {
  if (total === 0) return "transparent";
  if (lossRate >= 75) return "rgba(255,59,92,0.75)";
  if (lossRate >= 60) return "rgba(255,59,92,0.55)";
  if (lossRate >= 45) return "rgba(255,176,32,0.55)";
  if (lossRate >= 30) return "rgba(255,176,32,0.3)";
  return "rgba(0,232,122,0.3)";
}

export default function MistakeHeatmapTab({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ h: number; d: number; x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    fetch(`/api/mistake-heatmap${params.toString() ? `?${params}` : ""}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="card" style={{ height: 300, animation: "pulse 1.5s infinite" }} />
    );
  }

  if (!data || !data.ok || data.totalTrades === 0) {
    return (
      <div
        className="card"
        style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}
      >
        No trade data yet. Log trades with entry times to see your mistake heatmap.
      </div>
    );
  }

  // Build lookup map
  const cellMap = new Map<string, Cell>();
  for (const c of data.cells) cellMap.set(`${c.hour}-${c.dow}`, c);

  // Find active hours (hours with any trades)
  const activeHours = Array.from(new Set(data.cells.map((c) => c.hour))).sort((a, b) => a - b);
  const activeDows = Array.from(new Set(data.cells.map((c) => c.dow))).sort((a, b) => a - b);

  const tooltipCell =
    tooltip ? cellMap.get(`${tooltip.h}-${tooltip.d}`) ?? null : null;

  return (
    <div>
      {/* Worst time callouts */}
      {(data.worstHour || data.worstDow) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {data.worstHour && (
            <div
              className="card"
              style={{
                padding: "16px 14px",
                textAlign: "center",
                background: "rgba(255,59,92,0.04)",
                border: "1px solid rgba(255,59,92,0.2)",
              }}
            >
              <div
                className="font-bebas"
                style={{ fontSize: 28, color: "var(--red)", lineHeight: 1, marginBottom: 4 }}
              >
                {fmtHour(data.worstHour.hour)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 2,
                }}
              >
                WORST HOUR
              </div>
              <div style={{ fontSize: 11, color: "var(--red)" }}>
                {data.worstHour.lossRate}% loss rate
              </div>
            </div>
          )}
          {data.worstDow && (
            <div
              className="card"
              style={{
                padding: "16px 14px",
                textAlign: "center",
                background: "rgba(255,59,92,0.04)",
                border: "1px solid rgba(255,59,92,0.2)",
              }}
            >
              <div
                className="font-bebas"
                style={{ fontSize: 28, color: "var(--red)", lineHeight: 1, marginBottom: 4 }}
              >
                {DOW_LABELS[data.worstDow.dow]}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 2,
                }}
              >
                WORST DAY
              </div>
              <div style={{ fontSize: 11, color: "var(--red)" }}>
                {data.worstDow.lossRate}% loss rate
              </div>
            </div>
          )}
        </div>
      )}

      {/* Heatmap grid */}
      <div className="card" style={{ padding: 24, marginBottom: 20, overflowX: "auto" }}>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            marginBottom: 16,
          }}
        >
          LOSS RATE BY HOUR & DAY
        </h3>

        <div style={{ position: "relative", minWidth: 320 }}>
          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `56px repeat(${activeDows.length}, 1fr)`,
              gap: 3,
              marginBottom: 3,
            }}
          >
            <div />
            {activeDows.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                }}
              >
                {DOW_LABELS[d]}
              </div>
            ))}
          </div>

          {/* Rows */}
          {activeHours.map((h) => (
            <div
              key={h}
              style={{
                display: "grid",
                gridTemplateColumns: `56px repeat(${activeDows.length}, 1fr)`,
                gap: 3,
                marginBottom: 3,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 8,
                }}
              >
                {fmtHour(h)}
              </div>
              {activeDows.map((d) => {
                const cell = cellMap.get(`${h}-${d}`);
                const lr = cell?.lossRate ?? 0;
                const tot = cell?.total ?? 0;
                return (
                  <div
                    key={d}
                    onMouseEnter={(e) => {
                      if (cell) setTooltip({ h, d, x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      height: 28,
                      borderRadius: 4,
                      background: tot > 0 ? cellColor(lr, tot) : "var(--surface2)",
                      cursor: tot > 0 ? "pointer" : "default",
                      border: "1px solid rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: tot > 0 ? "rgba(255,255,255,0.9)" : "transparent",
                    }}
                  >
                    {tot > 0 ? `${lr}%` : ""}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Tooltip */}
          {tooltip && tooltipCell && (
            <div
              style={{
                position: "fixed",
                left: tooltip.x + 12,
                top: tooltip.y - 40,
                background: "var(--surface)",
                border: "1px solid var(--border-bright)",
                borderRadius: 8,
                padding: "8px 12px",
                pointerEvents: "none",
                zIndex: 100,
                fontSize: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                {fmtHour(tooltipCell.hour)} on {DOW_LABELS[tooltipCell.dow]}
              </div>
              <div style={{ color: "var(--text-muted)" }}>
                {tooltipCell.losses} losses / {tooltipCell.total} trades
              </div>
              <div
                style={{
                  color: tooltipCell.lossRate >= 60 ? "var(--red)" : "var(--amber)",
                  fontWeight: 700,
                }}
              >
                {tooltipCell.lossRate}% loss rate
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Loss rate:</span>
          {[
            { color: "rgba(0,232,122,0.3)", label: "< 30%" },
            { color: "rgba(255,176,32,0.3)", label: "30–45%" },
            { color: "rgba(255,176,32,0.55)", label: "45–60%" },
            { color: "rgba(255,59,92,0.55)", label: "60–75%" },
            { color: "rgba(255,59,92,0.75)", label: "> 75%" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: color,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 20,
          background: "rgba(94,106,210,0.03)",
          border: "1px solid rgba(94,106,210,0.15)",
        }}
      >
        <h3
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          HOW TO USE THIS
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
          Red zones are your &ldquo;danger hours&rdquo; — times when you consistently lose more than you win.
          Consider reducing size or skipping trades during these windows. Green zones are your edge —
          protect them by being fully prepared before these times.
        </p>
      </div>
    </div>
  );
}
