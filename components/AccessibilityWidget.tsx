"use client";

import { useState, useEffect } from "react";

type FontSize = "normal" | "large" | "xlarge";

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tm_a11y");
    if (saved) {
      try {
        const { fontSize: fs, highContrast: hc } = JSON.parse(saved);
        if (fs) applyFontSize(fs, false);
        if (hc) applyHighContrast(hc, false);
      } catch {}
    }
  }, []);

  function applyFontSize(size: FontSize, save = true) {
    setFontSize(size);
    const sizes: Record<FontSize, string> = { normal: "16px", large: "19px", xlarge: "22px" };
    document.documentElement.style.fontSize = sizes[size];
    if (save) savePrefs(size, highContrast);
  }

  function applyHighContrast(on: boolean, save = true) {
    setHighContrast(on);
    if (on) {
      document.documentElement.style.setProperty("--text-dim", "#C8D8F0");
      document.documentElement.style.setProperty("--text-muted", "#7A8BA8");
      document.documentElement.style.setProperty("--border", "#2A3F60");
    } else {
      document.documentElement.style.removeProperty("--text-dim");
      document.documentElement.style.removeProperty("--text-muted");
      document.documentElement.style.removeProperty("--border");
    }
    if (save) savePrefs(fontSize, on);
  }

  function savePrefs(fs: FontSize, hc: boolean) {
    localStorage.setItem("tm_a11y", JSON.stringify({ fontSize: fs, highContrast: hc }));
  }

  function reset() {
    applyFontSize("normal");
    applyHighContrast(false);
    localStorage.removeItem("tm_a11y");
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Accessibility options"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Accessibility"
        style={{
          position: "fixed",
          bottom: 88,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--border-bright)",
          color: "var(--text)",
          fontSize: 20,
          cursor: "pointer",
          zIndex: 8999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="4" r="2" fill="currentColor"/>
          <path d="M12 7v6l3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 11H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M7 19c1.1 1.2 2.7 2 4.5 2a6.5 6.5 0 006.5-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          style={{
            position: "fixed",
            bottom: 140,
            right: 20,
            width: 260,
            background: "var(--surface)",
            border: "1px solid var(--border-bright)",
            borderRadius: 14,
            padding: 20,
            zIndex: 8999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, letterSpacing: "0.06em" }}>ACCESSIBILITY</div>

          {/* Font size */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>TEXT SIZE</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["normal", "large", "xlarge"] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => applyFontSize(size)}
                  aria-pressed={fontSize === size}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: 8,
                    border: `1px solid ${fontSize === size ? "var(--blue)" : "var(--border)"}`,
                    background: fontSize === size ? "rgba(79,142,247,0.12)" : "var(--surface2)",
                    color: fontSize === size ? "var(--blue)" : "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: size === "normal" ? 12 : size === "large" ? 14 : 16,
                    fontWeight: 600,
                  }}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>HIGH CONTRAST</div>
            <button
              onClick={() => applyHighContrast(!highContrast)}
              aria-pressed={highContrast}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: `1px solid ${highContrast ? "var(--green)" : "var(--border)"}`,
                background: highContrast ? "rgba(0,232,122,0.1)" : "var(--surface2)",
                color: highContrast ? "var(--green)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {highContrast
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8"/></svg>
              }
              <span>Increase contrast</span>
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Reset to defaults
          </button>
        </div>
      )}
    </>
  );
}