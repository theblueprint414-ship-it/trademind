"use client";

import React, { useEffect, useState } from "react";
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
  if (rank === 1) return <span style={{ fontSize: 20 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 20 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 20 }}>🥉</span>;
  return <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", minWidth: 28, textAlign: "center", display: "inline-block" }}>#{rank}</span>;
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
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
          </div>
          <h1 className="font-bebas" style={{ fontSize: 36, margin: 0 }}>Discipline Leaderboard</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.6 }}>
            Ranked by consistency — not P&L. Check-in streaks, mental score quality, and discipline under pressure.
          </p>
        </div>

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
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>No public traders yet</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Be the first to join the leaderboard and show your discipline.</div>
            {publicProfile === false && (
              <button
                onClick={togglePublic}
                disabled={toggling}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "var(--blue)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Join Leaderboard
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
                  background: entry.isCurrentUser ? "rgba(79,142,247,0.06)" : "transparent",
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
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--blue)", background: "rgba(79,142,247,0.15)", borderRadius: 4, padding: "2px 6px" }}>YOU</span>
                    )}
                    {entry.checkedInToday && (
                      <span style={{ fontSize: 10, color: "var(--green)" }}>✓ today</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--amber)" }}>🔥 {entry.streak}d</span>
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
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(79,142,247,0.06)" }}>
                  <div style={{ minWidth: 32, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>—</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{currentUserEntry.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--amber)" }}>🔥 {currentUserEntry.streak}d</span>
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