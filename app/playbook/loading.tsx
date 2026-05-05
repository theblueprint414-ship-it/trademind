export default function Loading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .sk { background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3,#1c1e22) 50%, var(--surface2) 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <div className="sk" style={{ width: 110, height: 22 }} />
        <div className="sk" style={{ width: 80, height: 36, borderRadius: 8 }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>
        {/* Rule cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ padding: "18px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
            <div className="sk" style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="sk" style={{ width: `${60 + i * 10}%`, height: 14 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="sk" style={{ width: 28, height: 28, borderRadius: 6 }} />
              <div className="sk" style={{ width: 28, height: 28, borderRadius: 6 }} />
            </div>
          </div>
        ))}

        {/* Add rule button */}
        <div className="sk" style={{ width: "100%", height: 48, borderRadius: 10, marginTop: 8 }} />
      </div>
    </div>
  );
}