"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MT4Demo, TopstepXDemo, TradovateDemo, BinanceGuide, BybitGuide, CoinbaseGuide, KrakenGuide, AlpacaGuide } from "@/components/BrokerStepsDemo";
import ScoreRing from "@/components/ScoreRing";

type Step = "welcome" | "trader-type" | "limit" | "broker";

const STEPS_META: { key: Step; label: string }[] = [
  { key: "welcome",     label: "Welcome"      },
  { key: "trader-type", label: "Style"        },
  { key: "limit",       label: "Limit"        },
  { key: "broker",      label: "Connect"      },
];

const BROKERS = [
  { id: "topstepx",     name: "TopstepX",        abbr: "TSX", color: "#00C896", needsSecret: true,  secretLabel: "API Key",          keyLabel: "USERNAME",       keyPlaceholder: "Your TopstepX username", firms: "TopstepX funded accounts" },
  { id: "metaapi",      name: "MT4/MT5 (Forex)",  abbr: "MT4", color: "#FF6B35", needsSecret: true,  secretLabel: "Investor Password", keyLabel: "ACCOUNT NUMBER", keyPlaceholder: "e.g. 12345678",          firms: "FTMO, IC Markets, FxFlat, any MT4/MT5 broker" },
  { id: "alpaca",       name: "Alpaca",           abbr: "ALP", color: "#00E87A", needsSecret: true,  secretLabel: "API Secret",        keyLabel: "API KEY",        keyPlaceholder: "Paste your API key",     firms: "US stocks & options" },
  { id: "binance",      name: "Binance",          abbr: "BNB", color: "#F0B90B", needsSecret: true,  secretLabel: "API Secret",        keyLabel: "API KEY",        keyPlaceholder: "Paste your API key",     firms: "Binance crypto" },
  { id: "bybit",        name: "Bybit",            abbr: "BYB", color: "#F7A600", needsSecret: true,  secretLabel: "API Secret",        keyLabel: "API KEY",        keyPlaceholder: "Paste your API key",     firms: "Bybit crypto" },
  { id: "coinbase",     name: "Coinbase",         abbr: "CB",  color: "#0052FF", needsSecret: true,  secretLabel: "API Secret",        keyLabel: "API KEY",        keyPlaceholder: "Paste your API key",     firms: "Coinbase Advanced Trade" },
  { id: "kraken",       name: "Kraken",           abbr: "KRK", color: "#5741D9", needsSecret: true,  secretLabel: "Private Key",       keyLabel: "API KEY",        keyPlaceholder: "Paste your API key",     firms: "Kraken crypto" },
  { id: "tradovate",    name: "Tradovate",        abbr: "TRD", color: "#5e6ad2", needsSecret: true,  secretLabel: "Password",          keyLabel: "USERNAME",       keyPlaceholder: "Your Tradovate username", firms: "Apex, Funded Next, Lucid, TopStep futures" },
  { id: "tradestation", name: "TradeStation",     abbr: "TS",  color: "#FF3B5C", needsSecret: false, secretLabel: "",                  keyLabel: "API KEY",        keyPlaceholder: "",                       firms: "" },
  { id: "ibkr",         name: "IBKR",             abbr: "IB",  color: "#CC0000", needsSecret: false, secretLabel: "",                  keyLabel: "API KEY",        keyPlaceholder: "",                       firms: "" },
];

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 40, alignItems: "center" }}>
      {STEPS_META.map((s, i) => (
        <div key={s.key} style={{ display: "flex", alignItems: "center", flex: 1, gap: 6 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <div style={{ height: 3, borderRadius: 2, background: i < current ? "var(--blue)" : "var(--surface3)", transition: "background 0.4s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);
  const [traderType, setTraderType] = useState("");
  const [tradeLimit, setTradeLimit] = useState(5);
  const [isPro, setIsPro] = useState<boolean | null>(null);

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

  function goToStep(next: Step, dir: "forward" | "back" = "forward") {
    setSlideDir(dir);
    setAnimKey((k) => k + 1);
    setStep(next);
  }

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
    goToStep("limit");
  }

  async function saveLimit() {
    localStorage.setItem("trademind_trade_limit", String(tradeLimit));
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradeLimit }),
    }).catch(() => {});
    goToStep("broker");
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
    if (selectedBroker === "metaapi" && !metaApiServer.trim()) {
      setConnectError("MT4/MT5 server name is required. Open MT4/MT5 → File → Login to find it.");
      return;
    }
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

  const tradeLimitLabels: Record<number, string> = {
    1: "Ultra-disciplined", 2: "Conservative", 3: "Focused",
    5: "Selective", 8: "Active", 10: "High volume",
    15: "Aggressive", 20: "Maximum",
  };
  const nearestLabel = [1, 2, 3, 5, 8, 10, 15, 20].reduce((prev, curr) =>
    Math.abs(curr - tradeLimit) < Math.abs(prev - tradeLimit) ? curr : prev
  );
  const limitLabel = tradeLimitLabels[nearestLabel] ?? "";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px 80px" }}>
      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp       { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin         { to   { transform:rotate(360deg); } }
        @keyframes pulse-ring   { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .slide-forward { animation: slideInRight 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-back    { animation: slideInLeft  0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up       { animation: fadeUp       0.5s  cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-1     { animation-delay: 0.05s; }
        .fade-up-2     { animation-delay: 0.10s; }
        .fade-up-3     { animation-delay: 0.15s; }
        .fade-up-4     { animation-delay: 0.20s; }
        .fade-up-5     { animation-delay: 0.25s; }
        input[type=range] { -webkit-appearance:none; appearance:none; height:4px; border-radius:2px; background: linear-gradient(to right, var(--red) 0%, var(--red) var(--track-fill, 50%), var(--surface3) var(--track-fill, 50%), var(--surface3) 100%); outline:none; cursor:pointer; width:100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:var(--text); border:3px solid var(--bg); box-shadow:0 2px 8px rgba(0,0,0,0.4); cursor:pointer; }
        input[type=range]::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:var(--text); border:3px solid var(--bg); cursor:pointer; }
        .trader-btn { transition: border-color 0.15s, background 0.15s, transform 0.15s; }
        .trader-btn:hover { transform: translateY(-1px); }
        .broker-btn { transition: border-color 0.15s, background 0.15s; }
        .broker-btn:hover:not(:disabled) { border-color: rgba(94,106,210,0.5) !important; background: rgba(94,106,210,0.04) !important; }
      `}</style>

      <Link href="/" style={{ textDecoration: "none", marginBottom: 40, opacity: 0.85 }}>
        <img src="/logo.svg" alt="TradeMind" height="26" style={{ display: "block" }} />
      </Link>

      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Back button row */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, minHeight: 24 }}>
          {step !== "welcome" && (
            <button
              onClick={() => goToStep(step === "trader-type" ? "welcome" : step === "limit" ? "trader-type" : "limit", "back")}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 5, letterSpacing: "-0.01em" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
          )}
          <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            {stepIndex} / {STEPS_META.length}
          </div>
        </div>

        <ProgressBar current={stepIndex} total={STEPS_META.length} />

        {/* Step container */}
        <div key={animKey} className={slideDir === "forward" ? "slide-forward" : "slide-back"}>

          {/* ── Welcome ── */}
          {step === "welcome" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                  {/* Animated score ring preview */}
                  <div style={{ position: "relative", marginBottom: 14 }}>
                    <div style={{ position: "absolute", inset: -12, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,232,122,0.1) 0%, transparent 70%)", animation: "pulse-ring 3s ease-in-out infinite" }} />
                    <ScoreRing score={82} color="var(--green)" size={120} />
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 18px", background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.28)", borderRadius: 99 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 7px var(--green)" }} />
                    <span className="font-bebas" style={{ fontSize: 14, color: "var(--green)", letterSpacing: "0.1em" }}>GO · YOUR MIND IS READY TO TRADE</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, letterSpacing: "0.04em" }}>
                    This is what you&apos;ll see every morning after 60 seconds
                  </p>
                </div>

                <h1 className="font-bebas fade-up fade-up-1" style={{ fontSize: 46, lineHeight: 1, marginBottom: 14, letterSpacing: "0.02em" }}>
                  Your Mind Is Your Edge
                </h1>
                <p className="fade-up fade-up-2" style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 420, margin: "0 auto" }}>
                  Most losses aren&apos;t about the market — they&apos;re about the mental state you were in when you entered.
                  TradeMind quantifies that. Every morning. In 60 seconds.
                </p>
              </div>

              {/* 3 core pillars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
                {[
                  {
                    color: "var(--blue)", bg: "rgba(94,106,210,0.08)", bd: "rgba(94,106,210,0.2)",
                    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke="var(--blue)" strokeWidth="1.4"/><path d="M3 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="var(--blue)" strokeWidth="1.4" strokeLinecap="round"/><path d="M16 4.5l1.5-1.5M18 7.5h1.5M16 10.5l1.5 1.5" stroke="var(--blue)" strokeWidth="1.3" strokeLinecap="round"/></svg>,
                    title: "60-Second Daily Check-in",
                    desc: "5 research-backed questions. One number. GO, CAUTION, or NO-TRADE — every single day, before you touch the market.",
                  },
                  {
                    color: "var(--red)", bg: "rgba(255,59,92,0.08)", bd: "rgba(255,59,92,0.2)",
                    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="9" width="12" height="9" rx="2" stroke="var(--red)" strokeWidth="1.4"/><path d="M8 9V7a3 3 0 016 0v2" stroke="var(--red)" strokeWidth="1.4" strokeLinecap="round"/><circle cx="11" cy="13.5" r="1.2" fill="var(--red)"/></svg>,
                    title: "Circuit Breaker",
                    desc: "Set a daily trade limit. Hit it — your broker gets blocked at the network level. No override. Funded accounts stay funded.",
                  },
                  {
                    color: "var(--green)", bg: "rgba(0,232,122,0.07)", bd: "rgba(0,232,122,0.2)",
                    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 17l5-7 4 4 4-8 5 6" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 20h16" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                    title: "Psychology → P&L Correlation",
                    desc: "After 10 trades, you&apos;ll see exactly which mental states make you money — and which destroy your edge. That single insight changes everything.",
                  },
                ].map((f, i) => (
                  <div key={f.title} className={`card fade-up fade-up-${i + 3}`} style={{ padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start", borderColor: f.bd, background: f.bg }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface)", border: `1px solid ${f.bd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: "var(--text)" }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn-primary" style={{ width: "100%", padding: "17px", fontSize: 16, letterSpacing: "-0.01em" }} onClick={() => goToStep("trader-type")}>
                Set Up My Profile
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 6 }}><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>Takes 2 minutes. All steps optional.</p>
            </div>
          )}

          {/* ── Trader Type ── */}
          {step === "trader-type" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div className="fade-up" style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 20l6-9 5 5 7-12 4 8" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                <h1 className="font-bebas fade-up fade-up-1" style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }}>How Do You Trade?</h1>
                <p className="fade-up fade-up-2" style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                  We&apos;ll tailor your check-in and AI Coach to your specific style.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                {[
                  { id: "scalper",  label: "Scalper",       desc: "Seconds to minutes — pure execution, maximum mental load.",    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L7 9h6L5 18l2-7H3z" stroke="var(--amber)" strokeWidth="1.5" strokeLinejoin="round"/></svg>, color: "var(--amber)" },
                  { id: "day",      label: "Day Trader",    desc: "In and out same day. 10–20 decisions before lunch.",           icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15l5-6 4 3.5 5-9" stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: "var(--green)" },
                  { id: "swing",    label: "Swing Trader",  desc: "Hold for days or weeks. Entry quality determines everything.", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 12c2-4 3-5 4-3s1.5 5 3.5 3 2.5-7 4.5-5" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round"/></svg>, color: "var(--blue)" },
                  { id: "prop",     label: "Prop Trader",   desc: "Funded account. One bad mental day can void weeks of work.",   icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="10" rx="2" stroke="#8B5CF6" strokeWidth="1.5"/><path d="M7 8V6a3 3 0 016 0v2" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/></svg>, color: "#8B5CF6" },
                  { id: "crypto",   label: "Crypto Trader", desc: "24/7 markets. Being always available means trading when you shouldn't.", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="var(--amber)" strokeWidth="1.5"/><path d="M8 7h3a1.5 1.5 0 010 3H8m0-3v6m0-3h3.5a1.5 1.5 0 010 3H8" stroke="var(--amber)" strokeWidth="1.3" strokeLinecap="round"/></svg>, color: "var(--amber)" },
                ].map((t, i) => (
                  <button
                    key={t.id}
                    className={`trader-btn fade-up fade-up-${Math.min(i + 3, 5)}`}
                    onClick={() => saveTraderType(t.id)}
                    style={{
                      padding: "15px 18px", borderRadius: 12, textAlign: "left",
                      border: `1.5px solid ${traderType === t.id ? t.color : "var(--border)"}`,
                      background: traderType === t.id ? `${t.color === "var(--amber)" ? "rgba(255,176,32,0.07)" : t.color === "var(--green)" ? "rgba(0,232,122,0.07)" : t.color === "var(--blue)" ? "rgba(94,106,210,0.07)" : "rgba(139,92,246,0.07)"}` : "var(--surface2)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface)", border: `1px solid var(--border)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{t.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{t.desc}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>

              <button className="btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={() => goToStep("limit")}>
                Skip — set this later
              </button>
            </div>
          )}

          {/* ── Trade Limit ── */}
          {step === "limit" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div className="fade-up" style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="5" y="11" width="16" height="11" rx="2.5" stroke="var(--red)" strokeWidth="1.8"/><path d="M8 11V8a5 5 0 0110 0v3" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="13" cy="16.5" r="1.8" fill="var(--red)"/></svg>
                  </div>
                </div>
                <h1 className="font-bebas fade-up fade-up-1" style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }}>Set Your Daily Trade Limit</h1>
                <p className="fade-up fade-up-2" style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
                  When you hit this number, your broker is blocked for the rest of the day — no exceptions, no override. You can change it anytime in Settings.
                </p>
              </div>

              <div className="card fade-up fade-up-3" style={{ padding: "32px 28px", marginBottom: 16, textAlign: "center" }}>
                {/* Big number display */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                  <div className="font-bebas" style={{ fontSize: 88, color: "var(--red)", lineHeight: 1, textShadow: "0 0 40px rgba(255,59,92,0.35)", transition: "all 0.15s" }}>
                    {tradeLimit}
                  </div>
                  <div style={{ fontSize: 16, color: "var(--text-muted)", paddingBottom: 10 }}>/ day</div>
                </div>
                {limitLabel && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 20, marginBottom: 28, fontSize: 11, color: "var(--red)", fontWeight: 700, letterSpacing: "0.08em", transition: "all 0.2s" }}>
                    {limitLabel.toUpperCase()}
                  </div>
                )}

                <input
                  type="range" min={1} max={20} value={tradeLimit}
                  style={{ "--track-fill": `${((tradeLimit - 1) / 19) * 100}%` } as React.CSSProperties}
                  onChange={(e) => setTradeLimit(Number(e.target.value))}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
                  <span>1 — ultra-focused</span>
                  <span>20 — high volume</span>
                </div>
              </div>

              {/* Research callout */}
              <div className="fade-up fade-up-4" style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(255,176,32,0.05)", border: "1px solid rgba(255,176,32,0.2)", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1, color: "var(--amber)" }}><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "var(--amber)" }}>Research insight:</strong> Traders who limit to 3–5 high-conviction trades outperform those who overtrade by a significant margin. Start conservative — you can raise it anytime.
                </p>
              </div>

              <button className="btn-primary fade-up fade-up-5" style={{ width: "100%", padding: "17px", fontSize: 16 }} onClick={saveLimit}>
                Set Limit &amp; Continue →
              </button>
            </div>
          )}

          {/* ── Broker Connect ── */}
          {step === "broker" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div className="fade-up" style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13a8 8 0 018-8M21 13a8 8 0 01-8 8" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 5l3-3 3 3M16 21l-3 3-3-3" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                <h1 className="font-bebas fade-up fade-up-1" style={{ fontSize: 40, marginBottom: 8 }}>Connect Your Broker</h1>
                <p className="fade-up fade-up-2" style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                  Auto-import trades in real time. No manual logging, no missed entries.
                </p>
              </div>

              {isPro === null ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
                </div>
              ) : isPro === false ? (
                <>
                  <div className="card fade-up" style={{ padding: 28, marginBottom: 16, textAlign: "center", border: "1px solid rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.04)" }}>
                    <div style={{ marginBottom: 14, display: "flex", justifyContent: "center", color: "#8B5CF6" }}>
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M16 24l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M22 17l3-3a5 5 0 017 7l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 23l-3 3a5 5 0 01-7-7l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Broker sync is part of TradeMind</div>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20 }}>
                      Upgrade to connect MT4/MT5, TopstepX, and crypto exchanges. Unlock AI Coach, behavioral pattern detection, deep analytics, and more.
                    </p>
                    <Link href="/settings">
                      <button className="btn-primary" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366f1)", border: "none" }}>Start 7-Day Free Trial →</button>
                    </Link>
                  </div>
                  <button className="btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={finish}>
                    Skip — connect later in Settings
                  </button>
                </>
              ) : connected ? (
                <div>
                  <div className="card fade-up" style={{ padding: 36, textAlign: "center", border: "1px solid rgba(0,232,122,0.25)", background: "rgba(0,232,122,0.04)", marginBottom: 20 }}>
                    <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
                      <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="20" stroke="var(--green)" strokeWidth="2"/><path d="M17 26l7 7 11-11" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "var(--green)", marginBottom: 8 }}>
                      {BROKERS.find((b) => b.id === selectedBroker)?.name} Connected
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
                      Your trades will sync automatically. The last 90 days are being imported to your Journal now.
                    </p>
                  </div>
                  <button className="btn-primary" style={{ width: "100%", padding: "17px", fontSize: 16 }} onClick={finish}>
                    Take My First Check-in →
                  </button>
                </div>
              ) : (
                <div>
                  {/* Helper guide */}
                  <div className="fade-up" style={{ padding: "13px 16px", borderRadius: 10, background: "rgba(94,106,210,0.05)", border: "1px solid rgba(94,106,210,0.15)", marginBottom: 14, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.85 }}>
                    <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 5, fontSize: 12 }}>Not sure which to pick?</div>
                    <div>FTMO, IC Markets, Pepperstone → <strong style={{ color: "var(--text)" }}>MT4/MT5</strong></div>
                    <div>Apex, Funded Next, TopStep futures → <strong style={{ color: "var(--text)" }}>Tradovate</strong> (CSV)</div>
                    <div>TopstepX funded accounts → <strong style={{ color: "var(--text)" }}>TopstepX</strong></div>
                    <div>Crypto → <strong style={{ color: "var(--text)" }}>Binance / Bybit / Coinbase / Kraken</strong></div>
                  </div>

                  {/* Broker grid */}
                  <div className="fade-up fade-up-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 16 }}>
                    {BROKERS.map((b) => {
                      const isComingSoon = b.id === "tradestation" || b.id === "ibkr";
                      return (
                        <button
                          key={b.id}
                          className="broker-btn"
                          onClick={() => !isComingSoon && setSelectedBroker(b.id)}
                          disabled={isComingSoon}
                          title={isComingSoon ? "Coming soon" : undefined}
                          style={{
                            padding: "13px 14px", borderRadius: 10, textAlign: "left",
                            border: `1.5px solid ${selectedBroker === b.id ? "var(--blue)" : "var(--border)"}`,
                            background: selectedBroker === b.id ? "rgba(94,106,210,0.08)" : "var(--surface2)",
                            cursor: isComingSoon ? "not-allowed" : "pointer", opacity: isComingSoon ? 0.4 : 1,
                            display: "flex", alignItems: "center", gap: 10,
                          }}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: `${b.color}18`, border: `1px solid ${b.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: b.color, letterSpacing: "0.04em", flexShrink: 0 }}>{b.abbr}</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</div>
                            {isComingSoon ? (
                              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Coming soon</div>
                            ) : b.firms ? (
                              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1, lineHeight: 1.3 }}>{b.firms}</div>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tradovate CSV */}
                  {selectedBroker === "tradovate" && (
                    <div className="card fade-up" style={{ padding: 20, marginBottom: 14, border: "1px solid rgba(94,106,210,0.2)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>HOW TO EXPORT FROM TRADOVATE</div>
                      <TradovateDemo />
                      {csvResult ? (
                        <>
                          <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)", color: "var(--green)", fontSize: 13, textAlign: "center", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {csvResult.imported} trade{csvResult.imported !== 1 ? "s" : ""} imported{csvResult.skipped > 0 ? ` · ${csvResult.skipped} duplicates skipped` : ""}
                          </div>
                          <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={finish}>
                            Take My First Check-in →
                          </button>
                        </>
                      ) : (
                        <label style={{ display: "block", padding: "24px 18px", borderRadius: 10, border: "2px dashed var(--border)", textAlign: "center", cursor: csvUploading ? "wait" : "pointer", background: "var(--surface2)", transition: "border-color 0.15s" }}>
                          <input type="file" accept=".csv" style={{ display: "none" }} disabled={csvUploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }} />
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, color: "var(--text-dim)" }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4v14M10 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 20v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                            {csvUploading ? "Importing..." : "Upload Tradovate CSV"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Click or drag your export here</div>
                        </label>
                      )}
                    </div>
                  )}

                  {/* API credentials form */}
                  {selectedBroker && selectedBroker !== "tradovate" && (
                    <div className="card fade-up" style={{ padding: 22, marginBottom: 14, border: "1px solid rgba(94,106,210,0.2)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 14 }}>
                        {brokerMeta?.name} — CREDENTIALS
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {selectedBroker === "topstepx"  && <div style={{ padding: 13, borderRadius: 10, background: "rgba(0,200,150,0.04)",   border: "1px solid rgba(0,200,150,0.2)"   }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>HOW TO GET YOUR API KEY</div><TopstepXDemo /></div>}
                        {selectedBroker === "metaapi"   && <div style={{ padding: 13, borderRadius: 10, background: "rgba(255,107,53,0.04)",   border: "1px solid rgba(255,107,53,0.2)"   }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>HOW TO FIND YOUR MT4/MT5 CREDENTIALS</div><MT4Demo /></div>}
                        {selectedBroker === "binance"   && <div style={{ padding: 13, borderRadius: 10, background: "rgba(240,185,11,0.04)",   border: "1px solid rgba(240,185,11,0.2)"   }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>HOW TO CREATE A BINANCE API KEY</div><BinanceGuide /></div>}
                        {selectedBroker === "bybit"     && <div style={{ padding: 13, borderRadius: 10, background: "rgba(247,166,0,0.04)",    border: "1px solid rgba(247,166,0,0.2)"    }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>HOW TO CREATE A BYBIT API KEY</div><BybitGuide /></div>}
                        {selectedBroker === "coinbase"  && <div style={{ padding: 13, borderRadius: 10, background: "rgba(0,82,255,0.04)",     border: "1px solid rgba(0,82,255,0.2)"     }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>HOW TO CREATE A COINBASE API KEY</div><CoinbaseGuide /></div>}
                        {selectedBroker === "kraken"    && <div style={{ padding: 13, borderRadius: 10, background: "rgba(87,65,217,0.04)",    border: "1px solid rgba(87,65,217,0.2)"    }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>HOW TO CREATE A KRAKEN API KEY</div><KrakenGuide /></div>}
                        {selectedBroker === "alpaca"    && <div style={{ padding: 13, borderRadius: 10, background: "rgba(0,232,122,0.04)",    border: "1px solid rgba(0,232,122,0.2)"    }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>HOW TO FIND YOUR ALPACA API KEYS</div><AlpacaGuide /></div>}

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>{brokerMeta?.keyLabel ?? "API KEY"}</label>
                          <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={brokerMeta?.keyPlaceholder ?? "Paste your API key"} style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13 }} />
                        </div>

                        {brokerMeta?.needsSecret && (
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>{brokerMeta.secretLabel.toUpperCase()}</label>
                            <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder={`Your ${brokerMeta.secretLabel.toLowerCase()}`} style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13 }} />
                          </div>
                        )}

                        {selectedBroker === "metaapi" && (
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>MT4/MT5 SERVER <span style={{ color: "var(--red)" }}>*</span></label>
                            <input type="text" value={metaApiServer} onChange={(e) => setMetaApiServer(e.target.value)} placeholder="e.g. ICMarkets-Demo02" style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13, borderColor: !metaApiServer.trim() ? "rgba(255,59,92,0.35)" : undefined }} />
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Open MT4/MT5 → File → Login → check the server dropdown</div>
                          </div>
                        )}

                        {selectedBroker !== "topstepx" && selectedBroker !== "metaapi" && (
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>ENVIRONMENT</label>
                            <div style={{ display: "flex", gap: 8 }}>
                              {(["live", "paper"] as const).map((env) => (
                                <button key={env} type="button" onClick={() => setEnvironment(env)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${environment === env ? "var(--blue)" : "var(--border)"}`, background: environment === env ? "rgba(94,106,210,0.1)" : "var(--surface2)", color: environment === env ? "var(--blue)" : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 700, textTransform: "capitalize", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                  {env === "live"
                                    ? <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--red)", boxShadow: "0 0 5px var(--red)" }} />Live</>
                                    : <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6.5h5M4 4.5h3M4 8.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>Paper</>
                                  }
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

                      <button className="btn-primary" onClick={connectBroker} disabled={connecting || !apiKey.trim()} style={{ width: "100%", marginTop: 16, padding: 14, fontSize: 15 }}>
                        {connecting ? "Verifying credentials..." : `Connect ${brokerMeta?.name} →`}
                      </button>
                    </div>
                  )}

                  <button className="btn-ghost" style={{ width: "100%", fontSize: 13 }} onClick={finish}>
                    Skip — connect later in Settings
                  </button>
                </div>
              )}
            </div>
          )}

        </div>{/* end animated step container */}
      </div>
    </div>
  );
}