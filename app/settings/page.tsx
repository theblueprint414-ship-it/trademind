"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { showToast } from "@/components/Toast";

type ChallengeAttempt = {
  id: string;
  firm: string | null;
  accountSize: number;
  profitTarget: number | null;
  dailyLimit: number;
  maxDrawdown: number;
  tradingDaysTarget: number | null;
  startDate: string | null;
  endDate: string | null;
  outcome: string;
  finalPnl: number | null;
  tradingDays: number | null;
  notes: string | null;
  createdAt: string;
};


export default function SettingsPage() {
  const [tradeLimit, setTradeLimit] = useState(5);
  const [savedLimit, setSavedLimit] = useState(5);
  const [saved, setSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [customQSaved, setCustomQSaved] = useState(false);
  const [theme, setTheme] = useState<"dark" | "oled">("dark");
  const [referral, setReferral] = useState<{ code: string; usedCount: number; link: string } | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [profileLinkCopied, setProfileLinkCopied] = useState(false);
  const [freezeAvailable, setFreezeAvailable] = useState(false);
  const [freezeUsing, setFreezeUsing] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [pauseSuccess, setPauseSuccess] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Prop Firm Challenge
  const [challengeEnabled, setChallengeEnabled] = useState(false);
  const [challengeFirm, setChallengeFirm] = useState("ftmo");
  const [challengeAccountSize, setChallengeAccountSize] = useState("100000");
  const [challengeDailyLimit, setChallengeDailyLimit] = useState("5");
  const [challengeMaxDrawdown, setChallengeMaxDrawdown] = useState("10");
  const [challengeStartDate, setChallengeStartDate] = useState("");
  const [challengeEndDate, setChallengeEndDate] = useState("");
  const [challengeProfitTarget, setChallengeProfitTarget] = useState("10");
  const [challengeTradingDaysTarget, setChallengeTradingDaysTarget] = useState("");
  const [challengeSaving, setChallengeSaving] = useState(false);
  const [challengeSaved, setChallengeSaved] = useState(false);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveOutcome, setArchiveOutcome] = useState<"passed" | "failed">("passed");
  const [archiveFinalPnl, setArchiveFinalPnl] = useState("");
  const [archiveNotes, setArchiveNotes] = useState("");
  const [archiving, setArchiving] = useState(false);

  const limitTrackRef = useRef<HTMLDivElement>(null);
  const limitDragging = useRef(false);

  function updateLimitFromPointer(e: React.PointerEvent) {
    if (!limitTrackRef.current) return;
    const rect = limitTrackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setTradeLimit(Math.max(1, Math.min(5, Math.round(1 + pct * 4))));
  }

  const FIRM_PRESETS: Record<string, { dailyLimit: string; maxDrawdown: string; profitTarget: string; tradingDays: string }> = {
    ftmo:        { dailyLimit: "5", maxDrawdown: "10", profitTarget: "10", tradingDays: "4" },
    apex:        { dailyLimit: "1", maxDrawdown: "2",  profitTarget: "6",  tradingDays: "7" },
    topstep:     { dailyLimit: "2", maxDrawdown: "6",  profitTarget: "6",  tradingDays: "5" },
    funded_next: { dailyLimit: "5", maxDrawdown: "10", profitTarget: "8",  tradingDays: "5" },
    e8:          { dailyLimit: "5", maxDrawdown: "8",  profitTarget: "8",  tradingDays: "0" },
    mff:         { dailyLimit: "5", maxDrawdown: "10", profitTarget: "10", tradingDays: "0" },
    custom:      { dailyLimit: "5", maxDrawdown: "10", profitTarget: "10", tradingDays: "0" },
  };

  // Broker
  const [broker, setBroker] = useState<{ broker: string; status: string; lastSyncAt: string | null } | null>(null);
  const [brokerLoading, setBrokerLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Circuit Breaker
  const [cb, setCb] = useState<{ isActive: boolean; dailyLimit: number; scoreAdaptive: boolean; extensionToken: string; resetHour: number } | null>(null);
  const [cbLoading, setCbLoading] = useState(true);
  const [cbSaving, setCbSaving] = useState(false);
  const [cbTokenCopied, setCbTokenCopied] = useState(false);
  const [cbRegenerating, setCbRegenerating] = useState(false);

  // Push notifications
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [reminderTime, setReminderTime] = useState("8:00 AM");
  const [reminderSaved, setReminderSaved] = useState(false);
  const [emailReminders, setEmailReminders] = useState(true);

  useEffect(() => {
    const savedTime = localStorage.getItem("trademind_reminder_time");
    if (savedTime) setReminderTime(savedTime);

    if (typeof window !== "undefined") {
      if (!("Notification" in window)) setNotifPermission("unsupported");
      else setNotifPermission(Notification.permission);
    }

    const savedCQ = localStorage.getItem("trademind_custom_q") ?? "";
    setCustomQuestion(savedCQ);

    const savedTheme = localStorage.getItem("trademind_theme") as "dark" | "oled" | null;
    if (savedTheme) setTheme(savedTheme);

    // Auto-scroll to plan section if ?plan= in URL
    const planParam = new URLSearchParams(window.location.search).get("plan");
    if (planParam) {
      setTimeout(() => {
        const el = document.querySelector(`[data-plan='${planParam}']`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    }

    // Load plan + trade limit from DB
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        setIsPro(d.plan === "pro" || d.plan === "premium");
        const limit = d.tradeLimit ?? 5;
        setTradeLimit(limit);
        setSavedLimit(limit);
        localStorage.setItem("trademind_trade_limit", String(limit));
        setEmailReminders(d.emailReminders !== false);
        if (d.id) setUserId(d.id);
        if (typeof d.publicProfile === "boolean") setPublicProfile(d.publicProfile);
        // Load streak freeze availability for Pro users
        if (d.plan === "pro" || d.plan === "premium") {
          fetch("/api/streak-freeze")
            .then((r) => r.json())
            .then((f) => { if (f.available) setFreezeAvailable(true); })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setPlanLoading(false));

    // Load referral
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => { if (d.code) setReferral(d); })
      .catch(() => {});

    // Load broker
    fetch("/api/broker")
      .then((r) => r.json())
      .then((d) => { if (d.connected) setBroker(d); })
      .catch(() => {})
      .finally(() => setBrokerLoading(false));

    // Load challenge config
    fetch("/api/challenge")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        setChallengeEnabled(d.enabled ?? false);
        if (d.firm) setChallengeFirm(d.firm);
        if (d.accountSize) setChallengeAccountSize(String(d.accountSize));
        if (d.dailyLimit) setChallengeDailyLimit(String(d.dailyLimit));
        if (d.maxDrawdown) setChallengeMaxDrawdown(String(d.maxDrawdown));
        if (d.startDate) setChallengeStartDate(d.startDate);
        if (d.endDate) setChallengeEndDate(d.endDate);
        if (d.profitTarget) setChallengeProfitTarget(String(d.profitTarget));
        if (d.tradingDaysTarget) setChallengeTradingDaysTarget(String(d.tradingDaysTarget));
      })
      .catch(() => {});

    // Load circuit breaker
    fetch("/api/circuit-breaker")
      .then((r) => r.json())
      .then((d) => { if (d && d.extensionToken) setCb(d); })
      .catch(() => {})
      .finally(() => setCbLoading(false));

    // Load challenge history
    setHistoryLoading(true);
    fetch("/api/challenge/history")
      .then((r) => r.json())
      .then((d) => { if (d.attempts) setChallengeHistory(d.attempts); })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));

  }, []);

  async function saveChallenge(enabled: boolean) {
    setChallengeSaving(true);
    try {
      await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          firm: challengeFirm,
          accountSize: parseFloat(challengeAccountSize) || null,
          dailyLimit: parseFloat(challengeDailyLimit) || 5,
          maxDrawdown: parseFloat(challengeMaxDrawdown) || 10,
          startDate: challengeStartDate || null,
          endDate: challengeEndDate || null,
          profitTarget: parseFloat(challengeProfitTarget) || null,
          tradingDaysTarget: parseInt(challengeTradingDaysTarget) || null,
        }),
      });
      setChallengeEnabled(enabled);
      setChallengeSaved(true);
      setTimeout(() => setChallengeSaved(false), 2000);
    } finally {
      setChallengeSaving(false);
    }
  }

  async function archiveCurrentChallenge() {
    setArchiving(true);
    const today = new Date().toISOString().split("T")[0];
    const effectiveStart = challengeStartDate || today;
    // Auto-calculate trading days from localStorage challenge P&L entries
    let autoTradingDays: number | null = null;
    try {
      const stored: Record<string, number> = JSON.parse(localStorage.getItem("trademind_challenge_pnl") || "{}");
      autoTradingDays = Object.entries(stored).filter(([d, v]) => d >= effectiveStart && v !== 0).length || null;
    } catch {}
    try {
      const res = await fetch("/api/challenge/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firm: challengeFirm,
          accountSize: parseFloat(challengeAccountSize) || 100000,
          profitTarget: parseFloat(challengeProfitTarget) || null,
          dailyLimit: parseFloat(challengeDailyLimit) || 5,
          maxDrawdown: parseFloat(challengeMaxDrawdown) || 10,
          tradingDaysTarget: parseInt(challengeTradingDaysTarget) || null,
          startDate: effectiveStart,
          endDate: challengeEndDate || today,
          outcome: archiveOutcome,
          finalPnl: parseFloat(archiveFinalPnl) || null,
          tradingDays: autoTradingDays,
          notes: archiveNotes || null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const refreshed = await fetch("/api/challenge/history").then((r) => r.json());
        if (refreshed.attempts) setChallengeHistory(refreshed.attempts);
        setShowArchiveModal(false);
        setArchiveFinalPnl("");
        setArchiveNotes("");
      }
    } catch {}
    setArchiving(false);
  }

  async function updateAttemptOutcome(id: string, outcome: string) {
    await fetch("/api/challenge/history", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, outcome }),
    });
    setChallengeHistory((prev) => prev.map((a) => a.id === id ? { ...a, outcome } : a));
  }

  async function saveCb(patch: Partial<typeof cb>) {
    if (!cb && !patch) return;
    setCbSaving(true);
    const updated = { ...(cb ?? { isActive: false, dailyLimit: 3, scoreAdaptive: true, extensionToken: "" }), ...patch };
    setCb(updated as typeof cb);
    try {
      const res = await fetch("/api/circuit-breaker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const d = await res.json();
      setCb(d);
      if (patch && "isActive" in patch) showToast((patch as { isActive: boolean }).isActive ? "Circuit Breaker activated" : "Circuit Breaker paused", (patch as { isActive: boolean }).isActive ? "success" : "info");
      else if (patch && ("dailyLimit" in patch || "scoreAdaptive" in patch || "resetHour" in patch)) showToast("Circuit Breaker updated", "success");
    } catch {
      showToast("Failed to save — check your connection", "error");
    }
    setCbSaving(false);
  }

  async function initCb() {
    setCbSaving(true);
    try {
      const res = await fetch("/api/circuit-breaker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false, dailyLimit: 3, scoreAdaptive: true }),
      });
      const d = await res.json();
      setCb(d);
    } catch {}
    setCbSaving(false);
    setCbLoading(false);
  }

  async function regenerateCbToken() {
    setCbRegenerating(true);
    try {
      const res = await fetch("/api/circuit-breaker/reset-token", { method: "POST" });
      const d = await res.json();
      if (d.extensionToken) setCb((prev) => prev ? { ...prev, extensionToken: d.extensionToken } : prev);
    } catch {}
    setCbRegenerating(false);
  }

  async function saveTradeLimit() {
    setSaved(true);
    setSavedLimit(tradeLimit);
    localStorage.setItem("trademind_trade_limit", String(tradeLimit));
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradeLimit }),
    }).catch(() => {});
    showToast(`Daily limit set to ${tradeLimit} trade${tradeLimit !== 1 ? "s" : ""}`, "success");
    setTimeout(() => setSaved(false), 2000);
  }

  async function disconnectBroker() {
    if (!confirm("Disconnect broker? You can reconnect anytime from onboarding.")) return;
    setDisconnecting(true);
    await fetch("/api/broker", { method: "DELETE" });
    setBroker(null);
    setDisconnecting(false);
    showToast("Broker disconnected", "info");
  }

  function scheduleReminder(timeStr: string) {
    const [timePart, meridiem] = timeStr.split(" ");
    const [rawHour, minute] = timePart.split(":").map(Number);
    const hour = meridiem === "PM" && rawHour !== 12 ? rawHour + 12 : meridiem === "AM" && rawHour === 12 ? 0 : rawHour;
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: "SCHEDULE_REMINDER", hour, minute });
    });
  }

  function saveReminderTime(time: string) {
    setReminderTime(time);
    localStorage.setItem("trademind_reminder_time", time);
    if (notifPermission === "granted") scheduleReminder(time);
    setReminderSaved(true);
    setTimeout(() => setReminderSaved(false), 2000);
  }

  function toggleTheme() {
    const next: "dark" | "oled" = theme === "dark" ? "oled" : "dark";
    setTheme(next);
    localStorage.setItem("trademind_theme", next);
    if (next === "oled") document.documentElement.classList.add("oled");
    else document.documentElement.classList.remove("oled");
  }

  async function toggleEmailReminders() {
    const next = !emailReminders;
    setEmailReminders(next);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailReminders: next }),
    }).catch(() => {});
  }

  async function handleEnableNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission !== "granted") return;
    scheduleReminder(reminderTime);
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch {
      // Push subscription optional — local SW scheduling still works
    }
  }

  async function togglePublicProfile() {
    const next = !publicProfile;
    setPublicProfile(next);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicProfile: next }),
    }).catch(() => {});
  }

  async function useStreakFreeze() {
    setFreezeUsing(true);
    try {
      const res = await fetch("/api/streak-freeze", { method: "POST" });
      const data = await res.json();
      if (data.ok) { setFreezeUsed(true); setFreezeAvailable(false); }
    } catch {}
    setFreezeUsing(false);
  }

  function copyProfileLink() {
    const base = typeof window !== "undefined" ? window.location.origin : "https://trademindedge.com";
    navigator.clipboard.writeText(`${base}/u/${userId}`).then(() => {
      setProfileLinkCopied(true);
      setTimeout(() => setProfileLinkCopied(false), 2000);
    });
  }

  const BROKER_META: Record<string, { abbr: string; color: string }> = {
    topstepx: { abbr: "TSX", color: "#00C896" },
    metaapi: { abbr: "MT4", color: "#FF6B35" },
    alpaca: { abbr: "ALP", color: "#00E87A" }, binance: { abbr: "BNB", color: "#F0B90B" },
    bybit: { abbr: "BYB", color: "#F7A600" }, coinbase: { abbr: "CB", color: "#0052FF" },
    kraken: { abbr: "KRK", color: "#5741D9" }, tradovate: { abbr: "TRD", color: "#5e6ad2" },
    tradestation: { abbr: "TS", color: "#FF3B5C" }, ibkr: { abbr: "IB", color: "#CC0000" }, mt4: { abbr: "MT4", color: "#2196F3" },
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <span className="font-bebas" style={{ fontSize: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>SETTINGS</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 className="font-bebas" style={{ fontSize: 40 }}>Settings</h1>
          {!planLoading && isPro && (
            <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, padding: "4px 12px", fontSize: 12, color: "#8B5CF6", fontWeight: 700, letterSpacing: "0.06em" }}>TRADEMIND ✓</div>
          )}
        </div>

        {/* Trade Limit */}
        <section className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid var(--red)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13V8M7 13V5M11 13V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M1 9.5h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" strokeDasharray="2 1.5"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Daily Trade Limit</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 24, lineHeight: 1.6 }}>
            When reached — automatic 60-minute lock. Protects against overtrading.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: "var(--text-dim)" }}>Trades per day:</span>
              <span className="font-bebas" style={{ fontSize: 40, color: "var(--red)", lineHeight: 1, textShadow: "0 0 20px rgba(255,59,92,0.4)", transition: "text-shadow 0.3s" }}>{tradeLimit}</span>
            </div>
            {/* Custom slider */}
            <div
              ref={limitTrackRef}
              role="slider"
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={tradeLimit}
              tabIndex={0}
              style={{ position: "relative", height: 36, cursor: "grab", userSelect: "none", touchAction: "none", marginBottom: 10 }}
              onPointerDown={(e) => {
                limitDragging.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                updateLimitFromPointer(e);
              }}
              onPointerMove={(e) => { if (limitDragging.current) updateLimitFromPointer(e); }}
              onPointerUp={() => { limitDragging.current = false; }}
              onPointerCancel={() => { limitDragging.current = false; }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") setTradeLimit((v) => Math.min(5, v + 1));
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") setTradeLimit((v) => Math.max(1, v - 1));
              }}
            >
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 6, transform: "translateY(-50%)", borderRadius: 99, background: "var(--surface3)" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, width: `${((tradeLimit - 1) / 4) * 100}%`, height: 6, transform: "translateY(-50%)", borderRadius: 99, background: "linear-gradient(90deg, rgba(255,59,92,0.5), var(--red))", boxShadow: "0 0 10px rgba(255,59,92,0.4)", transition: "background 0.3s" }} />
              {/* Tick marks */}
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} style={{ position: "absolute", top: "50%", left: `${((n - 1) / 4) * 100}%`, transform: "translate(-50%, -50%)", width: n === tradeLimit ? 26 : 10, height: n === tradeLimit ? 26 : 10, borderRadius: "50%", background: n <= tradeLimit ? "var(--red)" : "var(--surface3)", border: n === tradeLimit ? "2.5px solid rgba(255,255,255,0.15)" : "none", boxShadow: n === tradeLimit ? "0 0 18px rgba(255,59,92,0.7), 0 2px 8px rgba(0,0,0,0.5)" : "none", transition: "all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)", pointerEvents: "none" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", padding: "0 2px" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} style={{ color: n === tradeLimit ? "var(--red)" : "var(--text-muted)", fontWeight: n === tradeLimit ? 700 : 400, transition: "color 0.2s, font-weight 0.2s" }}>{n}</span>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={saveTradeLimit} style={{ width: "100%" }} disabled={tradeLimit === savedLimit}>
            {saved ? "✓ Saved!" : "Save limit"}
          </button>
          {savedLimit !== tradeLimit && <p style={{ fontSize: 12, color: "var(--amber)", marginTop: 8, textAlign: "center" }}>Unsaved changes</p>}
        </section>

        {/* Prop Firm Challenge Mode */}
        <section id="challenge" className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid var(--amber)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber)", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 11v2M5.5 14h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M4.5 2h7L10 8.5A2 2 0 018 10a2 2 0 01-2-1.5L4.5 2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 3.5H3a1 1 0 000 2l1.2.5M11.5 3.5H13a1 1 0 010 2l-1.2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Prop Firm Challenge Mode</h2>
            </div>
            {!isPro && (
              <span style={{ fontSize: 11, background: "rgba(139,92,246,0.12)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 6, padding: "3px 8px", fontWeight: 700 }}>TradeMind</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.6 }}>
            Track your daily P&L and drawdown against your challenge rules. TradeMind will warn you when you are approaching your limits — before you breach them.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "14px 16px", borderRadius: 10, background: "rgba(0,232,122,0.04)", border: "1px solid rgba(0,232,122,0.15)", marginBottom: 20, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 12 }}>How it works</div>
            <div>1. Select your firm and enter your account size — rules auto-fill based on the firm&apos;s standard challenge.</div>
            <div>2. Each day, log your trades in the Journal. TradeMind calculates your running daily P&L and total drawdown.</div>
            <div>3. Your dashboard shows a live challenge bar. When you hit 80% of your daily limit, you get a warning. At 100%, a hard stop is shown.</div>
            <div>4. Combined with your mental score — if your score is low <em>and</em> you are near your drawdown limit, TradeMind will strongly recommend no trading that day.</div>
          </div>
          {!isPro ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Upgrade to TradeMind to unlock Challenge Mode.</p>
              <button className="btn-primary" style={{ fontSize: 14, background: "linear-gradient(135deg,#8B5CF6,#6366f1)", border: "none" }} onClick={() => {
                const el = document.querySelector("[data-plan='premium']");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>Start 7-Day Free Trial →</button>
            </div>
          ) : (
            <>
              {/* Firm selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Prop Firm</label>
                <select
                  value={challengeFirm}
                  onChange={(e) => {
                    const firm = e.target.value;
                    setChallengeFirm(firm);
                    const preset = FIRM_PRESETS[firm];
                    if (preset) {
                      setChallengeDailyLimit(preset.dailyLimit);
                      setChallengeMaxDrawdown(preset.maxDrawdown);
                      setChallengeProfitTarget(preset.profitTarget);
                      if (preset.tradingDays !== "0") setChallengeTradingDaysTarget(preset.tradingDays);
                    }
                  }}
                  style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                >
                  <option value="ftmo">FTMO</option>
                  <option value="apex">Apex Funding</option>
                  <option value="topstep">TopStep</option>
                  <option value="funded_next">Funded Next</option>
                  <option value="e8">E8 Markets</option>
                  <option value="mff">MyForexFunds</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Account size */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Account Size ($)</label>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Find in your firm&apos;s dashboard</span>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={challengeAccountSize}
                  onChange={(e) => setChallengeAccountSize(e.target.value)}
                  style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                />
              </div>

              {/* Daily limit + max drawdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Daily Loss Limit (%)</label>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>e.g. FTMO = 5%</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={challengeDailyLimit}
                    onChange={(e) => setChallengeDailyLimit(e.target.value)}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Max Drawdown (%)</label>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>e.g. FTMO = 10%</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={challengeMaxDrawdown}
                    onChange={(e) => setChallengeMaxDrawdown(e.target.value)}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                  />
                </div>
              </div>

              {/* Profit target + trading days */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Profit Target (%)</label>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>e.g. FTMO = 10%</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    placeholder="e.g. 10"
                    value={challengeProfitTarget}
                    onChange={(e) => setChallengeProfitTarget(e.target.value)}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Min Trading Days</label>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>e.g. FTMO = 4 days</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="e.g. 4"
                    value={challengeTradingDaysTarget}
                    onChange={(e) => setChallengeTradingDaysTarget(e.target.value)}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Challenge Start</label>
                  <input
                    type="date"
                    value={challengeStartDate}
                    onChange={(e) => setChallengeStartDate(e.target.value)}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Challenge End</label>
                  <input
                    type="date"
                    value={challengeEndDate}
                    onChange={(e) => setChallengeEndDate(e.target.value)}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                  />
                </div>
              </div>

              {/* Save / Enable / Disable buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={challengeSaving}
                  onClick={() => saveChallenge(true)}
                >
                  {challengeSaving ? "Saving..." : challengeSaved ? "✓ Saved!" : challengeEnabled ? "Update Challenge" : "Enable Challenge Mode"}
                </button>
                {challengeEnabled && (
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 13, color: "var(--red)", borderColor: "rgba(255,45,45,0.3)" }}
                    disabled={challengeSaving}
                    onClick={() => saveChallenge(false)}
                  >
                    Disable
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {/* Challenge History */}
        {isPro && (
          <section className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Challenge History</h2>
              {challengeEnabled && (
                <button
                  onClick={() => setShowArchiveModal(true)}
                  style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text-muted)", cursor: "pointer", fontWeight: 700 }}
                >
                  + Archive Current
                </button>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20, lineHeight: 1.6 }}>
              Record of every challenge attempt — passed, failed, or active.
            </p>

            {historyLoading ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : challengeHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
                No archived challenges yet. Enable Challenge Mode and click &quot;Archive Current&quot; when you finish an attempt.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {challengeHistory.map((attempt) => {
                  const FIRM_NAMES: Record<string, string> = { ftmo: "FTMO", apex: "Apex", topstep: "TopStep", funded_next: "Funded Next", e8: "E8 Markets", mff: "MyForexFunds", custom: "Custom" };
                  const firmName = attempt.firm ? (FIRM_NAMES[attempt.firm] ?? attempt.firm.toUpperCase()) : "Custom";
                  const outcomeColor = attempt.outcome === "passed" ? "var(--green)" : attempt.outcome === "failed" ? "var(--red)" : "var(--amber)";
                  const outcomeBg = attempt.outcome === "passed" ? "rgba(0,232,122,0.08)" : attempt.outcome === "failed" ? "rgba(255,59,92,0.08)" : "rgba(255,176,32,0.08)";
                  const outcomeBorder = attempt.outcome === "passed" ? "rgba(0,232,122,0.2)" : attempt.outcome === "failed" ? "rgba(255,59,92,0.2)" : "rgba(255,176,32,0.2)";
                  return (
                    <div key={attempt.id} style={{ padding: "14px 16px", borderRadius: 10, background: outcomeBg, border: `1px solid ${outcomeBorder}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{firmName}</span>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>${attempt.accountSize.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {attempt.finalPnl !== null && (
                            <span style={{ fontSize: 13, fontWeight: 700, color: attempt.finalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
                              {attempt.finalPnl >= 0 ? "+" : ""}${attempt.finalPnl.toFixed(0)}
                            </span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: outcomeBorder, color: outcomeColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {attempt.outcome}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: attempt.outcome === "active" ? 10 : 0 }}>
                        {attempt.startDate ? attempt.startDate : "—"} → {attempt.endDate ? attempt.endDate : "ongoing"}
                        {attempt.tradingDays !== null && <span style={{ marginLeft: 8 }}>· {attempt.tradingDays} days traded</span>}
                      </div>
                      {attempt.notes && (
                        <div style={{ fontSize: 12, color: "var(--text-dim)", fontStyle: "italic", marginTop: 4 }}>{attempt.notes}</div>
                      )}
                      {attempt.outcome === "active" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button onClick={() => updateAttemptOutcome(attempt.id, "passed")}
                            style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: "1px solid rgba(0,232,122,0.3)", background: "rgba(0,232,122,0.08)", color: "var(--green)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            ✓ Mark Passed
                          </button>
                          <button onClick={() => updateAttemptOutcome(attempt.id, "failed")}
                            style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: "1px solid rgba(255,59,92,0.3)", background: "rgba(255,59,92,0.08)", color: "var(--red)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            ✗ Mark Failed
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Archive modal */}
        {showArchiveModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(7,11,20,0.92)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="card" style={{ maxWidth: 420, width: "100%", padding: 28, border: "1px solid rgba(94,106,210,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="font-bebas" style={{ fontSize: 22, letterSpacing: "0.04em" }}>ARCHIVE CHALLENGE</div>
                <button onClick={() => setShowArchiveModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 20 }}>
                Save the current challenge to your history before starting a new one.
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Outcome</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["passed", "failed"] as const).map((o) => (
                    <button key={o} onClick={() => setArchiveOutcome(o)}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: `1.5px solid ${archiveOutcome === o ? (o === "passed" ? "var(--green)" : "var(--red)") : "var(--border)"}`, background: archiveOutcome === o ? (o === "passed" ? "rgba(0,232,122,0.1)" : "rgba(255,59,92,0.1)") : "var(--surface2)", color: archiveOutcome === o ? (o === "passed" ? "var(--green)" : "var(--red)") : "var(--text-muted)", textTransform: "capitalize" }}>
                      {o === "passed" ? "✓ Passed" : "✗ Failed"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Final P&L ($) — optional</label>
                <input type="number" step="0.01" placeholder="e.g. 1200 or -450" value={archiveFinalPnl} onChange={(e) => setArchiveFinalPnl(e.target.value)}
                  style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Notes — optional</label>
                <textarea rows={2} placeholder="What went well? What will you do differently?" value={archiveNotes} onChange={(e) => setArchiveNotes(e.target.value)}
                  style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", outline: "none", resize: "vertical" }} />
              </div>
              <button className="btn-primary" onClick={archiveCurrentChallenge} disabled={archiving} style={{ width: "100%", padding: 13, fontSize: 14 }}>
                {archiving ? "Saving..." : "Save to History →"}
              </button>
            </div>
          </div>
        )}

        {/* Broker */}
        <section className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid var(--blue)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5L9.5 6.5M4.5 8L3.5 9a3.18 3.18 0 004.5 4.5l1-1M11.5 8l1-1a3.18 3.18 0 00-4.5-4.5l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Broker Connection</h2>
          </div>
          {brokerLoading ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p>
          ) : broker ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${(BROKER_META[broker.broker] ?? BROKER_META.alpaca).color}20`, border: `1px solid ${(BROKER_META[broker.broker] ?? BROKER_META.alpaca).color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: (BROKER_META[broker.broker] ?? BROKER_META.alpaca).color, letterSpacing: "0.04em", flexShrink: 0 }}>{(BROKER_META[broker.broker] ?? { abbr: broker.broker.slice(0,3).toUpperCase() }).abbr}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, textTransform: "capitalize" }}>{broker.broker}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: broker.status === "active" ? "var(--green)" : "var(--red)" }} />
                    {broker.status === "active" ? "Connected" : "Error"}
                    {broker.lastSyncAt && (
                      <span style={{ marginLeft: 8 }}>· Last sync: {new Date(broker.lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/onboarding" style={{ flex: 1 }}>
                  <button className="btn-ghost" style={{ width: "100%", fontSize: 13 }}>Change Broker</button>
                </Link>
                <button className="btn-ghost" style={{ fontSize: 13, color: "var(--red)", borderColor: "rgba(255,45,45,0.3)" }} onClick={disconnectBroker} disabled={disconnecting}>
                  {disconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            </>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.6 }}>No broker connected. Connect one to auto-count your trades and sync your journal automatically.</p>
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(94,106,210,0.05)", border: "1px solid rgba(94,106,210,0.15)", marginBottom: 16, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.9 }}>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Which platform should I connect?</div>
                <div>🟠 <strong style={{ color: "var(--text)" }}>MT4/MT5</strong> — FTMO, IC Markets, Pepperstone, FxFlat, and any MT4/MT5 broker</div>
                <div>🟢 <strong style={{ color: "var(--text)" }}>TopstepX</strong> — TopstepX funded accounts only</div>
                <div>🔵 <strong style={{ color: "var(--text)" }}>Tradovate (CSV)</strong> — Apex, Funded Next, Lucid, TopStep futures</div>
                <div>⭐ <strong style={{ color: "var(--text)" }}>Binance / Bybit / Kraken / Coinbase</strong> — crypto exchanges</div>
              </div>
              <Link href="/onboarding">
                <button className="btn-primary" style={{ fontSize: 14 }}>Connect Broker →</button>
              </Link>
            </div>
          )}
        </section>

        {/* Circuit Breaker */}
        <section id="circuit-breaker" className="card" style={{ padding: 28, marginBottom: 20, border: cb?.isActive ? "1px solid rgba(255,59,92,0.3)" : "1px solid var(--border)", borderLeft: "3px solid var(--red)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L2.5 4.5v4C2.5 12 5 14.5 8 15c3-.5 5.5-3 5.5-6.5v-4L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Circuit Breaker</h2>
                {cb?.isActive && (
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 9px", borderRadius: 20, background: "rgba(255,59,92,0.12)", color: "var(--red)", border: "1px solid rgba(255,59,92,0.3)" }}>ACTIVE</div>
                )}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                Automatically blocks access to trading platforms when your daily trade limit is reached — across Chrome, MT4, and MT5.
              </p>
            </div>
            {!cbLoading && (
              <button
                onClick={() => cb ? saveCb({ isActive: !cb.isActive }) : initCb()}
                disabled={cbSaving}
                style={{ width: 48, height: 26, borderRadius: 13, background: cb?.isActive ? "var(--red)" : "var(--surface3)", border: "1px solid var(--border)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: cb?.isActive ? 24 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
              </button>
            )}
          </div>

          {cbLoading ? (
            <div style={{ height: 48, display: "flex", alignItems: "center" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : !cb ? (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Enable the circuit breaker to set it up — it starts inactive until you turn it on.</p>
              <button className="btn-primary" style={{ fontSize: 14 }} onClick={initCb} disabled={cbSaving}>
                {cbSaving ? "Setting up..." : "Set up Circuit Breaker →"}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              {/* Daily limit */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Daily Trade Limit</label>
                  <span className="font-bebas" style={{ fontSize: 28, color: "var(--red)", lineHeight: 1 }}>{cb.dailyLimit}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={cb.dailyLimit}
                  onChange={(e) => setCb((p) => p ? { ...p, dailyLimit: Number(e.target.value) } : p)}
                  onMouseUp={(e) => saveCb({ dailyLimit: Number((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => saveCb({ dailyLimit: Number((e.target as HTMLInputElement).value) })}
                  style={{ width: "100%", marginBottom: 6 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                  <span>1 trade</span><span>20 trades</span>
                </div>
              </div>

              {/* Score-adaptive toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface2)", borderRadius: 10, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Score-Adaptive Limits</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    GO day → full limit · CAUTION day → 50% · NO-TRADE day → 0 trades
                  </div>
                </div>
                <button
                  onClick={() => saveCb({ scoreAdaptive: !cb.scoreAdaptive })}
                  disabled={cbSaving}
                  style={{ width: 44, height: 24, borderRadius: 12, background: cb.scoreAdaptive ? "var(--blue)" : "var(--surface3)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
                >
                  <div style={{ position: "absolute", top: 3, left: cb.scoreAdaptive ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                </button>
              </div>

              {/* Daily reset hour */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface2)", borderRadius: 10, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Daily Reset Time</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    UTC hour when trade count resets each day
                  </div>
                </div>
                <select
                  value={cb.resetHour ?? 0}
                  onChange={(e) => saveCb({ resetHour: Number(e.target.value) })}
                  disabled={cbSaving}
                  style={{ background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, fontWeight: 700, padding: "6px 10px", cursor: "pointer", flexShrink: 0 }}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>{String(h).padStart(2, "0")}:00 UTC</option>
                  ))}
                </select>
              </div>

              {/* How platforms connect */}
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(79,142,247,0.05)", border: "1px solid rgba(79,142,247,0.15)", marginBottom: 20, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.9 }}>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6, fontSize: 12 }}>How to connect each platform</div>
                <div>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>Chrome Extension</span> — Blocks TradingView, thinkorswim, Binance, and 15+ platforms. Install from the link below, paste your token.
                </div>
                <div>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>MT4 / MT5</span> — Attach the EA to any chart. It polls your token every 5 minutes and blocks new orders when blocked.
                </div>
              </div>

              {/* Extension token */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-muted)" }}>EXTENSION TOKEN</label>
                  <button
                    onClick={regenerateCbToken}
                    disabled={cbRegenerating}
                    style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, opacity: cbRegenerating ? 0.5 : 1 }}
                  >
                    {cbRegenerating ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cb.extensionToken}
                  </div>
                  <button
                    className={cbTokenCopied ? "btn-primary" : "btn-ghost"}
                    style={{ padding: "10px 16px", fontSize: 13, flexShrink: 0, transition: "all 0.15s" }}
                    onClick={() => {
                      navigator.clipboard.writeText(cb.extensionToken);
                      setCbTokenCopied(true);
                      setTimeout(() => setCbTokenCopied(false), 2000);
                    }}
                  >
                    {cbTokenCopied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Paste this into the Chrome extension or MT4/MT5 EA input. Regenerating invalidates the old token.</p>
              </div>

              {/* Download links */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="/downloads/trademind-circuit-breaker.zip" download style={{ textDecoration: "none" }}>
                  <button className="btn-ghost" style={{ width: "100%", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    Download Chrome Extension (.zip)
                  </button>
                </a>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href="/downloads/TradeMind_CircuitBreaker.mq4" download style={{ textDecoration: "none", flex: 1 }}>
                    <button className="btn-ghost" style={{ width: "100%", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      MT4 EA (.mq4)
                    </button>
                  </a>
                  <a href="/downloads/TradeMind_CircuitBreaker.mq5" download style={{ textDecoration: "none", flex: 1 }}>
                    <button className="btn-ghost" style={{ width: "100%", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      MT5 EA (.mq5)
                    </button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Check-in reminder */}
        <section className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid #8B5CF6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2.5a4.5 4.5 0 014.5 4.5v2l1.2 2H2.3l1.2-2V7A4.5 4.5 0 018 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 13a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 2.5V1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Check-in Reminder</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>When should we send your daily check-in notification?</p>

          {/* Email reminders toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface2)", borderRadius: 10, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Daily email reminder</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Sent every morning at 7:00 AM if you haven&apos;t checked in</div>
            </div>
            <button
              onClick={toggleEmailReminders}
              style={{ width: 44, height: 24, borderRadius: 12, background: emailReminders ? "var(--blue)" : "var(--surface3)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
            >
              <div style={{ position: "absolute", top: 3, left: emailReminders ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
            </button>
          </div>
          {notifPermission === "unsupported" && (
            <p style={{ fontSize: 13, color: "var(--amber)" }}>Push notifications are not supported in this browser.</p>
          )}
          {notifPermission === "denied" && (
            <p style={{ fontSize: 13, color: "var(--red)" }}>Notifications are blocked. Enable them in your browser settings, then reload.</p>
          )}
          {notifPermission !== "unsupported" && notifPermission !== "denied" && (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                {["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM"].map((t) => (
                  <button key={t} onClick={() => saveReminderTime(t)}
                    className={reminderTime === t ? "btn-primary" : "btn-ghost"}
                    style={{ fontSize: 14, padding: "10px 16px" }}>{t}</button>
                ))}
              </div>
              {notifPermission !== "granted" ? (
                <button className="btn-primary" onClick={handleEnableNotifications} style={{ width: "100%" }}>Enable Notifications</button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--green)" }}>
                  <span>✓</span>
                  <span>{reminderSaved ? "Reminder updated!" : `Daily reminder set for ${reminderTime}`}</span>
                </div>
              )}
            </>
          )}
        </section>

        {/* Plan section */}
        {!planLoading && (
          <section id="plan-section" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 14 }}>YOUR PLAN</h2>

            {/* Current plan badge */}
            {isPro && (
              <div className="card" style={{ padding: 20, marginBottom: 8, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>TradeMind — Active</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Full access to every feature in TradeMind</div>
                </div>
              </div>
            )}
            {isPro && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {/* Billing portal row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>Billing & Invoices</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Update payment method, view invoices, or cancel</div>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "7px 14px", flexShrink: 0 }}
                    disabled={portalLoading}
                    onClick={async () => {
                      setPortalLoading(true);
                      try {
                        const r = await fetch("/api/lemonsqueezy/portal");
                        const { url } = await r.json();
                        window.open(url, "_blank", "noopener");
                      } catch {
                        window.open("https://app.lemonsqueezy.com/my-orders", "_blank", "noopener");
                      } finally {
                        setPortalLoading(false);
                      }
                    }}
                  >
                    {portalLoading ? "Loading…" : "Manage →"}
                  </button>
                </div>
                {/* Pause subscription row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>Pause Subscription</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Take a break — pauses at end of billing period</div>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "7px 14px", flexShrink: 0 }}
                    onClick={() => setShowPauseModal(true)}
                  >
                    Pause →
                  </button>
                </div>
              </div>
            )}

            {/* Pause subscription modal */}
            {showPauseModal && (
              <div
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
                onClick={(e) => { if (e.target === e.currentTarget) setShowPauseModal(false); }}
              >
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 380, width: "100%" }}>
                  {pauseSuccess ? (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,232,122,0.1)", border: "1.5px solid rgba(0,232,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12l5.5 5.5 10.5-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Subscription paused</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                        Your subscription will pause at the end of the current billing period. You&apos;ll keep full access until then.
                      </div>
                      <button className="btn-primary" style={{ width: "100%", fontSize: 13 }} onClick={() => { setShowPauseModal(false); setPauseSuccess(false); }}>
                        Got it
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FBB024", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="3.5" height="10" rx="1" fill="currentColor"/><rect x="8.5" y="2" width="3.5" height="10" rx="1" fill="currentColor"/></svg>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>Pause your subscription?</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                        Your subscription will pause at the <strong style={{ color: "var(--text)" }}>end of the current billing period</strong>. You keep full access until then — no charge during the pause.
                      </div>
                      <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#8B5CF6", flexShrink: 0, marginTop: 1 }}><circle cx="7" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 8.5h4M5.5 10h3M7 11v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        Your streaks, journal, and analytics are saved. Resume anytime from this page.
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-ghost"
                          style={{ flex: 1, fontSize: 13 }}
                          onClick={() => setShowPauseModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-primary"
                          style={{ flex: 1, fontSize: 13, background: "none", border: "1px solid rgba(251,191,36,0.4)", color: "#FBB024" }}
                          disabled={pauseLoading}
                          onClick={async () => {
                            setPauseLoading(true);
                            try {
                              const r = await fetch("/api/lemonsqueezy/pause", { method: "POST" });
                              if (r.ok) {
                                setPauseSuccess(true);
                              } else {
                                const { error } = await r.json();
                                alert(error ?? "Something went wrong. Please manage from your billing portal.");
                              }
                            } catch {
                              alert("Something went wrong. Please try again.");
                            } finally {
                              setPauseLoading(false);
                            }
                          }}
                        >
                          {pauseLoading ? "Pausing…" : "Pause Subscription"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TradeMind upgrade — shown for free users */}
            {!planLoading && !isPro && (
              <div className="card" data-plan="premium" style={{ padding: 24, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.04)" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>TradeMind</div>
                    <div style={{ display: "inline-block", background: "linear-gradient(135deg,#8B5CF6,#6366f1)", color: "white", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 6, marginTop: 4 }}>EVERYTHING INCLUDED</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="font-bebas" style={{ fontSize: 32, color: "#8B5CF6" }}>$39</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/mo</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.6 }}>AI Coach Alex, broker auto-connect, trade journal, 90-day analytics, accountability partners, Trading Playbook, prop firm challenge tracker, and more.</p>
                <button
                  className="btn-primary"
                  style={{ width: "100%", fontSize: 14, padding: "12px", background: "linear-gradient(135deg,#8B5CF6,#6366f1)", border: "none" }}
                  onClick={async () => {
                    setCheckoutLoading(true);
                    try {
                      const r = await fetch("/api/lemonsqueezy/checkout", { method: "POST" });
                      const { url, error } = await r.json();
                      if (error === "already_premium") { window.location.reload(); return; }
                      if (error) { alert(error); return; }
                      window.location.href = url;
                    } catch {
                      alert("Something went wrong. Please try again.");
                    } finally {
                      setCheckoutLoading(false);
                    }
                  }}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Loading..." : "Start 7-Day Free Trial — $39/month"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Data & Tools */}
        <section className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid var(--text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(120,130,150,0.1)", border: "1px solid rgba(120,130,150,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 11v1.5A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Data & Tools</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Monthly Report", desc: "Calendar heatmap + score trend. Save as PDF.", href: "/report", internal: true },
              { label: "Download CSV", desc: "All check-ins and journal entries.", href: "/api/export", internal: false },
            ].map((item, i, arr) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < arr.length - 1 || isPro || userId ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</div>
                </div>
                {item.internal ? (
                  <Link href={item.href}><button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }}>Open →</button></Link>
                ) : (
                  <a href={item.href} download><button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }}>Download</button></a>
                )}
              </div>
            ))}
            {isPro && (
              <div style={{ paddingTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Custom Check-in Question</div>
                </div>
                <input type="text" placeholder="e.g. Did you review your watchlist?" value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)} style={{ marginBottom: 8, fontSize: 13 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }} onClick={() => { localStorage.setItem("trademind_custom_q", customQuestion.trim()); setCustomQSaved(true); setTimeout(() => setCustomQSaved(false), 2000); }}>
                    {customQSaved ? "✓ Saved!" : "Save"}
                  </button>
                  {customQuestion && <button className="btn-ghost" style={{ fontSize: 12, padding: "8px 14px" }} onClick={() => { setCustomQuestion(""); localStorage.removeItem("trademind_custom_q"); }}>Remove</button>}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Display */}
        <section className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid var(--blue)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a6.5 6.5 0 100 13A6.5 6.5 0 008 1.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5C6 4 5 6 5 8s1 4 3 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M1.5 8h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Display</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>OLED Black mode</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>Pure black background — saves battery on AMOLED screens</div>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle OLED mode"
              style={{ width: 48, height: 26, borderRadius: 13, background: theme === "oled" ? "var(--blue)" : "var(--surface3)", border: "1px solid var(--border)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
            >
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: theme === "oled" ? 24 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
            </button>
          </div>
        </section>

        {/* Referral */}
        <section id="referral" className="card" style={{ padding: 28, marginBottom: 20, border: referral && referral.usedCount >= 3 ? "1px solid rgba(0,232,122,0.3)" : "1px solid var(--border)", background: referral && referral.usedCount >= 3 ? "rgba(0,232,122,0.03)" : undefined, borderLeft: "3px solid var(--green)" }}>

          {referral && referral.usedCount >= 3 ? (
            /* === REWARD EARNED STATE === */
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(0,232,122,0.1)", border: "1.5px solid rgba(0,232,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3l2 5h5l-4 3 1.5 5.5L13 14l-4.5 2.5L10 11 6 8h5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 21h10M13 16v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </div>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>You&apos;ve earned a free month!</h2>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20 }}>
                {referral.usedCount} traders joined using your link. Email us to claim your reward — we&apos;ll add 1 month free to your account.
              </p>
              <a
                href={`mailto:support@trademindedge.com?subject=Referral%20Reward%20—%20${encodeURIComponent(referral.code)}&body=Hi%2C%20I%27ve%20referred%20${referral.usedCount}%20traders%20using%20my%20link%20(code%3A%20${encodeURIComponent(referral.code)}).%20Please%20add%201%20free%20month%20to%20my%20account.`}
                style={{ display: "inline-block", background: "linear-gradient(135deg,#00E87A,#00c46a)", color: "#070B14", textDecoration: "none", borderRadius: 10, padding: "12px 32px", fontSize: 14, fontWeight: 700 }}>
                Claim 1 Month Free →
              </a>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
                Or email support@trademindedge.com with subject &ldquo;Referral Reward&rdquo;
              </p>
            </div>
          ) : (
            /* === DEFAULT STATE === */
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="6" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 6V15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 6H5a2 2 0 010-4c1.5 0 3 2 3 4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 6h3a2 2 0 000-4c-1.5 0-3 2-3 4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M1 9h14" stroke="currentColor" strokeWidth="1.3"/></svg>
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Refer &amp; Earn</h2>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#8B5CF6", whiteSpace: "nowrap" }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ marginRight: 4 }}><rect x="0.5" y="4" width="10" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M5.5 4v6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><path d="M5.5 4H3.5a1.5 1.5 0 010-3C4.5 1 5.5 2.5 5.5 4z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><path d="M5.5 4h2a1.5 1.5 0 000-3C6.5 1 5.5 2.5 5.5 4z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><path d="M0.5 6.5h10" stroke="currentColor" strokeWidth="1.1"/></svg>
                  1 month free
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.6 }}>
                Refer 3 traders who start a trial and you get <strong style={{ color: "var(--text)" }}>1 month free</strong> — automatically. Traders refer traders. This is how the best tools spread.
              </p>

              {/* Progress bar */}
              {referral ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Progress toward free month</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: referral.usedCount >= 3 ? "var(--green)" : "var(--text)" }}>
                      {referral.usedCount} / 3 traders
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(90deg, #8B5CF6, #6366f1)",
                      width: `${Math.min(100, (referral.usedCount / 3) * 100)}%`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                  {referral.usedCount === 0 && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Share your link below to get started</p>
                  )}
                  {referral.usedCount === 1 && (
                    <p style={{ fontSize: 12, color: "#8B5CF6", marginTop: 8, fontWeight: 600 }}>1 trader joined — 2 more to earn your free month</p>
                  )}
                  {referral.usedCount === 2 && (
                    <p style={{ fontSize: 12, color: "#8B5CF6", marginTop: 8, fontWeight: 600 }}>2 traders joined — 1 more and you&apos;re there</p>
                  )}
                </div>
              ) : null}

              {/* Link + copy */}
              {referral ? (
                <>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {referral.link}
                    </div>
                    <button
                      className={referralCopied ? "btn-primary" : "btn-ghost"}
                      style={{ padding: "10px 18px", fontSize: 13, flexShrink: 0, transition: "all 0.15s" }}
                      onClick={() => {
                        navigator.clipboard.writeText(referral.link);
                        setReferralCopied(true);
                        setTimeout(() => setReferralCopied(false), 2000);
                      }}>
                      {referralCopied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I've been using TradeMind to track my mental edge before every trade — it's the pre-flight checklist I wish I had years ago. Try it free: ${referral.link}`)}`}
                      target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
                      <button className="btn-ghost" style={{ width: "100%", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 1L8.5 6.5 13.5 13H10L7 9 3.5 13H1L5.5 7.5 0.5 1H4L7 4.5 10.5 1H13Z" fill="currentColor"/></svg>
                        Share on X
                      </button>
                    </a>
                    <button
                      className="btn-ghost"
                      style={{ flex: 1, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      onClick={() => {
                        if (navigator.share) navigator.share({
                          title: "TradeMind — Know your mental edge before you trade",
                          text: "I've been using TradeMind to check my mental state before trading. It's changed how I approach every session. Try it free:",
                          url: referral.link,
                        });
                      }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="11.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="2.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="11.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 7l6-4M10 11L4 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Share
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              )}
            </>
          )}
        </section>

        {/* Public Profile */}
        <section className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid var(--blue)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Public Profile</h2>
            {!isPro && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 6, background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.25)", color: "var(--blue)" }}>PRO</span>}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20, lineHeight: 1.6 }}>
            Share your streak, mental score history, and verified badge publicly. Your email and trade data are never exposed.
          </p>
          {isPro ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: publicProfile ? 16 : 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Enable public profile</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {publicProfile ? `trademindedge.com/u/${userId}` : "Only your streak and scores are visible — no personal info"}
                  </div>
                </div>
                <button
                  onClick={togglePublicProfile}
                  style={{ width: 44, height: 24, borderRadius: 12, background: publicProfile ? "var(--blue)" : "var(--surface3)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
                >
                  <div style={{ position: "absolute", top: 3, left: publicProfile ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                </button>
              </div>
              {publicProfile && userId && (
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {typeof window !== "undefined" ? window.location.origin : "https://trademindedge.com"}/u/{userId}
                  </div>
                  <button className={profileLinkCopied ? "btn-primary" : "btn-ghost"} style={{ padding: "10px 16px", fontSize: 13, flexShrink: 0 }} onClick={copyProfileLink}>
                    {profileLinkCopied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 10, background: "var(--surface2)", border: "1px dashed var(--border)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, color: "var(--text-muted)" }}><rect x="3" y="10" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 10V7a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Unlock with Pro</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>Show your streak and verified badge to the world. Upgrade to enable.</div>
              </div>
              <button className="btn-primary" style={{ fontSize: 12, padding: "8px 14px", flexShrink: 0 }} onClick={() => document.getElementById("plan-section")?.scrollIntoView({ behavior: "smooth" })}>Upgrade →</button>
            </div>
          )}
        </section>

        {/* Streak Freeze — Pro only */}
        {isPro && (
          <section className="card" style={{ padding: 28, marginBottom: 20, border: `1px solid ${freezeAvailable ? "rgba(94,106,210,0.25)" : "var(--border)"}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4, gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Streak Freeze</h2>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                  Miss a day you didn&apos;t earn? Use your monthly freeze to protect your streak. One freeze available per month.
                </p>
              </div>
              <div style={{ fontSize: 24, flexShrink: 0 }}>🧊</div>
            </div>
            <div style={{ marginTop: 16 }}>
              {freezeUsed ? (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)", fontSize: 13, color: "var(--green)", fontWeight: 600 }}>
                  ✓ Streak protected for today
                </div>
              ) : freezeAvailable ? (
                <button
                  className="btn-primary"
                  style={{ width: "100%" }}
                  onClick={useStreakFreeze}
                  disabled={freezeUsing}
                >
                  {freezeUsing ? "Applying freeze..." : "Use Streak Freeze for Today"}
                </button>
              ) : (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)" }}>
                  Freeze already used this month — resets on the 1st
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ */}
        {/* Help */}
        <section className="card" style={{ padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Help & FAQ</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Questions? We respond within a few hours.</div>
          </div>
          <a href="mailto:support@trademindedge.com" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }}>Contact support →</button>
          </a>
        </section>

        {/* Privacy & Data */}
        <section className="card" style={{ padding: 28, marginBottom: 20, borderLeft: "3px solid #8B5CF6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.5 2.5 6.3 6 7 3.5-.7 6-3.5 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 8l1.5 1.5L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Privacy & Data</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20, lineHeight: 1.6 }}>
            Your data belongs to you. Export a full copy at any time, or delete your account permanently.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="btn-ghost"
              style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  const res = await fetch("/api/me/export");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `trademind-export-${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch { alert("Export failed. Try again."); }
                setExporting(false);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M1 10v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {exporting ? "Preparing export..." : "Download my data (JSON)"}
            </button>
          </div>
        </section>

        {/* Danger zone */}
        <section className="card" style={{ padding: 28, border: "1px solid rgba(255,45,45,0.15)", borderLeft: "3px solid var(--red)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 13h13L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11" r="0.6" fill="currentColor"/></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--red)" }}>Danger Zone</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>These actions are permanent and cannot be undone.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button className="btn-ghost" style={{ fontSize: 13, color: "var(--amber)", borderColor: "rgba(255,176,32,0.3)" }}
              onClick={() => {
                if (confirm("Delete all local history?")) {
                  localStorage.removeItem("trademind_history");
                  localStorage.removeItem("trademind_today");
                  alert("Local history deleted.");
                }
              }}>
              Clear local cache
            </button>

            <button
              className="btn-ghost"
              style={{ fontSize: 13, color: "var(--red)", borderColor: "rgba(255,45,45,0.3)" }}
              onClick={() => setDeleteConfirm(true)}
            >
              Delete account permanently
            </button>
          </div>

          {deleteConfirm && (
            <div style={{ padding: "20px", borderRadius: 12, background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)" }}>
              <p style={{ fontSize: 13, color: "var(--red)", fontWeight: 700, marginBottom: 8 }}>⚠ This will delete your account, all check-ins, journal entries, analytics data, and cancel your subscription.</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>Type <strong>DELETE</strong> to confirm:</p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE"
                style={{ marginBottom: 12, fontSize: 13, borderColor: deleteInput === "DELETE" ? "var(--red)" : "var(--border)" }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn-ghost"
                  style={{ flex: 1, fontSize: 13 }}
                  onClick={() => { setDeleteConfirm(false); setDeleteInput(""); }}
                >
                  Cancel
                </button>
                <button
                  style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: deleteInput === "DELETE" ? "var(--red)" : "var(--surface3)", color: "white", border: "none", cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, opacity: deleting ? 0.6 : 1 }}
                  disabled={deleteInput !== "DELETE" || deleting}
                  onClick={async () => {
                    if (deleteInput !== "DELETE") return;
                    setDeleting(true);
                    try {
                      const res = await fetch("/api/me/delete", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ confirm: "DELETE" }),
                      });
                      if (res.ok) {
                        window.location.href = "/?deleted=true";
                      } else {
                        alert("Deletion failed. Contact support@trademindedge.com");
                      }
                    } catch { alert("Network error. Try again."); }
                    setDeleting(false);
                  }}
                >
                  {deleting ? "Deleting..." : "Delete my account"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
