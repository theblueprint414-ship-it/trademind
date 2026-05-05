"use client";

import { useEffect, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, duration = 700, delay = 0): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let rafId: number;
    let startTime: number | null = null;

    const timeout = setTimeout(() => {
      function step(ts: number) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        setCount(Math.round(easeOutCubic(progress) * target));
        if (progress < 1) rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }, delay);

    return () => { clearTimeout(timeout); cancelAnimationFrame(rafId); };
  }, [target, duration, delay]);

  return count;
}