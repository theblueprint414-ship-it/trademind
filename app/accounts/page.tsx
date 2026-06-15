"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AccountStat = {
  id: string;
  name: string;
  currency: string;
  isDefault: boolean;
  startingBalance: number | null;
  currentBalance: number | null;
  totalPnl: number;
  todayPnl: number;
  last30Pnl: number;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
  avgR: number | null;
  drawdownUsedPct: number | null;
  drawdownRemainingDollar: number | null;
  dailyDrawdownPct: number | null;
  status: "healthy" | "caution" | "danger";
  last7Days: { date: string; pnl: number }[];
};

type Summary = {
  accounts: AccountStat[];
  combined: {
    totalPnl: number;
    todayPnl: number;
    totalTrades: number;
    winRate: number;
  };
  unassignedCount: number;
  unassignedPnl: number;
};

function fmt(n: number, currency = "USD") {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : abs.toFixed(0);
  return (n < 0 ? "-" : "+") + "$" + s;
}

function fmtExact(n: number) {
  return (n >= 0 ? "+" : "") + n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function Sparkline({ data }: { data: { date: string; pnl: number }[] }) {
  if (!data.length) return null;
  const vals = data.map((d) => d.pnl);
  const max = Math.max(...vals.map(Math.abs), 1);
  const mid = 24;
  const w = 56;

  return (
    <svg width={w} height={32} viewBox={`0 0 ${w} 32`} style={{ display: "block" }}>
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (w - 4) + 2;
        const barH = Math.max(2, (Math.abs(d.pnl) / max) * 14);
        const isPos = d.pnl >= 0;
        return (
          <rect
            key={d.date}
            x={x - 2}
            width={4}
            y={isPos ? mid - barH : mid}
            height={barH}
            rx={1}
            fill={isPos ? "var(--green)" : "var(--red)"}
            opacity={0.85}
          />
        );
      })}
      <line x1={0} y1={mid} x2={w} y2={mid} stroke="var(--border)" strokeWidth={0.5} />
    </svg>
  );
}

function DrawdownBar({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100);
  const color = pct >= 8 ? "var(--red)" : pct >= 5 ? "var(--amber)" : "var(--green)";
  return (
    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${clamped}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
    </div>
  );
}

const STATUS_CONFIG = {
  healthy: { color: "var(--green)", label: "HEALTHY", bg: "rgba(0,200,150,0.1)" },
  caution: { color: "var(--amber)", label: "CAUTION", bg: "rgba(245,158,11,0.1)" },
  danger: { color: "var(--red)", label: "DANGER", bg: "rgba(239,68,68,0.1)" },
};

