"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Rule = {
  id: string;
  text: string;
  category: "Entry" | "Exit" | "Risk" | "Mindset";
  enabled: boolean;
};

const CATEGORIES = ["Entry", "Exit", "Risk", "Mindset"] as const;
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  Entry:   { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: "var(--green)", desc: "When and how you get in" },
  Exit:    { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: "var(--red)", desc: "When and how you get out" },
  Risk:    { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l5 2.5v3c0 2.8-2.1 5.4-5 6.2-2.9-.8-5-3.4-5-6.2V4L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>, color: "var(--amber)", desc: "Protecting your capital" },
  Mindset: { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 13c0-2.2 2.2-4 5-4s5 1.8 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 3.5l1-.8M11.5 5h.8M10 6.5l1 .8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>, color: "var(--blue)", desc: "Mental rules and habits" },
};

const STARTER_RULES: Rule[] = [
  { id: "s1", text: "Only enter if setup matches my criteria — no FOMO entries", category: "Entry", enabled: true },
  { id: "s2", text: "Wait for confirmation before entering (at least 1 candle close)", category: "Entry", enabled: true },
  { id: "s3", text: "Define exit target before entering every trade", category: "Exit", enabled: true },
  { id: "s4", text: "Never move stop loss against the trade", category: "Exit", enabled: true },
  { id: "s5", text: "Max 1% account risk per trade", category: "Risk", enabled: true },
  { id: "s6", text: "Stop trading after 2 consecutive losses", category: "Risk", enabled: true },
  { id: "s7", text: "Do not trade if mental score is below 45", category: "Mindset", enabled: true },
  { id: "s8", text: "Journal every trade — win or lose", category: "Mindset", enabled: true },
];

function PremiumUpsell() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <div className="app-header">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Home</button>
        </Link>
        <span className="font-bebas" style={{ fontSize: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>PLAYBOOK</span>
      </div>
      <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center", color: "var(--blue)" }}><svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="10" y="8" width="36" height="40" rx="5" stroke="currentColor" strokeWidth="2.5"/><path d="M19 21h18M19 29h18M19 37h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></div>
        <div className="font-bebas" style={{ fontSize: 44, lineHeight: 1, marginBottom: 12 }}>Trading Playbook</div>
        <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 32 }}>
          Write your trading rules once. TradeMind shows them to you before every check-in — so you never forget your own plan.
        </p>
        <div className="card" style={{ padding: 28, marginBottom: 24, border: "1px solid rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#8B5CF6", marginBottom: 16 }}>PREMIUM FEATURES INCLUDED</div>
          {["Trading rules by category (Entry/Exit/Risk/Mindset)", "Shown before every check-in as a reminder", "8 starter rules to get you going", "Broker auto-connect (MT4/MT5 via MetaAPI)", "Deep behavioral pattern detection", "Priority support & early feature access"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14, color: "var(--text-dim)", textAlign: "left" }}>
              <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>{f}
            </div>
          ))}
          <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="font-bebas" style={{ fontSize: 48 }}>$39</span>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>/month • 7-day trial • Cancel anytime</span>
          </div>
        </div>
        <Link href="/settings"><button className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 16 }}>Start 7-Day Free Trial →</button></Link>
      </div>
      <BottomNav />
    </div>
  );
}

