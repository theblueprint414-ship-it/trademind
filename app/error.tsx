"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
      <div>
        <div className="font-bebas" style={{ fontSize: "clamp(80px, 20vw, 160px)", lineHeight: 1, color: "var(--amber)", textShadow: "0 0 40px var(--glow-amber)" }}>500</div>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>Something went wrong</h1>
        <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 36, maxWidth: 360 }}>
          An unexpected error occurred. Try again or contact support@trademindedge.com
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ padding: "14px 32px", fontSize: 15 }} onClick={reset}>Try again</button>
          <a href="/"><button className="btn-ghost" style={{ padding: "14px 32px", fontSize: 15 }}>← Home</button></a>
        </div>
      </div>
    </div>
  );
}