export default function AccountsDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/accounts/summary")
      .then((r) => r.json())
      .then((d) => {
        if (d.accounts) setData(d);
        else setError(d.error ?? "Failed to load");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p style={{ color: "var(--text-muted)", textAlign: "center" }}>{error}</p>
        <Link href="/settings" style={{ color: "var(--blue)", fontSize: 14 }}>Go to Settings →</Link>
      </div>
    );
  }

  if (!data) return null;

  const { combined, accounts, unassignedCount, unassignedPnl } = data;
  const noAccounts = accounts.length === 0;
  const dangerCount = accounts.filter((a) => a.status === "danger").length;
  const cautionCount = accounts.filter((a) => a.status === "caution").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 100 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .account-card { transition: box-shadow 0.15s; }
        .account-card:active { box-shadow: 0 0 0 2px var(--blue) !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 16px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 22, lineHeight: 1 }}>←</Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.5px" }}>Prop Accounts</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, marginTop: 2 }}>
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Link
          href="/settings#accounts"
          style={{ marginLeft: "auto", padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text)", textDecoration: "none" }}
        >
          + Add
        </Link>
      </div>

      {/* Alert bar if any danger */}
      {dangerCount > 0 && (
        <div style={{ margin: "16px 16px 0", padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <p style={{ margin: 0, fontSize: 13, color: "var(--red)", fontWeight: 600 }}>
            {dangerCount} account{dangerCount > 1 ? "s are" : " is"} in DANGER — drawdown limit approaching
          </p>
        </div>
      )}
      {dangerCount === 0 && cautionCount > 0 && (
        <div style={{ margin: "16px 16px 0", padding: "12px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: 13, color: "var(--amber)", fontWeight: 600 }}>
            {cautionCount} account{cautionCount > 1 ? "s are" : " is"} in CAUTION — watch your drawdown
          </p>
        </div>
      )}

      {/* Combined overview */}
      {!noAccounts && (
        <div style={{ margin: "16px 16px 0", padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", margin: "0 0 12px" }}>ALL ACCOUNTS COMBINED</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Total P&L</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: combined.totalPnl >= 0 ? "var(--green)" : "var(--red)", margin: 0, letterSpacing: "-1px" }}>
                {fmtExact(combined.totalPnl)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Today</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: combined.todayPnl >= 0 ? "var(--green)" : "var(--red)", margin: 0, letterSpacing: "-1px" }}>
                {fmtExact(combined.todayPnl)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Win Rate</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: combined.winRate >= 50 ? "var(--green)" : "var(--amber)", margin: 0 }}>
                {combined.winRate.toFixed(0)}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>Total Trades</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {combined.totalTrades.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account cards */}
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {noAccounts ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏦</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>No Accounts Yet</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px", lineHeight: 1.5 }}>
              Add your prop firm accounts (FTMO, Apex, TopStep) to track them side by side.
            </p>
            <Link
              href="/settings#accounts"
              style={{ display: "inline-block", padding: "12px 24px", background: "var(--blue)", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            >
              + Add First Account
            </Link>
          </div>
        ) : (
          accounts.map((acc) => {
            const cfg = STATUS_CONFIG[acc.status];
            const isExpanded = expandedId === acc.id;

            return (
              <div
                key={acc.id}
                className="account-card"
                onClick={() => setExpandedId(isExpanded ? null : acc.id)}
                style={{ background: "var(--surface)", border: `1px solid ${acc.status !== "healthy" ? cfg.color + "40" : "var(--border)"}`, borderRadius: 16, padding: 16, cursor: "pointer" }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {acc.name}
                      </p>
                      {acc.isDefault && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", background: "rgba(94,106,210,0.15)", color: "var(--blue)", borderRadius: 4, letterSpacing: "0.06em", flexShrink: 0 }}>DEFAULT</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", padding: "3px 7px", background: cfg.bg, color: cfg.color, borderRadius: 6 }}>
                        {cfg.label}
                      </span>
                      {acc.total > 0 && (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{acc.total} trades</span>
                      )}
                    </div>
                  </div>

                  {/* Sparkline */}
                  <Sparkline data={acc.last7Days} />

                  {/* P&L */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: acc.totalPnl >= 0 ? "var(--green)" : "var(--red)", margin: 0, letterSpacing: "-0.5px" }}>
                      {fmt(acc.totalPnl, acc.currency)}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                      Today: <span style={{ color: acc.todayPnl >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{fmt(acc.todayPnl, acc.currency)}</span>
                    </p>
                  </div>
                </div>

                {/* Drawdown bar (always visible if we have data) */}
                {acc.drawdownUsedPct !== null && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Drawdown used</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: acc.drawdownUsedPct >= 8 ? "var(--red)" : acc.drawdownUsedPct >= 5 ? "var(--amber)" : "var(--green)" }}>
                        {acc.drawdownUsedPct.toFixed(1)}%
                      </span>
                    </div>
                    <DrawdownBar pct={acc.drawdownUsedPct} />
                    {acc.drawdownRemainingDollar !== null && (
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "4px 0 0" }}>
                        ${acc.drawdownRemainingDollar.toLocaleString("en-US", { maximumFractionDigits: 0 })} remaining before limit
                      </p>
                    )}
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      <div style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 10 }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", letterSpacing: "0.05em" }}>WIN RATE</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: acc.winRate >= 50 ? "var(--green)" : "var(--amber)", margin: 0 }}>{acc.winRate.toFixed(0)}%</p>
                      </div>
                      <div style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 10 }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", letterSpacing: "0.05em" }}>AVG R</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: (acc.avgR ?? 0) >= 0 ? "var(--green)" : "var(--red)", margin: 0 }}>
                          {acc.avgR !== null ? (acc.avgR >= 0 ? "+" : "") + acc.avgR.toFixed(2) + "R" : "—"}
                        </p>
                      </div>
                      <div style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 10 }}>
                        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px", letterSpacing: "0.05em" }}>30D P&L</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: acc.last30Pnl >= 0 ? "var(--green)" : "var(--red)", margin: 0 }}>
                          {fmt(acc.last30Pnl, acc.currency)}
                        </p>
                      </div>
                    </div>

                    {acc.startingBalance !== null && (
                      <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--bg)", borderRadius: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px" }}>STARTING BALANCE</p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>${acc.startingBalance.toLocaleString()}</p>
                          </div>
                          {acc.currentBalance !== null && (
                            <div style={{ textAlign: "right" }}>
                              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 4px" }}>CURRENT BALANCE</p>
                              <p style={{ fontSize: 14, fontWeight: 600, color: acc.currentBalance >= acc.startingBalance ? "var(--green)" : "var(--red)", margin: 0 }}>
                                ${acc.currentBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <Link
                        href={`/analytics?account=${acc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, textAlign: "center", padding: "10px 0", background: "rgba(94,106,210,0.1)", color: "var(--blue)", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                      >
                        View Analytics
                      </Link>
                      <Link
                        href={`/journal?account=${acc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, textAlign: "center", padding: "10px 0", background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                      >
                        Journal
                      </Link>
                    </div>
                  </div>
                )}

                {/* Expand chevron */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none", display: "inline-block" }}>▼</span>
                </div>
              </div>
            );
          })
        )}

        {/* Unassigned trades notice */}
        {unassignedCount > 0 && (
          <div style={{ padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                {unassignedCount} unassigned trade{unassignedCount > 1 ? "s" : ""}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                P&L: <span style={{ color: unassignedPnl >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{fmtExact(unassignedPnl)}</span>
                {" · "}Not linked to an account
              </p>
            </div>
            <Link
              href="/journal"
              style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}
            >
              View →
            </Link>
          </div>
        )}

        {/* Tips */}
        {!noAccounts && (
          <div style={{ padding: "14px 16px", background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.15)", borderRadius: 12, marginTop: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", margin: "0 0 6px", letterSpacing: "0.05em" }}>💡 PRO TIP</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              Assign trades to accounts when logging in the journal to track each prop firm challenge independently. Tap any card to expand details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
