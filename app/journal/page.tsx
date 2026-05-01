"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type TradeEntry = {
  id: string;
  date: string;
  symbol: string | null;
  side: string | null;
  pnl: number | null;
  setup: string | null;
  emotionBefore: number | null;
  emotionAfter: number | null;
  mistake: string | null;
  notes: string | null;
  checkinScore: number | null;
  tags: string | null;
  reflection: string | null;
  chartUrl: string | null;
  createdAt: string;
};

const EMOTIONS = ["😖", "😟", "😐", "😊", "🔥"];
const EMOTION_LABELS = ["Terrible", "Bad", "Neutral", "Good", "Great"];

const PREDEFINED_TAGS = ["FOMO", "Revenge", "Perfect Setup", "Off-plan", "Disciplined", "Breakout", "News", "Scalp", "Swing"];

const TAG_COLORS: Record<string, string> = {
  FOMO: "rgba(255,59,92,0.15)",
  Revenge: "rgba(255,59,92,0.15)",
  "Perfect Setup": "rgba(0,232,122,0.15)",
  "Off-plan": "rgba(255,176,32,0.15)",
  Disciplined: "rgba(0,232,122,0.15)",
  Breakout: "rgba(94,106,210,0.15)",
  News: "rgba(139,92,246,0.15)",
  Scalp: "rgba(94,106,210,0.15)",
  Swing: "rgba(139,92,246,0.15)",
};

