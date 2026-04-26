import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
      <div>
        <div className="font-bebas" style={{ fontSize: "clamp(80px, 20vw, 160px)", lineHeight: 1, color: "var(--red)", textShadow: "0 0 40px var(--glow-red)" }}>404</div>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>Page not found</h1>
        <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 36, maxWidth: 360 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <button className="btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>← Back to TradeMind</button>
        </Link>
      </div>
    </div>
  );
}