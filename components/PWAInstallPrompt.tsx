"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("trademind_pwa_dismissed")) return;

    const hasCheckin = !!localStorage.getItem("trademind_history") &&
      JSON.parse(localStorage.getItem("trademind_history") ?? "[]").length >= 1;

    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (hasCheckin) setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("trademind_pwa_dismissed", "1");
    }
    setShow(false);
  }

  function handleDismiss() {
    localStorage.setItem("trademind_pwa_dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 80,
      left: 16,
      right: 16,
      zIndex: 9000,
      borderRadius: 16,
      background: "var(--surface)",
      border: "1px solid rgba(79,142,247,0.3)",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      animation: "slideUp 0.3s ease",
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <img src="/icons/icon-192.png" alt="TradeMind" style={{ width: 28, height: 28, borderRadius: 6 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Add to Home Screen</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>One tap to check in every morning.</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>
          Later
        </button>
        <button
          onClick={handleInstall}
          style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#4F8EF7", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Install
        </button>
      </div>
    </div>
  );
}