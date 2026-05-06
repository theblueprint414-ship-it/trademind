"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/components/Toast";
import Link from "next/link";
import PartnerCard from "@/components/PartnerCard";
import BottomNav from "@/components/BottomNav";

type Partner = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  score: number | null;
  verdict: "GO" | "CAUTION" | "NO-TRADE" | null;
  streak: number;
  lastCheckin: string;
};

type FeedItem = {
  userId: string;
  name: string;
  score: number;
  verdict: string;
  date: string;
  time: string;
  isSelf: boolean;
};

type IncomingInvite = { token: string; fromName: string; fromEmail: string };

type CircleMember = { id: string; name: string; avatar: string; score: number | null; verdict: "GO" | "CAUTION" | "NO-TRADE" | null; checkedInToday: boolean; isMe: boolean };
type Circle = { id: string; name: string; token: string; isCreator: boolean; memberCount: number; members: CircleMember[] };

function verdictDot(verdict: string | null) {
  if (verdict === "GO") return "var(--green)";
  if (verdict === "CAUTION") return "var(--amber)";
  if (verdict === "NO-TRADE") return "var(--red)";
  return "var(--surface3)";
}

export default function PartnersPage() {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [partners, setPartners] = useState<Partner[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [incoming, setIncoming] = useState<IncomingInvite[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [newCircleName, setNewCircleName] = useState("");
  const [creatingCircle, setCreatingCircle] = useState(false);
  const [circleInviteLinks, setCircleInviteLinks] = useState<Record<string, string>>({});
  const [nudged, setNudged] = useState<Record<string, boolean>>({});
  const [nudging, setNudging] = useState<Record<string, boolean>>({});
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedCircle, setCopiedCircle] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(async () => {
      const fRes = await fetch("/api/partners/feed").catch(() => null);
      if (fRes?.ok) {
        const data = await fRes.json();
        setFeed(data.feed ?? []);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, fRes, iRes] = await Promise.all([
          fetch("/api/partners"),
          fetch("/api/partners/feed"),
          fetch("/api/partners/invite"),
        ]);

        if (pRes.status === 401) { setIsLoggedIn(false); setLoadingPartners(false); return; }
        setIsLoggedIn(true);

        if (pRes.ok) {
          const data = await pRes.json();
          setPartners(data.partners ?? []);
        }
        if (fRes.ok) {
          const data = await fRes.json();
          setFeed(data.feed ?? []);
        }
        if (iRes.ok) {
          const data = await iRes.json();
          setIncoming(data.invites ?? []);
        }

        const cRes = await fetch("/api/circles");
        if (cRes.ok) {
          const cd = await cRes.json();
          setCircles(cd.circles ?? []);
        }
      } catch {}
      setLoadingPartners(false);
    }
    load();
  }, []);

  async function handleCreateCircle(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newCircleName.trim()) return;
    setCreatingCircle(true);
    try {
      const res = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCircleName.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        const cRes = await fetch("/api/circles");
        if (cRes.ok) { const cd = await cRes.json(); setCircles(cd.circles ?? []); }
        setNewCircleName("");
        showToast("Circle created", "success");
      } else {
        showToast(data.error ?? "Failed to create circle", "error");
      }
    } catch {
      showToast("Network error — try again", "error");
    }
    setCreatingCircle(false);
  }

  async function handleCircleInvite(circleId: string) {
    try {
      const res = await fetch("/api/circles/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circleId }),
      });
      const data = await res.json();
      if (data.ok) {
        setCircleInviteLinks((prev) => ({ ...prev, [circleId]: data.joinUrl }));
        const text = encodeURIComponent(`Hey! Join my "${data.circleName}" trading circle on TradeMind — we share our daily mental check-in scores to keep each other accountable. Click here: ${data.joinUrl}`);
        const opened = window.open(`https://wa.me/?text=${text}`, "_blank");
        if (!opened) showToast("Copy the link below and send it manually", "info");
      } else {
        showToast(data.error ?? "Failed to generate invite link", "error");
      }
    } catch {
      showToast("Network error — try again", "error");
    }
  }

  async function handleNudge(partnerId: string) {
    setNudging((prev) => ({ ...prev, [partnerId]: true }));
    try {
      await fetch("/api/partners/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId }),
      });
      setNudged((prev) => ({ ...prev, [partnerId]: true }));
      showToast("Nudge sent!", "success");
    } catch {
      showToast("Couldn't send nudge — try again", "error");
    }
    setNudging((prev) => ({ ...prev, [partnerId]: false }));
  }

  async function handleLeaveCircle(circleId: string) {
    try {
      await fetch(`/api/circles/leave?circleId=${circleId}`, { method: "DELETE" });
      setCircles((prev) => prev.filter((c) => c.id !== circleId));
      showToast("Left circle", "info");
    } catch {
      showToast("Couldn't leave circle — try again", "error");
    }
  }

  async function handleInvite(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);
    setInviteError("");
    setInviteLink(null);
    try {
      const res = await fetch("/api/partners/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to generate invite");
        showToast(data.error ?? "Failed to generate invite", "error");
        setGenerating(false);
        return;
      }
      const link: string = data.acceptUrl;
      setInviteLink(link);
      const text = encodeURIComponent(`Hey! I use TradeMind to track my trading psychology. Join me as an accountability partner — we'll see each other's daily mental check-in scores. Click here: ${link}`);
      const opened = window.open(`https://wa.me/?text=${text}`, "_blank");
      if (opened) showToast("Invite link sent to WhatsApp", "success");
      else showToast("Copy the link below and send it manually", "info");
    } catch {
      setInviteError("Network error — try again.");
      showToast("Network error — try again", "error");
    }
    setGenerating(false);
  }

  async function handleIncomingInvite(token: string, action: "accept" | "decline") {
    const res = await fetch(`/api/partners/invite/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setIncoming((prev) => prev.filter((inv) => inv.token !== token));
      if (action === "accept") {
        // Reload partners
        const pRes = await fetch("/api/partners");
        if (pRes.ok) { const data = await pRes.json(); setPartners(data.partners ?? []); }
      }
    }
  }

  function verdictColor(verdict: string | null) {
    if (verdict === "GO") return "var(--green)";
    if (verdict === "CAUTION") return "var(--amber)";
    return "var(--red)";
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/logo.svg" alt="TradeMind" height="28" style={{ display: "block" }} />
        </Link>
        <Link href="/dashboard"><button className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>← Dashboard</button></Link>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-bebas" style={{ fontSize: 40, marginBottom: 4 }}>Accountability Partners</h1>
          <p style={{ fontSize: 14, color: "var(--text-dim)" }}>
            Your partners see your daily check-in score. Mutual accountability keeps you honest.
          </p>
        </div>

        {/* Not logged in */}
        {!isLoggedIn && !loadingPartners && (
          <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--text-dim)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Sign in to use Partners</div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>Create an account to invite accountability partners and share check-in scores.</p>
            <Link href="/login"><button className="btn-primary">Sign in</button></Link>
          </div>
        )}

        {/* Incoming invites */}
        {incoming.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", letterSpacing: "0.08em", marginBottom: 12 }}>
              PENDING INVITES ({incoming.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {incoming.map((inv) => (
                <div key={inv.token} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid rgba(245,166,35,0.3)", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{inv.fromName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{inv.fromEmail}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => handleIncomingInvite(inv.token, "accept")}>Accept</button>
                    <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => handleIncomingInvite(inv.token, "decline")}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite via WhatsApp */}
        {isLoggedIn && (
          <div className="card" style={{ padding: 28, marginBottom: 28, border: "1px solid rgba(37,211,102,0.2)", background: "rgba(37,211,102,0.03)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Invite a partner</h2>
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
              Generates a personal invite link and opens WhatsApp to send it.
            </p>
            {inviteLink ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--green)", fontSize: 14 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5"/><path d="M5.5 9l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Link created and sent to WhatsApp
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "8px 16px", color: copiedInvite ? "var(--green)" : undefined }}
                    onClick={() => { navigator.clipboard.writeText(inviteLink); setCopiedInvite(true); setTimeout(() => setCopiedInvite(false), 2000); }}
                  >
                    {copiedInvite ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied</span> : "Copy link"}
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "8px 16px" }}
                    onClick={() => { setInviteLink(null); setInviteError(""); }}
                  >
                    Generate new link
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleInvite}>
                  <button type="submit" className="btn-primary" style={{ padding: "14px 28px", fontSize: 15, display: "flex", alignItems: "center", gap: 10 }} disabled={generating}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {generating ? "Generating..." : "Send via WhatsApp"}
                  </button>
                </form>
                {inviteError && <p style={{ fontSize: 13, color: "var(--red)", marginTop: 8 }}>{inviteError}</p>}
              </>
            )}
          </div>
        )}

        {/* Active partners */}
        {isLoggedIn && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 16 }}>
              ACTIVE PARTNERS ({partners.length})
            </h2>
            {loadingPartners ? (
              <div style={{ fontSize: 14, color: "var(--text-muted)", padding: "16px 0" }}>Loading...</div>
            ) : partners.length === 0 ? (
              <div className="card" style={{ padding: "32px 24px", textAlign: "center", border: "1px solid rgba(139,92,246,0.18)", background: "linear-gradient(135deg, rgba(139,92,246,0.04), var(--surface))" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="9" cy="9" r="4" stroke="#8B5CF6" strokeWidth="1.6"/><circle cx="19" cy="9" r="4" stroke="#8B5CF6" strokeWidth="1.6"/><path d="M2 23c0-3.866 3.134-7 7-7h8c3.866 0 7 3.134 7 7" stroke="#8B5CF6" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No accountability partners yet</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 0, maxWidth: 300, margin: "0 auto" }}>
                  When someone accepts your invite, their morning score shows here — and yours shows on theirs. Discipline compounds when someone is watching.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {partners.map((p) => (
                  <div key={p.id} style={{ position: "relative" }}>
                    <PartnerCard partner={{ ...p, verdict: p.verdict ?? "NO-TRADE" }} />
                    {p.score === null && (
                      <button
                        onClick={() => handleNudge(p.id)}
                        disabled={nudging[p.id] || nudged[p.id]}
                        style={{
                          position: "absolute", top: 12, right: 12,
                          background: nudged[p.id] ? "rgba(0,232,122,0.1)" : "var(--surface2)",
                          border: `1px solid ${nudged[p.id] ? "rgba(0,232,122,0.3)" : "var(--border)"}`,
                          borderRadius: 8, padding: "5px 11px", fontSize: 12, fontWeight: 700,
                          color: nudged[p.id] ? "var(--green)" : "var(--text-dim)",
                          cursor: nudging[p.id] || nudged[p.id] ? "default" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {nudged[p.id] ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Nudged
                          </span>
                        ) : nudging[p.id] ? "..." : (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v3M5.5 7v.5M3 3.5L1.5 2M8 3.5L9.5 2M2 6.5H1M10 6.5H9M3.5 9l-1 1M7.5 9l1 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>Nudge
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trading Circles */}
        {isLoggedIn && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                TRADING CIRCLES ({circles.length})
              </h2>
            </div>

            {/* Create circle form */}
            <form onSubmit={handleCreateCircle} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Circle name (e.g. Morning Traders)"
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                style={{ flex: 1, fontSize: 13 }}
                maxLength={60}
              />
              <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: "10px 16px", fontSize: 13 }} disabled={creatingCircle || !newCircleName.trim()}>
                {creatingCircle ? "Creating..." : "Create"}
              </button>
            </form>

            {/* Circle list */}
            {circles.length === 0 ? (
              <div className="card" style={{ padding: "28px 24px", textAlign: "center", border: "1px solid rgba(139,92,246,0.18)", background: "linear-gradient(135deg, rgba(139,92,246,0.04), var(--surface))" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="#8B5CF6" strokeWidth="1.5"/><circle cx="7.5" cy="10" r="2" stroke="#8B5CF6" strokeWidth="1.3"/><circle cx="14.5" cy="10" r="2" stroke="#8B5CF6" strokeWidth="1.3"/><path d="M4 18c0-2 1.6-3.5 3.5-3.5h7c1.9 0 3.5 1.5 3.5 3.5" stroke="#8B5CF6" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No circles yet</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 300, margin: "0 auto 0" }}>
                  Create a circle and invite your group. Everyone sees each other&apos;s morning score — making it impossible to pretend you&apos;re ready when you&apos;re not.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {circles.map((circle) => (
                  <div key={circle.id} className="card" style={{ padding: 20, border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{circle.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{circle.memberCount} {circle.memberCount === 1 ? "member" : "members"}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}
                          onClick={() => handleCircleInvite(circle.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Invite
                        </button>
                        {circleInviteLinks[circle.id] && (
                          <button
                            className="btn-ghost"
                            style={{ fontSize: 12, padding: "6px 12px", color: copiedCircle === circle.id ? "var(--green)" : undefined }}
                            onClick={() => { navigator.clipboard.writeText(circleInviteLinks[circle.id]); setCopiedCircle(circle.id); setTimeout(() => setCopiedCircle(null), 2000); }}
                          >
                            {copiedCircle === circle.id ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied</span> : "Copy link"}
                          </button>
                        )}
                        <button
                          className="btn-ghost"
                          style={{ fontSize: 12, padding: "6px 12px", color: "var(--red)" }}
                          onClick={() => handleLeaveCircle(circle.id)}
                        >
                          Leave
                        </button>
                      </div>
                    </div>

                    {/* Members grid */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {circle.members.map((m) => (
                        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "var(--surface2)", border: `1px solid ${m.checkedInToday ? verdictDot(m.verdict) + "40" : "var(--border)"}` }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.checkedInToday ? verdictDot(m.verdict) : "var(--surface3)", flexShrink: 0, boxShadow: m.checkedInToday ? `0 0 6px ${verdictDot(m.verdict)}` : "none" }} />
                          <span style={{ fontSize: 13, fontWeight: m.isMe ? 700 : 400 }}>{m.isMe ? "You" : m.name}</span>
                          {m.score !== null && (
                            <span style={{ fontSize: 12, color: verdictDot(m.verdict), fontWeight: 700 }}>{m.score}</span>
                          )}
                          {!m.checkedInToday && (
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feed */}
        {feed.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 16 }}>
              RECENT ACTIVITY
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {feed.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: verdictColor(item.verdict), flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <strong>{item.name}</strong>{" "}
                    <span style={{ color: "var(--text-dim)" }}>scored {item.score} — {item.verdict}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
