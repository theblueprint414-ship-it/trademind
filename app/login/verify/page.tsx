import Link from "next/link";

export default function VerifyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ textDecoration: "none", marginBottom: 40 }}>
        <img src="/logo.svg" alt="TradeMind" height="32" style={{ display: "block" }} />
      </Link>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 36, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
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
