export default function Loading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }} className="has-bottom-nav">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .sk { background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3,#1c1e22) 50%, var(--surface2) 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <div className="sk" style={{ width: 80, height: 22 }} />
        <div className="sk" style={{ width: 90, height: 32, borderRadius: 8 }} />
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Coach message */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div className="sk" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1, maxWidth: 400 }}>
            <div className="sk" style={{ width: "90%", height: 14, marginBottom: 8, borderRadius: 10 }} />
            <div className="sk" style={{ width: "70%", height: 14, borderRadius: 10 }} />
          </div>
        </div>

        {/* User message */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div className="sk" style={{ width: 200, height: 40, borderRadius: 12 }} />
        </div>

        {/* Coach response */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div className="sk" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1, maxWidth: 480 }}>
            <div className="sk" style={{ width: "95%", height: 14, marginBottom: 8, borderRadius: 10 }} />
            <div className="sk" style={{ width: "80%", height: 14, marginBottom: 8, borderRadius: 10 }} />
            <div className="sk" style={{ width: "60%", height: 14, borderRadius: 10 }} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", background: "var(--surface)" }}>
        <div className="sk" style={{ width: "100%", height: 48, borderRadius: 12 }} />
      </div>
    </div>
  );
}