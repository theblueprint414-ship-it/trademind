"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import BottomNav from "@/components/BottomNav";

const TradeChart = dynamic(() => import("@/components/TradeChart"), { ssr: false });

type TradeEntry = {
  id: string;
  date: string;
  symbol: string | null;
  side: string | null;
  pnl: number | null;
  entryPrice: number | null;
  exitPrice: number | null;
  entryTime: string | null;
  exitTime: string | null;
  qty: number | null;
  setup: string | null;
  emotionBefore: number | null;
  emotionAfter: number | null;
  mistake: string | null;
  notes: string | null;
  tags: string | null;
  checkinScore: number | null;
  reflection: string | null;
};

type SessionData = {
  date: string;
  trades: TradeEntry[];
  checkin: { score: number; verdict: string; answers: string } | null;
  totalPnl: number;
  tradeCount: number;
  tradeLimit: number;
  winners: number;
  losers: number;
  winRate: number | null;
  plan: string;
};

type CoachInsight = { summary: string; strength: string; watchOut: string };

const VERDICT_COLOR: Record<string, string> = {
  GO: "var(--green)",
  CAUTION: "var(--amber)",
  "NO-TRADE": "var(--red)",
};

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: color ?? "var(--text)", lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function MentalBar({ score, verdict }: { score: number; verdict: string }) {
  const color = VERDICT_COLOR[verdict] ?? "var(--text-muted)";
  const pct = Math.round((score / 10) * 100);
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style={{ color: "#8B5CF6" }}>
            <path d="M16 6C11.6 6 8 9.6 8 14c0 2 .7 3.8 1.9 5.2C8.7 20.3 8 21.9 8 23.6V26h16v-2.4c0-1.7-.7-3.3-1.9-4.4C23.3 17.8 24 16 24 14c0-4.4-3.6-8-8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M12 18h8M13 21h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Mental State</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, background: `${color}18`, padding: "3px 10px", borderRadius: 20 }}>{verdict}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
        </div>
        <span style={{ fontSize: 22, fontWeight: 900, color, minWidth: 40, textAlign: "right" }}>{score}</span>
      </div>
    </div>
  );
}

