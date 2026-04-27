"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[TradeMind] Global error:", error.message, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#010102", margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "clamp(80px, 20vw, 140px)", lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em", color: "#FF3B5C" }}>500</div>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 700, marginBottom: 12, color: "#f7f8f8" }}>Something went wrong</h1>
            <p style={{ color: "#8a8f98", fontSize: 15, marginBottom: 36, maxWidth: 360, lineHeight: 1.7, margin: "0 auto 36px" }}>
              An unexpected error occurred. The team has been notified.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{ background: "#e5e5e6", color: "#010102", border: "none", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Try again
              </button>
              <a href="/" style={{ background: "transparent", color: "#8a8f98", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                ← Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}