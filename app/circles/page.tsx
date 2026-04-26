"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Member = {
  id: string;
  name: string;
  avatar: string;
  score: number | null;
  verdict: "GO" | "CAUTION" | "NO-TRADE" | null;
  checkedInToday: boolean;
  isMe: boolean;
};

type Circle = {
  id: string;
  name: string;
  token: string;
  isCreator: boolean;
  memberCount: number;
  members: Member[];
};

function verdictColor(v: string | null) {
  if (v === "GO") return "#00E87A";
  if (v === "CAUTION") return "#FFB020";
  if (v === "NO-TRADE") return "#FF3B5C";
  return "var(--text-muted)";
}

function ScoreAvatar({ member }: { member: Member }) {
  const color = verdictColor(member.verdict);
  const initials = (member.name ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: 46, height: 46, borderRadius: "50%",
        background: member.avatar ? "transparent" : "var(--surface3)",
        border: `2px solid ${member.verdict ? color : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, fontWeight: 700, color: "var(--text-dim)",
        overflow: "hidden",
      }}>
        {member.avatar
          ? <img src={member.avatar} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials}
      </div>
      {member.checkedInToday && member.score !== null && (
        <div style={{
          position: "absolute", bottom: -4, right: -4,
          width: 20, height: 20, borderRadius: "50%",
          background: color, border: "2px solid var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 800, color: "#000",
        }}>
          {member.score}
        </div>
      )}
    </div>
  );
}

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState<string | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  useEffect(() => {
    fetch("/api/circles")
      .then((r) => {
        if (r.status === 403) { setError("pro"); return null; }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => { if (d) setCircles(d.circles); })
      .catch(() => setError("error"))
      .finally(() => setLoading(false));
  }, []);

  async function createCircle() {
    if (!newName.trim()) return;
    setCreateLoading(true);
    const r = await fetch("/api/circles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const d = await r.json();
    if (d.ok) {
      setCircles((prev) => [...prev, { id: d.circle.id, name: d.circle.name, token: d.circle.token, isCreator: true, memberCount: 1, members: [] }]);
      setNewName("");
      setCreating(false);
    }
    setCreateLoading(false);
  }

  async function copyInvite(circleId: string) {
    const r = await fetch("/api/circles/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circleId }),
    });
    const d = await r.json();
    if (d.joinUrl) {
      await navigator.clipboard.writeText(d.joinUrl);
      setInviteCopied(circleId);
      setTimeout(() => setInviteCopied(null), 2000);
    }
  }

  async function leaveCircle(circleId: string) {
    const r = await fetch(`/api/circles/leave?circleId=${encodeURIComponent(circleId)}`, {
      method: "DELETE",
    });
    if (r.ok) {
      setCircles((prev) => prev.filter((c) => c.id !== circleId));
      setLeaveConfirm(null);
    }
  }

  async function deleteCircle(circleId: string) {
    const r = await fetch(`/api/circles?circleId=${encodeURIComponent(circleId)}`, {
      method: "DELETE",
    });
    if (r.ok) {
      setCircles((prev) => prev.filter((c) => c.id !== circleId));
      setDeleteConfirm(null);
    }
  }

  async function renameCircle(circleId: string) {
    if (!renameValue.trim()) return;
    setRenameLoading(true);
    const r = await fetch(`/api/circles?circleId=${encodeURIComponent(circleId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    const d = await r.json();
    if (d.ok) {
      setCircles((prev) => prev.map((c) => c.id === circleId ? { ...c, name: d.name } : c));
      setRenaming(null);
      setRenameValue("");
    }
    setRenameLoading(false);
  }

  if (loading) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (error === "pro") return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "60px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Circles is a Pro feature</div>
        <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
          Create accountability groups with your trading partners. See each other&apos;s mental state every morning — the most effective way to stay consistent.
        </p>
        <Link href="/pricing" style={{ display: "inline-block", background: "var(--blue)", color: "#fff", padding: "12px 28px", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>
          Upgrade to Pro →
        </Link>
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 100, color: "var(--text)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Circles</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Your accountability groups</div>
          </div>
          <button
            onClick={() => setCreating(true)}
            style={{ background: "var(--blue)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            + New Circle
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>New Circle</div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCircle()}
              placeholder="Circle name (e.g. ES Trading Group)"
              autoFocus
              style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={createCircle}
                disabled={createLoading || !newName.trim()}
                style={{ flex: 1, background: "var(--blue)", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, cursor: "pointer", opacity: createLoading ? 0.7 : 1 }}
              >
                {createLoading ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(""); }}
                style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px", fontWeight: 600, cursor: "pointer", color: "var(--text-dim)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {circles.length === 0 && !creating && (
          <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--border)", borderRadius: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>No circles yet</div>
            <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
              Create a circle with your trading group to see each other&apos;s mental state every morning.
            </p>
            <button
              onClick={() => setCreating(true)}
              style={{ background: "var(--blue)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}
            >
              Create Your First Circle
            </button>
          </div>
        )}

        {/* Circle cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {circles.map((circle) => (
            <div key={circle.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

              {/* Circle header */}
              <div style={{ padding: "18px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                  {renaming === circle.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") renameCircle(circle.id); if (e.key === "Escape") { setRenaming(null); setRenameValue(""); } }}
                        autoFocus
                        style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--blue)", borderRadius: 8, padding: "6px 10px", color: "var(--text)", fontSize: 15, fontWeight: 700 }}
                      />
                      <button
                        onClick={() => renameCircle(circle.id)}
                        disabled={renameLoading || !renameValue.trim()}
                        style={{ background: "var(--blue)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        {renameLoading ? "…" : "Save"}
                      </button>
                      <button
                        onClick={() => { setRenaming(null); setRenameValue(""); }}
                        style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{circle.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {circle.memberCount} member{circle.memberCount !== 1 ? "s" : ""} · {circle.isCreator ? "Created by you" : "Member"}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => copyInvite(circle.id)}
                    style={{
                      background: inviteCopied === circle.id ? "rgba(0,232,122,0.12)" : "var(--surface2)",
                      border: `1px solid ${inviteCopied === circle.id ? "rgba(0,232,122,0.3)" : "var(--border)"}`,
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700,
                      color: inviteCopied === circle.id ? "var(--green)" : "var(--text-dim)",
                      cursor: "pointer",
                    }}
                  >
                    {inviteCopied === circle.id ? "✓ Copied!" : "Invite"}
                  </button>
                  {circle.isCreator ? (
                    <>
                      <button
                        onClick={() => { setRenaming(circle.id); setRenameValue(circle.name); }}
                        style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
                        title="Rename circle"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(circle.id)}
                        style={{ background: "transparent", border: "1px solid rgba(255,59,92,0.25)", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "var(--red)", cursor: "pointer" }}
                        title="Delete circle"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setLeaveConfirm(circle.id)}
                      style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      Leave
                    </button>
                  )}
                </div>
              </div>

              {/* Delete confirm (creator) */}
              {deleteConfirm === circle.id && (
                <div style={{ margin: "0 18px 14px", background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, marginBottom: 10 }}>Delete &ldquo;{circle.name}&rdquo;? This will remove all members.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => deleteCircle(circle.id)} style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Leave confirm (member) */}
              {leaveConfirm === circle.id && (
                <div style={{ margin: "0 18px 14px", background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, marginBottom: 10 }}>Leave &ldquo;{circle.name}&rdquo;?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => leaveCircle(circle.id)} style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Leave</button>
                    <button onClick={() => setLeaveConfirm(null)} style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px", fontSize: 13, cursor: "pointer", color: "var(--text-dim)" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Members */}
              {circle.members.length > 0 ? (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {circle.members.map((member, i) => (
                    <div key={member.id} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                      borderBottom: i < circle.members.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      <ScoreAvatar member={member} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                          {member.name}
                          {member.isMe && <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>you</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          {member.checkedInToday
                            ? `Checked in today${member.score !== null ? ` — ${member.score}/100` : ""}`
                            : "No check-in today"}
                        </div>
                      </div>
                      {member.verdict && (
                        <div style={{
                          fontSize: 11, fontWeight: 700,
                          color: verdictColor(member.verdict),
                          background: `${verdictColor(member.verdict)}18`,
                          border: `1px solid ${verdictColor(member.verdict)}35`,
                          borderRadius: 6, padding: "3px 8px",
                        }}>
                          {member.verdict}
                        </div>
                      )}
                      {!member.verdict && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>—</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "20px 18px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>No members yet. Share the invite link.</div>
                  <button
                    onClick={() => copyInvite(circle.id)}
                    style={{ background: "var(--blue)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    Copy Invite Link
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info box */}
        <div style={{ marginTop: 24, background: "rgba(94,106,210,0.05)", border: "1px solid rgba(94,106,210,0.15)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)", marginBottom: 6 }}>How Circles work</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}>
            <li>Create a circle and share the invite link</li>
            <li>Members&apos; GO / CAUTION / NO-TRADE verdicts appear here daily</li>
            <li>Knowing others will see your score keeps you accountable</li>
            <li>Invite via the button on each circle card</li>
          </ul>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}