function TradeCard({ trade, mentalScore }: { trade: TradeEntry; mentalScore: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const pnl = trade.pnl;
  const isProfit = pnl !== null && pnl >= 0;
  const tags = parseTags(trade.tags);
  const hasChart = !!(trade.entryPrice || trade.exitPrice);

  return (
    <div style={{ background: "var(--surface)", border: `1px solid ${pnl !== null ? (isProfit ? "rgba(0,208,132,0.2)" : "rgba(255,59,92,0.2)") : "var(--border)"}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "18px 20px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
      >
        {/* Side indicator */}
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: trade.side === "long" ? "var(--green)" : "var(--red)", flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{trade.symbol ?? "—"}</span>
            {trade.side && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: trade.side === "long" ? "rgba(0,208,132,0.12)" : "rgba(255,59,92,0.12)", color: trade.side === "long" ? "var(--green)" : "var(--red)" }}>
                {trade.side.toUpperCase()}
              </span>
            )}
            {tags.slice(0, 2).map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: "var(--surface2)", color: "var(--text-muted)" }}>{t}</span>
            ))}
          </div>
          {(trade.entryPrice || trade.exitPrice) && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
              {trade.entryPrice ? `Entry ${trade.entryPrice}` : ""}
              {trade.entryPrice && trade.exitPrice ? " → " : ""}
              {trade.exitPrice ? `Exit ${trade.exitPrice}` : ""}
              {trade.qty ? ` · ${trade.qty} units` : ""}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {pnl !== null ? (
            <div style={{ fontSize: 17, fontWeight: 900, color: isProfit ? "var(--green)" : "var(--red)" }}>
              {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>—</div>
          )}
          {trade.entryTime && (
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {new Date(trade.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "0 0 16px" }}>
          {/* Chart */}
          {hasChart && (
            <div style={{ padding: "16px 16px 0" }}>
              <TradeChart
                symbol={trade.symbol ?? ""}
                side={(trade.side as "long" | "short") ?? "long"}
                entryPrice={trade.entryPrice}
                exitPrice={trade.exitPrice}
                entryTime={trade.entryTime}
                exitTime={trade.exitTime}
                pnl={trade.pnl}
                mentalScore={mentalScore}
                height={220}
              />
            </div>
          )}

          {/* Mental analysis */}
          <div style={{ padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
            {mentalScore !== null && (
              <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", marginBottom: 4 }}>Mental State This Trade</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  {mentalScore >= 8
                    ? "Peak state — optimal execution window. Did you stick to the plan?"
                    : mentalScore >= 6
                    ? "Adequate state — disciplined execution needed. No improvising."
                    : mentalScore >= 4
                    ? "Below threshold — this trade was taken against your mental signal. Review why."
                    : "Critical state — this trade should not have been taken. High-risk of emotional decision."}
                </div>
              </div>
            )}

            {trade.setup && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Setup</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{trade.setup}</div>
              </div>
            )}

            {trade.mistake && (
              <div style={{ background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.15)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", marginBottom: 3 }}>Mistake</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{trade.mistake}</div>
              </div>
            )}

            {trade.notes && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{trade.notes}</div>
              </div>
            )}

            {trade.reflection && (
              <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", marginBottom: 3 }}>Reflection</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{trade.reflection}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [coachInsight, setCoachInsight] = useState<CoachInsight | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [hasBroker, setHasBroker] = useState(false);

  const load = useCallback(async () => {
    const [sessionRes, brokerRes] = await Promise.all([
      fetch(`/api/session?date=${date}`),
      fetch("/api/broker"),
    ]);
    if (sessionRes.ok) {
      const data = await sessionRes.json();
      setSession(data);
    }
    if (brokerRes.ok) {
      const b = await brokerRes.json();
      setHasBroker(!!(b.broker));
    }
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function syncNow() {
    setSyncing(true);
    await fetch("/api/broker/sync-journal?force=true", { method: "POST" });
    await load();
    setSyncing(false);
  }

  async function loadCoachInsight(session: SessionData) {
    if (coachInsight || coachLoading) return;
    setCoachLoading(true);
    try {
      const prompt = `Trader session summary:
- Date: ${session.date}
- Mental score: ${session.checkin?.score ?? "not logged"}/10, verdict: ${session.checkin?.verdict ?? "N/A"}
- Trades: ${session.tradeCount} of ${session.tradeLimit} limit
- P&L: $${session.totalPnl.toFixed(2)}
- Win rate: ${session.winRate ?? "N/A"}%
- Trade details: ${session.trades.map(t => `${t.symbol} ${t.side} P&L:${t.pnl ?? "N/A"} mistake:${t.mistake ?? "none"}`).join("; ")}

Provide a brief JSON response with:
- "summary": one sharp sentence about their session performance
- "strength": what they did well today (max 15 words)
- "watchOut": one behavioral pattern to watch tomorrow (max 15 words)`;

      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, mode: "session" }),
      });
      const data = await res.json();
      const text: string = data.reply ?? data.message ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { setCoachInsight(JSON.parse(match[0]) as CoachInsight); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    setCoachLoading(false);
  }

  useEffect(() => {
    if (session && session.tradeCount > 0) loadCoachInsight(session);
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: "#5e6ad2", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const totalPnl = session?.totalPnl ?? 0;
  const isProfitDay = totalPnl >= 0;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Session Review</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
        </div>
        {hasBroker && (
          <button
            onClick={syncNow}
            disabled={syncing}
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", cursor: syncing ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: syncing ? "spin 1s linear infinite" : "none" }}>
              <path d="M11.5 6.5A5 5 0 1 1 6.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M9 1.5h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {syncing ? "Syncing..." : "Sync"}
          </button>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          <StatCard
            label="P&L"
            value={`${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toFixed(0)}`}
            color={isProfitDay ? "var(--green)" : "var(--red)"}
          />
          <StatCard label="Trades" value={`${session?.tradeCount ?? 0}/${session?.tradeLimit ?? 5}`} />
          <StatCard label="Win Rate" value={session?.winRate !== null ? `${session!.winRate}%` : "—"} color={session?.winRate && session.winRate >= 50 ? "var(--green)" : "var(--red)"} />
          <StatCard label="Mental" value={session?.checkin ? `${session.checkin.score}/10` : "—"} color={session?.checkin ? (session.checkin.score >= 7 ? "var(--green)" : session.checkin.score >= 5 ? "var(--amber)" : "var(--red)") : undefined} />
        </div>

        {/* Mental bar */}
        {session?.checkin && (
          <div style={{ marginBottom: 20 }}>
            <MentalBar score={session.checkin.score} verdict={session.checkin.verdict} />
          </div>
        )}

        {/* AI Coach insight */}
        {(coachInsight || coachLoading) && (
          <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "#8B5CF6" }}>
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8B5CF6" }}>Coach Analysis</span>
            </div>
            {coachLoading ? (
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
              </div>
            ) : coachInsight ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{coachInsight.summary}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.15)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Strength</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{coachInsight.strength}</div>
                  </div>
                  <div style={{ background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.15)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--amber)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Watch Out</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{coachInsight.watchOut}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Trades */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Trades</h2>
            <Link href="/journal" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
              View full journal →
            </Link>
          </div>

          {session?.trades.length === 0 ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "32px 20px", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>No trades logged for this session</div>
              {hasBroker ? (
                <button onClick={syncNow} style={{ fontSize: 13, color: "#8B5CF6", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                  Sync broker →
                </button>
              ) : (
                <Link href="/settings" style={{ fontSize: 13, color: "#8B5CF6", fontWeight: 700, textDecoration: "none" }}>
                  Connect broker →
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {session!.trades.map(trade => (
                <TradeCard key={trade.id} trade={trade} mentalScore={session?.checkin?.score ?? null} />
              ))}
            </div>
          )}
        </div>

        {/* No checkin warning */}
        {!session?.checkin && (
          <div style={{ background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>No mental check-in logged for today.</div>
            <Link href="/checkin" style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", textDecoration: "none", whiteSpace: "nowrap" }}>Check in →</Link>
          </div>
        )}

        {/* CTA: Log notes */}
        <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
          <Link href={`/journal?date=${date}`} style={{ flex: 1, display: "block", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, color: "var(--text)", textDecoration: "none" }}>
            Add Trade Notes
          </Link>
          <Link href="/dashboard" style={{ flex: 1, display: "block", textAlign: "center", background: "linear-gradient(135deg,#5e6ad2,#8B5CF6)", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, color: "white", textDecoration: "none" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}