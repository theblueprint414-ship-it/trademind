"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const TV_COLOR = "#5e6ad2";
const TV_BG    = "rgba(94,106,210,0.08)";
const TV_BD    = "rgba(94,106,210,0.25)";

type ConnectionStatus = {
  connected: boolean;
  broker?: string;
  environment?: string;
  status?: string;
  lastSyncAt?: string | null;
};

type SyncResult = {
  trades: number;
  dailyPnl: number | null;
};

type RecentTrade = {
  date: string;
  symbol: string;
  side: string;
  pnl: number | null;
};

export default function TradovateSettingsPage() {
  const [conn, setConn]     = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [env, setEnv]           = useState<"live" | "paper">("live");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  // Post-connect state
  const [syncResult, setSyncResult]   = useState<SyncResult | null>(null);
  const [syncing, setSyncing]         = useState(false);
  const [syncError, setSyncError]     = useState("");
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  // Disconnect
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Token refresh
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch("/api/broker")
      .then((r) => r.json())
      .then((d) => {
        setConn(d);
        if (d.connected && d.broker === "tradovate") loadRecentTrades();
      })
      .catch(() => setConn({ connected: false }))
      .finally(() => setLoading(false));
  }, []);

  async function loadRecentTrades() {
    setTradesLoading(true);
    try {
      const res = await fetch("/api/journal?limit=10");
      if (!res.ok) return;
      const d = await res.json();
      if (Array.isArray(d.entries)) {
        setRecentTrades(
          d.entries
            .filter((t: RecentTrade) => t.symbol)
            .slice(0, 10)
        );
      }
    } catch { /* silent */ } finally {
      setTradesLoading(false);
    }
  }

  async function connect() {
    if (!username.trim() || !password.trim()) return;
    setConnecting(true);
    setConnectError("");
    try {
      const res = await fetch("/api/broker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broker: "tradovate",
          apiKey: username.trim(),
          apiSecret: password.trim(),
          environment: env,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error ?? "Connection failed. Check your credentials.");
        return;
      }
      // Refresh connection state
      setConn({ connected: true, broker: "tradovate", environment: env, status: "active", lastSyncAt: new Date().toISOString() });
      setSyncResult({ trades: data.tradesCount ?? 0, dailyPnl: null });
      setPassword("");
      loadRecentTrades();
    } catch {
      setConnectError("Network error. Please try again.");
    } finally {
      setConnecting(false);
    }
  }

  async function syncNow() {
    setSyncing(true);
    setSyncError("");
    try {
      const res = await fetch("/api/broker/sync", { method: "POST" });
      if (res.status === 401 || res.status === 403) {
        // Token likely expired — attempt renewal first
        const refresh = await fetch("/api/broker/tradovate-refresh", { method: "POST" });
        if (!refresh.ok) {
          const rd = await refresh.json();
          setSyncError(rd.error ?? "Session expired — please reconnect.");
          setConn((c) => c ? { ...c, status: "error" } : c);
          return;
        }
        // Retry sync after refresh
        const retry = await fetch("/api/broker/sync", { method: "POST" });
        if (!retry.ok) { setSyncError("Sync failed after token refresh."); return; }
        const rd2 = await retry.json();
        setSyncResult({ trades: rd2.trades ?? 0, dailyPnl: rd2.dailyPnl ?? null });
      } else if (!res.ok) {
        const d = await res.json();
        setSyncError(d.error ?? "Sync failed");
      } else {
        const d = await res.json();
        setSyncResult({ trades: d.trades ?? 0, dailyPnl: d.dailyPnl ?? null });
        setConn((c) => c ? { ...c, lastSyncAt: new Date().toISOString(), status: "active" } : c);
        loadRecentTrades();
      }
    } catch {
      setSyncError("Network error during sync.");
    } finally {
      setSyncing(false);
    }
  }

  async function refreshToken() {
    setRefreshing(true);
    const res = await fetch("/api/broker/tradovate-refresh", { method: "POST" });
    if (res.ok) {
      setConn((c) => c ? { ...c, status: "active" } : c);
    } else {
      const d = await res.json();
      setSyncError(d.error ?? "Token refresh failed.");
    }
    setRefreshing(false);
  }

  async function disconnect() {
    setDisconnecting(true);
    await fetch("/api/broker", { method: "DELETE" }).catch(() => {});
    setConn({ connected: false });
    setSyncResult(null);
    setRecentTrades([]);
    setDisconnectConfirm(false);
    setDisconnecting(false);
  }

  const isTradovate = conn?.connected && conn.broker === "tradovate";

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="app-header">
          <Link href="/settings"><button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Settings</button></Link>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Tradovate</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${TV_BG}`, borderTopColor: TV_COLOR, animation: "spin 0.8s linear infinite" }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .tv-fade { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .tv-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 10px; padding: 13px 14px; font-size: 14px; color: var(--text);
          outline: none; box-sizing: border-box; transition: border-color 0.15s;
        }
        .tv-input:focus { border-color: ${TV_COLOR}; }
        .tv-env-btn {
          flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 700;
          cursor: pointer; border: 1px solid var(--border); transition: all 0.15s;
          letter-spacing: 0.02em;
        }
        .tv-env-btn.active {
          background: ${TV_BG}; border-color: ${TV_COLOR}; color: ${TV_COLOR};
        }
        .tv-env-btn:not(.active) { background: var(--surface2); color: var(--text-muted); }
      `}</style>

      {/* Header */}
      <div className="app-header">
        <Link href="/settings">
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Settings</button>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: TV_BG, border: `1px solid ${TV_BD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: TV_COLOR, letterSpacing: "0.05em" }}>TRD</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Tradovate</span>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 100px" }}>

        {/* ── CONNECTED STATE ── */}
        {isTradovate ? (
          <div className="tv-fade">

            {/* Status card */}
            <div className="card" style={{ padding: "22px 24px", marginBottom: 16, border: `1px solid ${conn.status === "active" ? "rgba(0,232,122,0.25)" : "rgba(255,59,92,0.25)"}`, background: conn.status === "active" ? "rgba(0,232,122,0.04)" : "rgba(255,59,92,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: TV_BG, border: `1px solid ${TV_BD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: TV_COLOR, letterSpacing: "0.05em", flexShrink: 0 }}>TRD</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Tradovate</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: conn.status === "active" ? "rgba(0,232,122,0.12)" : "rgba(255,59,92,0.12)", color: conn.status === "active" ? "var(--green)" : "var(--red)", border: `1px solid ${conn.status === "active" ? "rgba(0,232,122,0.3)" : "rgba(255,59,92,0.3)"}`, letterSpacing: "0.06em" }}>
                      {conn.status === "active" ? "ACTIVE" : "ERROR"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {conn.environment === "paper" ? "Demo / Paper" : "Live"} account
                    {conn.lastSyncAt && (
                      <span> · Last sync: {new Date(conn.lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Error state: show refresh token option */}
              {conn.status === "error" && (
                <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
                  Session may have expired. Try refreshing your token, or disconnect and reconnect if the issue persists.
                  <button onClick={refreshToken} disabled={refreshing} style={{ display: "block", marginTop: 10, fontSize: 12, fontWeight: 700, color: TV_COLOR, background: TV_BG, border: `1px solid ${TV_BD}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer" }}>
                    {refreshing ? "Refreshing…" : "Refresh Token →"}
                  </button>
                </div>
              )}
            </div>

            {/* Today's sync result */}
            {syncResult !== null && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: TV_COLOR, lineHeight: 1, marginBottom: 4 }} className="font-bebas">{syncResult.trades}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>TRADES TODAY</div>
                </div>
                {syncResult.dailyPnl !== null && (
                  <div className="card" style={{ padding: "16px 18px", textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: syncResult.dailyPnl >= 0 ? "var(--green)" : "var(--red)", lineHeight: 1, marginBottom: 4 }} className="font-bebas">
                      {syncResult.dailyPnl >= 0 ? "+" : ""}${Math.abs(syncResult.dailyPnl).toFixed(0)}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>TODAY P&L</div>
                  </div>
                )}
              </div>
            )}

            {/* Sync error */}
            {syncError && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
                {syncError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={syncing}
                onClick={syncNow}
              >
                {syncing ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Syncing…
                  </span>
                ) : "Sync Now"}
              </button>
              <Link href="/journal">
                <button className="btn-ghost" style={{ fontSize: 13, whiteSpace: "nowrap" }}>View Journal →</button>
              </Link>
              <button
                className="btn-ghost"
                style={{ fontSize: 13, color: "var(--red)", borderColor: "rgba(255,59,92,0.3)", whiteSpace: "nowrap" }}
                onClick={() => setDisconnectConfirm(true)}
              >
                Disconnect
              </button>
            </div>

            {/* Disconnect confirm */}
            {disconnectConfirm && (
              <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Disconnect Tradovate?</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 14 }}>
                  Your stored access token will be removed. Imported trade history stays in your journal. You can reconnect anytime.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => setDisconnectConfirm(false)}>Cancel</button>
                  <button className="btn-ghost" style={{ flex: 1, fontSize: 13, color: "var(--red)", borderColor: "rgba(255,59,92,0.3)" }} disabled={disconnecting} onClick={disconnect}>
                    {disconnecting ? "Disconnecting…" : "Yes, disconnect"}
                  </button>
                </div>
              </div>
            )}

            {/* Recent trades */}
            {(recentTrades.length > 0 || tradesLoading) && (
              <div className="card" style={{ padding: "20px 22px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 16 }}>RECENT TRADES</div>
                {tradesLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: TV_COLOR, animation: "spin 0.7s linear infinite" }} />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {recentTrades.map((t, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < recentTrades.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: t.side === "long" ? "rgba(0,232,122,0.1)" : "rgba(255,59,92,0.1)", border: `1px solid ${t.side === "long" ? "rgba(0,232,122,0.25)" : "rgba(255,59,92,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            {t.side === "long"
                              ? <path d="M6 10V2M2 6l4-4 4 4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              : <path d="M6 2v8M10 6l-4 4-4-4" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-geist-mono)" }}>{t.symbol}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{t.date}</div>
                        </div>
                        {t.pnl !== null && (
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.pnl >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-geist-mono)" }}>
                            {t.pnl >= 0 ? "+" : ""}${Math.abs(t.pnl).toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/journal">
                  <button className="btn-ghost" style={{ width: "100%", fontSize: 12, marginTop: 14 }}>View Full Journal →</button>
                </Link>
              </div>
            )}
          </div>

        ) : (
          // ── CONNECT FORM ──
          <div className="tv-fade">

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: TV_BG, border: `1px solid ${TV_BD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: TV_COLOR, letterSpacing: "0.05em", margin: "0 auto 14px" }}>TRD</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>Connect Tradovate</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
                Enter your Tradovate username and password. TradeMind exchanges them for a short-lived access token — your password is never stored.
              </p>
            </div>

            {/* Account type info */}
            <div style={{ padding: "14px 16px", borderRadius: 10, background: TV_BG, border: `1px solid ${TV_BD}`, marginBottom: 24, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, color: TV_COLOR, marginBottom: 6, fontSize: 12, letterSpacing: "0.06em" }}>COMPATIBLE ACCOUNT TYPES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  "Apex Trader Funding",
                  "Funded Next",
                  "Lucid Trading",
                  "TopStep (via Tradovate)",
                  "Personal Tradovate accounts",
                ].map((firm) => (
                  <div key={firm} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke={TV_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {firm}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TV_BD}`, fontSize: 12, color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--amber)" }}>Note:</strong> Nostro / institutional accounts may require a separate Tradovate API agreement.
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ padding: "24px 22px", marginBottom: 16 }}>

              {/* Environment */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>ENVIRONMENT</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["live", "paper"] as const).map((e) => (
                    <button key={e} className={`tv-env-btn${env === e ? " active" : ""}`} onClick={() => setEnv(e)}>
                      {e === "live" ? "🔴 Live" : "📋 Demo / Paper"}
                    </button>
                  ))}
                </div>
                {env === "live" && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "var(--amber)", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1L9.5 9H1.5L5.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5.5 4.5v2M5.5 8v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    Connects to live.tradovateapi.com — real account data
                  </div>
                )}
              </div>

              {/* Username */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>TRADOVATE USERNAME</label>
                <input
                  className="tv-input"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. john_trader"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && connect()}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="tv-input"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your Tradovate password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && connect()}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>
                    }
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
                  Your password is sent directly to Tradovate&apos;s API in exchange for a short-lived token. It is never logged or stored.
                </p>
              </div>

              {/* Error */}
              {connectError && (
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.6 }}>
                  {connectError}
                </div>
              )}

              <button
                className="btn-primary"
                style={{ width: "100%", padding: "15px", fontSize: 15, opacity: (!username.trim() || !password.trim()) ? 0.5 : 1 }}
                disabled={!username.trim() || !password.trim() || connecting}
                onClick={connect}
              >
                {connecting ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Authenticating…
                  </span>
                ) : "Connect Tradovate →"}
              </button>
            </div>

            {/* Security note */}
            <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M7 1.5L2 3.5v3.5C2 10 4.5 12.5 7 13c2.5-.5 5-3 5-6V3.5L7 1.5z" stroke="var(--green)" strokeWidth="1.2" strokeLinejoin="round"/><path d="M4.5 7l2 2 3-3" stroke="var(--green)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>
                Your credentials are transmitted over HTTPS directly to <strong style={{ color: "var(--text)" }}>live.tradovateapi.com</strong>. The returned access token is encrypted with AES-256-GCM before being stored.
              </span>
            </div>

            {/* Other broker options */}
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Using a different platform? </span>
              <Link href="/onboarding" style={{ fontSize: 12, color: TV_COLOR, fontWeight: 700 }}>Connect another broker →</Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}