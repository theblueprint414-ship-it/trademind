"use client";

import { useState, useEffect } from "react";

type AppError = {
  id: string;
  message: string;
  stack: string | null;
  route: string | null;
  userId: string | null;
  context: string | null;
  level: string;
  createdAt: string;
};

type Counts = { level: string; count: number }[];

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [errors, setErrors] = useState<AppError[]>([]);
  const [counts, setCounts] = useState<Counts>([]);
  const [level, setLevel] = useState<"error" | "warn">("error");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(lvl = level) {
    setLoading(true);
    const res = await fetch(`/api/admin/errors?level=${lvl}&limit=100`, {
      headers: { authorization: `Bearer ${secret}` },
    });
    if (res.status === 401) { alert("Wrong secret"); setLoading(false); return; }
    const data = await res.json();
    setErrors(data.errors ?? []);
    setCounts(data.counts ?? []);
    setAuthed(true);
    setLoading(false);
  }

  async function clearOld() {
    await fetch("/api/admin/errors", {
      method: "DELETE",
      headers: { authorization: `Bearer ${secret}` },
    });
    load();
  }

  const total = counts.reduce((s, c) => s + Number(c.count), 0);
  const errorCount = counts.find((c) => c.level === "error")?.count ?? 0;
  const warnCount = counts.find((c) => c.level === "warn")?.count ?? 0;

  if (!authed) {
    return (
      <div style={{ background: "#010102", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#0f1011", border: "1px solid #23252a", borderRadius: 16, padding: "36px 40px", width: "100%", maxWidth: 400 }}>
          <h1 style={{ color: "#f7f8f8", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Admin — Error Monitor</h1>
          <input
            type="password"
            placeholder="CRON_SECRET"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            style={{ width: "100%", background: "#141516", border: "1px solid #23252a", borderRadius: 8, padding: "12px 16px", color: "#f7f8f8", fontSize: 14, marginBottom: 16, boxSizing: "border-box" }}
          />
          <button
            onClick={() => load()}
            style={{ width: "100%", background: "#e5e5e6", color: "#010102", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            View Errors →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#010102", minHeight: "100vh", padding: "32px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ color: "#f7f8f8", fontSize: 22, fontWeight: 700, margin: 0 }}>Error Monitor</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={clearOld} style={{ background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.3)", color: "#FF3B5C", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Clear older than 30d
            </button>
            <button onClick={() => load(level)} style={{ background: "#e5e5e6", color: "#010102", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total logs", value: total, color: "#5e6ad2" },
            { label: "Errors", value: errorCount, color: "#FF3B5C" },
            { label: "Warnings", value: warnCount, color: "#FFB020" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0f1011", border: "1px solid #23252a", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#62666d" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {(["error", "warn"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => { setLevel(lvl); load(lvl); }}
              style={{ background: level === lvl ? "#23252a" : "transparent", color: level === lvl ? "#f7f8f8" : "#62666d", border: "1px solid", borderColor: level === lvl ? "#34343a" : "transparent", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              {lvl === "error" ? "🔴 Errors" : "🟡 Warnings"}
            </button>
          ))}
        </div>

        {/* Error list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {errors.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#62666d", fontSize: 14 }}>
              No {level}s logged.
            </div>
          )}
          {errors.map((e) => (
            <div
              key={e.id}
              style={{ background: "#0f1011", border: "1px solid #23252a", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            >
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12, justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: e.level === "error" ? "#FF3B5C" : "#FFB020", marginBottom: 4 }}>
                    {e.route ?? "unknown route"}
                  </div>
                  <div style={{ fontSize: 14, color: "#f7f8f8", marginBottom: 4, wordBreak: "break-word" }}>{e.message}</div>
                  {e.userId && <div style={{ fontSize: 11, color: "#62666d" }}>user: {e.userId}</div>}
                </div>
                <div style={{ fontSize: 11, color: "#62666d", flexShrink: 0, textAlign: "right" }}>
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>
              {expanded === e.id && (
                <div style={{ borderTop: "1px solid #23252a", padding: "16px 20px", background: "#141516" }}>
                  {e.stack && (
                    <pre style={{ fontSize: 11, color: "#8a8f98", overflowX: "auto", margin: "0 0 12px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{e.stack}</pre>
                  )}
                  {e.context && (
                    <pre style={{ fontSize: 11, color: "#5e6ad2", overflowX: "auto", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(JSON.parse(e.context), null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}