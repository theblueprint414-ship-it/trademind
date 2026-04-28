import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TradeMind — Mental Edge for Traders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#070B14",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{ width: 12, height: 12, background: "#FF3B5C", borderRadius: "50%" }} />
          <span style={{ fontSize: 18, color: "#4F8EF7", fontWeight: 700, letterSpacing: "0.15em" }}>MENTAL EDGE PROTOCOL</span>
        </div>
        <div style={{ fontSize: 88, fontWeight: 900, color: "#E8F0FF", lineHeight: 1, marginBottom: 8, textAlign: "center" }}>
          TRADEMIND
        </div>
        <div style={{ fontSize: 32, color: "#7A8BA8", textAlign: "center", maxWidth: 700, lineHeight: 1.4, marginBottom: 48 }}>
          Know your mental state before you trade
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          {[
            { val: "3×", label: "more rule violations on bad mental days", color: "#00E87A" },
            { val: "5", label: "questions only", color: "#4F8EF7" },
            { val: "60s", label: "check-in time", color: "#FFB020" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: s.color }}>{s.val}</span>
              <span style={{ fontSize: 16, color: "#3D4F6A", marginTop: 4 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}