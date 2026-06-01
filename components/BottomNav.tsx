"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7.5 18V13h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const JournalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 7h6M7 10.5h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 15l4-5 3 3 4-7 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const MORE_ITEMS = [
  {
    href: "/coach",
    label: "AI Coach",
    emoji: "🧠",
    description: "Your personal trading psychologist",
    color: "var(--blue)",
  },
  {
    href: "/pretrade",
    label: "Pre-Trade Ritual",
    emoji: "⚡",
    description: "60-second ritual before every trade",
    color: "var(--amber)",
  },
  {
    href: "/challenge",
    label: "Challenge",
    emoji: "🏆",
    description: "Prop firm challenge tracker",
    color: "var(--amber)",
  },
  {
    href: "/setup-library",
    label: "Setup Library",
    emoji: "📖",
    description: "ICT / SMC reference guide",
    color: "#60A5FA",
  },
  {
    href: "/mind",
    label: "Mental Patterns",
    emoji: "📊",
    description: "Lifestyle × P&L correlations",
    color: "var(--green)",
  },
  {
    href: "/weekly",
    label: "Weekly Review",
    emoji: "📅",
    description: "Last week's performance summary",
    color: "#A78BFA",
  },
  {
    href: "/bridge",
    label: "EdgeBridge",
    emoji: "🔗",
    description: "Desktop sync for MT4/MT5",
    color: "#3B82F6",
  },
  {
    href: "/circles",
    label: "Circles",
    emoji: "👥",
    description: "Group accountability",
    color: "#EC4899",
  },
  {
    href: "/settings",
    label: "Settings",
    emoji: "⚙️",
    description: "Account, notifications, integrations",
    color: "var(--text-dim)",
  },
];

const NAV_ITEMS = [
  { href: "/dashboard",  Icon: HomeIcon,      label: "Home"     },
  { href: "/journal",    Icon: JournalIcon,   label: "Journal"  },
  { href: "/checkin",    Icon: CheckinIcon,   label: "Check-in", primary: true },
  { href: "/analytics",  Icon: AnalyticsIcon, label: "Stats"    },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const moreActive = MORE_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* More drawer backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* More drawer */}
      <div
        style={{
          position: "fixed",
          bottom: open ? 72 : "-100%",
          left: 0, right: 0,
          zIndex: 1000,
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderRadius: "20px 20px 0 0",
          padding: "20px 16px 8px",
          transition: "bottom 0.3s cubic-bezier(0.32,0.72,0,1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
          maxHeight: "75vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 20px" }} />

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12, paddingLeft: 4 }}>MORE</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingBottom: 16 }}>
          {MORE_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "14px 14px",
                    borderRadius: 14,
                    background: isActive ? "rgba(94,106,210,0.12)" : "var(--bg)",
                    border: `1px solid ${isActive ? "rgba(94,106,210,0.3)" : "var(--border)"}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{item.description}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Nav bar */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, Icon, label, primary }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[isActive ? "active" : "", primary ? "nav-primary" : ""].filter(Boolean).join(" ")}
            >
              <span className="nav-icon"><Icon /></span>
              <span className="nav-label">{label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={moreActive ? "active" : ""}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "8px 0",
            flex: 1,
            color: moreActive || open ? "var(--blue)" : "var(--text-muted)",
            transition: "color 0.15s",
            fontFamily: "inherit",
          }}
        >
          <span style={{ transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>
            <GridIcon />
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.02em" }}>More</span>
        </button>
      </nav>
    </>
  );
}