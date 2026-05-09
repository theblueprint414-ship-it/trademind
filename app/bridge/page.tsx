"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type BridgeToken = {
  id: string;
  deviceName: string | null;
  platform: string | null;
  brokers: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  token: string;
};


const BROKERS = [
  { id: "mt4", label: "MetaTrader 4", icon: "📊", desc: "Via Expert Advisor file watcher" },
  { id: "mt5", label: "MetaTrader 5", icon: "📈", desc: "Via Expert Advisor file watcher" },
  { id: "ninjatrader", label: "NinjaTrader 8", icon: "🥷", desc: "Direct SQLite database read" },
  { id: "tradovate", label: "Tradovate", icon: "⚡", desc: "CSV export folder watcher" },
  { id: "csv", label: "Any Platform (CSV)", icon: "📄", desc: "Watch a folder for CSV exports" },
];

const STEPS = [
  { num: 1, label: "Download EdgeBridge" },
  { num: 2, label: "Generate API Token" },
  { num: 3, label: "Configure & Connect" },
];

function PlatformIcon({ platform }: { platform: string | null }) {
  if (platform === "windows") return <span>🪟</span>;
  if (platform === "mac") return <span>🍎</span>;
  if (platform === "linux") return <span>🐧</span>;
  return <span>💻</span>;
}

