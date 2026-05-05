import Link from "next/link";

export default function VerifyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="32" style={{ display: "block" }} />
      </Link>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 36, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(94,106,210,0.1)", border: "1.5px solid rgba(94,106,210,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="7" width="22" height="15" rx="3" stroke="currentColor" strokeWidth="1.6"/><path d="M3 10l11 7 11-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <h1 className="font-bebas" style={{ fontSize: 32, marginBottom: 8 }}>Check your inbox</h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 24 }}>
          A sign-in link has been sent to your email address.
          Click the link to complete sign-in — it expires in 10 minutes.
        </p>
        <Link href="/login">
          <button className="btn-ghost" style={{ width: "100%" }}>Back to sign in</button>
        </Link>
      </div>
    </div>
  );
}
