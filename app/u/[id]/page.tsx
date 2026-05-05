import type { Metadata } from "next";
import Link from "next/link";

type ProfileData = {
  id: string;
  name: string | null;
  memberSince: string;
  streak: number;
  longestStreak: number;
  totalCheckins: number;
  avgScore: number | null;
  goRate: number;
  today: { score: number; verdict: string } | null;
  recentCheckins: { date: string; score: number; verdict: string }[];
  badgeEarned: boolean;
  badgeTier: "consistent" | "elite" | null;
};

async function getProfile(id: string): Promise<ProfileData | null> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://trademindedge.com";
    const res = await fetch(`${base}/api/profile/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);
  const name = profile?.name?.split(" ")[0] ?? "A trader";
  const streak = profile?.streak ?? 0;
  const score = profile?.avgScore ?? null;

  return {
    title: `${name}'s TradeMind Profile — ${streak}-day streak`,
    description: `${name} has checked in ${profile?.totalCheckins ?? 0} times on TradeMind${score ? ` with an avg mental score of ${score}/100` : ""}. Know your mental edge before you trade.`,
    openGraph: {
      title: `${name}'s Mental Edge — ${streak}-day streak`,
      description: "Daily mental check-ins. GO / CAUTION / NO-TRADE. Know your state before you trade.",
      images: [{ url: `https://trademindedge.com/api/og?score=${score ?? ""}&streak=${streak}&name=${encodeURIComponent(profile?.name ?? "")}`, width: 1200, height: 630 }],
    },
  };
}

function verdictColor(verdict: string) {
  if (verdict === "GO") return "#00E87A";
  if (verdict === "CAUTION") return "#FFB020";
  return "#FF3B5C";
}

