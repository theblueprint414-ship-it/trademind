"use client";

import { useEffect, useRef, useId, useState } from "react";

interface ScoreRingProps {
  score: number;
  color?: string;
  size?: number;
}

function getGradientColors(color: string): [string, string] {
  if (color.includes("--green") || color === "var(--green)") return ["#00E87A", "#00b8ff"];
  if (color.includes("--red")   || color === "var(--red)")   return ["#FF3B5C", "#ff8c00"];
  if (color.includes("--amber") || color === "var(--amber)") return ["#FFB020", "#ff6b00"];
  if (color.includes("--blue")  || color === "var(--blue)")  return ["#4F8EF7", "#9D6FFF"];
  return [color, color];
}

// Ease-out cubic — matches the ring stroke animation feel
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function ScoreRing({ score, color = "var(--red)", size = 120 }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const gradId = useId().replace(/:/g, "");
  const radius = (size / 2) * 0.75;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;
  const strokeWidth = size * 0.065;
  const [colorA, colorB] = getGradientColors(color);
  const [displayed, setDisplayed] = useState(0);

  // Ring stroke animation
  useEffect(() => {
    if (!circleRef.current) return;
    const circle = circleRef.current;
    circle.style.strokeDashoffset = String(circumference);
    circle.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
        circle.style.strokeDashoffset = String(targetOffset);
      });
    });
  }, [score, circumference, targetOffset]);

  // Counter animation — counts from 0 to score in sync with the ring
  useEffect(() => {
    setDisplayed(0);
    const duration = 1100;
    let startTime: number | null = null;
    let rafId: number;

    function step(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setDisplayed(Math.round(easeOutCubic(progress) * score));
      if (progress < 1) rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [score]);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={`grad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={colorA} />
            <stop offset="100%" stopColor={colorB} />
          </linearGradient>
          <filter id={`glow-${gradId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--surface3)"
          strokeWidth={strokeWidth}
        />

        {/* Subtle track glow */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={colorA}
          strokeWidth={strokeWidth * 0.3}
          opacity={0.12}
        />

        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#grad-${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          filter={`url(#glow-${gradId})`}
        />
      </svg>

      {/* Score number */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span
          className="font-bebas score-number animate-score-pop"
          style={{ fontSize: size * 0.3, color: colorA, lineHeight: 1, textShadow: `0 0 20px ${colorA}60` }}
        >
          {displayed}
        </span>
        <span style={{ fontSize: size * 0.1, color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)", lineHeight: 1 }}>
          /100
        </span>
      </div>
    </div>
  );
}
