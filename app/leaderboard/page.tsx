"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  streak: number;
  checkins30: number;
  avgScore: number;
  checkedInToday: boolean;
  goDays: number;
  noTradeDays: number;
  isCurrentUser: boolean;
  isPrivate?: boolean;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserEntry: (LeaderboardEntry & { isPrivate?: boolean }) | null;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 400 ? "var(--green)" : score >= 250 ? "var(--amber)" : "var(--blue)";
  return (
    <div style={{ fontSize: 20, fontWeight: 800, color, minWidth: 52, textAlign: "right" }}>
      {score}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors = ["#FFB020", "#A0AEC0", "#CD7C3B"];
  if (rank <= 3) return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${colors[rank - 1]}20`, border: `1.5px solid ${colors[rank - 1]}60`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: colors[rank - 1] }}>{rank}</span>
    </div>
  );
  return <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", minWidth: 28, textAlign: "center", display: "inline-block" }}>#{rank}</span>;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [publicProfile, setPublicProfile] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.currentUserEntry) {
          setPublicProfile(false);
        } else if (d.entries?.some((e: LeaderboardEntry) => e.isCurrentUser)) {
          setPublicProfile(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function togglePublic() {
    setToggling(true);
    try {
      const res = await fetch("/api/leaderboard", { method: "PATCH" });
      const d = await res.json();
      setPublicProfile(d.publicProfile);
      // Re-fetch leaderboard
      const updated = await fetch("/api/leaderboard").then((r) => r.json());
      setData(updated);
    } finally {
      setToggling(false);
    }
  }

  const allEntries = data?.entries ?? [];
  const currentUserEntry = data?.currentUserEntry;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <div style={{ textAlign: "center" }}>
          <span className="font-bebas" style={{ fontSize: 20, letterSpacing: "0.05em", display: "block", lineHeight: 1.1 }}>LEADERBOARD</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>DISCIPLINE RANKINGS</span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 0" }}>

        <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Ranked by consistency — not P&L. Streaks, mental score quality, and discipline under pressure.
        </p>

        {/* Score explanation */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { label: "Streak", desc: "up to 450 pts", color: "var(--amber)" },
            { label: "Consistency", desc: "up to 240 pts", color: "var(--blue)" },
            { label: "Mental quality", desc: "up to 150 pts", color: "var(--green)" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 140 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy toggle */}
        {publicProfile !== null && (
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                {publicProfile ? "You're on the leaderboard" : "Your profile is private"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {publicProfile ? "Others can see your discipline score" : "Join to show your streak publicly"}
              </div>
            </div>
            <button
              onClick={togglePublic}
              disabled={toggling}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: toggling ? "not-allowed" : "pointer",
                background: publicProfile ? "var(--surface)" : "var(--blue)",
                color: publicProfile ? "var(--text-dim)" : "white",
                flexShrink: 0,
              }}
            >
              {toggling ? "..." : publicProfile ? "Go Private" : "Join Leaderboard"}
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : allEntries.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: 14, padding: "44px 28px", textAlign: "center", background: "linear-gradient(135deg, rgba(255,176,32,0.04), var(--surface))" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <rect x="5" y="14" width="6" height="11" rx="1.5" stroke="var(--amber)" strokeWidth="1.6"/>
                  <rect x="12" y="10" width="6" height="15" rx="1.5" stroke="var(--amber)" strokeWidth="1.6"/>
                  <rect x="19" y="16" width="6" height="9" rx="1.5" stroke="var(--amber)" strokeWidth="1.6"/>
                  <path d="M15 6l1.2 2.4 2.6.4-1.9 1.8.5 2.6L15 12l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z" stroke="var(--amber)" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 10 }}>Be the first on the board</div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 24, maxWidth: 340, margin: "0 auto 24px" }}>
              The leaderboard ranks traders by mental discipline — streaks, check-in rate, and consistency score. Not P&L. The traders who actually do the work.
            </p>
            {publicProfile === false && (
              <button
                onClick={togglePublic}
                disabled={toggling}
                style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, var(--amber), #e8960a)", color: "#0a0800", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.3 3 3.2.5-2.3 2.2.5 3.1L7 8.4 4.3 9.8l.5-3.1L2.5 4.5l3.2-.5L7 1z" fill="currentColor"/></svg>
                Join the Leaderboard
              </button>
            )}
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            {allEntries.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderBottom: i < allEntries.length - 1 ? "1px solid var(--border)" : "none",
                  background: entry.isCurrentUser ? "rgba(94,106,210,0.06)" : "transparent",
                }}
              >
                <div style={{ minWidth: 32, display: "flex", justifyContent: "center" }}>
                  <RankBadge rank={i + 1} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.name}
                    </span>
                    {entry.isCurrentUser && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--blue)", background: "rgba(94,106,210,0.15)", borderRadius: 4, padding: "2px 6px" }}>YOU</span>
                    )}
                    {entry.checkedInToday && (
                      <span style={{ fontSize: 10, color: "var(--green)" }}>✓ today</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--amber)", display: "inline-flex", alignItems: "center", gap: 3 }}><svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor"><path d="M4.5 0.5C4.5 0.5 7 2.5 7 5c0 .65-.3 1.3-.9 1.75C5.7 7.2 5.2 7.5 4.5 7.5c-.7 0-1.2-.3-1.6-.75C2.3 6.3 2 5.65 2 5 2 2.5 4.5.5 4.5.5z"/></svg>{entry.streak}d</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{entry.checkins30}/30 check-ins</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>avg {entry.avgScore}</span>
                  </div>
                </div>
                <ScoreBadge score={entry.score} />
              </div>
            ))}

            {/* Current user if private (shown below the public list) */}
            {currentUserEntry && (
              <>
                <div style={{ padding: "8px 16px", background: "var(--surface2)", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>— YOUR PRIVATE SCORE —</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(94,106,210,0.06)" }}>
                  <div style={{ minWidth: 32, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>—</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{currentUserEntry.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--amber)", display: "inline-flex", alignItems: "center", gap: 3 }}><svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor"><path d="M4.5 0.5C4.5 0.5 7 2.5 7 5c0 .65-.3 1.3-.9 1.75C5.7 7.2 5.2 7.5 4.5 7.5c-.7 0-1.2-.3-1.6-.75C2.3 6.3 2 5.65 2 5 2 2.5 4.5.5 4.5.5z"/></svg>{currentUserEntry.streak}d</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{currentUserEntry.checkins30}/30 check-ins</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>avg {currentUserEntry.avgScore}</span>
                    </div>
                  </div>
                  <ScoreBadge score={currentUserEntry.score} />
                </div>
              </>
            )}
          </div>
        )}

        {/* CTA to join */}
        {!loading && allEntries.length > 0 && publicProfile === false && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={togglePublic}
              disabled={toggling}
              style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "var(--blue)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              {toggling ? "..." : "Join the Leaderboard →"}
            </button>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Only your streak and consistency score are shown — no P&L data.</div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}