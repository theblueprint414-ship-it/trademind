"use client";

import { useEffect, useState } from "react";

type PnLData = {
  avgPnl: { go: number | null; caution: number | null; noTrade: number | null };
  days: { go: number; caution: number; noTrade: number };
  tradedDays: { go: number; caution: number; noTrade: number };
  noTradeViolationCost: number;
  noTradeComplianceSaved: number;
  noTradeTotalDays: number;
  complianceRate: number | null;
  timeline: { date: string; score: number; verdict: string; pnl: number | null }[];
  hasData: boolean;
};

function fmt(n: number | null, prefix = "$") {
  if (n === null) return "—";
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `${n < 0 ? "-" : "+"}${prefix}${abs}`;
}

function verdictColor(v: string) {
  if (v === "GO") return "#00E87A";
  if (v === "CAUTION") return "#FFB020";
  return "#FF3B5C";
}

export default function MentalPnL() {
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mental-pnl")
      .then((r) => {
        if (r.status === 403) { setError("premium"); return null; }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => setError("error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (error === "premium") return (
    <div style={{ textAlign: "center", padding: "32px 20px", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, background: "rgba(139,92,246,0.04)" }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>🧠</div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Mental P&L is a Premium feature</div>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20, lineHeight: 1.6 }}>
        See exactly how much your mental state costs you — or earns you — in real dollars.
      </p>
      <a href="/settings" style={{ display: "inline-block", background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
        Upgrade to Premium →
      </a>
    </div>
  );

  if (!data || !data.hasData) return (
    <div style={{ textAlign: "center", padding: "28px 20px", border: "1px solid var(--border)", borderRadius: 14 }}>
      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
        Mental P&L needs at least 7 days of both check-ins and trade journal entries to calculate patterns.
      </div>
    </div>
  );

  const { avgPnl, days, tradedDays, noTradeViolationCost, complianceRate, timeline, noTradeTotalDays, noTradeComplianceSaved } = data;

  // Bar chart: max value for scaling
  const values = [avgPnl.go ?? 0, avgPnl.caution ?? 0, avgPnl.noTrade ?? 0];
  const maxAbs = Math.max(...values.map(Math.abs), 1);

  const BAR_ITEMS = [
    { label: "GO days", value: avgPnl.go, color: "#00E87A", days: tradedDays.go, total: days.go },
    { label: "CAUTION days", value: avgPnl.caution, color: "#FFB020", days: tradedDays.caution, total: days.caution },
    { label: "NO-TRADE days", value: avgPnl.noTrade, color: "#FF3B5C", days: tradedDays.noTrade, total: days.noTrade },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Key callout */}
      {noTradeViolationCost < -50 && (
        <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>⚠️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              Trading on NO-TRADE days cost you {fmt(noTradeViolationCost)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
              On days where your mental score said NO-TRADE, you still traded — and lost. If you had stayed out, your P&L would be {fmt(-noTradeViolationCost)} better.
            </div>
          </div>
        </div>
      )}

      {/* Compliance */}
      {noTradeTotalDays >= 3 && complianceRate !== null && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: complianceRate >= 70 ? "rgba(0,232,122,0.06)" : "rgba(255,176,32,0.06)", border: `1px solid ${complianceRate >= 70 ? "rgba(0,232,122,0.2)" : "rgba(255,176,32,0.2)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>NO-TRADE compliance</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: complianceRate >= 70 ? "var(--green)" : "var(--amber)" }}>{complianceRate}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${complianceRate}%`, borderRadius: 3, background: complianceRate >= 70 ? "var(--green)" : "var(--amber)", transition: "width 0.8s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            {noTradeComplianceSaved} of {noTradeTotalDays} NO-TRADE days correctly avoided
          </div>
        </div>
      )}

      {/* Avg P&L per verdict bar chart */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 14, letterSpacing: "0.06em" }}>AVG P&L PER TRADING DAY BY MENTAL STATE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {BAR_ITEMS.map((item) => {
            const pct = item.value !== null ? Math.abs(item.value) / maxAbs : 0;
            const positive = (item.value ?? 0) >= 0;
            return (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: "var(--text-dim)" }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.value === null ? "var(--text-muted)" : positive ? "var(--green)" : "var(--red)", fontFamily: "monospace" }}>
                    {fmt(item.value)} {item.days > 0 && <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 11 }}>({item.days} days)</span>}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "var(--surface3)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct * 100}%`, borderRadius: 4, background: positive ? item.color : "var(--red)", transition: "width 0.8s ease", opacity: item.value !== null ? 1 : 0 }} />
                </div>
                {item.total > item.days && (
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                    {item.total - item.days} {item.label.split(" ")[0]} days with no trades recorded
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      {timeline.length >= 5 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.06em" }}>LAST 30 DAYS — SCORE vs P&L</div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60, background: "var(--surface2)", borderRadius: 8, padding: "8px 10px", overflow: "hidden" }}>
            {timeline.map((d, i) => {
              const hasPnl = d.pnl !== null;
              const barH = hasPnl ? Math.min(100, Math.abs(d.pnl!) / (Math.max(...timeline.filter(x => x.pnl !== null).map(x => Math.abs(x.pnl!)), 1)) * 100) : 20;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div
                    style={{ width: "100%", height: `${barH}%`, minHeight: 4, borderRadius: 2, background: hasPnl ? ((d.pnl! >= 0) ? "var(--green)" : "var(--red)") : "var(--surface3)", opacity: hasPnl ? 0.85 : 0.4 }}
                    title={`${d.date}: ${d.verdict} (score ${d.score})${hasPnl ? ` | ${fmt(d.pnl)}` : ""}`}
                  />
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: verdictColor(d.verdict), flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E87A", display: "inline-block" }} />GO</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFB020", display: "inline-block" }} />CAUTION</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B5C", display: "inline-block" }} />NO-TRADE</span>
            <span style={{ marginLeft: "auto" }}>Bar height = P&L magnitude</span>
          </div>
        </div>
      )}

    </div>
  );
}