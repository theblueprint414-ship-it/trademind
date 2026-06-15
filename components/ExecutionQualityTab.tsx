"use client";

import { useEffect, useState } from "react";

type EQData = {
  ok: boolean;
  noData?: boolean;
  totalTrades: number;
  tradesWithR: number;
  slDiscipline: number | null;
  avgR: number | null;
  tpHitRate: number | null;
  fumbleRate: number | null;
  avgProfitCapture: number | null;
  rDistribution: { label: string; count: number }[];
};

function rColor(r: number | null) {
  if (r === null) return "var(--text-muted)";
  if (r >= 1) return "var(--green)";
  if (r >= 0) return "var(--amber)";
  return "var(--red)";
}

function pctColor(pct: number | null, invert = false) {
  if (pct === null) return "var(--text-muted)";
  const good = invert ? pct <= 20 : pct >= 80;
  const ok = invert ? pct <= 40 : pct >= 50;
  if (good) return "var(--green)";
  if (ok) return "var(--amber)";
  return "var(--red)";
}

function RDistChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const lossLabels = ["< -2R", "-2R – -1R", "-1R – 0R"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map(({ label, count }) => {
        const pct = (count / max) * 100;
        const isLoss = lossLabels.includes(label);
        const color = isLoss ? "var(--red)" : count === 0 ? "var(--surface3)" : "var(--green)";
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 90, fontSize: 11, color: "var(--text-muted)", textAlign: "right", flexShrink: 0 }}>
              {label}
            </div>
            <div style={{ flex: 1, height: 22, borderRadius: 4, background: "var(--surface2)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: color,
                  opacity: 0.8,
                  borderRadius: 4,
                  transition: "width 0.5s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 6,
                }}
              >
                {count > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#000" }}>{count}</span>
                )}
              </div>
            </div>
            {count === 0 && (
              <span style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 16 }}>0</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ExecutionQualityTab({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const [data, setData] = useState<EQData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    fetch(`/api/execution-quality${params.toString() ? `?${params}` : ""}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="card"
            style={{ height: 120, background: "var(--surface2)", animation: "pulse 1.5s infinite" }}
          />
        ))}
      </div>
    );
  }

  if (!data || !data.ok || data.noData) {
    return (
      <div
        className="card"
        style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}
      >
        No trade data found for this period. Log some trades to see execution quality metrics.
      </div>
    );
  }

  const kpis = [
    {
      label: "SL DISCIPLINE",
      value: data.slDiscipline !== null ? `${data.slDiscipline}%` : "—",
      sub: "trades with stop loss",
      color: pctColor(data.slDiscipline),
    },
    {
      label: "AVG R-MULTIPLE",
      value: data.avgR !== null ? `${data.avgR > 0 ? "+" : ""}${data.avgR}R` : "—",
      sub: `from ${data.tradesWithR} trades`,
      color: rColor(data.avgR),
    },
    {
      label: "TP HIT RATE",
      value: data.tpHitRate !== null ? `${data.tpHitRate}%` : "—",
      sub: "winners reaching ≥1R",
      color: pctColor(data.tpHitRate),
    },
    {
      label: "PROFIT CAPTURE",
      value: data.avgProfitCapture !== null ? `${data.avgProfitCapture}%` : "—",
      sub: "of planned move captured",
      color: pctColor(data.avgProfitCapture),
    },
  ];

  return (
    <div>
      {/* KPI grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="card"
            style={{ padding: "18px 14px", textAlign: "center" }}
          >
            <div
              className="font-bebas"
              style={{ fontSize: 30, color: kpi.color, lineHeight: 1, marginBottom: 4 }}
            >
              {kpi.value}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              {kpi.label}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Fumble Rate */}
      {data.fumbleRate !== null && data.fumbleRate > 0 && (
        <div
          className="card"
          style={{
            padding: "16px 20px",
            marginBottom: 20,
            background: "rgba(255,59,92,0.04)",
            border: "1px solid rgba(255,59,92,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ color: "var(--red)", flexShrink: 0 }}
          >
            <path
              d="M10 3v6l3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              Fumble Rate:{" "}
              <span style={{ color: "var(--red)" }}>{data.fumbleRate}%</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {data.fumbleRate}% of trades with a TP plan ended as losses. You had a plan — stick to it.
            </div>
          </div>
        </div>
      )}

      {/* R Distribution */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            R-MULTIPLE DISTRIBUTION
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            How your {data.tradesWithR} trades distributed across R outcomes
          </p>
        </div>
        <RDistChart data={data.rDistribution} />
      </div>

      {/* Insight */}
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
          EXECUTION INSIGHT
        </h3>
        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
          {data.avgR !== null && data.avgR < 0 && (
            <p>
              Your average R of <strong style={{ color: "var(--red)" }}>{data.avgR}R</strong> means
              you&apos;re losing more than you win on average. Focus on cutting losers at -1R and letting
              winners run to at least +1R.
            </p>
          )}
          {data.avgR !== null && data.avgR >= 0 && data.avgR < 1 && (
            <p>
              Your average R of <strong style={{ color: "var(--amber)" }}>{data.avgR}R</strong> is
              positive but below 1R. Small improvements in letting winners run will compound
              significantly over time.
            </p>
          )}
          {data.avgR !== null && data.avgR >= 1 && (
            <p>
              Excellent — your average R of{" "}
              <strong style={{ color: "var(--green)" }}>{data.avgR}R</strong> means you&apos;re
              consistently capturing more than 1× your risk per trade. Keep that edge.
            </p>
          )}
          {data.slDiscipline !== null && data.slDiscipline < 80 && (
            <p style={{ marginTop: 8 }}>
              <strong style={{ color: "var(--amber)" }}>{100 - data.slDiscipline}%</strong> of your
              trades lack a stop loss. Undefined risk is the #1 account killer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