function scoreColor(score: number) {
  if (score >= 70) return "#00E87A";
  if (score >= 45) return "#FFB020";
  return "#FF3B5C";
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);

  if (!profile) {
    return (
      <div style={{ background: "#070B14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8F0FF", fontFamily: "-apple-system,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: "#FF3B5C", marginBottom: 16 }}>404</div>
          <p style={{ color: "#7A8BA8", marginBottom: 24 }}>This profile doesn&apos;t exist or is private.</p>
          <Link href="/" style={{ color: "#5e6ad2", textDecoration: "none" }}>← TradeMind</Link>
        </div>
      </div>
    );
  }

  const firstName = profile.name?.split(" ")[0] ?? "Trader";
  const streakColor = profile.streak >= 30 ? "#8B5CF6" : profile.streak >= 14 ? "#5e6ad2" : "#FFB020";
  const streakIcon = profile.streak >= 60
    ? <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3l2.5 5.5 6 .9-4.3 4.2 1 6-5.2-2.7-5.2 2.7 1-6L5.5 9.4l6-.9z" stroke={streakColor} strokeWidth="1.6" strokeLinejoin="round"/></svg>
    : profile.streak >= 30
    ? <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3l2.5 5.5 6 .9-4.3 4.2 1 6-5.2-2.7-5.2 2.7 1-6L5.5 9.4l6-.9z" stroke={streakColor} fill={`${streakColor}30`} strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 22h8M14 19v3" stroke={streakColor} strokeWidth="1.6" strokeLinecap="round"/></svg>
    : profile.streak >= 14
    ? <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3v10M10 7l4-4 4 4M4 14h20M10 19l4 5 4-5" stroke={streakColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    : <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3C14 3 20 8 20 14c0 2-1 4-2.5 5.5C16 21 15 22 14 22c-1 0-2-.5-3.5-2.5C9 18 8 16 8 14c0-6 6-11 6-11z" fill={`${streakColor}60`} stroke={streakColor} strokeWidth="1.6" strokeLinejoin="round"/></svg>;

  // Build 30-day calendar grid
  const today = new Date();
  const days: { date: string; score: number | null; verdict: string | null }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const checkin = profile.recentCheckins.find((c) => c.date === dateStr);
    days.push({ date: dateStr, score: checkin?.score ?? null, verdict: checkin?.verdict ?? null });
  }

  return (
    <div style={{ background: "#070B14", minHeight: "100vh", color: "#E8F0FF", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1E2D45", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,11,20,0.92)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#5e6ad2" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#E8F0FF" }}>TradeMind</span>
        </Link>
        <Link href="/dashboard" style={{ background: "#5e6ad2", color: "white", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          Track Your Edge →
        </Link>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${streakColor}30, ${streakColor}10)`, border: `2px solid ${streakColor}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {streakIcon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 4 }}>{firstName}</div>
            <div style={{ fontSize: 13, color: "#7A8BA8" }}>
              Member since {new Date(profile.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              {profile.badgeEarned && (
                <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: profile.badgeTier === "elite" ? "#8B5CF6" : "#FFB020", background: profile.badgeTier === "elite" ? "rgba(139,92,246,0.12)" : "rgba(255,176,32,0.1)", border: `1px solid ${profile.badgeTier === "elite" ? "rgba(139,92,246,0.3)" : "rgba(255,176,32,0.25)"}`, borderRadius: 6, padding: "2px 8px" }}>
                  {profile.badgeTier === "elite" ? "ELITE EDGE" : "✓ VERIFIED MENTAL EDGE"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Today's verdict */}
        {profile.today && (
          <div style={{ marginBottom: 24, padding: "20px 24px", borderRadius: 14, background: `${verdictColor(profile.today.verdict)}08`, border: `1px solid ${verdictColor(profile.today.verdict)}30`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: verdictColor(profile.today.verdict), lineHeight: 1 }}>{profile.today.score}</div>
              <div style={{ fontSize: 10, color: "#3D4F6A", letterSpacing: "0.08em" }}>/100</div>
            </div>
            <div style={{ width: 1, height: 40, background: "#1E2D45" }} />
            <div>
              <div style={{ fontSize: 11, color: "#3D4F6A", letterSpacing: "0.1em", marginBottom: 2 }}>TODAY&apos;S VERDICT</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: verdictColor(profile.today.verdict), letterSpacing: "0.04em" }}>{profile.today.verdict}</div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "STREAK", value: `${profile.streak}d`, color: streakColor },
            { label: "BEST STREAK", value: `${profile.longestStreak}d`, color: "#5e6ad2" },
            { label: "AVG SCORE", value: profile.avgScore ? `${profile.avgScore}` : "—", color: profile.avgScore ? scoreColor(profile.avgScore) : "#3D4F6A" },
            { label: "GO RATE", value: `${profile.goRate}%`, color: profile.goRate >= 60 ? "#00E87A" : profile.goRate >= 40 ? "#FFB020" : "#FF3B5C" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0D1420", border: "1px solid #1E2D45", borderRadius: 12, padding: "16px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#3D4F6A", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 30-day calendar */}
        <div style={{ background: "#0D1420", border: "1px solid #1E2D45", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#3D4F6A", marginBottom: 16 }}>LAST 30 DAYS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 4 }}>
            {days.map((day) => (
              <div
                key={day.date}
                title={day.score !== null ? `${day.date}: ${day.score}/100 · ${day.verdict}` : day.date}
                style={{
                  aspectRatio: "1",
                  borderRadius: 4,
                  background: day.verdict ? verdictColor(day.verdict) : "#1E2D45",
                  opacity: day.verdict ? 0.85 : 0.3,
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 10, color: "#3D4F6A" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#00E87A", display: "inline-block" }} /> GO</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#FFB020", display: "inline-block" }} /> CAUTION</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#FF3B5C", display: "inline-block" }} /> NO-TRADE</span>
          </div>
        </div>

        {/* Badge section */}
        {profile.badgeEarned && (
          <div style={{ background: profile.badgeTier === "elite" ? "rgba(139,92,246,0.06)" : "rgba(255,176,32,0.05)", border: `1px solid ${profile.badgeTier === "elite" ? "rgba(139,92,246,0.25)" : "rgba(255,176,32,0.2)"}`, borderRadius: 14, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ color: profile.badgeTier === "elite" ? "#8B5CF6" : "#FFB020", flexShrink: 0 }}>
              {profile.badgeTier === "elite"
                ? <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 4l3 6.5 7 1-5 4.9 1.2 7L20 20l-6.2 3.4 1.2-7-5-4.9 7-1z" fill="currentColor" opacity="0.7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                : <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 5l3 6.5 7 1-5 4.9 1.2 7L20 21l-6.2 3.4 1.2-7-5-4.9 7-1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M14 32h12M20 27v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              }
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E8F0FF", marginBottom: 2 }}>
                {profile.badgeTier === "elite" ? "Elite Mental Edge" : "Verified Mental Edge"}
              </div>
              <div style={{ fontSize: 12, color: "#7A8BA8", lineHeight: 1.5 }}>
                {profile.badgeTier === "elite"
                  ? `${firstName} has maintained 60+ days of consistent mental discipline — top 1% of traders.`
                  : `${firstName} has completed 30+ consecutive check-ins — a habit most traders never build.`}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg,rgba(94,106,210,0.08),rgba(94,106,210,0.02))", border: "1px solid rgba(94,106,210,0.2)", borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.01em" }}>
            Know your mental edge before you trade
          </div>
          <p style={{ fontSize: 14, color: "#7A8BA8", lineHeight: 1.6, marginBottom: 24 }}>
            60-second daily check-in. GO / CAUTION / NO-TRADE. Free forever.
          </p>
          <Link href="/dashboard" style={{ display: "inline-block", background: "#5e6ad2", color: "white", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontSize: 15, fontWeight: 700 }}>
            Start Your First Check-in →
          </Link>
        </div>

      </div>
    </div>
  );
}