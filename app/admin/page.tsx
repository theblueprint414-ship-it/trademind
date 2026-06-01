"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stats = {
  timestamp: string;
  users: {
    total: number; pro: number; premium: number; free: number;
    signups7d: number; signups30d: number;
    recent: { id: string; email: string; name: string | null; plan: string; createdAt: string }[];
    planDistribution: { plan: string; _count: { plan: number } }[];
  };
  engagement: {
    checkinsToday: number; checkins7d: number;
    tradesTotal: number; tradesThisWeek: number;
    verdictsToday: { verdict: string; _count: { verdict: number } }[];
    checkinsByDay: { date: string; _count: { date: number } }[];
  };
  brokers: {
    connected: number; errors: number; none: number;
    breakdown: { broker: string; _count: { broker: number } }[];
  };
  funnel: { totalSignups: number; didCheckin: number; loggedTrade: number; upgraded: number };
  errors: {
    last24hErrors: number; last24hWarnings: number;
    topErrors: { id: string; message: string; route: string | null; createdAt: string }[];
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(a: number, b: number) {
  if (!b) return "0%";
  return `${Math.round((a / b) * 100)}%`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Metric({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 12, padding: "20px 22px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#52565e", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: color ?? "#f0f0f2", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#52565e", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: ok ? "#00E87A" : "#FF3B5C", boxShadow: `0 0 6px ${ok ? "#00E87A" : "#FF3B5C"}`, flexShrink: 0 }} />;
}

// ─── Funnel Bar ───────────────────────────────────────────────────────────────

function FunnelStep({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const p = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#a0a3a9", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{value} <span style={{ fontSize: 11, color: "#52565e", fontWeight: 400 }}>({pct(value, total)})</span></span>
      </div>
      <div style={{ height: 8, background: "#1e2025", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: { date: string; _count: { date: number } }[] }) {
  if (data.length < 2) return <span style={{ fontSize: 11, color: "#52565e" }}>no data</span>;
  const vals = data.map((d) => d._count.date);
  const max = Math.max(...vals, 1);
  const W = 140; const H = 32; const pad = 2;
  const step = (W - pad * 2) / (vals.length - 1);
  const pts = vals.map((v, i) => `${pad + i * step},${H - pad - ((v / max) * (H - pad * 2))}`).join(" ");
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke="#5e6ad2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [secret, setSecret] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_secret") ?? "" : "");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<Record<string, { ok: boolean; loading: boolean; msg?: string }>>({});
  const [tab, setTab] = useState<"overview" | "errors" | "users">("overview");

  const load = useCallback(async (s = secret) => {
    setLoading(true);
    const res = await fetch("/api/admin/stats", { headers: { authorization: `Bearer ${s}` } });
    if (res.status === 401) { alert("Wrong secret"); setLoading(false); return; }
    const data = await res.json();
    setStats(data);
    setAuthed(true);
    localStorage.setItem("admin_secret", s);
    setLoading(false);
  }, [secret]);

  // Auto-load if secret already saved
  useEffect(() => {
    if (secret) load(secret);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function triggerAgent(agent: string) {
    setTriggerResult((p) => ({ ...p, [agent]: { ok: false, loading: true } }));
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${secret}` },
        body: JSON.stringify({ agent }),
      });
      const data = await res.json();
      setTriggerResult((p) => ({ ...p, [agent]: { ok: res.ok, loading: false, msg: JSON.stringify(data, null, 2) } }));
    } catch (err) {
      setTriggerResult((p) => ({ ...p, [agent]: { ok: false, loading: false, msg: String(err) } }));
    }
  }

  if (!authed) {
    return (
      <div style={{ background: "#07080a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 16, padding: "40px 44px", width: "100%", maxWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5e6ad2", boxShadow: "0 0 10px #5e6ad2" }} />
            <span style={{ color: "#f0f0f2", fontSize: 18, fontWeight: 800, letterSpacing: "0.02em" }}>TradeMind Command Center</span>
          </div>
          <p style={{ color: "#52565e", fontSize: 13, marginBottom: 28 }}>Enter CRON_SECRET to access</p>
          <input
            type="password"
            placeholder="CRON_SECRET"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            autoFocus
            style={{ width: "100%", background: "#141618", border: "1px solid #1e2025", borderRadius: 10, padding: "13px 16px", color: "#f0f0f2", fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none", fontFamily: "monospace" }}
          />
          <button onClick={() => load()} disabled={loading} style={{ width: "100%", background: "#5e6ad2", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Loading…" : "Enter →"}
          </button>
        </div>
      </div>
    );
  }

  const s = stats;
  const paying = (s?.users.pro ?? 0) + (s?.users.premium ?? 0);

  return (
    <div style={{ background: "#07080a", minHeight: "100vh", color: "#f0f0f2", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Top nav */}
      <div style={{ borderBottom: "1px solid #1e2025", padding: "14px 28px", display: "flex", alignItems: "center", gap: 20, background: "#0a0b0d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5e6ad2", boxShadow: "0 0 8px #5e6ad2" }} />
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.03em", color: "#f0f0f2" }}>COMMAND CENTER</span>
        </div>
        <div style={{ fontSize: 11, color: "#52565e" }}>Last updated: {s ? timeAgo(s.timestamp) : "—"}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {(["overview", "errors", "users"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: tab === t ? "#1e2025" : "transparent", color: tab === t ? "#f0f0f2" : "#52565e", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
          <button onClick={() => load()} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #1e2025", background: "transparent", color: "#52565e", fontSize: 12, cursor: "pointer" }}>
            ↻ Refresh
          </button>
          <Link href="/admin/agents" style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #5e6ad240", background: "rgba(94,106,210,0.1)", color: "#5e6ad2", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            Agents Map →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 28px" }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && s && (
          <>
            {/* North Star */}
            <div style={{ background: "linear-gradient(135deg,rgba(94,106,210,0.1),rgba(0,232,122,0.05))", border: "1px solid rgba(94,106,210,0.25)", borderRadius: 16, padding: "20px 28px", marginBottom: 28, display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#5e6ad2", marginBottom: 4 }}>NORTH STAR</div>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#f0f0f2", lineHeight: 1 }}>{s.engagement.checkins7d}</div>
                <div style={{ fontSize: 12, color: "#52565e", marginTop: 4 }}>check-ins last 7 days</div>
              </div>
              <div style={{ width: 1, height: 56, background: "#1e2025" }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#00E87A", marginBottom: 4 }}>TODAY</div>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#00E87A", lineHeight: 1 }}>{s.engagement.checkinsToday}</div>
                <div style={{ fontSize: 12, color: "#52565e", marginTop: 4 }}>check-ins today</div>
              </div>
              <div style={{ width: 1, height: 56, background: "#1e2025" }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#FFB020", marginBottom: 4 }}>REVENUE</div>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#FFB020", lineHeight: 1 }}>{paying}</div>
                <div style={{ fontSize: 12, color: "#52565e", marginTop: 4 }}>paying users</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#52565e", marginBottom: 8 }}>VERDICTS TODAY</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { v: "GO", color: "#00E87A" },
                    { v: "CAUTION", color: "#FFB020" },
                    { v: "NO-TRADE", color: "#FF3B5C" },
                  ].map(({ v, color }) => {
                    const cnt = s.engagement.verdictsToday.find((x) => x.verdict === v)?._count.verdict ?? 0;
                    return (
                      <div key={v} style={{ textAlign: "center", padding: "10px 16px", borderRadius: 10, background: `${color}12`, border: `1px solid ${color}30` }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color }}>{cnt}</div>
                        <div style={{ fontSize: 9, color, letterSpacing: "0.1em", marginTop: 2 }}>{v}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
              <Metric label="TOTAL USERS" value={s.users.total} sub={`+${s.users.signups7d} this week`} />
              <Metric label="PRO + PREMIUM" value={paying} sub={`${pct(paying, s.users.total)} of all users`} color="#5e6ad2" />
              <Metric label="TRADES LOGGED" value={s.engagement.tradesTotal.toLocaleString()} sub={`${s.engagement.tradesThisWeek} this week`} color="#00E87A" />
              <Metric label="ERRORS (24H)" value={s.errors.last24hErrors} sub={`${s.errors.last24hWarnings} warnings`} color={s.errors.last24hErrors > 0 ? "#FF3B5C" : "#00E87A"} />
            </div>

            {/* Funnel + Brokers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

              {/* Funnel */}
              <div style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 14, padding: "24px 26px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#52565e", marginBottom: 20 }}>CONVERSION FUNNEL</div>
                <FunnelStep label="Signed up" value={s.funnel.totalSignups} total={s.funnel.totalSignups} color="#5e6ad2" />
                <FunnelStep label="Did first check-in" value={s.funnel.didCheckin} total={s.funnel.totalSignups} color="#8B5CF6" />
                <FunnelStep label="Logged a trade" value={s.funnel.loggedTrade} total={s.funnel.totalSignups} color="#00C896" />
                <FunnelStep label="Upgraded to Pro" value={s.funnel.upgraded} total={s.funnel.totalSignups} color="#FFB020" />
              </div>

              {/* Broker */}
              <div style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 14, padding: "24px 26px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#52565e", marginBottom: 20 }}>BROKER CONNECTIONS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 10, background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.15)" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#00E87A" }}>{s.brokers.connected}</div>
                    <div style={{ fontSize: 10, color: "#52565e", marginTop: 4 }}>CONNECTED</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 10, background: s.brokers.errors > 0 ? "rgba(255,59,92,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${s.brokers.errors > 0 ? "rgba(255,59,92,0.2)" : "#1e2025"}` }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: s.brokers.errors > 0 ? "#FF3B5C" : "#52565e" }}>{s.brokers.errors}</div>
                    <div style={{ fontSize: 10, color: "#52565e", marginTop: 4 }}>ERRORS</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "14px 10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid #1e2025" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#52565e" }}>{s.brokers.none}</div>
                    <div style={{ fontSize: 10, color: "#52565e", marginTop: 4 }}>NONE</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {s.brokers.breakdown.map((b) => (
                    <div key={b.broker} style={{ padding: "4px 10px", borderRadius: 6, background: "#1e2025", fontSize: 11, color: "#a0a3a9", display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>{b._count.broker}</span>
                      <span style={{ color: "#52565e" }}>{b.broker}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Check-in sparkline + plan distribution */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              <div style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 14, padding: "24px 26px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#52565e", marginBottom: 16 }}>CHECK-INS LAST 7 DAYS</div>
                <Sparkline data={s.engagement.checkinsByDay} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#52565e" }}>
                  {s.engagement.checkinsByDay.map((d) => (
                    <span key={d.date}>{new Date(d.date + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 14, padding: "24px 26px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#52565e", marginBottom: 16 }}>PLAN DISTRIBUTION</div>
                {s.users.planDistribution.map((p) => {
                  const colors: Record<string, string> = { free: "#52565e", pro: "#5e6ad2", premium: "#8B5CF6" };
                  const c = colors[p.plan] ?? "#52565e";
                  return (
                    <div key={p.plan} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: c, fontWeight: 700, textTransform: "capitalize" }}>{p.plan}</span>
                        <span style={{ color: "#a0a3a9" }}>{p._count.plan} ({pct(p._count.plan, s.users.total)})</span>
                      </div>
                      <div style={{ height: 5, background: "#1e2025", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct(p._count.plan, s.users.total), background: c, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top errors */}
            {s.errors.topErrors.length > 0 && (
              <div style={{ background: "#0f1011", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 14, padding: "24px 26px", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF3B5C", boxShadow: "0 0 6px #FF3B5C" }} />
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#52565e" }}>RECENT ERRORS</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.errors.topErrors.map((e) => (
                    <div key={e.id} style={{ display: "flex", gap: 14, padding: "12px 16px", background: "#141618", borderRadius: 10, border: "1px solid #1e2025" }}>
                      <div style={{ fontSize: 11, color: "#FF3B5C", fontWeight: 600, minWidth: 160, flexShrink: 0 }}>{e.route ?? "unknown"}</div>
                      <div style={{ fontSize: 12, color: "#a0a3a9", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.message}</div>
                      <div style={{ fontSize: 11, color: "#52565e", flexShrink: 0 }}>{timeAgo(e.createdAt)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setTab("errors")} style={{ fontSize: 12, color: "#5e6ad2", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                    View all errors →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ERRORS TAB ── */}
        {tab === "errors" && (
          <ErrorsTab secret={secret} />
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && s && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#52565e", marginBottom: 20 }}>RECENT SIGNUPS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.users.recent.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", background: "#0f1011", border: "1px solid #1e2025", borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e2025", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#5e6ad2", flexShrink: 0 }}>
                    {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f2", marginBottom: 2 }}>{u.name ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "#52565e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                  <div style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: u.plan === "premium" ? "rgba(139,92,246,0.15)" : u.plan === "pro" ? "rgba(94,106,210,0.15)" : "#1e2025", color: u.plan === "premium" ? "#8B5CF6" : u.plan === "pro" ? "#5e6ad2" : "#52565e" }}>
                    {u.plan}
                  </div>
                  <div style={{ fontSize: 12, color: "#52565e", flexShrink: 0 }}>{timeAgo(u.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Errors sub-tab (reuses existing /api/admin/errors) ──────────────────────

function ErrorsTab({ secret }: { secret: string }) {
  const [errors, setErrors] = useState<{ id: string; message: string; stack: string | null; route: string | null; userId: string | null; level: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [level, setLevel] = useState<"error" | "warn">("error");

  const load = useCallback(async (lvl = level) => {
    setLoading(true);
    const res = await fetch(`/api/admin/errors?level=${lvl}&limit=100`, { headers: { authorization: `Bearer ${secret}` } });
    const data = await res.json();
    setErrors(data.errors ?? []);
    setLoading(false);
  }, [secret, level]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["error", "warn"] as const).map((lvl) => (
          <button key={lvl} onClick={() => { setLevel(lvl); load(lvl); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: level === lvl ? "#1e2025" : "transparent", color: level === lvl ? "#f0f0f2" : "#52565e", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {lvl === "error" ? "🔴 Errors" : "🟡 Warnings"} ({errors.filter((e) => e.level === lvl).length})
          </button>
        ))}
        <button onClick={() => load(level)} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 8, border: "1px solid #1e2025", background: "transparent", color: "#52565e", fontSize: 12, cursor: "pointer" }}>
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {errors.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#52565e" }}>No {level}s 🎉</div>}
        {errors.map((e) => (
          <div key={e.id} onClick={() => setExpanded(expanded === e.id ? null : e.id)} style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
            <div style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <StatusDot ok={false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#FF3B5C", fontWeight: 600, marginBottom: 3 }}>{e.route ?? "unknown"}</div>
                <div style={{ fontSize: 13, color: "#f0f0f2", wordBreak: "break-word" }}>{e.message}</div>
              </div>
              <div style={{ fontSize: 11, color: "#52565e", flexShrink: 0 }}>{new Date(e.createdAt).toLocaleString()}</div>
            </div>
            {expanded === e.id && e.stack && (
              <div style={{ borderTop: "1px solid #1e2025", padding: "14px 18px", background: "#141618" }}>
                <pre style={{ fontSize: 11, color: "#8a8f98", overflowX: "auto", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{e.stack}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
