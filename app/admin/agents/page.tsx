"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Agent definitions ────────────────────────────────────────────────────────

type AgentStatus = "idle" | "running" | "success" | "error";

type Agent = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  schedule: string;
  area: "users" | "trading" | "ai" | "risk" | "billing";
  canTrigger: boolean;
};

const AGENTS: Agent[] = [
  {
    id: "reminder",
    name: "Daily Reminder",
    emoji: "🔔",
    description: "Sends check-in reminder emails to users who haven't checked in today. Respects emailReminders setting.",
    schedule: "Daily at 7:00 AM ET",
    area: "users",
    canTrigger: true,
  },
  {
    id: "weekly-digest",
    name: "Weekly Digest",
    emoji: "📊",
    description: "Sends Monday morning email with last week's summary: streak, P&L, lessons, check-in count.",
    schedule: "Every Monday at 8:00 AM ET",
    area: "users",
    canTrigger: true,
  },
  {
    id: "onboarding-emails",
    name: "Onboarding Sequence",
    emoji: "👋",
    description: "Sends educational email sequence to new users in their first 7 days. Day 1, 3, and 7 emails.",
    schedule: "Daily at 9:00 AM ET",
    area: "users",
    canTrigger: true,
  },
  {
    id: "behavioral-triggers",
    name: "Behavioral Triggers",
    emoji: "🧠",
    description: "Detects patterns (revenge trading, losing streaks, NO-TRADE violations) and sends targeted coaching emails.",
    schedule: "Daily at 6:00 PM ET",
    area: "ai",
    canTrigger: true,
  },
  {
    id: "auto-sync-journal",
    name: "Auto Sync Journal",
    emoji: "🔄",
    description: "Syncs broker trades to journal for all Pro/Premium users who are connected and checked in today.",
    schedule: "Every 2 hours during market hours",
    area: "trading",
    canTrigger: true,
  },
  {
    id: "circuit-breaker-reset",
    name: "Circuit Breaker Reset",
    emoji: "⚡",
    description: "Resets daily trade count for users whose circuit breaker resetHour has passed. Clears blocked status.",
    schedule: "Every hour",
    area: "risk",
    canTrigger: true,
  },
  {
    id: "streak-recovery",
    name: "Streak Freeze Recovery",
    emoji: "🛡️",
    description: "Resets monthly streak freeze for all users on the 1st of each month.",
    schedule: "1st of each month at midnight",
    area: "users",
    canTrigger: true,
  },
  {
    id: "mid-session-push",
    name: "Mid-Session Push",
    emoji: "📱",
    description: "Sends push notifications during trading hours to users who have trades but no mid-session check-in.",
    schedule: "12:30 PM & 2:30 PM ET",
    area: "trading",
    canTrigger: true,
  },
];

const AREA_COLORS: Record<Agent["area"], string> = {
  users: "#5e6ad2",
  trading: "#00E87A",
  ai: "#8B5CF6",
  risk: "#FF3B5C",
  billing: "#FFB020",
};

const AREA_LABELS: Record<Agent["area"], string> = {
  users: "Users",
  trading: "Trading",
  ai: "AI",
  risk: "Risk",
  billing: "Billing",
};

// ─── Non-cron processes ───────────────────────────────────────────────────────

const PASSIVE_AGENTS = [
  {
    name: "AI Coach (Alex)",
    emoji: "🤖",
    description: "Claude-based coach. Analyzes check-in history, P&L, and behavioral patterns on demand. Streams responses.",
    trigger: "User opens /coach",
    area: "ai" as const,
    endpoint: "/api/ai-coach",
  },
  {
    name: "Per-Trade AI Analysis",
    emoji: "🔬",
    description: "Analyzes individual trades for alignment, risk, and key lesson. Cached in localStorage per trade.",
    trigger: "User expands trade in /session",
    area: "ai" as const,
    endpoint: "/api/ai-trade-analysis",
  },
  {
    name: "Broker Sync (Manual)",
    emoji: "📡",
    description: "Syncs today's trade count from connected broker. Called on dashboard load and via Sync button.",
    trigger: "Dashboard load / Sync button",
    area: "trading" as const,
    endpoint: "/api/broker/sync",
  },
  {
    name: "Journal Sync (Historical)",
    emoji: "📚",
    description: "Fetches 90-day trade history from broker and upserts to journal. Runs on journal page load.",
    trigger: "Journal page load",
    area: "trading" as const,
    endpoint: "/api/broker/sync-journal",
  },
  {
    name: "Tradovate Token Refresh",
    emoji: "🔑",
    description: "Renews Tradovate access token using current Bearer token. Called when sync returns 401.",
    trigger: "Sync failure → auto-retry",
    area: "trading" as const,
    endpoint: "/api/broker/tradovate-refresh",
  },
  {
    name: "Challenge Drawdown Alert",
    emoji: "🏆",
    description: "Checks if drawdown is within 20% of limit and sets drawdownNearAlert flag on GET /api/challenge.",
    trigger: "/challenge page load",
    area: "risk" as const,
    endpoint: "/api/challenge",
  },
];

