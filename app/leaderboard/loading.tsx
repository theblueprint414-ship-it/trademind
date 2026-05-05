export default function Loading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .sk { background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3,#1c1e22) 50%, var(--surface2) 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", textAlign: "center", background: "var(--surface)" }}>
        <div className="sk" style={{ width: 160, height: 28, margin: "0 auto 6px" }} />
        <div className="sk" style={{ width: 120, height: 12, margin: "0 auto" }} />
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>
        {/* Top 3 podium */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[2, 1, 3].map((rank, i) => (
            <div key={i} className="card" style={{ padding: "20px 12px", textAlign: "center" }}>
              <div className="sk" style={{ width: 40, height: 40, borderRadius: "50%", margin: "0 auto 10px" }} />
              <div className="sk" style={{ width: 60, height: 13, margin: "0 auto 6px" }} />
              <div className="sk" style={{ width: 40, height: 24, margin: "0 auto", borderRadius: 6 }} />
            </div>
          ))}
        </div>

        {/* Rank rows */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="card" style={{ padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <div className="sk" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
            <div className="sk" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="sk" style={{ width: 100, height: 13, marginBottom: 5 }} />
              <div className="sk" style={{ width: 60, height: 10 }} />
            </div>
            <div className="sk" style={{ width: 48, height: 28, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}