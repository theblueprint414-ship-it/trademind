export default function Loading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="has-bottom-nav">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .sk {
          background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3) 50%, var(--surface2) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }
      `}</style>

      {/* Header skeleton */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="sk" style={{ width: 120, height: 28 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="sk" style={{ width: 80, height: 36, borderRadius: 8 }} />
          <div className="sk" style={{ width: 36, height: 36, borderRadius: 8 }} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Today card skeleton */}
        <div className="card" style={{ padding: 28, marginBottom: 24, display: "flex", gap: 24, alignItems: "center" }}>
          <div className="sk" style={{ width: 110, height: 110, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="sk" style={{ width: 120, height: 12, marginBottom: 12 }} />
            <div className="sk" style={{ width: 180, height: 48, marginBottom: 12 }} />
            <div className="sk" style={{ width: 100, height: 14 }} />
          </div>
        </div>

        {/* Stats row skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div className="sk" style={{ width: 48, height: 32, margin: "0 auto 8px" }} />
              <div className="sk" style={{ width: 64, height: 10, margin: "0 auto" }} />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="sk" style={{ width: 80, height: 12 }} />
            <div className="sk" style={{ width: 120, height: 12 }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
            {[60, 40, 75, 30, 85, 50, 70].map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div className="sk" style={{ width: "100%", height: h, borderRadius: 4 }} />
                <div className="sk" style={{ width: 20, height: 10 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick links skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "18px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <div className="sk" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
              <div>
                <div className="sk" style={{ width: 50, height: 13, marginBottom: 6 }} />
                <div className="sk" style={{ width: 36, height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}