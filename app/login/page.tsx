"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("resend", { email, redirect: false, callbackUrl });
      if (res?.error) setError("Failed to send sign-in link. Try again.");
      else setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="32" style={{ display: "block" }} />
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 36 }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
            <h2 className="font-bebas" style={{ fontSize: 28, marginBottom: 8 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
              We sent a sign-in link to <strong style={{ color: "white" }}>{email}</strong>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-bebas" style={{ fontSize: 32, marginBottom: 4 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 28 }}>
              Track your mental edge. No password required.
            </p>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "13px 20px", color: "white", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16, transition: "border-color 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or email</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Email */}
            <form onSubmit={handleEmailSignIn} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              {error && <p style={{ fontSize: 12, color: "var(--red)" }}>{error}</p>}
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "13px" }} disabled={loading}>
                {loading ? "Sending..." : "Send sign-in link"}
              </button>
            </form>

            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
              By signing in you agree to our Terms of Service.
              <br />No spam, ever.
            </p>

            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
              No account? Just sign in — we&apos;ll create one automatically.
            </p>

          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg)", minHeight: "100vh" }} />}>
      <LoginInner />
    </Suspense>
  );
}