// ─── StatusDot ────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: AgentStatus }) {
  const configs = {
    idle: { color: "#52565e", bg: "#1e2025", label: "IDLE" },
    running: { color: "#FFB020", bg: "rgba(255,176,32,0.12)", label: "RUNNING" },
    success: { color: "#00E87A", bg: "rgba(0,232,122,0.12)", label: "SUCCESS" },
    error: { color: "#FF3B5C", bg: "rgba(255,59,92,0.12)", label: "ERROR" },
  };
  const c = configs[status];
  return (
    <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [secret, setSecret] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_secret") ?? "" : "");
  const [authed, setAuthed] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [filterArea, setFilterArea] = useState<Agent["area"] | "all">("all");

  useEffect(() => {
    if (secret) setAuthed(true);
  }, []);

  async function triggerAgent(agentId: string) {
    setStatuses((p) => ({ ...p, [agentId]: "running" }));
    setResults((p) => ({ ...p, [agentId]: "" }));
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${secret}` },
        body: JSON.stringify({ agent: agentId }),
      });
      const data = await res.json();
      setStatuses((p) => ({ ...p, [agentId]: res.ok ? "success" : "error" }));
      setResults((p) => ({ ...p, [agentId]: JSON.stringify(data, null, 2) }));
      setExpandedResult(agentId);
      // Auto-clear success after 10s
      if (res.ok) setTimeout(() => setStatuses((p) => ({ ...p, [agentId]: "idle" })), 10000);
    } catch (err) {
      setStatuses((p) => ({ ...p, [agentId]: "error" }));
      setResults((p) => ({ ...p, [agentId]: String(err) }));
    }
  }

  if (!authed) {
    return (
      <div style={{ background: "#07080a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 16, padding: "40px 44px", width: "100%", maxWidth: 420 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f2", marginBottom: 6 }}>Agent Map</div>
          <p style={{ color: "#52565e", fontSize: 13, marginBottom: 24 }}>Enter CRON_SECRET</p>
          <input
            type="password"
            placeholder="CRON_SECRET"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setAuthed(true); localStorage.setItem("admin_secret", secret); } }}
            autoFocus
            style={{ width: "100%", background: "#141618", border: "1px solid #1e2025", borderRadius: 10, padding: "13px 16px", color: "#f0f0f2", fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none", fontFamily: "monospace" }}
          />
          <button onClick={() => { setAuthed(true); localStorage.setItem("admin_secret", secret); }} style={{ width: "100%", background: "#5e6ad2", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Enter →
          </button>
        </div>
      </div>
    );
  }

  const areas = ["all", "users", "trading", "ai", "risk"] as const;
  const filteredAgents = AGENTS.filter((a) => filterArea === "all" || a.area === filterArea);

  return (
    <div style={{ background: "#07080a", minHeight: "100vh", color: "#f0f0f2", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e2025", padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, background: "#0a0b0d" }}>
        <Link href="/admin" style={{ color: "#52565e", textDecoration: "none", fontSize: 13 }}>← Command Center</Link>
        <div style={{ width: 1, height: 16, background: "#1e2025" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 8px #8B5CF6" }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f0f2" }}>AGENT MAP</span>
          <span style={{ fontSize: 12, color: "#52565e" }}>{AGENTS.length + PASSIVE_AGENTS.length} agents running</span>
        </div>

        {/* Area filter */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {areas.map((a) => (
            <button key={a} onClick={() => setFilterArea(a as typeof filterArea)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: filterArea === a ? "#1e2025" : "transparent", color: filterArea === a ? "#f0f0f2" : "#52565e", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {a === "all" ? "All" : AREA_LABELS[a as Agent["area"]]}
              {a !== "all" && <span style={{ marginLeft: 5, padding: "1px 6px", borderRadius: 4, background: `${AREA_COLORS[a as Agent["area"]]}20`, color: AREA_COLORS[a as Agent["area"]], fontSize: 10 }}>{AGENTS.filter((ag) => ag.area === a).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 28px" }}>

        {/* ── Scheduled Agents ─────────────────────────────────────── */}
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#52565e" }}>SCHEDULED AGENTS</div>
          <div style={{ flex: 1, height: 1, background: "#1e2025" }} />
          <div style={{ fontSize: 11, color: "#52565e" }}>Triggered by Vercel Cron</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16, marginBottom: 44 }}>
          {filteredAgents.map((agent) => {
            const status = statuses[agent.id] ?? "idle";
            const result = results[agent.id];
            const areaColor = AREA_COLORS[agent.area];
            return (
              <div key={agent.id} style={{ background: "#0f1011", border: `1px solid ${status === "success" ? "rgba(0,232,122,0.25)" : status === "error" ? "rgba(255,59,92,0.25)" : status === "running" ? "rgba(255,176,32,0.2)" : "#1e2025"}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Card header */}
                <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: `${areaColor}15`, border: `1px solid ${areaColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {agent.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f2" }}>{agent.name}</span>
                      <StatusPill status={status} />
                    </div>
                    <div style={{ fontSize: 12, color: "#a0a3a9", lineHeight: 1.5, marginBottom: 8 }}>{agent.description}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: `${areaColor}15`, color: areaColor, fontWeight: 700, letterSpacing: "0.06em" }}>{AREA_LABELS[agent.area]}</span>
                      <span style={{ fontSize: 10, color: "#52565e" }}>⏱ {agent.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: "12px 20px", borderTop: "1px solid #1e2025", display: "flex", gap: 8, alignItems: "center", background: "#0c0d0f" }}>
                  <button
                    onClick={() => triggerAgent(agent.id)}
                    disabled={status === "running"}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: status === "running" ? "#1e2025" : "#1e2025", color: status === "running" ? "#52565e" : "#f0f0f2", fontSize: 12, fontWeight: 600, cursor: status === "running" ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s" }}
                    onMouseEnter={(e) => { if (status !== "running") (e.currentTarget as HTMLElement).style.background = "#2a2d35"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#1e2025"; }}
                  >
                    {status === "running"
                      ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #52565e", borderTopColor: "#FFB020", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Running</>
                      : <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 2l7 4-7 4V2z" fill="currentColor"/></svg> Run now</>
                    }
                  </button>
                  {result && (
                    <button onClick={() => setExpandedResult(expandedResult === agent.id ? null : agent.id)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #1e2025", background: "transparent", color: "#52565e", fontSize: 11, cursor: "pointer" }}>
                      {expandedResult === agent.id ? "Hide result ↑" : "Show result ↓"}
                    </button>
                  )}
                  <div style={{ marginLeft: "auto", fontSize: 10, color: "#3a3d45", fontFamily: "monospace" }}>/api/cron/{agent.id}</div>
                </div>

                {/* Result */}
                {result && expandedResult === agent.id && (
                  <div style={{ borderTop: "1px solid #1e2025", padding: "14px 20px", background: "#141618" }}>
                    <pre style={{ fontSize: 11, color: status === "success" ? "#00E87A" : "#FF3B5C", margin: 0, overflowX: "auto", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{result}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Passive / Reactive Agents ────────────────────────────── */}
        {(filterArea === "all" || PASSIVE_AGENTS.some((a) => a.area === filterArea)) && (
          <>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#52565e" }}>REACTIVE AGENTS</div>
              <div style={{ flex: 1, height: 1, background: "#1e2025" }} />
              <div style={{ fontSize: 11, color: "#52565e" }}>Triggered by user actions</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {PASSIVE_AGENTS.filter((a) => filterArea === "all" || a.area === filterArea).map((agent) => {
                const areaColor = AREA_COLORS[agent.area];
                return (
                  <div key={agent.name} style={{ background: "#0f1011", border: "1px solid #1e2025", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${areaColor}15`, border: `1px solid ${areaColor}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {agent.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f2", marginBottom: 4 }}>{agent.name}</div>
                      <div style={{ fontSize: 12, color: "#a0a3a9", lineHeight: 1.5, marginBottom: 8 }}>{agent.description}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: `${areaColor}15`, color: areaColor, fontWeight: 700 }}>{AREA_LABELS[agent.area]}</span>
                        <span style={{ fontSize: 10, color: "#52565e" }}>→ {agent.trigger}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#3a3d45", fontFamily: "monospace", marginTop: 6 }}>{agent.endpoint}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
