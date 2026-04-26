"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    if (!email || !token) { setStatus("error"); return; }

    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.ok ? setStatus("done") : setStatus("error"))
      .catch(() => setStatus("error"));
  }, [params]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="28" style={{ display: "block" }} />
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 40, textAlign: "center" }}>
        {status === "loading" && (
          <>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Unsubscribing...</p>
          </>
        )}

        {status === "done" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 className="font-bebas" style={{ fontSize: 32, marginBottom: 12 }}>Unsubscribed</h1>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28 }}>
              You won&apos;t receive daily reminder emails anymore.<br />
              You can re-enable them anytime in Settings.
            </p>
            <Link href="/settings">
              <button className="btn-ghost" style={{ width: "100%" }}>Go to Settings</button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h1 className="font-bebas" style={{ fontSize: 32, marginBottom: 12 }}>Invalid Link</h1>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 28 }}>
              This unsubscribe link is invalid or expired.<br />
              You can manage notifications from Settings.
            </p>
            <Link href="/settings">
              <button className="btn-primary" style={{ width: "100%" }}>Go to Settings</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  );
}