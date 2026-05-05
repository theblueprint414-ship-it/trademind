export default function Loading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .sk { background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3,#1c1e22) 50%, var(--surface2) 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <div className="sk" style={{ width: 100, height: 22 }} />
        <div className="sk" style={{ width: 80, height: 36, borderRadius: 8 }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>
        {/* Partner cards */}
        {[1, 2].map((i) => (
          <div key={i} className="card" style={{ padding: "20px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <div className="sk" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="sk" style={{ width: 130, height: 15, marginBottom: 8 }} />
              <div className="sk" style={{ width: 80, height: 24, borderRadius: 6 }} />
            </div>
            <div className="sk" style={{ width: 60, height: 32, borderRadius: 8 }} />
          </div>
        ))}

        {/* Invite card */}
        <div className="card" style={{ padding: 24, border: "1px dashed var(--border)" }}>
          <div className="sk" style={{ width: 180, height: 15, marginBottom: 12 }} />
          <div className="sk" style={{ width: "100%", height: 44, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}