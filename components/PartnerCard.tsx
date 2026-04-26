"use client";

interface Partner {
  id: string;
  name: string;
  avatar: string;
  score: number | null;
  verdict: "GO" | "CAUTION" | "NO-TRADE" | null;
  streak: number;
  lastCheckin: string;
}

const VERDICT_COLORS: Record<string, string> = {
  GO: "var(--green)",
  CAUTION: "var(--amber)",
  "NO-TRADE": "var(--red)",
};

export default function PartnerCard({ partner }: { partner: Partner }) {
  const color = partner.verdict ? VERDICT_COLORS[partner.verdict] : "var(--text-muted)";

  return (
    <div
      className="card card-hover"
      style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: `${color}22`,
          border: `1.5px solid ${color}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: color,
          flexShrink: 0,
        }}
      >
        {partner.avatar}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{partner.name}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {partner.streak}-day streak · {partner.lastCheckin}
        </div>
      </div>

      {/* Score + verdict */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div
          className="font-bebas"
          style={{ fontSize: 24, color: color, lineHeight: 1 }}
        >
          {partner.score ?? "—"}
        </div>
        <div
          style={{
            fontSize: 10,
            color: color,
            background: `${color}15`,
            border: `1px solid ${color}33`,
            borderRadius: 6,
            padding: "2px 6px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginTop: 4,
          }}
        >
          {partner.verdict}
        </div>
      </div>
    </div>
  );
}
