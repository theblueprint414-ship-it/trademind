"use client";

import { useEffect, useState, useCallback } from "react";

export default function TradeLimit() {
  const [limit, setLimit] = useState(5);
  const [tradesUsed, setTradesUsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockEnd, setLockEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(() => {
    try {
      const l = Number(localStorage.getItem("trademind_trade_limit") || 5);
      const trades = JSON.parse(localStorage.getItem(`trademind_trades_${today}`) || "[]");
      const lockEndStored = Number(localStorage.getItem(`trademind_lock_${today}`) || 0);
      setLimit(l);
      setTradesUsed(trades.length);
      if (lockEndStored > Date.now()) {
        setLocked(true); setLockEnd(lockEndStored);
        setTimeLeft(Math.ceil((lockEndStored - Date.now()) / 1000));
      } else { setLocked(false); setLockEnd(null); }
    } catch {}
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!locked || !lockEnd) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockEnd - Date.now()) / 1000);
      if (remaining <= 0) { setLocked(false); setLockEnd(null); setTimeLeft(0); clearInterval(interval); }
      else setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [locked, lockEnd]);

  function addTrade() {
    if (locked) return;
    try {
      const trades = JSON.parse(localStorage.getItem(`trademind_trades_${today}`) || "[]");
      trades.push({ time: new Date().toISOString() });
      localStorage.setItem(`trademind_trades_${today}`, JSON.stringify(trades));
      if (trades.length >= limit) {
        const end = Date.now() + 60 * 60 * 1000;
        localStorage.setItem(`trademind_lock_${today}`, String(end));
        setLocked(true); setLockEnd(end); setTimeLeft(3600);
      }
      setTradesUsed(trades.length);
    } catch {}
  }

  const remaining = Math.max(0, limit - tradesUsed);
  const pct = (tradesUsed / limit) * 100;
  const barColor = pct >= 100 ? "var(--red)" : pct >= 75 ? "var(--amber)" : "var(--green)";
  const barGradient = pct >= 100
    ? "linear-gradient(90deg, var(--red), #c4183a)"
    : pct >= 75
    ? "linear-gradient(90deg, var(--amber), var(--red))"
    : "linear-gradient(90deg, var(--green), var(--blue))";

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (locked) {
    return (
      <div className="card" style={{ padding: 28, border: "1px solid rgba(255,59,92,0.35)", background: "linear-gradient(135deg, rgba(255,59,92,0.06) 0%, var(--surface) 60%)", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
        <div className="font-bebas" style={{ fontSize: 32, color: "var(--red)", letterSpacing: "0.05em", marginBottom: 6 }}>TRADING LOCKED</div>
        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>You reached your {limit}-trade daily limit</p>
        <div className="font-bebas score-number" style={{ fontSize: 52, color: "var(--amber)", letterSpacing: "0.08em", textShadow: "0 0 20px rgba(255,176,32,0.5)" }}>
          {formatTime(timeLeft)}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>until lock releases</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 24, borderColor: pct >= 75 ? `${barColor}30` : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>TRADE LIMIT</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13, color: pct >= 75 ? barColor : "var(--text-dim)", fontWeight: 700 }}>
            {tradesUsed}/{limit}
          </span>
          <button onClick={addTrade} className="btn-primary" style={{ fontSize: 13, padding: "6px 14px", background: pct >= 75 ? "linear-gradient(135deg, var(--amber), var(--red))" : undefined, boxShadow: pct >= 75 ? "0 4px 14px rgba(255,176,32,0.3)" : undefined }} disabled={tradesUsed >= limit}>
            + Trade
          </button>
        </div>
      </div>

      <div style={{ height: 8, background: "var(--surface2)", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: barGradient, borderRadius: 4, transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 10px ${barColor}70` }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
        <span style={{ color: remaining === 0 ? "var(--red)" : remaining <= 2 ? "var(--amber)" : "var(--text-muted)" }}>
          {remaining > 0 ? `${remaining} trade${remaining !== 1 ? "s" : ""} remaining` : "Limit reached!"}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
