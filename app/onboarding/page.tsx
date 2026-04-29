"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MT4Demo, TopstepXDemo, TradovateDemo, BinanceGuide, BybitGuide, CoinbaseGuide, KrakenGuide, AlpacaGuide } from "@/components/BrokerStepsDemo";

type Step = "welcome" | "trader-type" | "limit" | "broker";

const FEATURES = [
  { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="10" r="5.5" stroke="#5e6ad2" strokeWidth="1.6"/><path d="M4.5 26c0-4.142 4.253-7.5 9.5-7.5s9.5 3.358 9.5 7.5" stroke="#5e6ad2" strokeWidth="1.6" strokeLinecap="round"/><path d="M20 7l2-1.5M22.5 10h2M20 13l2 1.5" stroke="#5e6ad2" strokeWidth="1.4" strokeLinecap="round"/></svg>, title: "60-Second Daily Check-in", desc: "Before you touch the markets, you&apos;ll know your mental state. GO, CAUTION, or NO-TRADE — every single day." },
  { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="5" y="5" width="18" height="18" rx="4" stroke="#FF3B5C" strokeWidth="1.6"/><path d="M10 14h8M14 10v8" stroke="#FF3B5C" strokeWidth="1.8" strokeLinecap="round"/></svg>, title: "Hard Stop on Overtrading", desc: "Set your daily limit. Hit it — you&apos;re locked out for an hour. No willpower needed." },
  { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 21l6-8 5 5 7-12 4 6" stroke="#00E87A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 24.5h20" stroke="#00E87A" strokeWidth="1.8" strokeLinecap="round"/></svg>, title: "Psychology → P&L Correlation", desc: "See exactly which mental states cost you money. Stop repeating the same expensive mistakes." },
];

const BROKERS = [
  { id: "topstepx",     name: "TopstepX",        abbr: "TSX", color: "#00C896", needsSecret: true,  secretLabel: "API Key",         keyLabel: "USERNAME",        keyPlaceholder: "Your TopstepX username", firms: "TopstepX funded accounts" },
  { id: "metaapi",      name: "MT4/MT5 (Forex)",  abbr: "MT4", color: "#FF6B35", needsSecret: true,  secretLabel: "Investor Password",keyLabel: "ACCOUNT NUMBER",  keyPlaceholder: "e.g. 12345678",          firms: "FTMO, IC Markets, FxFlat, any MT4/MT5 broker" },
  { id: "alpaca",       name: "Alpaca",           abbr: "ALP", color: "#00E87A", needsSecret: true,  secretLabel: "API Secret",      keyLabel: "API KEY",         keyPlaceholder: "Paste your API key",     firms: "US stocks & options" },
  { id: "binance",      name: "Binance",         abbr: "BNB", color: "#F0B90B", needsSecret: true,  secretLabel: "API Secret", keyLabel: "API KEY",     keyPlaceholder: "Paste your API key",     firms: "Binance crypto" },
  { id: "bybit",        name: "Bybit",           abbr: "BYB", color: "#F7A600", needsSecret: true,  secretLabel: "API Secret", keyLabel: "API KEY",     keyPlaceholder: "Paste your API key",     firms: "Bybit crypto" },
  { id: "coinbase",     name: "Coinbase",        abbr: "CB",  color: "#0052FF", needsSecret: true,  secretLabel: "API Secret", keyLabel: "API KEY",     keyPlaceholder: "Paste your API key",     firms: "Coinbase Advanced Trade" },
  { id: "kraken",       name: "Kraken",          abbr: "KRK", color: "#5741D9", needsSecret: true,  secretLabel: "Private Key",keyLabel: "API KEY",     keyPlaceholder: "Paste your API key",     firms: "Kraken crypto" },
  { id: "tradovate",    name: "Tradovate",       abbr: "TRD", color: "#5e6ad2", needsSecret: true,  secretLabel: "Password",   keyLabel: "USERNAME",   keyPlaceholder: "Your Tradovate username",  firms: "Apex, Funded Next, Lucid, TopStep futures" },
  { id: "tradestation", name: "TradeStation",    abbr: "TS",  color: "#FF3B5C", needsSecret: false, secretLabel: "",           keyLabel: "API KEY",     keyPlaceholder: "",                       firms: "" },
  { id: "ibkr",         name: "IBKR",            abbr: "IB",  color: "#CC0000", needsSecret: false, secretLabel: "",           keyLabel: "API KEY",     keyPlaceholder: "",                       firms: "" },
];

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < current ? "var(--blue)" : "var(--surface3)", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [traderType, setTraderType] = useState("");
  const [tradeLimit, setTradeLimit] = useState(5);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  // Broker connect state
  const [selectedBroker, setSelectedBroker] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [environment, setEnvironment] = useState<"live" | "paper">("live");
  const [metaApiServer, setMetaApiServer] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [connected, setConnected] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ imported: number; skipped: number } | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      setIsPro(d.plan === "pro" || d.plan === "premium");
    }).catch(() => setIsPro(false));
  }, []);

  function finish() {
    document.cookie = "tm_onboarded=1; path=/; max-age=31536000";
    router.push("/checkin");
  }

  async function saveTraderType(type: string) {
    setTraderType(type);
    localStorage.setItem("trademind_trader_type", type);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traderType: type }),
    }).catch(() => {});
    setStep("limit");
  }

  async function saveLimit() {
    localStorage.setItem("trademind_trade_limit", String(tradeLimit));
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradeLimit }),
    }).catch(() => {});
    setStep("broker");
  }

  async function handleCsvUpload(file: File) {
    setCsvUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/broker/csv-import", { method: "POST", body: fd });
    const data = await res.json();
    setCsvUploading(false);
    if (res.ok) {
      setCsvResult({ imported: data.imported ?? 0, skipped: data.skipped ?? 0 });
    } else {
      setCsvResult(null);
      setConnectError(data.error ?? "CSV import failed.");
    }
  }

  async function connectBroker() {
    if (!selectedBroker || !apiKey.trim()) return;
    setConnecting(true);
    setConnectError("");
    try {
      const res = await fetch("/api/broker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broker: selectedBroker, apiKey: apiKey.trim(), apiSecret: apiSecret.trim() || undefined, environment: selectedBroker === "metaapi" ? metaApiServer.trim() : environment }),
      });
      const data = await res.json();
      if (data.ok) {
        setConnected(true);
      } else {
        setConnectError(data.error ?? "Connection failed. Check your credentials.");
      }
    } catch {
      setConnectError("Network error. Try again.");
    }
    setConnecting(false);
  }

  const stepIndex = ({ welcome: 1, "trader-type": 2, limit: 3, broker: 4 } as Record<Step, number>)[step];
  const brokerMeta = BROKERS.find((b) => b.id === selectedBroker);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 80px" }}>

      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="28" style={{ display: "block" }} />
      </Link>

      <div style={{ width: "100%", maxWidth: 520 }}>
        <ProgressBar current={stepIndex} total={4} />

        {/* ── Step: Welcome ── */}
        {step === "welcome" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><svg width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="20" r="11" stroke="#5e6ad2" strokeWidth="2.5"/><path d="M9 52c0-8.284 8.506-15 19-15s19 6.716 19 15" stroke="#5e6ad2" strokeWidth="2.5" strokeLinecap="round"/><path d="M40 14l3-2.5M44 20h3M40 26l3 2.5" stroke="#5e6ad2" strokeWidth="2" strokeLinecap="round"/></svg></div>
              <h1 className="font-bebas" style={{ fontSize: 44, lineHeight: 1, marginBottom: 12 }}>Your Mind Is Your Edge</h1>
              <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7 }}>
                Most losses aren&apos;t about the market — they&apos;re about the mental state you were in when you entered.<br />
                TradeMind tracks that. Here&apos;s how:
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {FEATURES.map((f) => (
                <div key={f.title} className="card" style={{ padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }} onClick={() => setStep("trader-type")}>
              Start Setup (2 min) →
            </button>
          </div>
        )}

        {/* ── Step: Trader Type ── */}
        {step === "trader-type" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M8 36l10-14 8 8 12-18 8 10" stroke="#5e6ad2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 40h32" stroke="#5e6ad2" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <h1 className="font-bebas" style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }}>What Kind of Trader Are You?</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                This helps us tailor your check-in and coach to your specific style.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {([
                { id: "scalper",    label: "Scalper",       desc: "Multiple trades per minute, pure execution speed.",  emoji: "⚡" },
                { id: "day",        label: "Day Trader",    desc: "In and out same day, no overnight positions.",        emoji: "📈" },
                { id: "swing",      label: "Swing Trader",  desc: "Hold for days or weeks, riding momentum.",           emoji: "🌊" },
                { id: "prop",       label: "Prop Trader",   desc: "Trading a firm's capital with risk rules.",          emoji: "🏢" },
                { id: "crypto",     label: "Crypto Trader", desc: "24/7 markets, high volatility, digital assets.",     emoji: "₿" },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => saveTraderType(t.id)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: `1.5px solid ${traderType === t.id ? "var(--blue)" : "var(--border)"}`,
                    background: traderType === t.id ? "rgba(94,106,210,0.08)" : "var(--surface2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{t.emoji}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{t.desc}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: "auto", color: "var(--text-muted)", flexShrink: 0 }}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ))}
            </div>

            <button className="btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={() => setStep("limit")}>
              Skip — I&apos;ll set this later
            </button>
          </div>
        )}

        {/* ── Step: Trade Limit ── */}
        {step === "limit" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="8" stroke="#FF3B5C" strokeWidth="2.5"/><path d="M17 24h14M24 17v14" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round"/></svg></div>
              <h1 className="font-bebas" style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }}>How Many Trades Per Day?</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                When you hit this number, you&apos;re locked out for 1 hour — no exceptions.<br />
                Most profitable traders take fewer, higher-quality trades.
              </p>
            </div>

            <div className="card" style={{ padding: 32, marginBottom: 24, textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 80, color: "var(--red)", lineHeight: 1, marginBottom: 4, textShadow: "0 0 30px rgba(255,59,92,0.4)" }}>
                {tradeLimit}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>trades per day</div>
              <input
                type="range" min={1} max={5} value={tradeLimit}
                onChange={(e) => setTradeLimit(Number(e.target.value))}
                style={{ width: "100%", marginBottom: 12 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
                <span>1 trade</span><span>5 trades</span>
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 24, border: "1px solid rgba(255,176,32,0.2)", background: "rgba(255,176,32,0.05)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0, color: "var(--amber)" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="7" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M6 12h4M8 11v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></span>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: "var(--amber)" }}>Tip:</strong> Studies show traders who limit themselves to 3–5 trades per day have significantly higher win rates. Start conservative — you can raise it in Settings anytime.
              </p>
            </div>

            <button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }} onClick={saveLimit}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step: Broker ── */}
        {step === "broker" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 className="font-bebas" style={{ fontSize: 40, marginBottom: 8 }}>Connect Your Broker</h1>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                TradeMind syncs your trades automatically — no manual logging.
              </p>
            </div>

            {isPro === null ? (
              /* Loading */
              <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : isPro === false ? (
              /* Free user — show upsell */
              <>
                <div className="card" style={{ padding: 28, marginBottom: 20, textAlign: "center", border: "1px solid rgba(255,176,32,0.2)", background: "rgba(255,176,32,0.04)" }}>
                  <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "var(--amber)" }}><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M16 24l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M22 17l3-3a5 5 0 017 7l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 23l-3 3a5 5 0 01-7-7l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Broker Connect is a TradeMind feature</div>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20 }}>
                    Upgrade to TradeMind to automatically sync your trades, unlock AI Coach Alex, behavioral pattern detection, and more.
                  </p>
                  <Link href="/settings">
                    <button className="btn-primary" style={{ marginBottom: 12, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", border: "none" }}>Start 7-Day Free Trial →</button>
                  </Link>
                </div>
                <button className="btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={finish}>
                  Skip for now — connect later in Settings
                </button>
              </>
            ) : connected ? (
              /* Success state */
              <div>
                <div className="card" style={{ padding: 32, textAlign: "center", border: "1px solid rgba(0,232,122,0.25)", background: "rgba(0,232,122,0.04)", marginBottom: 20 }}>
                  <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "var(--green)" }}><svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/><path d="M15 24l7 7 11-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "var(--green)", marginBottom: 8 }}>
                    {BROKERS.find((b) => b.id === selectedBroker)?.name} Connected
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
                    Your trades will sync automatically. Last 90 days are being imported to your Journal.
                  </p>
                </div>
                <button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }} onClick={finish}>
                  Continue to Check-in →
                </button>
              </div>
            ) : (
              /* Premium — show connect form */
              <div>
                {/* Helper: which broker to pick */}
                <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(94,106,210,0.05)", border: "1px solid rgba(94,106,210,0.15)", marginBottom: 16, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6, fontSize: 12 }}>Not sure which to pick?</div>
                  <div>FTMO, IC Markets, Pepperstone, FxFlat → <strong style={{ color: "var(--text)" }}>MT4/MT5</strong></div>
                  <div>Apex, Funded Next, Lucid, TopStep futures → <strong style={{ color: "var(--text)" }}>Tradovate</strong> (CSV import)</div>
                  <div>TopstepX funded accounts → <strong style={{ color: "var(--text)" }}>TopstepX</strong></div>
                  <div>Crypto trading → <strong style={{ color: "var(--text)" }}>Binance / Bybit / Coinbase / Kraken</strong></div>
                </div>

                {/* Broker grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {BROKERS.map((b) => {
                    const isComingSoon = b.id === "tradestation" || b.id === "ibkr";
                    return (
                      <button
                        key={b.id}
                        onClick={() => !isComingSoon && setSelectedBroker(b.id)}
                        disabled={isComingSoon}
                        style={{
                          padding: "14px 16px", borderRadius: 10, textAlign: "left",
                          border: `1.5px solid ${selectedBroker === b.id ? "var(--blue)" : "var(--border)"}`,
                          background: selectedBroker === b.id ? "rgba(94,106,210,0.08)" : "var(--surface2)",
                          cursor: isComingSoon ? "not-allowed" : "pointer", opacity: isComingSoon ? 0.4 : 1,
                          display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                        }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${b.color}20`, border: `1px solid ${b.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: b.color, letterSpacing: "0.04em", flexShrink: 0 }}>{b.abbr}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                          {isComingSoon ? (
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Coming soon</div>
                          ) : b.firms ? (
                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{b.firms}</div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedBroker === "tradovate" && (
                  <div className="card" style={{ padding: 20, marginBottom: 16, border: "1px solid rgba(94,106,210,0.2)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 14 }}>HOW TO EXPORT FROM TRADOVATE</div>
                    <TradovateDemo />
                    {csvResult ? (
                      <>
                        <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)", color: "var(--green)", fontSize: 13, textAlign: "center", marginBottom: 14 }}>
                          ✓ {csvResult.imported} trade{csvResult.imported !== 1 ? "s" : ""} imported{csvResult.skipped > 0 ? ` · ${csvResult.skipped} duplicates skipped` : ""}
                        </div>
                        <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={finish}>
                          Continue to Check-in →
                        </button>
                      </>
                    ) : (
                      <label style={{ display: "block", padding: "22px 18px", borderRadius: 10, border: "2px dashed var(--border)", textAlign: "center", cursor: csvUploading ? "wait" : "pointer", background: "var(--surface2)" }}>
                        <input type="file" accept=".csv" style={{ display: "none" }} disabled={csvUploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }} />
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                          {csvUploading ? "Importing..." : "Upload CSV"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Click or drag your Tradovate export here</div>
                      </label>
                    )}
                  </div>
                )}

                {selectedBroker && selectedBroker !== "tradovate" && (
                  <div className="card" style={{ padding: 24, marginBottom: 16, border: "1px solid rgba(94,106,210,0.2)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 16 }}>
                      {brokerMeta?.name} — API Credentials
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                      {selectedBroker === "topstepx" && (
                        <div style={{ padding: "14px", borderRadius: 10, background: "rgba(0,200,150,0.04)", border: "1px solid rgba(0,200,150,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO GET YOUR TOPSTEPX API KEY</div>
                          <TopstepXDemo />
                        </div>
                      )}

                      {selectedBroker === "metaapi" && (
                        <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,107,53,0.04)", border: "1px solid rgba(255,107,53,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO FIND YOUR MT4/MT5 CREDENTIALS</div>
                          <MT4Demo />
                        </div>
                      )}

                      {selectedBroker === "binance" && (
                        <div style={{ padding: "14px", borderRadius: 10, background: "rgba(240,185,11,0.04)", border: "1px solid rgba(240,185,11,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO CREATE A BINANCE API KEY</div>
                          <BinanceGuide />
                        </div>
                      )}

                      {selectedBroker === "bybit" && (
                        <div style={{ padding: "14px", borderRadius: 10, background: "rgba(247,166,0,0.04)", border: "1px solid rgba(247,166,0,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO CREATE A BYBIT API KEY</div>
                          <BybitGuide />
                        </div>
                      )}

                      {selectedBroker === "coinbase" && (
                        <div style={{ padding: "14px", borderRadius: 10, background: "rgba(0,82,255,0.04)", border: "1px solid rgba(0,82,255,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO CREATE A COINBASE API KEY</div>
                          <CoinbaseGuide />
                        </div>
                      )}

                      {selectedBroker === "kraken" && (
                        <div style={{ padding: "14px", borderRadius: 10, background: "rgba(87,65,217,0.04)", border: "1px solid rgba(87,65,217,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO CREATE A KRAKEN API KEY</div>
                          <KrakenGuide />
                        </div>
                      )}

                      {selectedBroker === "alpaca" && (
                        <div style={{ padding: "14px", borderRadius: 10, background: "rgba(0,232,122,0.04)", border: "1px solid rgba(0,232,122,0.2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO FIND YOUR ALPACA API KEYS</div>
                          <AlpacaGuide />
                        </div>
                      )}

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
                          {brokerMeta?.keyLabel ?? "API KEY"}
                        </label>
                        <input
                          type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                          placeholder={brokerMeta?.keyPlaceholder ?? "Paste your API key here"}
                          style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13 }}
                        />
                      </div>

                      {brokerMeta?.needsSecret && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>
                            {brokerMeta.secretLabel.toUpperCase()}
                          </label>
                          <input
                            type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)}
                            placeholder={`Your ${brokerMeta.secretLabel.toLowerCase()}`}
                            style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13 }}
                          />
                        </div>
                      )}

                      {selectedBroker === "metaapi" && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>MT4/MT5 SERVER</label>
                          <input
                            type="text" value={metaApiServer} onChange={(e) => setMetaApiServer(e.target.value)}
                            placeholder="e.g. ICMarkets-Demo02"
                            style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13, width: "100%" }}
                          />
                        </div>
                      )}

                      {selectedBroker !== "topstepx" && selectedBroker !== "metaapi" && (
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>ENVIRONMENT</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            {(["live", "paper"] as const).map((env) => (
                              <button key={env} type="button" onClick={() => setEnvironment(env)}
                                style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${environment === env ? "var(--blue)" : "var(--border)"}`, background: environment === env ? "rgba(94,106,210,0.1)" : "var(--surface2)", color: environment === env ? "var(--blue)" : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>
                                {env === "live" ? "🔴 Live" : "📄 Paper"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {connectError && (
                      <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.2)", fontSize: 13, color: "var(--red)", lineHeight: 1.6 }}>
                        {connectError}
                      </div>
                    )}

                    <button
                      className="btn-primary" onClick={connectBroker}
                      disabled={connecting || !apiKey.trim()}
                      style={{ width: "100%", marginTop: 16, padding: 14, fontSize: 15 }}>
                      {connecting ? "Testing connection..." : `Connect ${brokerMeta?.name} →`}
                    </button>
                  </div>
                )}

                <button className="btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={finish}>
                  Skip for now — connect later in Settings
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}