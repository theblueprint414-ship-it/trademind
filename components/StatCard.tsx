"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface StatCardProps {
  value: number;        // 0 = show fallback
  label: string;
  color: string;        // CSS color value
  delay?: number;       // stagger delay in ms
  suffix?: string;
  subtext?: string;
  subtextColor?: string;
  badge?: string;       // small badge above the number (e.g. "ON FIRE")
  sparkline?: React.ReactNode;
}

export default function StatCard({
  value, label, color, delay = 0,
  suffix = "", subtext, subtextColor, badge, sparkline,
}: StatCardProps) {
  const displayed = useCountUp(value, 650, delay);

  return (
    <div
      className="card stat-card animate-card-enter"
      style={{ padding: 0, textAlign: "center", overflow: "hidden", animationDelay: `${delay}ms` }}
    >
      <div style={{ height: 2, background: value > 0 ? color : "var(--border)", transition: "background 0.4s" }} />
      <div style={{ padding: "16px 12px 18px" }}>
        {badge && (
          <div style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 3 }}>
            {badge}
          </div>
        )}
        <div
          className="font-bebas"
          style={{ fontSize: 32, color: value > 0 ? color : "var(--text-muted)", lineHeight: 1, marginBottom: badge ? 3 : 4, transition: "color 0.3s" }}
        >
          {value > 0 ? `${displayed}${suffix}` : "—"}
        </div>
        {sparkline}
        <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em" }}>{label}</div>
        {subtext && (
          <div style={{ fontSize: 9, color: subtextColor ?? "var(--text-muted)", fontWeight: 600, marginTop: 2 }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}