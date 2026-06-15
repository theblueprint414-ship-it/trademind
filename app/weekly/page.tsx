"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type WeekData = {
  ok: boolean;
  reason?: string;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number | null;
  goDays: number;
  cautionDays: number;
  noTradeDays: number;
  noTradeCompliance: number | null;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  avgMentalScore: number | null;
  checkinDays: number;
};

type DayPnl = { date: string; pnl: number; label: string };

function fmt(n: number, short = false) {
  const abs = Math.abs(n);
  const str = short && abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (n >= 0 ? "+" : "−") + str;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function scoreColor(s: number) {
  return s >= 70 ? "var(--green)" : s >= 45 ? "var(--amber)" : "var(--red)";
}

function DayBarChart({ days }: { days: DayPnl[] }) {
  if (!days.length) return null;
  const max = Math.max(...days.map((d) => Math.abs(d.pnl)), 1);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 72, padding: "0 4px" }}>
      {days.map((d) => {
        const pct = Math.abs(d.pnl) / max;
        const h = Math.max(pct * 60, 4);
        const color = d.pnl >= 0 ? "var(--green)" : "var(--red)";
        return (
          <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {d.pnl >= 0 ? (
              <>
                <div style={{ height: h, width: "100%", borderRadius: "3px 3px 0 0", background: color, opacity: 0.85 }} />
                <div style={{ height: 1, width: "100%", background: "var(--border)" }} />
              </>
            ) : (
              <>
                <div style={{ height: 1, width: "100%", background: "var(--border)" }} />
                <div style={{ height: h, width: "100%", borderRadius: "0 0 3px 3px", background: color, opacity: 0.85 }} />
              </>
            )}
            <div style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.04em" }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 12, background: "var(--surface2)", border: "1px solid var(--border)", flex: 1 }}>
      <div className="font-bebas" style={{ fontSize: 22, lineHeight: 1, color: color ?? "var(--text)", marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

export default function WeeklyPage() {
  const [offset, setOffset] = useState(1);
  const [data, setData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayPnls, setDayPnls] = useState<DayPnl[]>([]);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [reviewSlide, setReviewSlide] = useState(0);

  async function generateReview() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "weekly" }),
      });
      const d = await res.json();
      if (!res.ok) {
        setAiError(d.error ?? "Failed to generate review");
      } else {
        setAiReview(d.message ?? null);
        setReviewSlide(0);
      }
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  const load = useCallback(async (off: number) => {
    setLoading(true);
    try {
      const [weekRes, journalRes] = await Promise.all([
        fetch(`/api/weekly-review?offset=${off}`).then((r) => r.json()),
        fetch(`/api/journal?date=all&limit=200`).then((r) => r.json()),
      ]);
      setData(weekRes);

      if (weekRes.ok && Array.isArray(journalRes.entries)) {
        const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const byDay: Record<string, number> = {};
        for (const e of journalRes.entries as { date: string; pnl: number | null }[]) {
          if (e.date >= weekRes.weekStart && e.date <= weekRes.weekEnd && e.pnl !== null) {
            byDay[e.date] = (byDay[e.date] ?? 0) + (e.pnl ?? 0);
          }
        }
        const sorted = Object.entries(byDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, pnl]) => ({
            date,
            pnl: Math.round(pnl * 100) / 100,
            label: DOW[new Date(date + "T12:00:00").getDay()],
          }));
        setDayPnls(sorted);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(offset); }, [offset, load]);

  const canGoBack = offset < 8;
  const canGoForward = offset > 1;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <span className="font-bebas" style={{ fontSize: 18, color: "var(--text)", letterSpacing: "0.05em" }}>WEEKLY REVIEW</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* Week Navigator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button
            onClick={() => canGoBack && setOffset(offset + 1)}
            disabled={!canGoBack}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", background: canGoBack ? "var(--surface2)" : "transparent", color: canGoBack ? "var(--text)" : "var(--text-muted)", cursor: canGoBack ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div style={{ textAlign: "center" }}>
            {loading ? (
              <div style={{ width: 160, height: 16, borderRadius: 4, background: "var(--surface2)" }} />
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{data?.weekLabel ?? "—"}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  {offset === 1 ? "Last week" : `${offset} weeks ago`}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => canGoForward && setOffset(offset - 1)}
            disabled={!canGoForward}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", background: canGoForward ? "var(--surface2)" : "transparent", color: canGoForward ? "var(--text)" : "var(--text-muted)", cursor: canGoForward ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[120, 80, 100, 80].map((h, i) => (
              <div key={i} style={{ height: h, borderRadius: 14, background: "var(--surface2)" }} />
            ))}
          </div>
        ) : !data?.ok ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No data for this week</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {offset === 1 ? "No trades or check-ins recorded last week." : "No data found for this period."}
            </p>
            <Link href="/journal">
              <button className="btn-primary" style={{ marginTop: 24, padding: "12px 28px" }}>Log a trade →</button>
            </Link>
          </div>
        ) : (
          <>
            {/* Hero P&L */}
            <div className="card" style={{ padding: "24px 24px 20px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 8 }}>WEEKLY P&L</div>
              <div className="font-bebas" style={{ fontSize: 56, lineHeight: 1, color: data.totalPnl >= 0 ? "var(--green)" : "var(--red)", marginBottom: 4 }}>
                {fmt(data.totalPnl)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {data.tradeCount} trade{data.tradeCount !== 1 ? "s" : ""} · {data.checkinDays} check-in{data.checkinDays !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {data.winRate !== null && (
                <StatPill label="WIN RATE" value={`${data.winRate}%`} color={data.winRate >= 50 ? "var(--green)" : "var(--red)"} />
              )}
              {data.avgMentalScore !== null && (
                <StatPill label="AVG SCORE" value={data.avgMentalScore} color={scoreColor(data.avgMentalScore)} />
              )}
              <StatPill label="TRADES" value={data.tradeCount} />
            </div>

            {/* Day chart */}
            {dayPnls.length >= 2 && (
              <div className="card" style={{ padding: "20px 20px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 16 }}>DAY-BY-DAY P&L</div>
                <DayBarChart days={dayPnls} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  {dayPnls.map((d) => (
                    <div key={d.date} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: d.pnl >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700, fontFamily: "var(--font-geist-mono)" }}>
                        {fmt(d.pnl, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verdict breakdown */}
            <div className="card" style={{ padding: "20px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 14 }}>MENTAL STATE BREAKDOWN</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {data.goDays > 0 && (
                  <div style={{ flex: 1, minWidth: 80, padding: "12px", borderRadius: 10, background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", textAlign: "center" }}>
                    <div className="font-bebas" style={{ fontSize: 26, color: "var(--green)", lineHeight: 1 }}>{data.goDays}</div>
                    <div style={{ fontSize: 9, color: "var(--green)", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.8 }}>GO DAYS</div>
                  </div>
                )}
                {data.cautionDays > 0 && (
                  <div style={{ flex: 1, minWidth: 80, padding: "12px", borderRadius: 10, background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.2)", textAlign: "center" }}>
                    <div className="font-bebas" style={{ fontSize: 26, color: "var(--amber)", lineHeight: 1 }}>{data.cautionDays}</div>
                    <div style={{ fontSize: 9, color: "var(--amber)", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.8 }}>CAUTION</div>
                  </div>
                )}
                {data.noTradeDays > 0 && (
                  <div style={{ flex: 1, minWidth: 80, padding: "12px", borderRadius: 10, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", textAlign: "center" }}>
                    <div className="font-bebas" style={{ fontSize: 26, color: "var(--red)", lineHeight: 1 }}>{data.noTradeDays}</div>
                    <div style={{ fontSize: 9, color: "var(--red)", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.8 }}>NO-TRADE</div>
                  </div>
                )}
              </div>
              {/* NO-TRADE compliance */}
              {data.noTradeCompliance !== null && data.noTradeDays > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>NO-TRADE compliance</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: data.noTradeCompliance >= 80 ? "var(--green)" : data.noTradeCompliance >= 50 ? "var(--amber)" : "var(--red)" }}>
                      {data.noTradeCompliance}%
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${data.noTradeCompliance}%`, borderRadius: 3, background: data.noTradeCompliance >= 80 ? "var(--green)" : data.noTradeCompliance >= 50 ? "var(--amber)" : "var(--red)", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
                    {data.noTradeCompliance === 100 ? "Perfect — you sat out every flagged day." : data.noTradeCompliance >= 80 ? "Strong discipline." : data.noTradeCompliance >= 50 ? "Room to improve on NO-TRADE days." : "Traded on most NO-TRADE days — high risk pattern."}
                  </div>
                </div>
              )}
            </div>

            {/* Best / Worst day */}
            {(data.bestDay || data.worstDay) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {data.bestDay && (
                  <div style={{ padding: "16px", borderRadius: 12, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--green)", marginBottom: 6 }}>BEST DAY</div>
                    <div className="font-bebas" style={{ fontSize: 22, color: "var(--green)", lineHeight: 1, marginBottom: 3 }}>{fmt(data.bestDay.pnl, true)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{fmtDate(data.bestDay.date)}</div>
                  </div>
                )}
                {data.worstDay && (
                  <div style={{ padding: "16px", borderRadius: 12, background: "rgba(255,59,92,0.05)", border: "1px solid rgba(255,59,92,0.2)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--red)", marginBottom: 6 }}>WORST DAY</div>
                    <div className="font-bebas" style={{ fontSize: 22, color: "var(--red)", lineHeight: 1, marginBottom: 3 }}>{fmt(data.worstDay.pnl, true)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{fmtDate(data.worstDay.date)}</div>
                  </div>
                )}
              </div>
            )}

            {/* AI Weekly Review */}
            <div className="card" style={{ padding: 24, marginBottom: 16, border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.3 3.9H13l-3.1 2.2 1.2 3.7L8 9.6l-3.1 2.2 1.2-3.7L3 5.9h3.7L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)" }}>AI WEEKLY REVIEW</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Powered by Alex, your trading coach</div>
                </div>
                {!aiReview && !aiLoading && (
                  <button
                    onClick={generateReview}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#8B5CF6", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Generate
                  </button>
                )}
              </div>

              {aiLoading && (
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#8B5CF6", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>Alex is reviewing your week...</div>
                </div>
              )}

              {aiError && (
                <div style={{ fontSize: 12, color: "var(--red)", padding: "10px 12px", borderRadius: 8, background: "rgba(255,59,92,0.08)" }}>
                  {aiError}
                </div>
              )}

              {aiReview && !aiLoading && (() => {
                // Split review into slide-able sentences (2-3 per slide)
                const sentences = aiReview.split(/(?<=[.!?])\s+/).filter(Boolean);
                const slides: string[][] = [];
                for (let i = 0; i < sentences.length; i += 2) {
                  slides.push(sentences.slice(i, i + 2));
                }
                const slide = slides[reviewSlide] ?? slides[0];
                return (
                  <div>
                    <div style={{ minHeight: 80, padding: "16px 0", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, fontStyle: "italic" }}>
                      &ldquo;{slide.join(" ")}&rdquo;
                    </div>
                    {slides.length > 1 && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                        <button
                          onClick={() => setReviewSlide((s) => Math.max(0, s - 1))}
                          disabled={reviewSlide === 0}
                          style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: reviewSlide === 0 ? "var(--text-muted)" : "var(--text)", cursor: reviewSlide === 0 ? "default" : "pointer", fontSize: 12 }}
                        >
                          ← Prev
                        </button>
                        <div style={{ display: "flex", gap: 5 }}>
                          {slides.map((_, i) => (
                            <div key={i} onClick={() => setReviewSlide(i)} style={{ width: 6, height: 6, borderRadius: "50%", background: i === reviewSlide ? "#8B5CF6" : "var(--surface3)", cursor: "pointer", transition: "background 0.2s" }} />
                          ))}
                        </div>
                        <button
                          onClick={() => setReviewSlide((s) => Math.min(slides.length - 1, s + 1))}
                          disabled={reviewSlide === slides.length - 1}
                          style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: reviewSlide === slides.length - 1 ? "var(--text-muted)" : "var(--text)", cursor: reviewSlide === slides.length - 1 ? "default" : "pointer", fontSize: 12 }}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => { setAiReview(null); setReviewSlide(0); }}
                      style={{ marginTop: 12, padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 11 }}
                    >
                      Regenerate
                    </button>
                  </div>
                );
              })()}

              {!aiReview && !aiLoading && !aiError && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Get a personalized AI analysis of this week — patterns, behavioral insights, and one clear focus for next week. Pro feature.
                </p>
              )}
            </div>

            {/* Ask Alex CTA */}
            <Link href="/coach" style={{ textDecoration: "none" }}>
              <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13 5l1.5-1.5M14.5 8h1.5M13 11l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>Ask Alex about this week</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Your AI coach has your full week data →</div>
                </div>
              </div>
            </Link>

          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}