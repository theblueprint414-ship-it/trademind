"use client";

import { useEffect, useState } from "react";

type ConfluenceResult = {
  key: string;
  total: number;
  wins: number;
  losses: number;
  winRate: number | null;
  avgPnl: number | null;
  avgR: number | null;
  totalPnl: number;
};

type ConfluenceData = {
  singles: ConfluenceResult[];
  combos: ConfluenceResult[];
  taggedCount: number;
  totalTrades: number;
};

function WinRateBar({ pct }: { pct: number }) {
  const color = pct >= 60 ? "var(--green)" : pct >= 45 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "var(--surface3)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

function ResultRow({ r, rank }: { r: ConfluenceResult; rank: number }) {
  const pnlColor = r.totalPnl >= 0 ? "var(--green)" : "var(--red)";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "24px 1fr 90px 60px 70px",
        gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>
        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
          {r.key.split("+").join(" + ")}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.total} trades · {r.wins}W {r.losses}L</div>
      </div>
      <div>
        {r.winRate !== null && <WinRateBar pct={r.winRate} />}
      </div>
      <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: r.avgR !== null ? (r.avgR >= 0 ? "var(--green)" : "var(--red)") : "var(--text-muted)" }}>
        {r.avgR !== null ? `${r.avgR >= 0 ? "+" : ""}${r.avgR}R` : "—"}
      </div>
      <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: pnlColor }}>
        {r.totalPnl >= 0 ? "+" : ""}${Math.abs(r.totalPnl).toFixed(0)}
      </div>
    </div>
  );
}

export default function ConfluenceAnalyticsTab({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<ConfluenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"singles" | "combos">("singles");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    fetch(`/api/confluence-analytics?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 64, borderRadius: 12, background: "var(--surface2)", animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );

  if (error === "Forbidden") return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Pro Feature</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Confluence analytics is available on Pro and Premium plans.</div>
      <a href="/settings" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 10, background: "var(--green)", color: "#09090b", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Upgrade to Pro →</a>
    </div>
  );

  if (error) return (
    <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Failed to load confluence analytics.</div>
  );

  const rows = view === "singles" ? (data?.singles ?? []) : (data?.combos ?? []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>ICT/SMC Confluence Analytics</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Which setups and combinations produce your edge?{" "}
          {data && <span style={{ color: "var(--text-dim)" }}>{data.taggedCount} tagged trades of {data.totalTrades} total.</span>}
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["singles", "combos"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: `1px solid ${view === v ? "var(--border-bright)" : "var(--border)"}`,
              background: view === v ? "var(--surface)" : "transparent",
              color: view === v ? "var(--text)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {v === "singles" ? "Single Setups" : "Combinations"}
          </button>
        ))}
      </div>

      {/* If no tagged trades */}
      {data && data.taggedCount < 3 && (
        <div style={{ padding: "32px 20px", textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏷️</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Tag Your Setups</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 280, margin: "0 auto" }}>
            Log ICT/SMC setups (FVG, OB, BOS, etc.) on your trades in the journal. Once you have 3+ tagged, you&apos;ll see your confluence stats here.
          </div>
        </div>
      )}

      {/* Table */}
      {rows.length > 0 && (
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 90px 60px 70px",
              gap: 8,
              padding: "8px 16px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>SETUP</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>WIN RATE</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textAlign: "right" }}>AVG R</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textAlign: "right" }}>P&L</div>
          </div>

          {rows.map((r, i) => <ResultRow key={r.key} r={r} rank={i + 1} />)}
        </div>
      )}

      {rows.length === 0 && data && data.taggedCount >= 3 && (
        <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          {view === "combos" ? "No combination data yet — tag multiple setups on the same trade to see combos." : "No single setup data with 2+ trades."}
        </div>
      )}

      {/* Insight */}
      {rows.length > 0 && rows[0].winRate !== null && rows[0].winRate >= 60 && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 16px",
            borderRadius: 12,
            background: "rgba(0,232,122,0.05)",
            border: "1px solid rgba(0,232,122,0.2)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 4 }}>Your Best Edge</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
            <strong>{rows[0].key.split("+").join(" + ")}</strong> gives you a {rows[0].winRate}% win rate over {rows[0].total} trades.
            {rows[0].avgR !== null && rows[0].avgR > 0 && ` Average reward: +${rows[0].avgR}R.`}
            {" "}Focus on this setup to maximize your edge.
          </div>
        </div>
      )}
    </div>
  );
}
