"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import PartnerCard from "@/components/PartnerCard";
import TradeLimit from "@/components/TradeLimit";
import ChallengeTracker from "@/components/ChallengeTracker";
import PositionSizing from "@/components/PositionSizing";
import BottomNav from "@/components/BottomNav";
import { Skeleton, SkeletonCard, SkeletonStat } from "@/components/Skeleton";

type HistoryEntry = { date: string; score: number; verdict?: string };
type Partner = {
  id: string; name: string; avatar: string;
  score: number | null; verdict: "GO" | "CAUTION" | "NO-TRADE" | null;
  streak: number; lastCheckin: string;
};
type WeeklyStats = { pnl: number; trades: number; winRate: number | null };

function getVerdict(score: number) {
  if (score >= 70) return { label: "GO", color: "var(--green)", glow: "rgba(0,232,122,0.18)", cardClass: "card-glow-green" };
  if (score >= 45) return { label: "CAUTION", color: "var(--amber)", glow: "rgba(255,176,32,0.18)", cardClass: "card-glow-amber" };
  return { label: "NO-TRADE", color: "var(--red)", glow: "rgba(255,59,92,0.18)", cardClass: "card-glow-red" };
}

function getMotivationalLine(score: number): string {
  if (score >= 85) return "Peak mental state. Execute with full conviction.";
  if (score >= 70) return "Your mind is sharp. Stick to your plan.";
  if (score >= 55) return "Trade smaller, stay patient. A+ setups only.";
  if (score >= 45) return "High caution. One quality trade max.";
  if (score >= 30) return "Risk is elevated. Consider sitting out.";
  return "Protect your capital. No trades today.";
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (Math.abs(diff) < 2) return <span style={{ fontSize: 10, color: "var(--text-muted)" }}>—</span>;
  return (
    <span style={{ fontSize: 11, color: diff > 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
      {diff > 0 ? "↑" : "↓"}{Math.abs(diff)}
    </span>
  );
}

export default function DashboardPage() {
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [goCount, setGoCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [savedLosses, setSavedLosses] = useState<number | null>(null);
  const [broker, setBroker] = useState<{ broker: string; status: string } | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [weeklyInsight, setWeeklyInsight] = useState<{ text: string; positive: boolean } | null>(null);
  const [weeklyCoach, setWeeklyCoach] = useState<string | null>(null);
  const [weeklyGoal] = useState(5);
  const [weeklyGoalCount, setWeeklyGoalCount] = useState(0);
  const [lifestyleInsight, setLifestyleInsight] = useState<{ exerciseLift: number | null; exerciseCount: number; avgScoreWithExercise: number | null; avgScoreWithoutExercise: number | null } | null>(null);

  const [showGate, setShowGate] = useState(false);
  const [gateChecked, setGateChecked] = useState(false);
  const [showUpgradeWelcome, setShowUpgradeWelcome] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dashLoading, setDashLoading] = useState(true);
  const [showQuickTrade, setShowQuickTrade] = useState(false);
  const [showUpgradeNudge, setShowUpgradeNudge] = useState(false);
  const [userId, setUserId] = useState("");
  const [publicProfile, setPublicProfile] = useState(false);
  const [profileLinkCopied, setProfileLinkCopied] = useState(false);
  const [challengeConfig, setChallengeConfig] = useState<{ firm: string | null; accountSize: number; dailyLimit: number; maxDrawdown: number; profitTarget: number | null; tradingDaysTarget: number | null; startDate: string | null; endDate: string | null } | null>(null);
  const [qtSymbol, setQtSymbol] = useState("");
  const [qtSide, setQtSide] = useState<"long" | "short">("long");
  const [qtPnl, setQtPnl] = useState("");
  const [qtSetup, setQtSetup] = useState("");
  const [qtSaving, setQtSaving] = useState(false);
  const [qtSaved, setQtSaved] = useState(false);
  const [qtError, setQtError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setShowUpgradeWelcome(true);
      window.history.replaceState({}, "", "/dashboard");
      // Poll /api/me until plan=premium (webhook may arrive a few seconds after redirect)
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const d = await fetch("/api/me").then((r) => r.json());
          if (d.plan === "premium" || d.plan === "pro") {
            setIsPro(true);
            clearInterval(poll);
          }
        } catch { /* ignore */ }
        if (attempts >= 10) clearInterval(poll);
      }, 1500);
      return () => clearInterval(poll);
    }
  }, [searchParams]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 60);

    async function loadData() {
      const todayStr = new Date().toISOString().split("T")[0];

      fetch("/api/me")
        .then((r) => r.json())
        .then((d) => {
          const pro = d.plan === "pro" || d.plan === "premium";
          setIsPro(pro);
          if (!pro && localStorage.getItem("trademind_nudge_eligible") === "1") {
            setShowUpgradeNudge(true);
            localStorage.removeItem("trademind_nudge_eligible");
          }
          if (d.id) setUserId(d.id);
          if (typeof d.publicProfile === "boolean") setPublicProfile(d.publicProfile);
          if (d.tradeLimit) localStorage.setItem("trademind_trade_limit", String(d.tradeLimit));
          if (d.challenge?.enabled) setChallengeConfig({ firm: d.challenge.firm ?? null, accountSize: d.challenge.accountSize ?? 0, dailyLimit: d.challenge.dailyLimit ?? 5, maxDrawdown: d.challenge.maxDrawdown ?? 10, profitTarget: d.challenge.profitTarget ?? null, tradingDaysTarget: d.challenge.tradingDaysTarget ?? null, startDate: d.challenge.startDate ?? null, endDate: d.challenge.endDate ?? null });
          if (pro) {
            setPartnersLoading(true);
            fetch("/api/partners")
              .then((r) => r.json())
              .then((pd) => { if (Array.isArray(pd.partners)) setPartners(pd.partners); })
              .catch(() => {})
              .finally(() => setPartnersLoading(false));
          }
          if (pro) {
            fetch("/api/analytics")
              .then((r) => r.json())
              .then((ad) => { if (ad.estimatedSaved > 0) setSavedLosses(ad.estimatedSaved); })
              .catch(() => {});

            fetch("/api/lifestyle?days=30")
              .then((r) => r.json())
              .then((ld) => { if (ld.insights) setLifestyleInsight({ exerciseLift: ld.insights.exerciseLift, exerciseCount: ld.insights.exerciseCount ?? 0, avgScoreWithExercise: ld.insights.avgScoreWithExercise, avgScoreWithoutExercise: ld.insights.avgScoreWithoutExercise }); })
              .catch(() => {});

            const weekKey = (() => {
              const d = new Date();
              const jan1 = new Date(d.getFullYear(), 0, 1);
              return `trademind_coach_week_${d.getFullYear()}_${Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)}`;
            })();
            const cachedCoach = localStorage.getItem(weekKey);
            if (cachedCoach) { setWeeklyCoach(cachedCoach); }
            else {
              fetch("/api/ai-coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "weekly" }) })
                .then((r) => r.json())
                .then((d) => { if (d.message) { setWeeklyCoach(d.message); localStorage.setItem(weekKey, d.message); } })
                .catch(() => {});
            }
          }
        })
        .catch(() => {});

      try {
        const bRes = await fetch("/api/broker");
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.connected) {
            setBroker({ broker: bData.broker, status: bData.status });
            const sRes = await fetch("/api/broker/sync", { method: "POST" });
            if (sRes.ok) {
              const sData = await sRes.json();
              if (typeof sData.dailyPnl === "number") {
                const today2 = new Date().toISOString().split("T")[0];
                const stored = JSON.parse(localStorage.getItem("trademind_challenge_pnl") || "{}");
                stored[today2] = sData.dailyPnl;
                localStorage.setItem("trademind_challenge_pnl", JSON.stringify(stored));
              }
            }
          }
        }
      } catch {}

      let todayCheckinDone = false;
      try {
        const res = await fetch("/api/checkin?date=history&limit=30");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.history) && data.history.length > 0) {
            const all: HistoryEntry[] = data.history;
            setHistory(all.slice(0, 7));
            setMonthlyCount(all.length);
            setGoCount(all.filter((h) => (h.score ?? 0) >= 70).length);
            const todayEntry = all.find((h) => h.date === todayStr);
            if (todayEntry) { setTodayScore(todayEntry.score); todayCheckinDone = true; }
            computeStreak(all);
            // Show upgrade nudge for free users after 7 check-ins (dismissed max once per week)
            if (all.length >= 7) {
              const nudgeKey = "trademind_upgrade_nudge_dismissed";
              const dismissed = localStorage.getItem(nudgeKey);
              const weekAgo = Date.now() - 7 * 86400000;
              if (!dismissed || Number(dismissed) < weekAgo) {
                // Will set after plan loads — defer via flag in localStorage
                localStorage.setItem("trademind_nudge_eligible", "1");
              }
            }
          }
        }
      } catch {} finally {
        setDashLoading(false);
      }

      if (!todayCheckinDone) {
        try {
          const todayData = JSON.parse(localStorage.getItem("trademind_today") || "null");
          if (todayData?.date === todayStr) { setTodayScore(todayData.score); todayCheckinDone = true; }
          const hist: HistoryEntry[] = JSON.parse(localStorage.getItem("trademind_history") || "[]");
          setHistory(hist.slice(0, 7));
          const thisMonth = new Date().getMonth();
          setMonthlyCount(hist.filter((h) => new Date(h.date).getMonth() === thisMonth).length);
          setGoCount(hist.filter((h) => (h.score ?? 0) >= 70).length);
          computeStreak(hist);
        } catch {}
      }

      const bRes2 = await fetch("/api/broker").then((r) => r.json()).catch(() => ({ connected: false }));
      if (bRes2.connected && !todayCheckinDone) setShowGate(true);
      setGateChecked(true);

      // Weekly goal count
      try {
        const monday = new Date();
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const mondayStr = monday.toISOString().split("T")[0];
        const wRes = await fetch("/api/checkin?date=history&limit=30");
        if (wRes.ok) {
          const wData = await wRes.json();
          if (Array.isArray(wData.history)) {
            setWeeklyGoalCount(wData.history.filter((h: { date: string }) => h.date >= mondayStr && h.date <= todayStr).length);
          }
        }
      } catch {}

      try {
        const jRes = await fetch("/api/journal?date=all&limit=100");
        if (jRes.ok) {
          const jData = await jRes.json();
          if (Array.isArray(jData.entries) && jData.entries.length > 0) {
            const now = new Date();
            const monday = new Date(now);
            monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
            monday.setHours(0, 0, 0, 0);
            const mondayStr = monday.toISOString().split("T")[0];
            type JEntry = { date: string; pnl: number | null; checkinScore: number | null };
            const weekEntries = jData.entries.filter((e: JEntry) => e.date >= mondayStr) as JEntry[];
            if (weekEntries.length > 0) {
              const wPnl = weekEntries.reduce((s, e) => s + (e.pnl ?? 0), 0);
              const withPnl = weekEntries.filter((e) => e.pnl !== null);
              const winners = withPnl.filter((e) => (e.pnl ?? 0) > 0).length;
              setWeeklyStats({ pnl: Math.round(wPnl * 100) / 100, trades: weekEntries.length, winRate: withPnl.length > 0 ? Math.round((winners / withPnl.length) * 100) : null });
              const goEntries = withPnl.filter((e) => (e.checkinScore ?? 0) >= 70);
              const ntEntries = withPnl.filter((e) => e.checkinScore !== null && (e.checkinScore) < 45);
              const fmt = (n: number) => (n >= 0 ? "+" : "−") + "$" + Math.abs(Math.round(n)).toLocaleString();
              if (goEntries.length > 0 && ntEntries.length > 0) {
                const goPnl = goEntries.reduce((s, e) => s + (e.pnl ?? 0), 0);
                const ntPnl = ntEntries.reduce((s, e) => s + (e.pnl ?? 0), 0);
                setWeeklyInsight({ text: `GO days: ${fmt(goPnl)} · NO-TRADE days: ${fmt(ntPnl)}`, positive: goPnl > ntPnl });
              } else if (goEntries.length > 0) {
                const goPnl = goEntries.reduce((s, e) => s + (e.pnl ?? 0), 0);
                setWeeklyInsight({ text: `${goEntries.length} trade${goEntries.length > 1 ? "s" : ""} on GO days — ${fmt(goPnl)} total`, positive: goPnl >= 0 });
              } else if (ntEntries.length > 0) {
                const ntPnl = ntEntries.reduce((s, e) => s + (e.pnl ?? 0), 0);
                setWeeklyInsight({ text: `Traded ${ntEntries.length}x on NO-TRADE days — ${fmt(ntPnl)}`, positive: false });
              }
            }
          }
        }
      } catch {}
    }

    function computeStreak(hist: HistoryEntry[]) {
      let s = 0;
      const today = new Date();
      for (let i = 0; i < hist.length; i++) {
        const d = new Date(hist[i].date);
        const diff = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === i) s++; else break;
      }
      setStreak(s);
    }

    loadData();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") loadData();
    });
  }, []);

  useEffect(() => {
    if (streak === 7 || streak === 14 || streak === 30) {
      const key = `trademind_streak_cele_${streak}`;
      if (!localStorage.getItem(key)) { setShowStreakCelebration(true); localStorage.setItem(key, "1"); }
    }
  }, [streak]);

  const morningBriefInsight = useMemo(() => {
    if (history.length < 3) return null;
    const recent3 = history.slice(0, 3);
    const prev3 = history.slice(3, 6);
    const recentAvg = Math.round(recent3.reduce((s, h) => s + h.score, 0) / recent3.length);
    const prevAvg = prev3.length >= 2 ? Math.round(prev3.reduce((s, h) => s + h.score, 0) / prev3.length) : null;
    const trend = prevAvg !== null ? recentAvg - prevAvg : null;
    const byDow: Record<string, number[]> = {};
    history.forEach((h) => {
      const dow = new Date(h.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
      if (!byDow[dow]) byDow[dow] = [];
      byDow[dow].push(h.score);
    });
    const dowEntries = Object.entries(byDow).filter(([, v]) => v.length >= 2);
    const bestDow = dowEntries.sort((a, b) => {
      const avgA = a[1].reduce((s, n) => s + n, 0) / a[1].length;
      const avgB = b[1].reduce((s, n) => s + n, 0) / b[1].length;
      return avgB - avgA;
    })[0];
    return { recentAvg, trend, bestDow: bestDow ? bestDow[0] : null };
  }, [history]);

  const verdict = todayScore !== null ? getVerdict(todayScore) : null;
  const avg7 = history.length > 0 ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : null;
  const avg7Color = avg7 ? (avg7 >= 70 ? "var(--green)" : avg7 >= 45 ? "var(--amber)" : "var(--red)") : "var(--text-muted)";
  const streakColor = streak >= 7 ? "var(--green)" : streak >= 3 ? "var(--amber)" : "var(--text-muted)";
  const positionSizePct = todayScore !== null ? (todayScore >= 70 ? 100 : todayScore >= 45 ? 50 : 0) : null;
  const prevScore = history.length >= 2 ? history[1].score : null;
  const bestDay = history.length >= 5 ? history.reduce((best, h) => h.score > best.score ? h : best) : null;
  const worstDay = history.length >= 5 ? history.reduce((worst, h) => h.score < worst.score ? h : worst) : null;
  const nowHour = new Date().getHours();
  const isAfterMarket = nowHour >= 16;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.28} 50%{opacity:0.52} }
        @keyframes ring-breathe { 0%,100%{transform:scale(1);opacity:0.18} 50%{transform:scale(1.06);opacity:0.32} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes brief-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        .dash-section { animation: slide-up 0.5s ease both; }
        .s1{animation-delay:0.05s} .s2{animation-delay:0.12s} .s3{animation-delay:0.19s}
        .s4{animation-delay:0.26s} .s5{animation-delay:0.33s} .s6{animation-delay:0.40s}
        .quick-link { transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
        .quick-link:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .quick-link-arrow { opacity: 0; transform: translateX(-4px); transition: opacity 0.15s ease, transform 0.15s ease; }
        .quick-link:hover .quick-link-arrow { opacity: 1; transform: translateX(0); }
        .stat-card { transition: transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { border-color: var(--border-bright) !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .quick-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .bar-col:hover .bar-fill { opacity: 1 !important; }
        .brief-card { position: relative; overflow: hidden; }
        .brief-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(94,106,210,0.06),rgba(139,92,246,0.06),rgba(0,232,122,0.04)); pointer-events:none; border-radius:inherit; }
        .ring-glow { position:absolute; border-radius:50%; animation:ring-breathe 4s ease-in-out infinite; pointer-events:none; }
      `}</style>

      {/* Streak Celebration */}
      {showStreakCelebration && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(7,11,20,0.92)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowStreakCelebration(false)}>
          <div style={{ maxWidth: 380, width: "100%", textAlign: "center", background: "var(--surface)", border: "1px solid rgba(255,176,32,0.3)", borderRadius: 20, padding: "48px 32px", boxShadow: "0 0 80px rgba(255,176,32,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "bounce 0.6s ease" }}>🔥</div>
            <div className="font-bebas" style={{ fontSize: 56, lineHeight: 1, color: "var(--amber)", marginBottom: 12, textShadow: "0 0 40px rgba(255,176,32,0.6)" }}>{streak} DAY STREAK</div>
            <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 32 }}>
              {streak === 7 ? "One week straight. Most traders quit before they build a habit — you didn't." : streak === 14 ? "Two weeks of mental discipline. Your data is now revealing real patterns." : "30 days. You've built something most traders never do: consistency."}
            </p>
            <button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 15 }} onClick={() => setShowStreakCelebration(false)}>Keep the streak going →</button>
          </div>
        </div>
      )}

      {/* Upgrade Welcome */}
      {showUpgradeWelcome && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(7,11,20,0.94)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowUpgradeWelcome(false)}>
          <div style={{ maxWidth: 400, width: "100%", textAlign: "center", background: "var(--surface)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: "48px 32px", boxShadow: "0 0 80px rgba(139,92,246,0.1)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div className="font-bebas" style={{ fontSize: 52, lineHeight: 1, marginBottom: 12, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Welcome to TradeMind
            </div>
            <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28 }}>
              Your full pre-flight protocol is unlocked — trade journal, AI Coach Alex, broker sync, behavioral pattern detection, Trading Playbook, and everything else.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <>
                <Link href="/journal" style={{ display: "block" }}><button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={() => setShowUpgradeWelcome(false)}>Open Trade Journal →</button></Link>
                <Link href="/coach" style={{ display: "block" }}><button className="btn-ghost" style={{ width: "100%", padding: 14, fontSize: 14 }} onClick={() => setShowUpgradeWelcome(false)}>Meet AI Coach Alex →</button></Link>
              </>
              <button onClick={() => setShowUpgradeWelcome(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: 8 }}>I&apos;ll explore on my own</button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Gate */}
      {gateChecked && showGate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(7,11,20,0.96)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center", color: "#8B5CF6" }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="22" r="12" stroke="currentColor" strokeWidth="2.5"/><path d="M10 56c0-10 9.85-18 22-18s22 8 22 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M46 16l3.5-3M51 22.5h4M46 29l3.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="font-bebas" style={{ fontSize: 48, lineHeight: 1, marginBottom: 12, background: "linear-gradient(135deg, var(--red), var(--amber))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>BEFORE YOU TRADE</div>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 32 }}>Complete your daily mental check-in before you start trading today.</p>
            <div className="card" style={{ padding: 20, marginBottom: 24, border: "1px solid rgba(255,176,32,0.2)", background: "rgba(255,176,32,0.05)" }}>
              <div style={{ fontSize: 13, color: "var(--amber)", fontWeight: 700, marginBottom: 8, letterSpacing: "0.06em" }}>WHY THIS MATTERS</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>Most emotional losses happen when traders skip their mental prep. 5 questions. 60 seconds.</p>
            </div>
            <Link href="/checkin"><button className="btn-primary" style={{ width: "100%", fontSize: 16, padding: "18px", borderRadius: 12, marginBottom: 12 }}>Start Check-in →</button></Link>
            <button onClick={() => setShowGate(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: "8px" }}>Skip for today (not recommended)</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="app-header" style={{ padding: "12px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="TradeMind" height="24" style={{ display: "block" }} />
          </Link>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.04em" }}>
            {getGreeting()} · {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {broker && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 4px var(--green)" }} />
              {broker.broker}
            </div>
          )}
          <Link href="/checkin">
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>Check-in</button>
          </Link>
          <Link href="/settings">
            <button className="btn-ghost" style={{ padding: "8px 10px", fontSize: 13 }} aria-label="Settings">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.3"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </Link>
        </div>
      </div>

      {dashLoading ? (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <Skeleton width={100} height={100} style={{ borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton width="55%" height={16} style={{ marginBottom: 12 }} />
                <Skeleton width="70%" height={44} style={{ marginBottom: 10 }} />
                <Skeleton width="45%" height={13} />
              </div>
            </div>
          </div>
          <div className="stats-grid">
            {[0,1,2,3].map((i) => <SkeletonStat key={i} />)}
          </div>
          <SkeletonCard rows={3} style={{ marginBottom: 16, padding: 24 }} />
          <SkeletonCard rows={2} style={{ marginBottom: 16, padding: 24 }} />
        </div>
      ) : (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px", opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>

        {/* TODAY HERO CARD */}
        <div className={`card dash-section s1 ${verdict?.cardClass ?? ""}`} style={{ padding: 0, marginBottom: 20, overflow: "hidden", position: "relative" }}>
          {verdict && (
            <div style={{ position: "absolute", inset: 0, background: verdict.glow, filter: "blur(60px)", opacity: 0.5, pointerEvents: "none", animation: "glow-pulse 3s ease-in-out infinite" }} />
          )}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>

            {todayScore !== null && verdict ? (
              <>
                {/* Score ring section */}
                <div style={{ padding: "28px 24px 28px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, borderRight: "1px solid var(--border)", minWidth: 140, position: "relative" }}>
                  {/* Ambient glow rings */}
                  <div className="ring-glow" style={{ width: 140, height: 140, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: `radial-gradient(circle, ${verdict.color}28 0%, transparent 70%)`, animationDelay: "0s" }} />
                  <div className="ring-glow" style={{ width: 110, height: 110, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: `radial-gradient(circle, ${verdict.color}20 0%, transparent 70%)`, animationDelay: "1.5s" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <ScoreRing score={todayScore} color={verdict.color} size={100} />
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", fontWeight: 700, position: "relative", zIndex: 1 }}>MENTAL SCORE</div>
                  {prevScore !== null && <TrendArrow current={todayScore} previous={prevScore} />}
                </div>

                {/* Verdict + info */}
                <div style={{ flex: 1, padding: "28px 24px", minWidth: 200 }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 6 }}>
                    TODAY · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
                  </div>
                  <div className="font-bebas" style={{ fontSize: "clamp(52px, 10vw, 80px)", color: verdict.color, lineHeight: 0.9, marginBottom: 10, textShadow: `0 0 30px ${verdict.color}60`, letterSpacing: "0.02em" }}>
                    {verdict.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: positionSizePct !== null && positionSizePct < 100 ? 12 : 0 }}>
                    {getMotivationalLine(todayScore)}
                  </div>
                  {positionSizePct !== null && positionSizePct < 100 && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, background: positionSizePct === 0 ? "rgba(255,59,92,0.1)" : "rgba(255,176,32,0.1)", border: `1px solid ${positionSizePct === 0 ? "rgba(255,59,92,0.3)" : "rgba(255,176,32,0.3)"}` }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v5M6 9v1.5" stroke={positionSizePct === 0 ? "var(--red)" : "var(--amber)"} strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="6" r="5" stroke={positionSizePct === 0 ? "var(--red)" : "var(--amber)"} strokeWidth="1.1"/></svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: positionSizePct === 0 ? "var(--red)" : "var(--amber)" }}>{positionSizePct}% max position size today</span>
                    </div>
                  )}
                </div>

                {/* Right action */}
                <div style={{ padding: "28px 24px 28px 8px", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  <Link href="/result"><button className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px", whiteSpace: "nowrap" }}>View Report</button></Link>
                  <Link href="/checkin"><button style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", padding: "4px 12px" }}>Re-do</button></Link>
                </div>
              </>
            ) : (
              <div style={{ width: "100%", padding: "40px 28px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
                  </div>
                  <div className="font-bebas" style={{ fontSize: "clamp(32px, 6vw, 48px)", lineHeight: 1, marginBottom: 10, color: "var(--text)" }}>
                    {history.length === 0 ? "Your edge starts here." : "Ready to trade?"}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 440 }}>
                    {history.length === 0
                      ? "The traders who make it log their mental state before every session — not occasionally, religiously. One week of honest check-ins is all it takes to start seeing your own patterns."
                      : "Take 60 seconds before you open any charts. Your mental score determines your verdict — and your verdict determines your size."}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                  <Link href="/checkin">
                    <button className="btn-primary" style={{ padding: "16px 32px", fontSize: 15, whiteSpace: "nowrap" }}>
                      {history.length === 0 ? "Do Your First Check-in →" : "Start Check-in →"}
                    </button>
                  </Link>
                  {history.length === 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>Takes 60 seconds</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MORNING BRIEF */}
        {morningBriefInsight && (
          <div className="card brief-card dash-section s2" style={{ padding: "18px 22px", marginBottom: 16, border: "1px solid rgba(94,106,210,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)", boxShadow: "0 0 6px var(--blue)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--blue)" }}>MORNING BRIEF</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Trend insight */}
              {morningBriefInsight.trend !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: morningBriefInsight.trend > 0 ? "rgba(0,232,122,0.1)" : morningBriefInsight.trend < 0 ? "rgba(255,59,92,0.1)" : "rgba(255,176,32,0.1)", border: `1px solid ${morningBriefInsight.trend > 0 ? "rgba(0,232,122,0.25)" : morningBriefInsight.trend < 0 ? "rgba(255,59,92,0.25)" : "rgba(255,176,32,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 13 }}>{morningBriefInsight.trend > 0 ? "↑" : morningBriefInsight.trend < 0 ? "↓" : "→"}</span>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                    Your 3-day average is <strong style={{ color: morningBriefInsight.trend > 0 ? "var(--green)" : morningBriefInsight.trend < 0 ? "var(--red)" : "var(--amber)" }}>{morningBriefInsight.recentAvg}</strong>
                    {morningBriefInsight.trend !== 0 && <span style={{ color: morningBriefInsight.trend > 0 ? "var(--green)" : "var(--red)" }}> ({morningBriefInsight.trend > 0 ? "+" : ""}{morningBriefInsight.trend} vs prior 3 days)</span>}
                  </span>
                </div>
              )}
              {/* Best day of week */}
              {morningBriefInsight.bestDow && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13 }}>📅</div>
                  <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                    Historically your sharpest day is <strong style={{ color: "var(--amber)" }}>{morningBriefInsight.bestDow}</strong> — plan your best setups then
                  </span>
                </div>
              )}
              {/* Lifestyle correlation — premium only */}
              {lifestyleInsight && lifestyleInsight.exerciseLift !== null && lifestyleInsight.exerciseCount >= 3 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13 }}>💪</div>
                  <span style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                    Exercise days give you a <strong style={{ color: "var(--green)" }}>+{lifestyleInsight.exerciseLift} point lift</strong> — {lifestyleInsight.avgScoreWithExercise} vs {lifestyleInsight.avgScoreWithoutExercise} avg score
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NO-TRADE smart move card */}
        {todayScore !== null && todayScore < 45 && (
          <div className="dash-section s2" style={{ padding: "14px 20px", marginBottom: 20, borderRadius: 12, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.18)", display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><path d="M10 2l1.5 4.5H16l-3.5 2.5 1.5 4.5L10 11l-4 2.5 1.5-4.5L4 6.5h4.5L10 2z" stroke="var(--green)" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>Smart move — staying out today is a win.</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 6 }}>Traders on sub-45 scores lose 3× more than average.</span>
            </div>
          </div>
        )}

        {/* Saved losses banner */}
        {isPro && savedLosses !== null && savedLosses > 0 && (
          <div className="dash-section s2" style={{ padding: "14px 20px", marginBottom: 20, borderRadius: 12, background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,232,122,0.12)", border: "1px solid rgba(0,232,122,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.3 3.2L13 5l-2.3 2.2.5 3.1L8 8.8l-2.7 1.5.5-3.1L3.5 5l3.2-.3L8 1.5z" stroke="var(--green)" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>Estimated ${savedLosses.toLocaleString()} saved</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>from honoring NO-TRADE days</span>
            </div>
            <Link href="/analytics" style={{ marginLeft: "auto", fontSize: 11, color: "var(--green)", textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap" }}>SEE DETAILS →</Link>
          </div>
        )}

        {/* STATS ROW — 4 cards */}
        <div className="dash-section s2 stats-grid">
          {/* Streak */}
          <div className="card stat-card" style={{ padding: "18px 14px", textAlign: "center", background: streak >= 3 ? "linear-gradient(160deg, rgba(255,176,32,0.08) 0%, var(--surface) 70%)" : "linear-gradient(160deg, rgba(255,255,255,0.02), var(--surface))", borderColor: streak >= 3 ? "rgba(255,176,32,0.25)" : undefined, boxShadow: streak >= 7 ? "0 0 20px rgba(255,176,32,0.08) inset" : "none" }}>
            <div className="font-bebas" style={{ fontSize: 30, color: streakColor, lineHeight: 1, marginBottom: streak >= 3 ? 0 : 4, textShadow: streak >= 3 ? `0 0 20px ${streakColor}60` : "none" }}>
              {streak > 0 ? streak : "—"}
            </div>
            {streak >= 3 && <div style={{ fontSize: 14, lineHeight: 1, marginBottom: 4 }}>🔥</div>}
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>STREAK</div>
          </div>

          {/* 7-day avg */}
          <div className="card stat-card" style={{ padding: "18px 14px", textAlign: "center", background: "linear-gradient(160deg, rgba(255,255,255,0.02), var(--surface))" }}>
            <div className="font-bebas" style={{ fontSize: 30, color: avg7Color, lineHeight: 1, marginBottom: 2, textShadow: avg7 ? `0 0 20px ${avg7Color}50` : "none" }}>
              {avg7 !== null ? avg7 : "—"}
            </div>
            {history.length >= 3 && (() => {
              const pts = [...history].reverse();
              const W = 48; const H = 16; const pad = 2;
              const xs = pts.map((_, i) => pad + (i / Math.max(pts.length - 1, 1)) * (W - pad * 2));
              const ys = pts.map((p) => pad + (1 - p.score / 100) * (H - pad * 2));
              const d = pts.map((_, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${ys[i]}`).join(" ");
              const area = `${d} L ${xs[xs.length - 1]} ${H - pad} L ${xs[0]} ${H - pad} Z`;
              return (
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 48, height: 16, display: "block", margin: "0 auto 2px" }}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={avg7Color} stopOpacity="0.3"/><stop offset="100%" stopColor={avg7Color} stopOpacity="0"/></linearGradient></defs>
                  <path d={area} fill="url(#sg)" />
                  <path d={d} fill="none" stroke={avg7Color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                </svg>
              );
            })()}
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>7-DAY AVG</div>
          </div>

          {/* Monthly */}
          <div className="card stat-card" style={{ padding: "18px 14px", textAlign: "center", background: "linear-gradient(160deg, rgba(94,106,210,0.05), var(--surface))", borderColor: monthlyCount > 0 ? "rgba(94,106,210,0.15)" : undefined }}>
            <div className="font-bebas" style={{ fontSize: 30, color: "var(--blue)", lineHeight: 1, marginBottom: 4, textShadow: "0 0 20px rgba(94,106,210,0.4)" }}>
              {monthlyCount > 0 ? monthlyCount : "—"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: weeklyGoalCount > 0 ? 4 : 0 }}>THIS MONTH</div>
            {weeklyGoalCount > 0 && (
              <div style={{ fontSize: 9, color: weeklyGoalCount >= weeklyGoal ? "var(--green)" : "var(--text-muted)" }}>
                {weeklyGoalCount}/{weeklyGoal} wk {weeklyGoalCount >= weeklyGoal ? "✓" : ""}
              </div>
            )}
          </div>

          {/* GO days */}
          <div className="card stat-card" style={{ padding: "18px 14px", textAlign: "center", background: goCount > 0 ? "linear-gradient(160deg, rgba(0,232,122,0.05), var(--surface))" : "linear-gradient(160deg, rgba(255,255,255,0.02), var(--surface))", borderColor: goCount > 0 ? "rgba(0,232,122,0.18)" : undefined }}>
            <div className="font-bebas" style={{ fontSize: 30, color: "var(--green)", lineHeight: 1, marginBottom: 4, textShadow: goCount > 0 ? "0 0 20px rgba(0,232,122,0.4)" : "none" }}>
              {goCount > 0 ? goCount : "—"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>GO DAYS</div>
            {monthlyCount > 0 && goCount > 0 && (
              <div style={{ fontSize: 9, color: "var(--green)" }}>{Math.round((goCount / monthlyCount) * 100)}% rate</div>
            )}
          </div>
        </div>

        {/* Lifestyle correlation strip — premium */}
        {isPro && lifestyleInsight && lifestyleInsight.exerciseLift !== null && lifestyleInsight.exerciseCount >= 3 && (
          <div className="dash-section s3" style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "linear-gradient(135deg, rgba(0,232,122,0.05), rgba(94,106,210,0.04))", border: "1px solid rgba(0,232,122,0.15)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 16, flex: 1, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em" }}>EXERCISE DAYS</span>
                <span className="font-bebas" style={{ fontSize: 22, color: "var(--green)", lineHeight: 1 }}>{lifestyleInsight.avgScoreWithExercise ?? "—"}</span>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>avg score</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em" }}>REST DAYS</span>
                <span className="font-bebas" style={{ fontSize: 22, color: "var(--text-dim)", lineHeight: 1 }}>{lifestyleInsight.avgScoreWithoutExercise ?? "—"}</span>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>avg score</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
                <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em" }}>LIFT</span>
                <span className="font-bebas" style={{ fontSize: 22, color: "var(--green)", lineHeight: 1 }}>+{lifestyleInsight.exerciseLift}</span>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>pts from exercise</span>
              </div>
            </div>
            <Link href="/analytics" style={{ fontSize: 11, color: "var(--green)", textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>FULL REPORT →</Link>
          </div>
        )}

        {/* Upgrade nudge — free users with 7+ check-ins */}
        {showUpgradeNudge && !isPro && (
          <div className="dash-section s3" style={{ marginBottom: 20, padding: "16px 20px", borderRadius: 14, background: "linear-gradient(135deg, rgba(94,106,210,0.07), rgba(94,106,210,0.03))", border: "1px solid rgba(94,106,210,0.25)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                You&apos;ve done {monthlyCount} check-ins — unlock what the data is hiding
              </div>
              <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>
                TradeMind unlocks your full 90-day history, P&L vs. psychology correlation, AI Coach, and accountability partners.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <Link href="/settings">
                <button className="btn-primary" style={{ fontSize: 13, padding: "10px 18px" }}>Upgrade →</button>
              </Link>
              <button
                onClick={() => {
                  setShowUpgradeNudge(false);
                  localStorage.setItem("trademind_upgrade_nudge_dismissed", String(Date.now()));
                }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "6px 8px" }}
                aria-label="Dismiss"
              >×</button>
            </div>
          </div>
        )}

        {/* Weekly goal progress bar */}
        {weeklyGoalCount > 0 && (
          <div className="dash-section s3" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.06em" }}>WEEKLY GOAL</span>
              <span style={{ fontSize: 11, color: weeklyGoalCount >= weeklyGoal ? "var(--green)" : "var(--text-muted)", fontWeight: 700 }}>
                {weeklyGoalCount}/{weeklyGoal} days {weeklyGoalCount >= weeklyGoal ? "✓" : ""}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((weeklyGoalCount / weeklyGoal) * 100, 100)}%`, background: weeklyGoalCount >= weeklyGoal ? "var(--green)" : "linear-gradient(90deg, var(--blue), var(--purple))", borderRadius: 4, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)", boxShadow: weeklyGoalCount >= weeklyGoal ? "0 0 8px var(--green)" : "0 0 8px rgba(94,106,210,0.5)" }} />
            </div>
          </div>
        )}

        {/* Weekly P&L + insight */}
        {(weeklyStats || weeklyInsight) && (
          <div className="dash-section s3" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", fontWeight: 700 }}>THIS WEEK</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            {weeklyStats && (
              <div className="card" style={{ padding: "16px 20px", marginBottom: weeklyInsight ? 8 : 0, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 2 }}>P&L THIS WEEK</div>
                  <div className="font-bebas" style={{ fontSize: 28, lineHeight: 1, color: weeklyStats.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                    {weeklyStats.pnl >= 0 ? "+" : ""}${Math.abs(weeklyStats.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div className="font-bebas" style={{ fontSize: 20, color: "var(--text-dim)", lineHeight: 1 }}>{weeklyStats.trades}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>TRADES</div>
                  </div>
                  {weeklyStats.winRate !== null && (
                    <div style={{ textAlign: "center" }}>
                      <div className="font-bebas" style={{ fontSize: 20, color: weeklyStats.winRate >= 50 ? "var(--green)" : "var(--red)", lineHeight: 1 }}>{weeklyStats.winRate}%</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>WIN RATE</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {weeklyInsight && (
              <div style={{ padding: "10px 16px", borderRadius: 10, background: weeklyInsight.positive ? "rgba(0,232,122,0.05)" : "rgba(255,59,92,0.05)", border: `1px solid ${weeklyInsight.positive ? "rgba(0,232,122,0.18)" : "rgba(255,59,92,0.18)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: weeklyInsight.positive ? "var(--green)" : "var(--red)", flexShrink: 0 }}><path d="M2 10l2.5-3.5 2 2L9 4l3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 12, color: weeklyInsight.positive ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{weeklyInsight.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Position Sizing */}
        {todayScore !== null && verdict && challengeConfig && challengeConfig.accountSize > 0 && (
          <div className="dash-section s3" style={{ marginBottom: 20 }}>
            <PositionSizing verdict={verdict.label as "GO" | "CAUTION" | "NO-TRADE"} score={todayScore} accountSize={challengeConfig.accountSize} />
          </div>
        )}

        {/* Trade Limit */}
        <div className="dash-section s3" style={{ marginBottom: 20 }}><TradeLimit /></div>

        {/* Challenge Tracker */}
        {challengeConfig && challengeConfig.accountSize > 0 && (
          <div className="dash-section s3" style={{ marginBottom: 20 }}>
            <ChallengeTracker config={challengeConfig} verdict={verdict?.label ?? null} />
          </div>
        )}

        {/* Share Profile */}
        {publicProfile && userId && (
          <div className="card dash-section s3" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, var(--surface) 70%)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="12" cy="3" r="2" stroke="#8B5CF6" strokeWidth="1.4"/><circle cx="12" cy="13" r="2" stroke="#8B5CF6" strokeWidth="1.4"/><circle cx="4" cy="8" r="2" stroke="#8B5CF6" strokeWidth="1.4"/><path d="M6 7l4-2.5M6 9l4 2.5" stroke="#8B5CF6" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>Your public profile is live</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {typeof window !== "undefined" ? `${window.location.origin}/u/${userId}` : `/u/${userId}`}
              </div>
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/u/${userId}`;
                navigator.clipboard.writeText(url).then(() => {
                  setProfileLinkCopied(true);
                  setTimeout(() => setProfileLinkCopied(false), 2000);
                });
              }}
              style={{ padding: "7px 14px", borderRadius: 8, background: profileLinkCopied ? "rgba(0,232,122,0.12)" : "rgba(139,92,246,0.12)", border: `1px solid ${profileLinkCopied ? "rgba(0,232,122,0.3)" : "rgba(139,92,246,0.3)"}`, color: profileLinkCopied ? "var(--green)" : "#8B5CF6", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}
            >
              {profileLinkCopied ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}

        {/* WEEK 1 ONBOARDING — show until 5 check-ins */}
        {monthlyCount < 5 && (
          <div className="card dash-section s3" style={{ padding: "28px 24px", marginBottom: 20, background: "linear-gradient(135deg, rgba(94,106,210,0.04) 0%, var(--surface) 70%)", border: "1px solid rgba(94,106,210,0.18)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" stroke="var(--blue)" strokeWidth="1.4"/><path d="M10 9v4M10 7h.01" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                  Your edge builds from day one.
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 16 }}>
                  Right now you&apos;re measuring nothing — and you can&apos;t improve what you don&apos;t measure. The traders who get the most from TradeMind do one thing differently: they check in <em style={{ color: "var(--text)", fontStyle: "normal", fontWeight: 600 }}>every trading day before the open</em>, no exceptions. Rate your mental state honestly. Log your verdict. Mark your P&amp;L at close.
                  <br /><br />
                  Five check-ins is all it takes to start seeing your own patterns — which mental states are printing money for you, and which ones are quietly bleeding your account.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  {/* Progress pips */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {[1,2,3,4,5].map((n) => (
                      <div key={n} style={{ width: 28, height: 6, borderRadius: 4, background: n <= monthlyCount ? "var(--blue)" : "var(--surface2)", border: `1px solid ${n <= monthlyCount ? "var(--blue)" : "var(--border)"}`, transition: "background 0.3s" }} />
                    ))}
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>{monthlyCount}/5 this week</span>
                  </div>
                  <Link href="/checkin">
                    <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Check in now →</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7-DAY CHART — improved */}
        {history.length > 0 && (
          <div className="card dash-section s4" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em" }}>LAST 7 DAYS</h3>
              <Link href="/analytics" style={{ fontSize: 11, color: "var(--blue)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.06em" }}>VIEW ALL →</Link>
            </div>
            <div style={{ position: "relative" }}>
              {/* Threshold lines */}
              <div style={{ position: "absolute", right: 0, left: 0, top: `${(1 - 70 / 100) * 96}px`, borderTop: "1px dashed rgba(0,232,122,0.2)", zIndex: 0 }}>
                <span style={{ position: "absolute", right: 0, top: -8, fontSize: 9, color: "rgba(0,232,122,0.4)", fontWeight: 700 }}>70</span>
              </div>
              <div style={{ position: "absolute", right: 0, left: 0, top: `${(1 - 45 / 100) * 96}px`, borderTop: "1px dashed rgba(255,176,32,0.2)", zIndex: 0 }}>
                <span style={{ position: "absolute", right: 0, top: -8, fontSize: 9, color: "rgba(255,176,32,0.4)", fontWeight: 700 }}>45</span>
              </div>
              {/* SVG line overlay */}
              {(() => {
                const entries = [...Array(7)].map((_, i) => history[6 - i]);
                const filled = entries.filter(Boolean);
                if (filled.length < 2) return null;
                const W = 100; const H = 96; const pad = 6;
                const totalW = W; const barW = totalW / 7;
                const xs = entries.map((_, i) => i * barW + barW / 2);
                const ys = entries.map((e) => e ? pad + (1 - e.score / 100) * (H - pad * 2) : null);
                const pts = xs.map((x, i) => ys[i] !== null ? { x: (x / totalW) * 100, y: (ys[i]! / H) * 100 } : null).filter(Boolean) as { x: number; y: number }[];
                if (pts.length < 2) return null;
                const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y}%`).join(" ");
                return (
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }} preserveAspectRatio="none">
                    <path d={path} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
                  </svg>
                );
              })()}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100, position: "relative", zIndex: 3 }}>
                {[...Array(7)].map((_, i) => {
                  const dayEntry = history[6 - i];
                  const h = dayEntry ? Math.max((dayEntry.score / 100) * 96, 4) : 4;
                  const c = dayEntry ? (dayEntry.score >= 70 ? "var(--green)" : dayEntry.score >= 45 ? "var(--amber)" : "var(--red)") : "var(--surface3)";
                  const gradId = `bg${i}`;
                  const d2 = new Date(); d2.setDate(d2.getDate() - (6 - i));
                  const label = d2.toLocaleDateString("en-US", { weekday: "short" });
                  const isToday = i === 6;
                  return (
                    <div key={i} className="bar-col" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      {dayEntry && (
                        <div style={{ fontSize: 9, color: isToday ? c : "var(--text-muted)", fontWeight: isToday ? 700 : 400, lineHeight: 1 }}>{dayEntry.score}</div>
                      )}
                      <div className="bar-fill" style={{ width: "100%", height: h, borderRadius: "3px 3px 0 0", opacity: dayEntry ? (isToday ? 1 : 0.65) : 0.12, boxShadow: isToday && dayEntry ? `0 -4px 12px ${c}60, 0 0 8px ${c}40` : "none", transition: "height 0.8s ease, opacity 0.2s ease", background: dayEntry ? `linear-gradient(180deg, ${c} 0%, ${c}99 100%)` : "var(--surface3)", position: "relative", overflow: "hidden" }}>
                        {isToday && dayEntry && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: `linear-gradient(180deg, ${c}30, transparent)`, borderRadius: "3px 3px 0 0" }} />}
                        <svg style={{ display: "none" }}><defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity="1"/><stop offset="100%" stopColor={c} stopOpacity="0.7"/></linearGradient></defs></svg>
                      </div>
                      <div style={{ fontSize: 9, color: isToday ? "var(--blue)" : "var(--text-muted)", fontWeight: isToday ? 700 : 400, lineHeight: 1 }}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BEST / WORST DAY CARDS */}
        {bestDay && worstDay && (
          <div className="dash-section s5" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ padding: "16px 18px", borderColor: "rgba(0,232,122,0.15)" }}>
              <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>BEST DAY (7D)</div>
              <div className="font-bebas" style={{ fontSize: 34, color: "var(--green)", lineHeight: 1, marginBottom: 2 }}>{bestDay.score}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {new Date(bestDay.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
            <div className="card" style={{ padding: "16px 18px", borderColor: "rgba(255,59,92,0.15)" }}>
              <div style={{ fontSize: 10, color: "var(--red)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>WORST DAY (7D)</div>
              <div className="font-bebas" style={{ fontSize: 34, color: "var(--red)", lineHeight: 1, marginBottom: 2 }}>{worstDay.score}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {new Date(worstDay.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
        )}

        {/* EOD RECAP PROMPT — after market hours if checked in today */}
        {isAfterMarket && todayScore !== null && (
          <Link href="/recap" style={{ textDecoration: "none" }}>
            <div className="dash-section s5" style={{ marginBottom: 20, padding: "16px 20px", borderRadius: 12, background: "rgba(0,232,122,0.04)", border: "1px solid rgba(0,232,122,0.15)", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--green)" strokeWidth="1.3"/><path d="M8 5v3l2 1.5" stroke="var(--green)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 2 }}>Close your session</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Log P&L · Playbook compliance · One lesson — 60 seconds</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </Link>
        )}

        {/* QUICK LINKS */}
        <div className="dash-section s4" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>QUICK ACCESS</div>
          <div className="quick-grid">
            {[
              {
                href: "/checkin",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7.5v4.5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
                label: "Check-in",
                sub: "Daily mental score",
                color: "var(--blue)",
                hex: "#4F8EF7",
              },
              {
                href: "/journal",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                label: "Journal",
                sub: "Log & reflect on trades",
                color: "var(--green)",
                hex: "#00E87A",
              },
              {
                href: "/analytics",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 18l5-7 4 4 5-9 4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
                label: "Analytics",
                sub: "Psychology vs P&L",
                color: "var(--amber)",
                hex: "#FFB020",
              },
              {
                href: "/playbook",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9h8M8 13h6M15 16l2-2 1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                label: "Playbook",
                sub: "Rules & trading plan",
                color: "var(--purple)",
                hex: "#A78BFA",
              },
              {
                href: "/partners",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="17" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M2 20c0-3.314 3.134-6 7-6M14 14c3.866 0 7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                label: "Partners",
                sub: "Accountability circles",
                color: "#5E6AD2",
                hex: "#5E6AD2",
              },
              {
                href: "/coach",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 3l1.5-1.5M20.5 6H22M19 9l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
                label: "AI Coach",
                sub: "Alex · Personalized insights",
                color: "#8B5CF6",
                hex: "#8B5CF6",
                premium: !isPro,
              },
              {
                href: "/leaderboard",
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="8" width="5" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="17" y="4" width="5" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
                label: "Leaderboard",
                sub: "Discipline rank",
                color: "var(--amber)",
                hex: "#FFB020",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  className="card quick-link"
                  style={{
                    padding: "18px 16px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    cursor: "pointer",
                    borderColor: `${item.hex}22`,
                    background: `linear-gradient(145deg, ${item.hex}08 0%, var(--surface) 70%)`,
                    position: "relative",
                    minHeight: 120,
                    overflow: "hidden",
                  }}
                >
                  {/* Ambient corner glow */}
                  <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${item.hex}18, transparent 70%)`, pointerEvents: "none" }} />

                  {/* Top row: icon + arrow */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${item.hex}14`,
                      border: `1px solid ${item.hex}28`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.color, flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <svg className="quick-link-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: item.color, marginTop: 4 }}>
                      <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Text */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 3, letterSpacing: "-0.015em" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{item.sub}</div>
                  </div>

                  {/* Premium badge */}
                  {item.premium && (
                    <div style={{ position: "absolute", top: 10, right: 10, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 7px", borderRadius: 5 }}>PRO</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Weekly AI Coach */}
        {weeklyCoach && (
          <div className="card dash-section s5" style={{ padding: "20px 24px", marginBottom: 20, border: "1px solid rgba(139,92,246,0.2)", background: "linear-gradient(135deg, rgba(139,92,246,0.04), var(--surface))" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#8B5CF6" strokeWidth="1.2"/><path d="M1 10.5c0-2.209 2.239-4 5-4s5 1.791 5 4" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#8B5CF6" }}>WEEKLY COACH · ALEX</span>
              </div>
              <Link href="/coach" style={{ fontSize: 11, color: "#8B5CF6", textDecoration: "none", fontWeight: 700, letterSpacing: "0.06em" }}>CHAT →</Link>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, margin: 0 }}>{weeklyCoach}</p>
          </div>
        )}

        {/* Partners */}
        <div className="dash-section s6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>ACCOUNTABILITY PARTNERS</h3>
            <Link href="/partners" style={{ fontSize: 11, color: "var(--blue)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.06em" }}>
              {isPro ? "MANAGE →" : "UPGRADE →"}
            </Link>
          </div>

          {isPro ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {partnersLoading ? (
                <div className="card" style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                </div>
              ) : partners.length > 0 ? (
                partners.map((p) => <PartnerCard key={p.id} partner={p} />)
              ) : (
                <div className="card" style={{ padding: "28px 24px", display: "flex", alignItems: "center", gap: 20, border: "1px dashed var(--border)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(94,106,210,0.08)", border: "1px dashed rgba(94,106,210,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: "var(--blue)" }}><circle cx="7" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M1 17c0-2.76 2.686-5 6-5M11 12c3.314 0 6 2.24 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>No partners yet</div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>Partners see your morning score. Mutual visibility = fewer emotional mistakes.</p>
                  </div>
                  <Link href="/partners"><button className="btn-primary" style={{ fontSize: 13, padding: "10px 18px", whiteSpace: "nowrap" }}>Invite →</button></Link>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 16, border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: 28 }}>👥</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Add accountability partners</div>
                <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>Your trading partner sees your score every morning. Discipline is easier when someone&apos;s watching.</p>
              </div>
              <Link href="/settings"><button className="btn-primary" style={{ fontSize: 13, padding: "10px 18px", whiteSpace: "nowrap" }}>Upgrade →</button></Link>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Quick-Add Trade FAB */}
      <button
        onClick={() => { setShowQuickTrade(true); setQtSaved(false); setQtSymbol(""); setQtPnl(""); setQtSetup(""); setQtError(null); }}
        style={{ position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom, 0px))", right: 20, zIndex: 100, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--blue), #4a5bbd)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(94,106,210,0.4)", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        title="Quick-add trade"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4v14M4 11h14" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
      </button>

      {/* Quick-Add Trade Modal */}
      {showQuickTrade && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 env(safe-area-inset-bottom, 0px)" }} onClick={() => setShowQuickTrade(false)}>
          <div style={{ background: "var(--surface)", borderRadius: "20px 20px 0 0", padding: "24px 24px 32px", width: "100%", maxWidth: 520, border: "1px solid var(--border)", borderBottom: "none", animation: "slide-up 0.25s ease" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{qtSaved ? "Trade logged ✓" : "Quick-Add Trade"}</div>
              <button onClick={() => setShowQuickTrade(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 4 }}>×</button>
            </div>

            {qtSaved ? (
              <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 20 }}>Added to your journal. Keep tracking.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => { setQtSaved(false); setQtSymbol(""); setQtPnl(""); setQtSetup(""); setQtError(null); }}>Add another</button>
                  <Link href="/journal" style={{ flex: 1, textDecoration: "none" }}>
                    <button className="btn-primary" style={{ width: "100%", fontSize: 13 }}>View journal →</button>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>SYMBOL</label>
                    <input type="text" value={qtSymbol} onChange={(e) => setQtSymbol(e.target.value.toUpperCase())} placeholder="AAPL, BTC..." style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>P&L</label>
                    <input type="number" value={qtPnl} onChange={(e) => setQtPnl(e.target.value)} placeholder="+250 or -80" style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>SIDE</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["long", "short"] as const).map((s) => (
                      <button key={s} onClick={() => setQtSide(s)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${qtSide === s ? (s === "long" ? "var(--green)" : "var(--red)") : "var(--border)"}`, background: qtSide === s ? (s === "long" ? "rgba(0,232,122,0.08)" : "rgba(255,59,92,0.08)") : "var(--surface2)", color: qtSide === s ? (s === "long" ? "var(--green)" : "var(--red)") : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 700, textTransform: "capitalize", transition: "all 0.15s" }}>
                        {s === "long" ? "↑ Long" : "↓ Short"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>SETUP (optional)</label>
                  <input type="text" value={qtSetup} onChange={(e) => setQtSetup(e.target.value)} placeholder="Breakout, VWAP reclaim..." style={{ fontSize: 13 }} />
                </div>

                {qtError && (
                  <div style={{ fontSize: 12, color: "var(--red)", padding: "10px 12px", borderRadius: 8, background: "rgba(255,59,92,0.07)", border: "1px solid rgba(255,59,92,0.2)" }}>
                    {qtError}
                    {!isPro && <Link href="/settings" style={{ marginLeft: 8, color: "var(--red)", fontWeight: 700, textDecoration: "none" }}>Upgrade →</Link>}
                  </div>
                )}
                <button
                  className="btn-primary"
                  style={{ padding: 14, fontSize: 15, marginTop: 4 }}
                  disabled={qtSaving}
                  onClick={async () => {
                    setQtSaving(true);
                    setQtError(null);
                    try {
                      const today = new Date().toISOString().split("T")[0];
                      const res = await fetch("/api/journal", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          date: today,
                          symbol: qtSymbol.trim() || undefined,
                          side: qtSide,
                          pnl: qtPnl ? parseFloat(qtPnl) : undefined,
                          setup: qtSetup.trim() || undefined,
                        }),
                      });
                      const d = await res.json();
                      if (res.ok) {
                        setQtSaved(true);
                        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
                      } else {
                        setQtError(d.error ?? "Failed to save");
                      }
                    } catch { setQtError("Network error — try again"); }
                    setQtSaving(false);
                  }}>
                  {qtSaving ? "Saving..." : "Log Trade →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}