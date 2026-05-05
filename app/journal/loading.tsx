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
        <div style={{ display: "flex", gap: 8 }}>
          <div className="sk" style={{ width: 80, height: 36, borderRadius: 8 }} />
          <div className="sk" style={{ width: 36, height: 36, borderRadius: 8 }} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {/* Filter row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[80, 60, 70, 60].map((w, i) => (
            <div key={i} className="sk" style={{ width: w, height: 34, borderRadius: 8 }} />
          ))}
        </div>

        {/* Entry cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ padding: "18px 20px", marginBottom: 12, display: "flex", gap: 16, alignItems: "center" }}>
            <div className="sk" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="sk" style={{ width: 120, height: 14, marginBottom: 8 }} />
              <div className="sk" style={{ width: 200, height: 11 }} />
            </div>
            <div className="sk" style={{ width: 60, height: 24, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}