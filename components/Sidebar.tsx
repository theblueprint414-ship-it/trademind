"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_SECTIONS = [
  {
    items: [
      {
        href: "/dashboard",
        label: "Home",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M6 15V9.5h4V15" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        href: "/journal",
        label: "Journal",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: "/analytics",
        label: "Analytics",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12l3.5-4 2.5 2.5L11 6l3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 14.5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: "/checkin",
        label: "Psychology",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M2 14.5c0-2.485 2.686-4.5 6-4.5s6 2.015 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10.5 4.5l1-1M11.5 6.5H13M10.5 8.5l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
        matchPaths: ["/checkin", "/mind", "/weekly", "/mid-checkin"],
      },
    ],
  },
  {
    items: [
      {
        href: "/backtest",
        label: "Backtest",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8A5 5 0 013 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3 8a5 5 0 0110 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 2"/>
            <path d="M13 5v3h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        href: "/coach",
        label: "AI Coach",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10a1 1 0 011 1v5a1 1 0 01-1 1H9l-3 2v-2H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M5.5 8h.5M7.75 8h.5M10 8h.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: "/challenge",
        label: "Challenge",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l1.5 3.5 3.5.5-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        href: "/playbook",
        label: "Playbook",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
];

const BOTTOM_ITEMS = [
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function NavItem({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "7px 10px",
          borderRadius: 8,
          cursor: "pointer",
          transition: "background 0.15s ease, color 0.15s ease",
          background: active ? "rgba(94,106,210,0.12)" : "transparent",
          color: active ? "var(--text)" : "var(--text-dim)",
          position: "relative",
          userSelect: "none",
        }}
        className="sidebar-nav-item"
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            flexShrink: 0,
            color: active ? "var(--blue)" : "currentColor",
            transition: "color 0.15s ease",
          }}
        >
          {icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, letterSpacing: "-0.01em", flex: 1 }}>
          {label}
        </span>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
            background: "rgba(94,106,210,0.18)", color: "var(--blue)", letterSpacing: "0.02em",
          }}>
            {badge}
          </span>
        )}
        {active && (
          <div style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
            width: 3, height: 16, borderRadius: "0 2px 2px 0",
            background: "var(--blue)",
          }} />
        )}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => setPlan(d.plan)).catch(() => {});
  }, []);

  function isActive(item: { href: string; matchPaths?: string[] }) {
    if (item.matchPaths) {
      return item.matchPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.svg" alt="TradeMind" height="22" style={{ display: "block" }} />
        </Link>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {si > 0 && <div style={{ height: 1, background: "var(--border)", margin: "6px 4px 10px" }} />}
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item)}
                badge={item.href === "/coach" && plan !== "premium" ? "PRO" : undefined}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ padding: "8px 8px 16px", borderTop: "1px solid var(--border)" }}>
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item)}
          />
        ))}
        {plan && (
          <div style={{
            margin: "8px 4px 0",
            padding: "8px 10px",
            borderRadius: 8,
            background: plan === "premium"
              ? "linear-gradient(135deg, rgba(157,111,255,0.12), rgba(94,106,210,0.08))"
              : "rgba(94,106,210,0.06)",
            border: `1px solid ${plan === "premium" ? "rgba(157,111,255,0.25)" : "var(--border)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: plan === "premium" ? "#9D6FFF" : plan === "pro" ? "var(--blue)" : "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {plan === "premium" ? "Premium" : plan === "pro" ? "Pro" : "Free"}
            </span>
            {plan === "free" && (
              <Link href="/pricing" style={{ textDecoration: "none" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--blue)", cursor: "pointer" }}>Upgrade →</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
