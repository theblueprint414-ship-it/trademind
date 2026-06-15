"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Trade = {
  id: string;
  symbol: string | null;
  side: string | null;
  pnl: number | null;
  rMultiple: number | null;
  entryPrice: number | null;
  exitPrice: number | null;
  date: string;
  setupType: string | null;
  confidence: string | null;
  notes: string | null;
  entryTime: string | null;
  exitTime: string | null;
};

function pnlColor(pnl: number | null) {
  if (pnl === null) return "var(--text-muted)";
  return pnl >= 0 ? "var(--green)" : "var(--red)";
}

function fmt(n: number) {
  const s = Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (n >= 0 ? "+" : "−") + "$" + s;
}

function TradeShareCard({ trade }: { trade: Trade }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const pnlSign = (trade.pnl ?? 0) >= 0;
  const accentColor = pnlSign ? "#00E87A" : "#FF3B5C";
  const bgGrad = pnlSign
    ? "linear-gradient(135deg, rgba(0,232,122,0.12) 0%, rgba(0,232,122,0.02) 100%)"
    : "linear-gradient(135deg, rgba(255,59,92,0.12) 0%, rgba(255,59,92,0.02) 100%)";

  function handlePrint() {
    const card = cardRef.current;
    if (!card) return;

    // Open a minimal print window with only the card
    const win = window.open("", "_blank", "width=600,height=500");
    if (!win) return;

    // Grab all CSS variables from root
    const rootStyle = getComputedStyle(document.documentElement);
    const cssVars = [
      "--bg","--surface","--surface2","--surface3","--border","--border-bright",
      "--text","--text-dim","--text-muted","--green","--red","--amber","--blue",
    ].map((v) => `${v}:${rootStyle.getPropertyValue(v)}`).join(";");

    // Copy relevant font faces
    const fontLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((l) => l.outerHTML).join("");

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${fontLinks}
  <style>
    :root { ${cssVars}; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; font-family: system-ui, sans-serif; }
    .font-bebas { font-family: "Bebas Neue", sans-serif; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${card.outerHTML}
  <script>setTimeout(() => { window.print(); window.close(); }, 400);<\/script>
</body>
</html>`);
    win.document.close();
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* The shareable card */}
      <div
        ref={cardRef}
        style={{
          background: "var(--surface)",
          border: `1px solid ${accentColor}30`,
          borderRadius: 20,
          padding: 28,
          backgroundImage: bgGrad,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              TRADEMIND
            </div>
            <div
              className="font-bebas"
              style={{ fontSize: 32, lineHeight: 1, color: "var(--text)" }}
            >
              {trade.symbol ?? "—"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 4,
                textTransform: "capitalize",
              }}
            >
              {trade.side ?? "—"} · {new Date(trade.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>

          {/* P&L */}
          <div style={{ textAlign: "right" }}>
            <div
              className="font-bebas"
              style={{
                fontSize: 42,
                lineHeight: 1,
                color: accentColor,
                textShadow: `0 0 20px ${accentColor}60`,
              }}
            >
              {trade.pnl !== null ? fmt(trade.pnl) : "—"}
            </div>
            {trade.rMultiple !== null && (
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: accentColor,
                  marginTop: 2,
                }}
              >
                {trade.rMultiple > 0 ? "+" : ""}
                {trade.rMultiple}R
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: trade.notes ? 20 : 0,
          }}
        >
          {[
            {
              label: "ENTRY",
              value: trade.entryPrice != null ? `$${trade.entryPrice.toLocaleString()}` : "—",
            },
            {
              label: "EXIT",
              value: trade.exitPrice != null ? `$${trade.exitPrice.toLocaleString()}` : "—",
            },
            {
              label: "SETUP",
              value: trade.setupType ?? "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {trade.notes && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderLeft: `3px solid ${accentColor}60`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              &ldquo;{trade.notes}&rdquo;
            </div>
          </div>
        )}

        {/* Watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 20,
            fontSize: 9,
            color: "rgba(255,255,255,0.15)",
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          trademindedge.com
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          onClick={handlePrint}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid var(--border-bright)",
            background: "var(--surface2)",
            color: "var(--text)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => {
            const text = `${trade.symbol ?? "Trade"} ${trade.side ?? ""}: ${trade.pnl !== null ? fmt(trade.pnl) : ""}${trade.rMultiple !== null ? ` (${trade.rMultiple > 0 ? "+" : ""}${trade.rMultiple}R)` : ""} — trademindedge.com`;
            if (navigator.share) {
              navigator.share({ text });
            } else {
              navigator.clipboard.writeText(text);
            }
          }}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: "var(--green)",
            color: "#09090b",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
}

export default function TradeCardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Trade | null>(null);

  useEffect(() => {
    fetch("/api/journal?limit=30")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => {
        if (d?.trades) {
          setTrades(d.trades.filter((t: Trade) => t.pnl !== null));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 0 16px",
          }}
        >
          <Link href="/journal">
            <button
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13 4l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
          <div>
            <h1
              className="font-bebas"
              style={{ fontSize: 28, lineHeight: 1, color: "var(--text)" }}
            >
              TRADE CARDS
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Export and share your best trades
            </p>
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  borderRadius: 12,
                  background: "var(--surface2)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {!loading && selected && (
          <>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 16,
                padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3l-5 5 5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to list
            </button>
            <TradeShareCard trade={selected} />
          </>
        )}

        {!loading && !selected && (
          <>
            {trades.length === 0 && (
              <div
                className="card"
                style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}
              >
                No trades with P&L found. Log some trades first.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {trades.map((t) => {
                const pnlSign = (t.pnl ?? 0) >= 0;
                const color = pnlColor(t.pnl);
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    style={{
                      width: "100%",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      padding: "16px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      textAlign: "left",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.borderColor =
                        "var(--border-bright)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")
                    }
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          className="font-bebas"
                          style={{ fontSize: 18, color: "var(--text)" }}
                        >
                          {t.symbol ?? "—"}
                        </span>
                        {t.side && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: pnlSign
                                ? "rgba(0,232,122,0.1)"
                                : "rgba(255,59,92,0.1)",
                              color: color,
                              textTransform: "capitalize",
                            }}
                          >
                            {t.side}
                          </span>
                        )}
                        {t.setupType && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: "var(--surface2)",
                            }}
                          >
                            {t.setupType}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(t.date + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="font-bebas"
                        style={{ fontSize: 22, color, lineHeight: 1 }}
                      >
                        {t.pnl !== null ? fmt(t.pnl) : "—"}
                      </div>
                      {t.rMultiple !== null && (
                        <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 700 }}>
                          {t.rMultiple > 0 ? "+" : ""}
                          {t.rMultiple}R
                        </div>
                      )}
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ color: "var(--text-muted)", flexShrink: 0 }}
                    >
                      <path
                        d="M6 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