export default function PlaybookPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"Entry" | "Exit" | "Risk" | "Mindset">("Entry");
  const [newRuleText, setNewRuleText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetch("/api/playbook")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/login"; return null; }
        if (r.status === 403) { setIsPremium(false); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.premium === false) { setIsPremium(false); return; }
        setIsPremium(true);
        setRules(d.rules ?? []);
      })
      .catch(() => { setIsPremium(true); setRules([]); })
      .finally(() => setLoading(false));
  }, []);

  if (isPremium === null) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} className="has-bottom-nav">
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <BottomNav />
      </div>
    );
  }

  if (isPremium === false) return <PremiumUpsell />;

  async function save(updatedRules: Rule[]) {
    setSaving(true);
    try {
      await fetch("/api/playbook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updatedRules }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  function addRule() {
    if (!newRuleText.trim()) return;
    const newRule: Rule = { id: crypto.randomUUID(), text: newRuleText.trim(), category: activeCategory, enabled: true };
    const updated = [...rules, newRule];
    setRules(updated);
    setNewRuleText("");
    save(updated);
  }

  function toggleRule(id: string) {
    const updated = rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setRules(updated);
    save(updated);
  }

  function deleteRule(id: string) {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    save(updated);
  }

  function startEdit(rule: Rule) {
    setEditingId(rule.id);
    setEditText(rule.text);
  }

  function saveEdit(id: string) {
    if (!editText.trim()) return;
    const updated = rules.map((r) => r.id === id ? { ...r, text: editText.trim() } : r);
    setRules(updated);
    setEditingId(null);
    save(updated);
  }

  function loadStarters() {
    const existing = new Set(rules.map((r) => r.text));
    const toAdd = STARTER_RULES.filter((r) => !existing.has(r.text));
    const updated = [...rules, ...toAdd.map((r) => ({ ...r, id: crypto.randomUUID() }))];
    setRules(updated);
    save(updated);
  }

  const filteredRules = rules.filter((r) => r.category === activeCategory);
  const totalEnabled = rules.filter((r) => r.enabled).length;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">

      <div className="app-header">
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/logo.svg" alt="TradeMind" height="28" style={{ display: "block" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && <span style={{ fontSize: 12, color: "var(--green)" }}>✓ Saved</span>}
          {saving && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Saving...</span>}
          <span className="font-bebas" style={{ fontSize: 20, color: "var(--text-muted)", letterSpacing: "0.05em" }}>PLAYBOOK</span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        {/* Intro */}
        <div className="card" style={{ padding: 20, marginBottom: 20, border: "1px solid rgba(94,106,210,0.15)", background: "rgba(94,106,210,0.03)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, color: "var(--blue)" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Your Trading Rules</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
                These rules are shown to you before every check-in as a reminder. You have <strong style={{ color: "var(--blue)" }}>{totalEnabled}</strong> active rule{totalEnabled !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        </div>

        {/* Starter rules CTA */}
        {rules.length === 0 && !loading && (
          <div className="card" style={{ padding: 24, textAlign: "center", marginBottom: 20, border: "1px dashed var(--border)" }}>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "var(--blue)" }}><svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 4c0 0 8 4 8 14v6l-8 8-8-8v-6C12 8 20 4 20 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="20" cy="17" r="3" stroke="currentColor" strokeWidth="2"/><path d="M14 28l-4 4M26 28l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Start with proven rules</div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 20 }}>
              Load 8 battle-tested trading rules to get started. You can edit or delete any of them.
            </p>
            <button className="btn-primary" onClick={loadStarters} style={{ fontSize: 14, padding: "12px 28px" }}>Load Starter Rules →</button>
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = rules.filter((r) => r.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6,
                  border: `1.5px solid ${isActive ? meta.color : "var(--border)"}`,
                  background: isActive ? `${meta.color}12` : "var(--surface2)",
                  color: isActive ? meta.color : "var(--text-muted)",
                  cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 400,
                  transition: "all 0.15s",
                }}>
                <span>{meta.icon}</span>
                <span>{cat}</span>
                {count > 0 && <span style={{ background: isActive ? meta.color : "var(--surface3)", color: isActive ? "var(--bg)" : "var(--text-muted)", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Category header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
            {CATEGORY_META[activeCategory].icon} {activeCategory} Rules — <span style={{ fontStyle: "italic" }}>{CATEGORY_META[activeCategory].desc}</span>
          </div>
        </div>

        {/* Add rule input */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            placeholder={`Add a ${activeCategory.toLowerCase()} rule...`}
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
            style={{ flex: 1, fontSize: 14 }}
          />
          <button className="btn-primary" onClick={addRule} style={{ padding: "10px 20px", fontSize: 14, flexShrink: 0 }}>
            + Add
          </button>
        </div>

        {/* Rules list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
        ) : filteredRules.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 12 }}>
            No {activeCategory.toLowerCase()} rules yet. Add your first one above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredRules.map((rule) => {
              const meta = CATEGORY_META[rule.category];
              const isEditing = editingId === rule.id;
              return (
                <div key={rule.id} className="card"
                  style={{ padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start", opacity: rule.enabled ? 1 : 0.45, transition: "opacity 0.2s", border: rule.enabled ? `1px solid ${meta.color}20` : "1px solid var(--border)" }}>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", border: `2px solid ${rule.enabled ? meta.color : "var(--surface3)"}`, background: rule.enabled ? meta.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--bg)", fontSize: 12, fontWeight: 700, marginTop: 1 }}>
                    {rule.enabled ? "✓" : ""}
                  </button>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(rule.id); if (e.key === "Escape") setEditingId(null); }}
                          autoFocus style={{ flex: 1, fontSize: 14 }}
                        />
                        <button onClick={() => saveEdit(rule.id)} className="btn-primary" style={{ padding: "6px 14px", fontSize: 12 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-muted)", cursor: "pointer", padding: "6px 10px", fontSize: 12 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: rule.enabled ? "var(--text)" : "var(--text-muted)", lineHeight: 1.5 }}>
                        {rule.text}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => startEdit(rule)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "2px 6px" }} title="Edit">✏️</button>
                      <button onClick={() => deleteRule(rule.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "2px 6px" }} title="Delete">🗑</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats footer */}
        {rules.length > 0 && (
          <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, background: "var(--surface2)", display: "flex", gap: 24, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const count = rules.filter((r) => r.category === cat && r.enabled).length;
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: meta.color, fontWeight: 700 }}>{count}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{cat.toUpperCase()}</div>
                </div>
              );
            })}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Shown before every check-in 🧠</span>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}