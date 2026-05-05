"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmed)) {
      setError("Enter a valid email address (e.g. you@gmail.com).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await signIn("resend", { email: trimmed, redirect: false, callbackUrl });
      if (res?.error === "EmailSignin") {
        setError("Couldn't send the email — check the address and try again.");
      } else if (res?.error) {
        setError("Sign-in failed. Try Google instead, or contact support.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, animation: "page-in 0.28s cubic-bezier(0.16,1,0.3,1) both" }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="32" style={{ display: "block" }} />
      </Link>

      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 36 }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(0,232,122,0.1)", border: "1.5px solid rgba(0,232,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="7" width="22" height="15" rx="3" stroke="currentColor" strokeWidth="1.6"/><path d="M3 10l11 7 11-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <h2 className="font-bebas" style={{ fontSize: 28, marginBottom: 8 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
              We sent a sign-in link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
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
              disabled={loading || googleLoading}
              style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "13px 20px", color: "white", fontSize: 14, cursor: googleLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16, transition: "border-color 0.2s" }}
              onMouseOver={(e) => !googleLoading && (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              {googleLoading ? (
                <>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "white", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
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
              By signing in you agree to our{" "}
              <Link href="/terms" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Terms of Service</Link>.
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
    <Suspense fallback={
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--surface3)", borderTopColor: "var(--blue)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
