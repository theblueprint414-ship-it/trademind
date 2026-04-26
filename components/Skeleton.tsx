"use client";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 6, style }: SkeletonProps) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function SkeletonCard({ rows = 3, style }: { rows?: number; style?: React.CSSProperties }) {
  return (
    <div className="card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={i === 0 ? 18 : 13} width={i === 0 ? "60%" : i === rows - 1 ? "40%" : "100%"} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton height={10} width="50%" />
      <Skeleton height={32} width="60%" />
      <Skeleton height={10} width="40%" />
    </div>
  );
}