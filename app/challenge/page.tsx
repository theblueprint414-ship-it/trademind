"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { showToast } from "@/components/Toast";

const FIRMS = [
  { value: "apex", label: "Apex Trader Funding" },
  { value: "ftmo", label: "FTMO" },
  { value: "mff", label: "My Funded Futures" },
  { value: "topstep", label: "Topstep" },
  { value: "funded_next", label: "Funded Next" },
  { value: "tradeday", label: "TradeDay" },
  { value: "blueguardian", label: "Blue Guardian" },
  { value: "other", label: "Other / Personal Account" },
];

type ChallengeData = {
  enabled: boolean;
  firm: string | null;
  accountSize: number;
  dailyLimit: number;
  maxDrawdown: number;
  startDate: string | null;
  endDate: string | null;
  profitTarget: number | null;
  tradingDaysTarget: number | null;
  totalPnl: number;
  dailyPnl: number;
  drawdownUsed: number;
  drawdownRemaining: number | null;
  drawdownNearAlert: boolean;
  profitProgress: number | null;
  tradingDaysCompleted: number;
};

function fmt(n: number) {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return (n >= 0 ? "+" : "−") + s;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProgressBar({ pct, color, height = 10 }: { pct: number; color: string; height?: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div style={{ background: "var(--surface3)", borderRadius: 999, height, overflow: "hidden" }}>
      <div style={{ width: `${clamped}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function MetricCard({ label, value, sub, color, alert }: { label: string; value: string; sub?: string; color?: string; alert?: boolean }) {
  return (
    <div style={{ background: alert ? "rgba(255,59,92,0.06)" : "var(--surface)", border: `1px solid ${alert ? "rgba(255,59,92,0.35)" : "var(--border)"}`, borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: color ?? "var(--text)", lineHeight: 1, marginBottom: sub ? 5 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

function SetupForm({ initial, onSave, saving }: {
  initial: Partial<ChallengeData>;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [firm, setFirm] = useState(initial.firm ?? "");
  const [accountSize, setAccountSize] = useState(initial.accountSize ? String(initial.accountSize) : "");
  const [dailyLimit, setDailyLimit] = useState(initial.dailyLimit ? String(initial.dailyLimit) : "5");
  const [maxDrawdown, setMaxDrawdown] = useState(initial.maxDrawdown ? String(initial.maxDrawdown) : "5");
  const [profitTarget, setProfitTarget] = useState(initial.profitTarget ? String(initial.profitTarget) : "10");
  const [tradingDaysTarget, setTradingDaysTarget] = useState(initial.tradingDaysTarget ? String(initial.tradingDaysTarget) : "");
  const [startDate, setStartDate] = useState(initial.startDate ?? new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(initial.endDate ?? "");

  const accNum = parseFloat(accountSize) || 0;
  const ddNum = parseFloat(maxDrawdown) || 0;
  const ptNum = parseFloat(profitTarget) || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Firm */}
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>PROP FIRM / ACCOUNT TYPE</label>
        <select
          value={firm}
          onChange={(e) => setFirm(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", appearance: "none" }}
        >
          <option value="">Select firm…</option>
          {FIRMS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Account size */}
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>ACCOUNT SIZE ($)</label>
        <input
          type="number"
          value={accountSize}
          onChange={(e) => setAccountSize(e.target.value)}
          placeholder="e.g. 100000"
          style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}
        />
      </div>

      {/* Daily limit + Max drawdown row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>DAILY LOSS LIMIT ($)</label>
          <input
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            placeholder="e.g. 1000"
            style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {accNum > 0 && parseFloat(dailyLimit) > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{((parseFloat(dailyLimit) / accNum) * 100).toFixed(2)}% of account</div>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>MAX DRAWDOWN (%)</label>
          <input
            type="number"
            value={maxDrawdown}
            onChange={(e) => setMaxDrawdown(e.target.value)}
            placeholder="e.g. 5"
            style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {accNum > 0 && ddNum > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>${((accNum * ddNum) / 100).toLocaleString()} max loss</div>
          )}
        </div>
      </div>

      {/* Profit target + trading days */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>PROFIT TARGET (%)</label>
          <input
            type="number"
            value={profitTarget}
            onChange={(e) => setProfitTarget(e.target.value)}
            placeholder="e.g. 10"
            style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {accNum > 0 && ptNum > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>${((accNum * ptNum) / 100).toLocaleString()} target</div>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>MIN TRADING DAYS</label>
          <input
            type="number"
            value={tradingDaysTarget}
            onChange={(e) => setTradingDaysTarget(e.target.value)}
            placeholder="optional"
            style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Start / End dates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>START DATE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", colorScheme: "dark" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>END DATE (optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", colorScheme: "dark" }}
          />
        </div>
      </div>

      <button
        onClick={() => onSave({
          enabled: true,
          firm: firm || null,
          accountSize: parseFloat(accountSize) || 0,
          dailyLimit: parseFloat(dailyLimit) || 5,
          maxDrawdown: parseFloat(maxDrawdown) || 5,
          profitTarget: parseFloat(profitTarget) || null,
          tradingDaysTarget: tradingDaysTarget ? parseFloat(tradingDaysTarget) : null,
          startDate: startDate || null,
          endDate: endDate || null,
        })}
        disabled={saving || !accountSize}
        className="btn-primary"
        style={{ width: "100%", padding: 16, fontSize: 15, marginTop: 4, opacity: (!accountSize || saving) ? 0.5 : 1 }}
      >
        {saving ? "Saving…" : "Save Challenge Settings"}
      </button>
    </div>
  );
}

export default function ChallengePage() {
  const [data, setData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const load = useCallback(async () => {
    const [meRes, chalRes] = await Promise.all([
      fetch("/api/me").then((r) => r.json()).catch(() => ({})),
      fetch("/api/challenge").then((r) => r.json()).catch(() => null),
    ]);
    const pro = meRes.plan === "pro" || meRes.plan === "premium";
    setIsPro(pro);
    if (chalRes && !chalRes.error) setData(chalRes);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (d.ok) {
        showToast("Challenge saved", "success");
        setEditing(false);
        await load();
      } else {
        showToast(d.error ?? "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setSaving(false);
  }

  async function handleDisable() {
    setDisabling(true);
    try {
      await fetch("/api/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: false }) });
      showToast("Challenge disabled", "success");
      await load();
    } catch { /* ignore */ }
    setDisabling(false);
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2.5px solid var(--border)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "0 0 90px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🏆</div>
            <div className="font-bebas" style={{ fontSize: 34, letterSpacing: "0.04em", marginBottom: 10 }}>CHALLENGE MODE</div>
            <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6 }}>
              Track your prop firm challenge live — P&L progress, max drawdown, daily limits. Available on Pro and Premium.
            </p>
          </div>
          <Link href="/pricing"><button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 15 }}>Upgrade to Pro →</button></Link>
          <div style={{ textAlign: "center", marginTop: 14 }}><Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: 13 }}>← Back to Dashboard</Link></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const isActive = data?.enabled && data.accountSize > 0;
  const showSetup = !isActive || editing;

  // Live computed metrics
  const profitTargetDollar = isActive && data ? (data.accountSize * (data.profitTarget ?? 10)) / 100 : null;
  const maxDdDollar = isActive && data ? (data.accountSize * data.maxDrawdown) / 100 : null;
  const dailyLimitDollar = isActive && data ? data.dailyLimit : null;
  const pnlColor = !data || data.totalPnl >= 0 ? "var(--green)" : "var(--red)";
  const dailyPnlColor = !data || data.dailyPnl >= 0 ? "var(--green)" : "var(--red)";
  const drawdownPct = data ? data.drawdownUsed : 0;
  const profitPct = data?.profitProgress ?? 0;
  const daysCompleted = data?.tradingDaysCompleted ?? 0;
  const daysTarget = data?.tradingDaysTarget ?? null;
  const daysPct = daysTarget ? Math.min(100, (daysCompleted / daysTarget) * 100) : null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "0 0 90px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 5L7.5 10l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="font-bebas" style={{ fontSize: 28, letterSpacing: "0.04em", lineHeight: 1 }}>CHALLENGE MODE</div>
            {isActive && data?.firm && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {FIRMS.find((f) => f.value === data.firm)?.label ?? data.firm}
                {data.startDate && ` · Since ${fmtDate(data.startDate)}`}
              </div>
            )}
          </div>
          {isActive && !editing && (
            <button onClick={() => setEditing(true)} style={{ marginLeft: "auto", background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Edit
            </button>
          )}
        </div>

        {/* Drawdown near-limit alert */}
        {isActive && data?.drawdownNearAlert && (
          <div style={{ background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.4)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}><path d="M9 2L16.5 15H1.5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 7v4M9 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", marginBottom: 3 }}>Drawdown Warning</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>You&apos;ve used {drawdownPct.toFixed(1)}% of your max drawdown. Trade smaller or sit out today.</div>
            </div>
          </div>
        )}

        {showSetup ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 20px", marginBottom: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{editing ? "Edit Challenge Settings" : "Set Up Your Challenge"}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Enter your prop firm rules. TradeMind will track your live P&L against these limits automatically.</div>
            </div>
            <SetupForm initial={data ?? {}} onSave={handleSave} saving={saving} />
            {editing && (
              <button onClick={() => setEditing(false)} style={{ width: "100%", marginTop: 10, padding: 12, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Live metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <MetricCard label="TOTAL P&L" value={fmt(data?.totalPnl ?? 0)} color={pnlColor} />
              <MetricCard label="TODAY'S P&L" value={fmt(data?.dailyPnl ?? 0)} color={dailyPnlColor} />
              <MetricCard label="DRAWDOWN USED" value={`${drawdownPct.toFixed(1)}%`} sub={maxDdDollar ? `$${maxDdDollar.toLocaleString()} max` : undefined} color={drawdownPct > 70 ? "var(--red)" : drawdownPct > 40 ? "var(--amber)" : "var(--green)"} alert={data?.drawdownNearAlert} />
              <MetricCard label="DAILY LIMIT" value={dailyLimitDollar ? `$${dailyLimitDollar.toLocaleString()}` : "—"} sub={data?.dailyPnl && dailyLimitDollar ? `$${Math.max(0, dailyLimitDollar + (data.dailyPnl < 0 ? data.dailyPnl : 0)).toLocaleString()} remaining` : undefined} />
            </div>

            {/* Profit target progress */}
            {profitTargetDollar !== null && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 3 }}>PROFIT TARGET</div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>${profitTargetDollar.toLocaleString()} goal</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: profitPct >= 100 ? "var(--green)" : "var(--blue)" }}>{Math.round(profitPct)}%</div>
                </div>
                <ProgressBar pct={profitPct} color={profitPct >= 100 ? "var(--green)" : "var(--blue)"} height={12} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
                  <span>{fmt(data?.totalPnl ?? 0)}</span>
                  <span>+${profitTargetDollar.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Max drawdown bar */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 3 }}>MAX DRAWDOWN USED</div>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>{maxDdDollar ? `$${maxDdDollar.toLocaleString()} limit` : `${data?.maxDrawdown ?? 0}% limit`}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: drawdownPct > 70 ? "var(--red)" : drawdownPct > 40 ? "var(--amber)" : "var(--green)" }}>{drawdownPct.toFixed(1)}%</div>
              </div>
              <ProgressBar pct={drawdownPct} color={drawdownPct > 70 ? "var(--red)" : drawdownPct > 40 ? "var(--amber)" : "var(--green)"} height={12} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
                <span>$0</span>
                {data?.drawdownRemaining !== null && data?.drawdownRemaining !== undefined && (
                  <span style={{ color: data.drawdownNearAlert ? "var(--red)" : "var(--text-muted)" }}>${data.drawdownRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining</span>
                )}
              </div>
            </div>

            {/* Trading days */}
            {daysTarget !== null && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 3 }}>TRADING DAYS</div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>{daysTarget} days minimum</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{daysCompleted}<span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>/{daysTarget}</span></div>
                </div>
                <ProgressBar pct={daysPct ?? 0} color="var(--blue)" height={10} />
              </div>
            )}

            {/* Challenge info */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 12, color: "var(--text-muted)" }}>
                {data?.firm && <span>Firm: <strong style={{ color: "var(--text)" }}>{FIRMS.find((f) => f.value === data.firm)?.label ?? data.firm}</strong></span>}
                <span>Account: <strong style={{ color: "var(--text)" }}>${(data?.accountSize ?? 0).toLocaleString()}</strong></span>
                {data?.startDate && <span>Started: <strong style={{ color: "var(--text)" }}>{fmtDate(data.startDate)}</strong></span>}
                {data?.endDate && <span>Deadline: <strong style={{ color: "var(--text)" }}>{fmtDate(data.endDate)}</strong></span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <Link href="/journal" style={{ flex: 1, textDecoration: "none" }}>
                <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 14 }}>View Journal →</button>
              </Link>
              <Link href="/analytics" style={{ flex: 1, textDecoration: "none" }}>
                <button className="btn-ghost" style={{ width: "100%", padding: 14, fontSize: 14 }}>Analytics →</button>
              </Link>
            </div>

            {/* Disable */}
            <div style={{ textAlign: "center", paddingBottom: 8 }}>
              <button onClick={handleDisable} disabled={disabling} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                {disabling ? "Disabling…" : "Disable challenge mode"}
              </button>
            </div>
          </>
        )}

        {/* Not active yet — prompt to set up */}
        {!isActive && !showSetup && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No active challenge</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Set up your prop firm rules and track your progress live.</div>
            <button onClick={() => setEditing(true)} className="btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>Set Up Challenge →</button>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
