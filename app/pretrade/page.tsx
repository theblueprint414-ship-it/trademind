"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const ICT_SETUPS = [
  { code: "FVG", label: "Fair Value Gap" },
  { code: "iFVG", label: "Inverse FVG" },
  { code: "OB", label: "Order Block" },
  { code: "BOS", label: "Break of Structure" },
  { code: "ChoCh", label: "Change of Character" },
  { code: "SMT", label: "SMT Divergence" },
  { code: "LiqSW", label: "Liquidity Sweep" },
  { code: "DISP", label: "Displacement" },
  { code: "EQH", label: "EQH / EQL" },
];

type Ritual = {
  id: string;
  date: string;
  setupType: string | null;
  conviction: number | null;
  reason: string | null;
  hasStopLoss: boolean;
  linkedTradeId: string | null;
  createdAt: string;
};

const today = new Date().toISOString().split("T")[0];

function ConvictionBar({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const active = value !== null && n <= value;
        const color = value !== null && value >= 8 ? "#00E87A" : value !== null && value >= 5 ? "#F59E0B" : "#FF3B5C";
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1, height: 28, borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
              background: active ? color : "var(--surface3)",
              color: active ? (value !== null && value >= 5 ? "#000" : "#fff") : "var(--text-muted)",
              transition: "background 0.1s",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function RitualCard({ ritual }: { ritual: Ritual }) {
  const timeLabel = new Date(ritual.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const convColor = ritual.conviction !== null && ritual.conviction >= 8 ? "#00E87A" : ritual.conviction !== null && ritual.conviction >= 5 ? "#F59E0B" : "#FF3B5C";

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {ritual.setupType && (
              <span style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700, color: "#60A5FA" }}>
                {ritual.setupType}
              </span>
            )}
            {ritual.conviction !== null && (
              <span style={{ fontSize: 12, fontWeight: 700, color: convColor }}>
                Conviction: {ritual.conviction}/10
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 7px",
              background: ritual.hasStopLoss ? "rgba(0,232,122,0.12)" : "rgba(255,59,92,0.12)",
              color: ritual.hasStopLoss ? "#00E87A" : "#FF3B5C",
            }}>
              {ritual.hasStopLoss ? "✓ Stop Loss Set" : "⚠ No Stop Loss"}
            </span>
          </div>
          {ritual.reason && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>{ritual.reason}</p>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{timeLabel}</div>
      </div>
    </div>
  );
}

export default function PreTradePage() {
  const [step, setStep] = useState<"form" | "done">("form");
  const [setupType, setSetupType] = useState<string | null>(null);
  const [conviction, setConviction] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [hasStopLoss, setHasStopLoss] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayRituals, setTodayRituals] = useState<Ritual[]>([]);
  const [loadingRituals, setLoadingRituals] = useState(true);

  useEffect(() => {
    fetch(`/api/pretrade?date=${today}`)
      .then((r) => r.json())
      .then((d) => { setTodayRituals(d.rituals ?? []); setLoadingRituals(false); })
      .catch(() => setLoadingRituals(false));
  }, []);

  async function handleSubmit() {
    if (hasStopLoss === null) {
      setError("Please confirm whether you have a stop loss set.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/pretrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, setupType, conviction, reason: reason.trim() || null, hasStopLoss }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      setTodayRituals((prev) => [data.ritual, ...prev]);
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setSetupType(null);
    setConviction(null);
    setReason("");
    setHasStopLoss(null);
    setError(null);
    setStep("form");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      <div style={{ padding: "18px 16px 0" }}>
        <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text-dim)", textDecoration: "none" }}>← Dashboard</Link>
        <h1 style={{ margin: "8px 0 2px", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Pre-Trade Ritual</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Ground yourself before entering a trade</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {step === "done" ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Ritual Complete</h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              You are prepared and intentional. Take this trade with discipline.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={resetForm}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "var(--blue)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Another Trade
              </button>
              <Link href="/journal" style={{
                padding: "10px 20px", borderRadius: 10, background: "var(--surface2)", color: "var(--text-dim)",
                fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-block",
              }}>
                Go to Journal
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Checklist reminder */}
            <div style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#60A5FA", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.05em" }}>Before You Enter</div>
              {["I have identified my setup clearly", "I have a defined entry, stop, and target", "I know my risk in $", "I am not trading out of boredom or FOMO", "My mental score today supports trading"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ color: "#60A5FA", fontSize: 13 }}>□</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Setup type */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Setup Type (Optional)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {ICT_SETUPS.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => setSetupType(setupType === s.code ? null : s.code)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                      background: setupType === s.code ? "rgba(96,165,250,0.2)" : "var(--surface2)",
                      color: setupType === s.code ? "#60A5FA" : "var(--text-dim)",
                      borderColor: setupType === s.code ? "rgba(96,165,250,0.4)" : "transparent",
                      borderWidth: 1, borderStyle: "solid",
                    }}
                  >
                    {s.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Conviction */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                Conviction Level {conviction !== null && <span style={{ color: conviction >= 8 ? "#00E87A" : conviction >= 5 ? "#F59E0B" : "#FF3B5C" }}>{conviction}/10</span>}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>How confident are you in this setup?</div>
              <ConvictionBar value={conviction} onChange={setConviction} />
              {conviction !== null && conviction < 6 && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#F59E0B", background: "rgba(245,158,11,0.1)", borderRadius: 6, padding: "6px 10px" }}>
                  Low conviction — consider waiting for a higher-quality setup.
                </div>
              )}
            </div>

            {/* Why this trade */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Why This Trade?</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Articulate your edge in one or two sentences.</div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Bullish FVG on 15m aligned with 4H OB, price swept EQL and reversed during London open kill zone..."
                rows={3}
                maxLength={500}
                style={{
                  width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8,
                  padding: "10px 12px", fontSize: 13, color: "var(--text)", resize: "none", boxSizing: "border-box",
                  outline: "none", fontFamily: "inherit", lineHeight: 1.5,
                }}
              />
              <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "right", marginTop: 2 }}>{reason.length}/500</div>
            </div>

            {/* Stop loss confirmation */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Do you have a stop loss set?</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setHasStopLoss(v)}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                      background: hasStopLoss === v ? (v ? "rgba(0,232,122,0.15)" : "rgba(255,59,92,0.12)") : "var(--surface2)",
                      color: hasStopLoss === v ? (v ? "#00E87A" : "#FF3B5C") : "var(--text-dim)",
                      borderColor: hasStopLoss === v ? (v ? "rgba(0,232,122,0.35)" : "rgba(255,59,92,0.3)") : "transparent",
                      borderWidth: 1, borderStyle: "solid",
                    }}
                  >
                    {v ? "✓ Yes" : "✗ No"}
                  </button>
                ))}
              </div>
              {hasStopLoss === false && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#FF3B5C", background: "rgba(255,59,92,0.1)", borderRadius: 6, padding: "7px 10px" }}>
                  Trading without a stop loss is a risk management violation. Consider setting one before entering.
                </div>
              )}
            </div>

            {error && (
              <div style={{ background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#FF3B5C" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: saving ? "default" : "pointer",
                background: saving ? "var(--surface3)" : "var(--blue)", color: saving ? "var(--text-muted)" : "#fff",
                fontSize: 15, fontWeight: 800, letterSpacing: "0.02em",
              }}
            >
              {saving ? "Saving..." : "Complete Ritual →"}
            </button>
          </div>
        )}

        {/* Today's rituals */}
        {!loadingRituals && todayRituals.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Today's Rituals ({todayRituals.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todayRituals.map((r) => <RitualCard key={r.id} ritual={r} />)}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}