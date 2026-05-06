"use client";

import { useEffect, useState, useRef } from "react";

type ToastItem = { id: string; message: string; type: "success" | "error" | "info" };

export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("trademind:toast", { detail: { message, type } }));
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    function handleToast(e: Event) {
      const { message, type } = (e as CustomEvent<{ message: string; type: ToastItem["type"] }>).detail;
      const id = String(counter.current++);
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
    }
    window.addEventListener("trademind:toast", handleToast);
    return () => window.removeEventListener("trademind:toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  const icon = (type: ToastItem["type"]) => {
    if (type === "success") return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="var(--green)" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="var(--green)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    );
    if (type === "error") return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#ff6b6b" strokeWidth="1.3"/><path d="M7 4v3.5M7 10v.5" stroke="#ff6b6b" strokeWidth="1.4" strokeLinecap="round"/></svg>
    );
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="var(--text-muted)" strokeWidth="1.3"/><path d="M7 6.5v4M7 4v.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/></svg>
    );
  };

  const borderColor = (type: ToastItem["type"]) =>
    type === "success" ? "rgba(0,232,122,0.28)" : type === "error" ? "rgba(255,59,92,0.28)" : "rgba(255,255,255,0.1)";

  const textColor = (type: ToastItem["type"]) =>
    type === "success" ? "var(--green)" : type === "error" ? "#ff6b6b" : "var(--text)";

  return (
    <div style={{
      position: "fixed",
      bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10000,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      pointerEvents: "none",
      width: "100%",
      maxWidth: 360,
      padding: "0 16px",
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            color: textColor(t.type),
            background: "rgba(16,17,18,0.96)",
            border: `1px solid ${borderColor(t.type)}`,
            boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            animation: "toast-up 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{icon(t.type)}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}