"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("tm_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("tm_cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("tm_cookie_consent", "essential_only");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 48px)",
        maxWidth: 640,
        background: "var(--surface)",
        border: "1px solid var(--border-bright)",
        borderRadius: 16,
        padding: "20px 24px",
        zIndex: 9000,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>🍪 We use cookies</div>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
          We use essential cookies for authentication and session management only.
          No advertising or tracking cookies.{" "}
          <Link href="/privacy" style={{ color: "var(--blue)", textDecoration: "underline" }}>
            Privacy Policy
          </Link>
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, paddingTop: 4 }}>
        <button
          onClick={decline}
          style={{
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-muted)", borderRadius: 8, padding: "8px 16px",
            fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          Essential only
        </button>
        <button
          onClick={accept}
          className="btn-primary"
          style={{ padding: "8px 20px", fontSize: 13, whiteSpace: "nowrap" }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}