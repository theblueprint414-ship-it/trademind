"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const SHORTCUTS = [
  { key: "k", label: "Check-in", path: "/checkin" },
  { key: "j", label: "Journal", path: "/journal" },
  { key: "d", label: "Dashboard", path: "/dashboard" },
  { key: "a", label: "Analytics", path: "/analytics" },
  { key: "c", label: "AI Coach", path: "/coach" },
  { key: "p", label: "Playbook", path: "/playbook" },
  { key: "r", label: "Session Recap", path: "/recap" },
];

export default function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  // Only active inside the app (not on landing or login)
  const isApp = pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/vs-") && !pathname.startsWith("/for-");

  useEffect(() => {
    if (!isApp) return;

    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement).isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "?") { setShowHelp((v) => !v); return; }
      if (e.key === "Escape") { setShowHelp(false); return; }

      const shortcut = SHORTCUTS.find((s) => s.key === e.key.toLowerCase());
      if (shortcut && pathname !== shortcut.path) {
        router.push(shortcut.path);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isApp, pathname, router]);

  if (!isApp || !showHelp) {
    if (!isApp) return null;
    return (
      <div
        style={{ position: "fixed", bottom: 80, right: 16, zIndex: 50, display: "none" }}
        id="kbd-hint"
      />
    );
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={() => setShowHelp(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 360, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>Keyboard Shortcuts</h3>
          <kbd style={{ fontSize: 11, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 6px", color: "var(--text-muted)" }}>Esc to close</kbd>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SHORTCUTS.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 14, color: "var(--text-dim)" }}>Go to {s.label}</span>
              <kbd style={{ fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 5, padding: "3px 9px", color: "var(--text)", fontFamily: "var(--font-geist-mono)", fontWeight: 700 }}>{s.key}</kbd>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ fontSize: 14, color: "var(--text-dim)" }}>Toggle this panel</span>
            <kbd style={{ fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 5, padding: "3px 9px", color: "var(--text)", fontFamily: "var(--font-geist-mono)", fontWeight: 700 }}>?</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}