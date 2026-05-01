"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopLoadingBar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#") || href === pathname) return;
      clearTimers();
      setVisible(true);
      setWidth(0);
      timers.current = [
        setTimeout(() => setWidth(25), 10),
        setTimeout(() => setWidth(55), 250),
        setTimeout(() => setWidth(80), 900),
      ];
    }
    document.addEventListener("click", onLinkClick);
    return () => document.removeEventListener("click", onLinkClick);
  }, [pathname]);

  useEffect(() => {
    clearTimers();
    setWidth(100);
    timers.current.push(setTimeout(() => { setVisible(false); setWidth(0); }, 280));
  }, [pathname]);

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 9999, pointerEvents: "none" }}>
      <div style={{
        height: "100%",
        width: `${width}%`,
        background: "linear-gradient(90deg, var(--blue), #8B5CF6)",
        transition: width === 100 ? "width 0.12s ease" : "width 0.6s ease",
        boxShadow: "0 0 10px rgba(94,106,210,0.8)",
        borderRadius: "0 2px 2px 0",
      }} />
    </div>
  );
}