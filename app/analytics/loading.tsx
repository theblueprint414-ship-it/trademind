export default function Loading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .sk { background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3,#1c1e22) 50%, var(--surface2) 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <div className="sk" style={{ width: 120, height: 22 }} />
        <div className="sk" style={{ width: 100, height: 32, borderRadius: 20 }} />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {/* Big stat */}
        <div className="card" style={{ padding: 32, marginBottom: 20, textAlign: "center" }}>
          <div className="sk" style={{ width: 80, height: 12, margin: "0 auto 16px" }} />
          <div className="sk" style={{ width: 140, height: 72, margin: "0 auto 12px", borderRadius: 12 }} />
          <div className="sk" style={{ width: 100, height: 28, margin: "0 auto" }} />
        </div>

        {/* KPI grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div className="sk" style={{ width: 56, height: 36, margin: "0 auto 10px", borderRadius: 8 }} />
              <div className="sk" style={{ width: 72, height: 11, margin: "0 auto" }} />
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="sk" style={{ width: 120, height: 13, marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 100 }}>
            {[55, 80, 40, 90, 60, 75, 35, 85, 50, 70, 45, 65].map((h, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div className="sk" style={{ width: "100%", height: h, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Two-col cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="sk" style={{ width: 100, height: 12, marginBottom: 16 }} />
              <div className="sk" style={{ width: "100%", height: 80, borderRadius: 10 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}