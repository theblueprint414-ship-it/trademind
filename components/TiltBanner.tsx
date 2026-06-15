"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TiltData = {
  riskLevel: "safe" | "caution" | "tilt" | "danger";
  consecutiveLosses: number;
  revengeTradesCount: number;
  todayPnl: number;
  message: string | null;
  tip: string | null;
  shouldStop: boolean;
};

const DISMISS_KEY = "trademind_tilt_dismiss";
const DISMISS_TTL_MS = 30 * 60 * 1000; // 30 minutes

export default function TiltBanner() {
  const [data, setData] = useState<TiltData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check sessionStorage dismiss (with 30-min TTL)
    try {
      const raw = sessionStorage.getItem(DISMISS_KEY);
      if (raw) {
        const { ts, level } = JSON.parse(raw) as { ts: number; level: string };
        // Reset dismiss if new tilt level is higher than what was dismissed
        const levelRank = { safe: 0, caution: 1, tilt: 2, danger: 3 };
        if (Date.now() - ts < DISMISS_TTL_MS) {
          setDismissed(true);
          // Will still fetch to see if level escalated
        }
      }
    } catch {}

    fetch("/api/tilt")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: TiltData | null) => {
        if (!d || d.riskLevel === "safe") return;
        // If dismissed at this level, keep dismissed; if escalated, show again
        try {
          const raw = sessionStorage.getItem(DISMISS_KEY);
          if (raw) {
            const { level } = JSON.parse(raw) as { ts: number; level: string };
            const levelRank: Record<string, number> = { safe: 0, caution: 1, tilt: 2, danger: 3 };
            if ((levelRank[d.riskLevel] ?? 0) > (levelRank[level] ?? 0)) {
              setDismissed(false); // escalated — show again
            }
          }
        } catch {}
        setData(d);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, JSON.stringify({ ts: Date.now(), level: data?.riskLevel ?? "caution" }));
    } catch {}
  }

  if (!data || data.riskLevel === "safe" || dismissed) return null;

  const isRed = data.riskLevel === "danger" || data.riskLevel === "tilt";
  const accentColor = isRed ? "var(--red)" : "var(--amber)";
  const bgColor = isRed ? "rgba(255,59,92,0.06)" : "rgba(255,176,32,0.05)";
  const borderColor = isRed ? "rgba(255,59,92,0.35)" : "rgba(255,176,32,0.3)";

  return (
    <div
      style={{
        margin: "0 0 16px",
        padding: "14px 16px",
        borderRadius: 12,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        {data.shouldStop ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke={accentColor} strokeWidth="1.4" />
            <path d="M9 5v5M9 12.5v.5" stroke={accentColor} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16.5 15.5H1.5L9 2z" stroke={accentColor} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M9 7v4M9 13v.5" stroke={accentColor} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, marginBottom: 3 }}>
          {data.riskLevel === "danger"
            ? "Behavioral Risk: STOP"
            : data.riskLevel === "tilt"
            ? "Tilt Detected — Slow Down"
            : "Caution: Check Your Head"}
        </div>
        {data.message && (
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: data.tip ? 4 : 0 }}>
            {data.message}
          </div>
        )}
        {data.tip && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
            {data.tip}
          </div>
        )}
        {data.shouldStop && (
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/coach" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1px solid ${accentColor}50`,
                  background: `${accentColor}15`,
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Talk to AI Coach →
              </button>
            </Link>
            <Link href="/recap" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Write a Recap
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          padding: 2,
          flexShrink: 0,
          lineHeight: 1,
        }}
        title="Dismiss for 30 minutes"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