function relativeTime(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function BridgePage() {
  const [tokens, setTokens] = useState<BridgeToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [creatingToken, setCreatingToken] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [platform, setPlatform] = useState<"windows" | "mac" | "linux" | "">("");
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const [downloading, setDownloading] = useState<"windows" | "mac" | null>(null);

  useEffect(() => {
    fetch("/api/bridge/auth")
      .then((r) => r.json())
      .then((d) => { setTokens(d.tokens ?? []); setLoadingTokens(false); })
      .catch(() => setLoadingTokens(false));
  }, []);

  async function createToken() {
    setCreatingToken(true);
    try {
      const res = await fetch("/api/bridge/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName: deviceName.trim() || null, platform: platform || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewToken(data.token);
        setTokens((prev) => [{ id: data.id, deviceName: data.deviceName, platform: data.platform, brokers: null, lastUsedAt: null, createdAt: data.createdAt, token: data.token }, ...prev]);
        setActiveStep(3);
      }
    } finally {
      setCreatingToken(false);
    }
  }

  async function revokeToken(id: string) {
    setRevoking(id);
    try {
      await fetch(`/api/bridge/auth?id=${id}`, { method: "DELETE" });
      setTokens((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setRevoking(null);
    }
  }

  function download(platform: "windows" | "mac") {
    setDownloading(platform);
    window.location.href = `/api/bridge/download?file=${platform}`;
    setTimeout(() => setDownloading(null), 3000);
  }

  function copyToken() {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 8px" }}>
        <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>← Dashboard</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌉</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text)" }}>EdgeBridge</h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Desktop sync for MT4/MT5, NinjaTrader, Tradovate</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        {/* Supported brokers */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Supported Platforms</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BROKERS.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{b.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup steps */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Setup Guide</div>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <button
                  onClick={() => setActiveStep(s.num)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
                    background: activeStep >= s.num ? "var(--blue)" : "var(--surface3)",
                    color: activeStep >= s.num ? "#fff" : "var(--text-muted)",
                  }}>
                    {activeStep > s.num ? "✓" : s.num}
                  </div>
                  <span style={{ fontSize: 9, color: activeStep === s.num ? "var(--blue)" : "var(--text-muted)", textAlign: "center", maxWidth: 60 }}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: activeStep > s.num ? "var(--blue)" : "var(--border)", marginBottom: 18 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Download */}
          {activeStep === 1 && (
            <div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                EdgeBridge runs in your system tray and syncs trades from MT4/MT5, NinjaTrader 8, and Tradovate to TradeMind in real-time — no MetaAPI subscription required.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <button
                  onClick={() => download("windows")}
                  disabled={downloading === "windows"}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                    border: "1.5px solid var(--border)", background: "var(--surface2)",
                    cursor: "pointer", textAlign: "left", opacity: downloading === "windows" ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: 28 }}>🪟</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      {downloading === "windows" ? "Starting download..." : "Download for Windows"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>EdgeBridge-Setup.exe · x64 · auto-updates</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-dim)", flexShrink: 0 }}>
                    <path d="M8 2v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <button
                  onClick={() => download("mac")}
                  disabled={downloading === "mac"}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                    border: "1.5px solid var(--border)", background: "var(--surface2)",
                    cursor: "pointer", textAlign: "left", opacity: downloading === "mac" ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: 28 }}>🍎</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      {downloading === "mac" ? "Starting download..." : "Download for macOS"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>EdgeBridge.dmg · Apple Silicon + Intel · auto-updates</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-dim)", flexShrink: 0 }}>
                    <path d="M8 2v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.2)", marginBottom: 14 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: "var(--blue)", flexShrink: 0 }}>
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M6.5 5.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="6.5" cy="3.5" r="0.6" fill="currentColor"/>
                </svg>
                <span style={{ fontSize: 11, color: "var(--blue)", lineHeight: 1.5 }}>
                  EdgeBridge auto-updates silently in the background. Always stay on the latest version.
                </span>
              </div>

              <button
                onClick={() => setActiveStep(2)}
                style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "var(--blue)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Already installed? Set up token →
              </button>
            </div>
          )}

          {/* Step 2: Generate token */}
          {activeStep === 2 && (
            <div>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                Generate a secure API token for EdgeBridge. This token authorizes the desktop app to sync trades to your account.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Device Name (optional)</label>
                  <input
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g. Trading PC, Home Mac"
                    maxLength={60}
                    style={{
                      width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8,
                      padding: "9px 12px", fontSize: 13, color: "var(--text)", boxSizing: "border-box", outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Platform</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["windows", "mac", "linux"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(platform === p ? "" : p)}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                          background: platform === p ? "rgba(96,165,250,0.15)" : "var(--surface2)",
                          color: platform === p ? "#60A5FA" : "var(--text-dim)",
                          borderColor: platform === p ? "rgba(96,165,250,0.35)" : "transparent",
                          borderWidth: 1, borderStyle: "solid",
                        }}
                      >
                        {p === "windows" ? "🪟" : p === "mac" ? "🍎" : "🐧"} {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createToken}
                  disabled={creatingToken}
                  style={{
                    padding: "12px 0", borderRadius: 10, border: "none", cursor: creatingToken ? "default" : "pointer",
                    background: creatingToken ? "var(--surface3)" : "var(--blue)", color: creatingToken ? "var(--text-muted)" : "#fff",
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  {creatingToken ? "Generating..." : "Generate Token"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configure */}
          {activeStep === 3 && newToken && (
            <div>
              <div style={{ background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.25)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#00E87A", marginBottom: 8 }}>Your API Token (copy now — shown once)</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <code style={{ flex: 1, fontSize: 11, color: "var(--text)", background: "var(--surface2)", borderRadius: 6, padding: "7px 10px", wordBreak: "break-all", lineHeight: 1.4 }}>
                    {newToken}
                  </code>
                  <button
                    onClick={copyToken}
                    style={{
                      padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0,
                      background: copied ? "rgba(0,232,122,0.2)" : "var(--surface2)",
                      color: copied ? "#00E87A" : "var(--text-dim)",
                    }}
                  >
                    {copied ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>How to connect:</div>
              {[
                "Open EdgeBridge from your system tray",
                "Click Settings → Connect to TradeMind",
                "Paste the token above and save",
                "Select your trading platform (MT4/MT5/NinjaTrader/etc.)",
                "EdgeBridge will auto-sync trades in real-time",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.4, paddingTop: 2 }}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active tokens */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Connected Devices ({tokens.length}/5)
          </div>

          {loadingTokens && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 16 }}>Loading...</div>
          )}

          {!loadingTokens && tokens.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 16 }}>
              No devices connected yet. Follow the setup guide above.
            </div>
          )}

          {tokens.map((t) => {
            const brokers: string[] = t.brokers ? JSON.parse(t.brokers) : [];
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PlatformIcon platform={t.platform} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      {t.deviceName || "Unnamed Device"}
                    </span>
                    {brokers.length > 0 && (
                      <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--surface2)", borderRadius: 4, padding: "1px 6px" }}>
                        {brokers.join(", ")}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                    Last sync: {relativeTime(t.lastUsedAt)} · Token: {t.token}
                  </div>
                </div>
                <button
                  onClick={() => revokeToken(t.id)}
                  disabled={revoking === t.id}
                  style={{
                    padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,59,92,0.3)", background: "rgba(255,59,92,0.08)",
                    color: "#FF3B5C", fontSize: 11, fontWeight: 700, cursor: revoking === t.id ? "default" : "pointer", flexShrink: 0,
                  }}
                >
                  {revoking === t.id ? "..." : "Revoke"}
                </button>
              </div>
            );
          })}
        </div>

        {/* MT4/MT5 EA download */}
        <div style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#60A5FA", marginBottom: 8 }}>MetaTrader Expert Advisors</div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            For MT4/MT5, install the TradeMindBridge Expert Advisor to enable trade export.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "MT4 EA (.mq4)", file: "TradeMindBridge.mq4" },
              { label: "MT5 EA (.mq5)", file: "TradeMindBridge.mq5" },
            ].map((d, i) => (
              <a
                key={i}
                href={`/api/bridge/download?file=${d.file}`}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid rgba(96,165,250,0.3)",
                  background: "rgba(96,165,250,0.1)", color: "#60A5FA", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  textDecoration: "none", textAlign: "center" as const, display: "block",
                }}
              >
                ↓ {d.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}