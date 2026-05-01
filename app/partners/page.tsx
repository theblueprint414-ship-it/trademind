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
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
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
                  <span style={{ fontSize: 20 }}>✓</span>
                  Link created and sent to WhatsApp
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: "8px 16px", color: copiedInvite ? "var(--green)" : undefined }}
                    onClick={() => { navigator.clipboard.writeText(inviteLink); setCopiedInvite(true); setTimeout(() => setCopiedInvite(false), 2000); }}
                  >
                    {copiedInvite ? "✓ Copied!" : "Copy link"}
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
                    <span style={{ fontSize: 20 }}>💬</span>
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
              <div className="card" style={{ padding: 24, textAlign: "center", border: "1px dashed var(--border)" }}>
                <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No partners yet. Invite someone above.</p>
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
                        {nudged[p.id] ? "✓ Nudged" : nudging[p.id] ? "..." : "Nudge 👋"}
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
              <div className="card" style={{ padding: 24, textAlign: "center", border: "1px dashed var(--border)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔵</div>
                <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No circles yet. Create one and invite your group.</p>
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
                          <span>💬</span> Invite
                        </button>
                        {circleInviteLinks[circle.id] && (
                          <button
                            className="btn-ghost"
                            style={{ fontSize: 12, padding: "6px 12px", color: copiedCircle === circle.id ? "var(--green)" : undefined }}
                            onClick={() => { navigator.clipboard.writeText(circleInviteLinks[circle.id]); setCopiedCircle(circle.id); setTimeout(() => setCopiedCircle(null), 2000); }}
                          >
                            {copiedCircle === circle.id ? "✓ Copied!" : "Copy link"}
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