const TAG_TEXT_COLORS: Record<string, string> = {
  FOMO: "var(--red)",
  Revenge: "var(--red)",
  "Perfect Setup": "var(--green)",
  "Off-plan": "var(--amber)",
  Disciplined: "var(--green)",
  Breakout: "var(--blue)",
  News: "#8B5CF6",
  Scalp: "var(--blue)",
  Swing: "#8B5CF6",
};

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function EmotionPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {EMOTIONS.map((e, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(value === i + 1 ? null : i + 1)}
          title={EMOTION_LABELS[i]}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${value === i + 1 ? "var(--blue)" : "var(--border)"}`,
            background: value === i + 1 ? "rgba(94,106,210,0.12)" : "var(--surface2)",
            cursor: "pointer", fontSize: 20, transition: "all 0.15s",
            boxShadow: value === i + 1 ? "0 0 12px rgba(94,106,210,0.25)" : "none",
          }}
        >
          {e}
        </button>
      ))}
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Clear"
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function TagPicker({ selected, onChange }: { selected: string[]; onChange: (tags: string[]) => void }) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < 3) {
      onChange([...selected, tag]);
    }
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {PREDEFINED_TAGS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${active ? (TAG_TEXT_COLORS[tag] ?? "var(--blue)") : "var(--border)"}`,
              background: active ? (TAG_COLORS[tag] ?? "rgba(94,106,210,0.12)") : "var(--surface2)",
              color: active ? (TAG_TEXT_COLORS[tag] ?? "var(--blue)") : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

function TagPills({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: TAG_COLORS[tag] ?? "rgba(94,106,210,0.12)",
            color: TAG_TEXT_COLORS[tag] ?? "var(--blue)",
            border: `1px solid ${TAG_TEXT_COLORS[tag] ?? "var(--blue)"}30`,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function pnlColor(pnl: number | null) {
  if (pnl === null) return "var(--text-muted)";
  return pnl > 0 ? "var(--green)" : pnl < 0 ? "var(--red)" : "var(--text-muted)";
}

function formatPnl(pnl: number | null) {
  if (pnl === null) return "—";
  return (pnl >= 0 ? "+" : "") + "$" + Math.abs(pnl).toFixed(2);
}

function FreeBanner({ todayCount }: { todayCount: number }) {
  return (
    <Link href="/settings" style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
      <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", marginBottom: 2 }}>
            Free Plan · {todayCount}/3 trades logged today · Last 7 days
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Upgrade to TradeMind for unlimited journal history, analytics &amp; emotion tracking</div>
        </div>
        <span style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>Upgrade →</span>
      </div>
    </Link>
  );
}

type FormState = {
  symbol: string;
  side: "long" | "short" | "";
  pnl: string;
  setup: string;
  emotionBefore: number | null;
  emotionAfter: number | null;
  mistake: string;
  notes: string;
  tags: string[];
  reflection: string;
  chartUrl: string | null;
};

const EMPTY_FORM: FormState = {
  symbol: "", side: "", pnl: "", setup: "",
  emotionBefore: null, emotionAfter: null,
  mistake: "", notes: "", tags: [], reflection: "", chartUrl: null,
};

export default function JournalPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [allEntries, setAllEntries] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [broker, setBroker] = useState<{ broker: string; status: string; lastSyncAt?: string | null } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [syncImported, setSyncImported] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [showPreCheck, setShowPreCheck] = useState(false);
  const [preCheckAnswers, setPreCheckAnswers] = useState<(boolean | null)[]>([null, null, null]);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ imported: number; skipped: number; format: string } | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [chartUploading, setChartUploading] = useState(false);
  const [chartUploadError, setChartUploadError] = useState<string | null>(null);

  function handleLogClick() {
    if (selectedDate === today) {
      if (todayScore === null) {
        setWarningMsg("You haven't checked in today. Trading without a mental check-in increases your risk of emotional mistakes.");
        setShowWarning(true);
        return;
      }
      if (todayScore < 45) {
        setWarningMsg(`Your mental score is ${todayScore}/100 — NO-TRADE zone. Emotional trading mistakes are significantly more likely on days like this.`);
        setShowWarning(true);
        return;
      }
    }
    // Pre-trade check only for CAUTION days — not for GO days
    if (todayScore !== null && todayScore >= 45 && todayScore < 70) {
      setPreCheckAnswers([null, null, null]);
      setShowPreCheck(true);
      return;
    }
    setShowForm(true);
  }

  useEffect(() => {
    try {
      const todayData = JSON.parse(localStorage.getItem("trademind_today") || "null");
      if (todayData?.date === today) setTodayScore(todayData.score);
    } catch {}
    fetch("/api/me").then((r) => {
      if (r.status === 401) { window.location.href = "/login"; return null; }
      return r.json();
    }).then((d) => { if (d) { setIsPro(d.plan === "pro" || d.plan === "premium"); } }).catch(() => setIsPro(false));
    fetch("/api/broker").then((r) => r.json()).then((d) => {
      if (d.connected) {
        setBroker(d);
        autoSync();
      }
    }).catch(() => {});
  }, [today]);

  useEffect(() => {
    if (isPro === false) return;
    fetch("/api/journal?date=all&limit=500")
      .then((r) => r.json())
      .then((d) => { if (d.entries) setAllEntries(d.entries); })
      .catch(() => {});
  }, [isPro]);

  // Keep ChallengeTracker localStorage in sync with journal entries
  useEffect(() => {
    if (!allEntries.length) return;
    const journalPnl: Record<string, number> = {};
    for (const e of allEntries) {
      if (e.pnl !== null) journalPnl[e.date] = (journalPnl[e.date] ?? 0) + e.pnl;
    }
    try {
      const stored: Record<string, number> = JSON.parse(localStorage.getItem("trademind_challenge_pnl") || "{}");
      localStorage.setItem("trademind_challenge_pnl", JSON.stringify({ ...stored, ...journalPnl }));
    } catch {}
  }, [allEntries]);

  useEffect(() => {
    if (isPro === false) return;
    setLoading(true);
    fetch(`/api/journal?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) return; setEntries(d.entries ?? []); })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selectedDate, isPro]);

  async function autoSync() {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/broker/sync-journal", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setSyncImported(data.imported ?? 0);
        setSyncStatus("done");
        if ((data.imported ?? 0) > 0) showToast(`${data.imported} new trade${data.imported !== 1 ? "s" : ""} imported`, "success");
        fetch(`/api/journal?date=${selectedDate}`).then((r) => r.json()).then((d) => setEntries(d.entries ?? []));
        fetch("/api/journal?date=all&limit=500").then((r) => r.json()).then((d) => { if (d.entries) setAllEntries(d.entries); });
      } else {
        setSyncStatus("error");
        showToast(data.error ?? "Broker sync failed — check your connection", "error");
      }
    } catch {
      setSyncStatus("error");
      showToast("Broker sync failed — network error", "error");
    }
  }

  async function syncBroker() {
    setSyncing(true);
    await autoSync();
    setSyncing(false);
  }

  async function handleSave() {
    setSaving(true);
    const parsedPnl = form.pnl.trim() !== "" ? parseFloat(form.pnl) : null;
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          symbol: form.symbol || null,
          side: form.side || null,
          pnl: Number.isNaN(parsedPnl) ? null : parsedPnl,
          setup: form.setup || null,
          emotionBefore: form.emotionBefore,
          emotionAfter: form.emotionAfter,
          mistake: form.mistake || null,
          notes: form.notes || null,
          checkinScore: todayScore,
          tags: form.tags.length > 0 ? form.tags : null,
          reflection: form.reflection || null,
          chartUrl: form.chartUrl || null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setEntries((prev) => [data.entry, ...prev]);
        setAllEntries((prev) => [data.entry, ...prev]);
        setShowForm(false);
        setForm(EMPTY_FORM);
        showToast("Trade saved", "success");
      } else {
        showToast(data.error ?? "Failed to save trade — try again", "error");
      }
    } catch {
      showToast("Network error — trade not saved", "error");
    }
    setSaving(false);
  }

  async function handleEdit(entry: TradeEntry) {
    setEditingId(entry.id);
    setEditForm({
      symbol: entry.symbol ?? "",
      side: (entry.side as "long" | "short" | "") ?? "",
      pnl: entry.pnl !== null ? String(entry.pnl) : "",
      setup: entry.setup ?? "",
      emotionBefore: entry.emotionBefore,
      emotionAfter: entry.emotionAfter,
      mistake: entry.mistake ?? "",
      notes: entry.notes ?? "",
      tags: parseTags(entry.tags),
      reflection: entry.reflection ?? "",
      chartUrl: entry.chartUrl ?? null,
    });
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    const parsedPnl = editForm.pnl.trim() !== "" ? parseFloat(editForm.pnl) : null;
    try {
      const res = await fetch(`/api/journal?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: editForm.symbol || null,
          side: editForm.side || null,
          pnl: Number.isNaN(parsedPnl) ? null : parsedPnl,
          setup: editForm.setup || null,
          emotionBefore: editForm.emotionBefore,
          emotionAfter: editForm.emotionAfter,
          mistake: editForm.mistake || null,
          notes: editForm.notes || null,
          tags: editForm.tags.length > 0 ? editForm.tags : null,
          reflection: editForm.reflection || null,
          chartUrl: editForm.chartUrl || null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setEntries((prev) => prev.map((e) => e.id === id ? data.entry : e));
        setAllEntries((prev) => prev.map((e) => e.id === id ? data.entry : e));
        setEditingId(null);
        showToast("Trade updated", "success");
      } else {
        showToast(data.error ?? "Failed to save — try again", "error");
      }
    } catch {
      showToast("Network error — changes not saved", "error");
    }
    setSaving(false);
  }

  async function handleChartUpload(file: File, setter: (url: string | null) => void) {
    setChartUploading(true);
    setChartUploadError(null);
    try {
      if (file.size > 10 * 1024 * 1024) {
        setChartUploadError("File is too large — max 10 MB. Try compressing the image.");
        setChartUploading(false);
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/chart", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setChartUploadError(data.error ?? "Upload failed — try a smaller file or different format.");
      } else {
        setter(data.url);
      }
    } catch {
      setChartUploadError("Upload failed — check your connection and try again.");
    }
    setChartUploading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this trade? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setAllEntries((prev) => prev.filter((e) => e.id !== id));
      showToast("Trade deleted", "info");
    } catch {
      showToast("Couldn't delete — try again", "error");
    }
    setDeletingId(null);
  }

  async function handleCsvUpload(file: File) {
    setCsvUploading(true);
    setCsvResult(null);
    setCsvError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/broker/csv-import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setCsvError(data.error ?? "Import failed");
      } else {
        setCsvResult({ imported: data.imported ?? 0, skipped: data.skipped ?? 0, format: data.format ?? "auto" });
        fetch("/api/journal?date=all&limit=500").then((r) => r.json()).then((d) => { if (d.entries) setAllEntries(d.entries); });
        fetch(`/api/journal?date=${selectedDate}`).then((r) => r.json()).then((d) => { if (!d.error) setEntries(d.entries ?? []); });
        setTimeout(() => { setShowCsvImport(false); setCsvResult(null); }, 2500);
      }
    } catch {
      setCsvError("Upload failed. Please try again.");
    }
    setCsvUploading(false);
  }

  const totalPnl = entries.reduce((s, e) => s + (e.pnl ?? 0), 0);
  const hasPnl = entries.some((e) => e.pnl !== null);

  const allPnl = allEntries.reduce((s, e) => s + (e.pnl ?? 0), 0);
  const allWithPnl = allEntries.filter((e) => e.pnl !== null);
  const allWinners = allWithPnl.filter((e) => (e.pnl ?? 0) > 0).length;
  const allWinRate = allWithPnl.length > 0 ? Math.round((allWinners / allWithPnl.length) * 100) : null;

  const recentDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  if (isPro === null) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} className="has-bottom-nav">
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <BottomNav />
      </div>
    );
  }

  const isFree = isPro === false;
  const todayEntryCount = isFree && selectedDate === today ? entries.length : 0;

  function TradeForm({
    f, setF, onSave, onCancel, label,
  }: {
    f: FormState;
    setF: (v: FormState) => void;
    onSave: () => void;
    onCancel: () => void;
    label: string;
  }) {
    return (
      <div className="card" style={{ padding: 24, marginBottom: 20, border: "1px solid rgba(94,106,210,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="font-bebas" style={{ fontSize: 22, letterSpacing: "0.04em" }}>{label}</div>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>SYMBOL</label>
              <input
                type="text" placeholder="AAPL, BTC, ES..." value={f.symbol}
                onChange={(e) => setF({ ...f, symbol: e.target.value.toUpperCase() })}
                style={{ fontFamily: "var(--font-geist-mono)", fontSize: 15, textTransform: "uppercase" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>SIDE</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["long", "short"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setF({ ...f, side: s })}
                    style={{ padding: "10px 16px", borderRadius: 8, border: `1.5px solid ${f.side === s ? (s === "long" ? "var(--green)" : "var(--red)") : "var(--border)"}`, background: f.side === s ? (s === "long" ? "rgba(0,232,122,0.1)" : "rgba(255,59,92,0.1)") : "var(--surface2)", color: f.side === s ? (s === "long" ? "var(--green)" : "var(--red)") : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                    {s === "long" ? "▲ Long" : "▼ Short"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>P&L ($)</label>
            <input
              type="number" placeholder="+250 or -120" value={f.pnl}
              onChange={(e) => setF({ ...f, pnl: e.target.value })}
              step="0.01"
              style={{ fontFamily: "var(--font-geist-mono)", fontSize: 15, color: parseFloat(f.pnl) > 0 ? "var(--green)" : parseFloat(f.pnl) < 0 ? "var(--red)" : undefined }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>SETUP / THESIS</label>
            <textarea
              placeholder="Why did you enter this trade?" value={f.setup}
              onChange={(e) => setF({ ...f, setup: e.target.value })}
              rows={2} style={{ resize: "vertical", fontSize: 14 }}
            />
          </div>

          {isFree && (
            <Link href="/settings" style={{ textDecoration: "none" }}>
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(139,92,246,0.05)", border: "1px dashed rgba(139,92,246,0.25)", fontSize: 12, color: "var(--text-muted)" }}>
                🔒 <strong style={{ color: "var(--blue)" }}>Upgrade to TradeMind</strong> for unlimited journal history, 90-day analytics, and emotion tracking
              </div>
            </Link>
          )}

          {isPro && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>
                EMOTION BEFORE {f.emotionBefore ? `— ${EMOTION_LABELS[f.emotionBefore - 1]}` : ""}
              </label>
              <EmotionPicker value={f.emotionBefore} onChange={(v) => setF({ ...f, emotionBefore: v })} />
            </div>
          )}

          {isPro && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>
                EMOTION AFTER {f.emotionAfter ? `— ${EMOTION_LABELS[f.emotionAfter - 1]}` : ""}
              </label>
              <EmotionPicker value={f.emotionAfter} onChange={(v) => setF({ ...f, emotionAfter: v })} />
            </div>
          )}

          {isPro && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>TAGS (max 3)</label>
              <TagPicker selected={f.tags} onChange={(tags) => setF({ ...f, tags })} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>WHAT WENT WRONG? (optional)</label>
            <input type="text" placeholder="Entered too early, chased, ignored stop loss..." value={f.mistake} onChange={(e) => setF({ ...f, mistake: e.target.value })} style={{ fontSize: 14 }} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>NOTES (optional)</label>
            <textarea placeholder="Anything else..." value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} style={{ resize: "vertical", fontSize: 14 }} />
          </div>

          {isPro && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>REFLECTION (optional)</label>
              <textarea
                placeholder="What did you learn from this trade? What will you do differently?"
                value={f.reflection}
                onChange={(e) => setF({ ...f, reflection: e.target.value })}
                rows={2} style={{ resize: "vertical", fontSize: 14 }}
              />
            </div>
          )}

          {isPro && (
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.07em", fontWeight: 700, display: "block", marginBottom: 8 }}>
                CHART SCREENSHOT (optional)
                {!isPro && <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 10, marginLeft: 6 }}>5/month · unlimited on TradeMind</span>}
              </label>
              {f.chartUrl ? (
                <div style={{ position: "relative" }}>
                  <img src={f.chartUrl} alt="Chart" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)", display: "block" }} />
                  <button
                    onClick={() => setF({ ...f, chartUrl: null })}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", color: "white", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                  >Remove</button>
                </div>
              ) : (
                <label style={{ display: "block", border: "1px dashed var(--border)", borderRadius: 8, padding: "16px", textAlign: "center", cursor: chartUploading ? "not-allowed" : "pointer", color: "var(--text-muted)", fontSize: 13 }}>
                  {chartUploading ? "Uploading..." : "Click to upload PNG, JPG, or WebP (max 10 MB)"}
                  <input type="file" accept="image/*" style={{ display: "none" }} disabled={chartUploading}
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleChartUpload(file, (url) => setF({ ...f, chartUrl: url })); e.target.value = ""; }}
                  />
                </label>
              )}
              {chartUploadError && (
                <div style={{ fontSize: 12, color: "var(--red)", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span>{chartUploadError}</span>
                  <button
                    type="button"
                    onClick={() => setChartUploadError(null)}
                    style={{ fontSize: 11, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", flexShrink: 0 }}
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="btn-primary" onClick={onSave} disabled={saving} style={{ padding: 14, fontSize: 15 }}>
            {saving ? "Saving..." : "Save Trade →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">

      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <span className="font-bebas" style={{ fontSize: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>JOURNAL</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        {/* First-time empty state */}
        {!loading && allEntries.length === 0 && (
          <div className="card" style={{ padding: 32, marginBottom: 24, border: "1px solid rgba(94,106,210,0.2)", background: "rgba(94,106,210,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📓</div>
            <div className="font-bebas" style={{ fontSize: 28, marginBottom: 8, letterSpacing: "0.03em" }}>Log Your First Trade</div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 0, maxWidth: 380, margin: "0 auto" }}>
              Every great trader keeps a journal. Log your symbol, P&L, and what you were thinking — over time, the patterns become undeniable.
            </p>
          </div>
        )}

        {/* All-time stats bar */}
        {allEntries.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            <div className="card" style={{ padding: "14px 12px", textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 22, color: pnlColor(allPnl), lineHeight: 1 }}>
                {allPnl >= 0 ? "+" : ""}${Math.abs(allPnl).toFixed(0)}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em" }}>ALL-TIME P&L</div>
            </div>
            <div className="card" style={{ padding: "14px 12px", textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 22, color: allWinRate !== null && allWinRate >= 50 ? "var(--green)" : "var(--red)", lineHeight: 1 }}>
                {allWinRate !== null ? `${allWinRate}%` : "—"}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em" }}>WIN RATE</div>
            </div>
            <div className="card" style={{ padding: "14px 12px", textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 22, color: "var(--blue)", lineHeight: 1 }}>{allEntries.length}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em" }}>TOTAL TRADES</div>
            </div>
          </div>
        )}

        {/* Date strip */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
          {recentDates.map((d) => {
            const isToday = d === today;
            const isSelected = d === selectedDate;
            const label = isToday ? "Today" : new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                style={{
                  flexShrink: 0, padding: "8px 16px", borderRadius: 20,
                  border: `1.5px solid ${isSelected ? "var(--blue)" : "var(--border)"}`,
                  background: isSelected ? "rgba(94,106,210,0.12)" : "var(--surface2)",
                  color: isSelected ? "var(--blue)" : "var(--text-muted)",
                  cursor: "pointer", fontSize: 12, fontWeight: isSelected ? 700 : 400,
                  whiteSpace: "nowrap", transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Broker sync bar */}
        {broker ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: broker.status === "active" ? "var(--green)" : "var(--amber)", flexShrink: 0 }} />
              <span style={{ textTransform: "capitalize", fontWeight: 600, color: "var(--text)" }}>{broker.broker}</span>
              {syncStatus === "syncing" && <span>Syncing...</span>}
              {syncStatus === "done" && <span style={{ color: "var(--green)" }}>✓ {syncImported > 0 ? `${syncImported} new trade${syncImported !== 1 ? "s" : ""} imported` : "Up to date"}</span>}
              {syncStatus === "error" && <span style={{ color: "var(--red)" }}>Sync failed</span>}
              {syncStatus === "idle" && broker.lastSyncAt && (
                <span>Updated {(() => { const m = Math.round((Date.now() - new Date(broker.lastSyncAt).getTime()) / 60000); return m < 60 ? `${m}m ago` : `${Math.round(m/60)}h ago`; })()}</span>
              )}
            </div>
            <button onClick={syncBroker} disabled={syncing || syncStatus === "syncing"}
              style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--blue)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {syncing ? "Syncing..." : "↻ Sync Now"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <Link href="/onboarding" style={{ textDecoration: "none", flex: 1 }}>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface2)", border: "1px dashed var(--border)", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Connect Broker</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Auto-sync your trades</div>
              </div>
            </Link>
            <button onClick={() => { setShowCsvImport(true); setCsvResult(null); setCsvError(null); }}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px dashed rgba(94,106,210,0.4)", background: "rgba(94,106,210,0.05)", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>📥 Import CSV</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Tradovate, MT4, NinjaTrader</div>
            </button>
          </div>
        )}

        {isFree && <FreeBanner todayCount={todayEntryCount} />}

        {/* Day summary */}
        {hasPnl && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div className="card" style={{ padding: "16px 12px", textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 28, color: pnlColor(totalPnl), lineHeight: 1 }}>
                {formatPnl(totalPnl)}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em" }}>TOTAL P&L</div>
            </div>
            <div className="card" style={{ padding: "16px 12px", textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 28, color: "var(--blue)", lineHeight: 1 }}>{entries.length}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em" }}>TRADES</div>
            </div>
            <div className="card" style={{ padding: "16px 12px", textAlign: "center" }}>
              <div className="font-bebas" style={{ fontSize: 28, color: todayScore !== null ? (todayScore >= 70 ? "var(--green)" : todayScore >= 45 ? "var(--amber)" : "var(--red)") : "var(--text-muted)", lineHeight: 1 }}>
                {todayScore ?? "—"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em" }}>MENTAL SCORE</div>
            </div>
          </div>
        )}

        {/* Pre-trade check modal */}
        {showPreCheck && (() => {
          const PRE_QUESTIONS = [
            { q: "Is this trade part of your plan or playbook?", warn: false },
            { q: "Are you feeling emotional or impulsive right now?", warn: true },
            { q: "Have you defined your risk/reward for this trade?", warn: false },
          ];
          const allAnswered = preCheckAnswers.every((a) => a !== null);
          const emotional = preCheckAnswers[1] === true;
          const offPlan = preCheckAnswers[0] === false;
          const noRR = preCheckAnswers[2] === false;
          const hasRisk = emotional || offPlan || noRR;
          return (
            <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(7,11,20,0.92)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div className="card" style={{ maxWidth: 420, width: "100%", padding: 28, border: "1px solid rgba(94,106,210,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div className="font-bebas" style={{ fontSize: 22, letterSpacing: "0.04em", color: "var(--blue)" }}>PRE-TRADE CHECK</div>
                  <button onClick={() => setShowPreCheck(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
                  {PRE_QUESTIONS.map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8, lineHeight: 1.5 }}>{item.q}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[{ label: "Yes", val: true }, { label: "No", val: false }].map(({ label, val }) => {
                          const active = preCheckAnswers[i] === val;
                          const isRisk = (item.warn && val === true) || (!item.warn && val === false);
                          return (
                            <button key={label} onClick={() => setPreCheckAnswers((prev) => prev.map((a, idx) => idx === i ? val : a))}
                              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${active ? (isRisk ? "var(--red)" : "var(--green)") : "var(--border)"}`, background: active ? (isRisk ? "rgba(255,59,92,0.1)" : "rgba(0,232,122,0.1)") : "var(--surface2)", color: active ? (isRisk ? "var(--red)" : "var(--green)") : "var(--text-muted)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {allAnswered && hasRisk && (
                  <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(255,176,32,0.07)", border: "1px solid rgba(255,176,32,0.25)", marginBottom: 16, fontSize: 12, color: "var(--amber)", lineHeight: 1.6 }}>
                    {emotional ? "⚠️ You're feeling emotional — high-risk state. Consider sitting this one out." : offPlan ? "⚠️ Off-plan trades have lower win rates. Proceed with caution." : "⚠️ No R/R defined means undefined risk. Set your stop before entering."}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn-primary" disabled={!allAnswered} onClick={() => { setShowPreCheck(false); setShowForm(true); }} style={{ padding: 13, fontSize: 14 }}>
                    {!allAnswered ? "Answer all questions" : hasRisk ? "Proceed anyway →" : "All clear — log trade →"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Warning modal */}
        {showWarning && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(7,11,20,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="card" style={{ maxWidth: 400, width: "100%", padding: 28, border: "1px solid rgba(255,176,32,0.3)" }}>
              <div style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}>⚠️</div>
              <div className="font-bebas" style={{ fontSize: 24, textAlign: "center", color: "var(--amber)", marginBottom: 12, letterSpacing: "0.04em" }}>
                {todayScore === null ? "NO CHECK-IN YET" : "LOW MENTAL SCORE"}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, textAlign: "center", marginBottom: 24 }}>
                {warningMsg}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/checkin" style={{ textDecoration: "none" }}>
                  <button className="btn-primary" style={{ width: "100%", padding: 13, fontSize: 14 }}>
                    {todayScore === null ? "Do Check-in First →" : "Update Check-in →"}
                  </button>
                </a>
                <button
                  className="btn-ghost"
                  style={{ width: "100%", padding: 13, fontSize: 13, color: "var(--text-muted)" }}
                  onClick={() => { setShowWarning(false); setShowForm(true); }}
                >
                  Log anyway (not recommended)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV import modal */}
        {showCsvImport && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(7,11,20,0.92)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="card" style={{ maxWidth: 440, width: "100%", padding: 28, border: "1px solid rgba(94,106,210,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="font-bebas" style={{ fontSize: 22, letterSpacing: "0.04em" }}>IMPORT CSV</div>
                <button onClick={() => { setShowCsvImport(false); setCsvResult(null); setCsvError(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
              </div>

              {!csvResult ? (
                <>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20 }}>
                    Import your trade history from a CSV export. Supported formats are auto-detected.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                    {["MT4 / MT5", "Tradovate", "NinjaTrader", "Generic"].map((fmt) => (
                      <span key={fmt} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{fmt}</span>
                    ))}
                  </div>
                  <label style={{ display: "block", padding: "28px 20px", borderRadius: 12, border: "2px dashed var(--border)", textAlign: "center", cursor: csvUploading ? "wait" : "pointer", background: "var(--surface2)", transition: "border-color 0.15s" }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleCsvUpload(f); }}>
                    <input type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }} disabled={csvUploading} />
                    {csvUploading ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Importing...</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "var(--blue)" }}><path d="M16 20V8M16 20l-4-4M16 20l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 24h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Drop CSV here or click to browse</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Format is auto-detected</span>
                      </div>
                    )}
                  </label>
                  {csvError && (
                    <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(255,59,92,0.07)", border: "1px solid rgba(255,59,92,0.25)", fontSize: 13, color: "var(--red)" }}>
                      {csvError}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{csvResult.imported > 0 ? "✅" : "📭"}</div>
                  <div className="font-bebas" style={{ fontSize: 32, letterSpacing: "0.04em", marginBottom: 8 }}>
                    {csvResult.imported > 0 ? `${csvResult.imported} Trade${csvResult.imported !== 1 ? "s" : ""} Imported` : "Nothing New"}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 24 }}>
                    Format detected: <strong style={{ color: "var(--text)" }}>{csvResult.format.toUpperCase()}</strong>
                    {csvResult.skipped > 0 && <> · {csvResult.skipped} duplicate{csvResult.skipped !== 1 ? "s" : ""} skipped</>}
                  </p>
                  <button className="btn-primary" onClick={() => { setShowCsvImport(false); setCsvResult(null); }} style={{ padding: "12px 32px", fontSize: 14 }}>Done</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Log trade button */}
        {!showForm && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {isFree && todayEntryCount >= 3 ? (
              <Link href="/settings" style={{ textDecoration: "none", flex: 1 }}>
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(139,92,246,0.07)", border: "1px dashed rgba(139,92,246,0.3)", textAlign: "center", fontSize: 13, color: "#8B5CF6", fontWeight: 700 }}>
                  Daily limit reached · Upgrade for unlimited →
                </div>
              </Link>
            ) : (
              <button
                className="btn-primary"
                onClick={handleLogClick}
                style={{ flex: 1, padding: 14, fontSize: 15 }}
              >
                + Log a Trade
              </button>
            )}
            <button
              onClick={() => { setShowCsvImport(true); setCsvResult(null); setCsvError(null); }}
              style={{ padding: "14px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text-muted)", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              ↑ CSV
            </button>
          </div>
        )}


        {/* Trade log form */}
        {showForm && (
          <TradeForm
            f={form}
            setF={setForm}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setForm(EMPTY_FORM); }}
            label="Log a Trade"
          />
        )}

        {/* Entries list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
        ) : entries.length === 0 ? (
          selectedDate === today ? (() => {
            const goEntries = allEntries.filter((e) => (e.checkinScore ?? 0) >= 70 && e.pnl !== null);
            const goWins = goEntries.filter((e) => (e.pnl ?? 0) > 0).length;
            const goWinRate = goEntries.length >= 5 ? Math.round((goWins / goEntries.length) * 100) : null;
            const sc = todayScore;
            const sColor = sc !== null ? (sc >= 70 ? "var(--green)" : sc >= 45 ? "var(--amber)" : "var(--red)") : "var(--text-muted)";
            const sLabel = sc !== null ? (sc >= 70 ? "GO" : sc >= 45 ? "CAUTION" : "NO-TRADE") : null;
            return (
              <div className="card" style={{ padding: 36, textAlign: "center", border: `1px dashed ${sColor}40` }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>🧠</div>
                {sc !== null ? (
                  <>
                    <div className="font-bebas" style={{ fontSize: 32, color: sColor, marginBottom: 6, letterSpacing: "0.04em" }}>{sLabel} · {sc}/100</div>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 0 }}>
                      {sc >= 70
                        ? goWinRate !== null
                          ? `On your GO days you win ${goWinRate}% of trades. Your mind is ready — execute your plan.`
                          : "Your mind is sharp today. Execute your plan."
                        : sc >= 45
                        ? goWinRate !== null
                          ? `GO-day win rate: ${goWinRate}%. Today is CAUTION — trade smaller and be selective.`
                          : "CAUTION day. Size down and be very selective."
                        : "NO-TRADE zone. Protecting capital on bad mental days is a winning move."}
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>No check-in yet today</div>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 20 }}>
                      Complete your check-in before logging trades — your mental state predicts your results.
                    </p>
                    <a href="/checkin" style={{ textDecoration: "none" }}>
                      <button className="btn-primary" style={{ fontSize: 13, padding: "10px 24px" }}>Start Check-in →</button>
                    </a>
                  </>
                )}
              </div>
            );
          })() : (
          <div className="card" style={{ padding: 40, textAlign: "center", border: "1px dashed var(--border)" }}>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", color: "var(--text-muted)" }}><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="8" y="5" width="24" height="30" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M14 14h12M14 20h12M14 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>No trades logged on this day</div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
              Log every trade — wins, losses, and flat. The journal reveals your patterns.
            </p>
          </div>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.map((entry) => {
              const entryTags = parseTags(entry.tags);
              const isEditing = editingId === entry.id;
              return (
                <div key={entry.id} className="card" style={{ padding: 20, position: "relative" }}>
                  {isEditing ? (
                    <TradeForm
                      f={editForm}
                      setF={setEditForm}
                      onSave={() => handleSaveEdit(entry.id)}
                      onCancel={() => setEditingId(null)}
                      label="Edit Trade"
                    />
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: entryTags.length > 0 || entry.setup || entry.pnl !== null ? 10 : 0, flexWrap: "wrap" }}>
                        {entry.symbol && (
                          <span className="font-bebas" style={{ fontSize: 20, letterSpacing: "0.04em" }}>{entry.symbol}</span>
                        )}
                        {entry.side && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: entry.side === "long" ? "rgba(0,232,122,0.12)" : "rgba(255,59,92,0.12)", color: entry.side === "long" ? "var(--green)" : "var(--red)", letterSpacing: "0.06em" }}>
                            {entry.side.toUpperCase()}
                          </span>
                        )}
                        {entry.checkinScore !== null && (() => {
                          const sc = entry.checkinScore;
                          const sColor = sc >= 70 ? "var(--green)" : sc >= 45 ? "var(--amber)" : "var(--red)";
                          const sBg = sc >= 70 ? "rgba(0,232,122,0.1)" : sc >= 45 ? "rgba(255,176,32,0.1)" : "rgba(255,59,92,0.1)";
                          const sLabel = sc >= 70 ? "GO" : sc >= 45 ? "CAUTION" : "NO-TRADE";
                          return (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: sBg, color: sColor, letterSpacing: "0.04em", border: `1px solid ${sColor}30` }}>
                              🧠 {sLabel} · {sc}
                            </span>
                          );
                        })()}
                        {entry.pnl !== null && (
                          <span className="font-bebas" style={{ fontSize: 20, color: pnlColor(entry.pnl), marginLeft: "auto" }}>
                            {formatPnl(entry.pnl)}
                          </span>
                        )}
                        <button
                          onClick={() => handleEdit(entry)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "0 4px", marginLeft: entry.pnl === null ? "auto" : 0 }}
                          title="Edit"
                        >✏</button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          style={{ background: "none", border: "none", color: deletingId === entry.id ? "var(--surface3)" : "var(--text-muted)", cursor: deletingId === entry.id ? "default" : "pointer", fontSize: 16, padding: "0 4px" }}
                          title="Delete"
                        >{deletingId === entry.id ? "…" : "×"}</button>
                      </div>

                      {entryTags.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <TagPills tags={entryTags} />
                        </div>
                      )}

                      {entry.setup && (
                        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 10 }}>{entry.setup}</p>
                      )}

                      {(entry.emotionBefore || entry.emotionAfter) && (
                        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)", marginBottom: entry.mistake || entry.notes ? 10 : 0 }}>
                          {entry.emotionBefore && <span>Before: {EMOTIONS[entry.emotionBefore - 1]} {EMOTION_LABELS[entry.emotionBefore - 1]}</span>}
                          {entry.emotionAfter && <span>After: {EMOTIONS[entry.emotionAfter - 1]} {EMOTION_LABELS[entry.emotionAfter - 1]}</span>}
                        </div>
                      )}

                      {entry.mistake && (
                        <div style={{ fontSize: 12, color: "var(--amber)", background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.15)", borderRadius: 8, padding: "6px 12px", marginBottom: entry.notes ? 8 : 0 }}>
                          ⚠️ {entry.mistake}
                        </div>
                      )}

                      {entry.notes && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 4 }}>{entry.notes}</p>
                      )}

                      {entry.reflection && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-dim)", background: "rgba(94,106,210,0.05)", border: "1px solid rgba(94,106,210,0.15)", borderRadius: 8, padding: "8px 12px", fontStyle: "italic", lineHeight: 1.5 }}>
                          💭 {entry.reflection}
                        </div>
                      )}

                      {entry.chartUrl && (
                        <div style={{ marginTop: 10 }}>
                          <a href={entry.chartUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={entry.chartUrl}
                              alt="Trade chart"
                              style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)", display: "block", maxHeight: 300, objectFit: "contain", background: "var(--surface2)" }}
                            />
                          </a>
                        </div>
                      )}

                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                        {new Date(entry.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cross-link to analytics */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 24px", width: "100%" }}>
        <Link href="/analytics" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "var(--blue)", flexShrink: 0 }}><path d="M2.5 13l3.5-4.5 3 3 4-6 2.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 15.5h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, color: "var(--text-dim)" }}>See how your journal data shapes your analytics</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700 }}>Analytics →</span>
          </div>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}