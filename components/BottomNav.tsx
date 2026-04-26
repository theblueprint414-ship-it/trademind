"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 11l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 15l4-5 3 3 4-7 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);


const CoachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 5l1.5-1.5M16 7.5h1.5M14 10l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CirclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="7" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="13" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 17c0-2.21 2.239-4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 17c0-2.21-2.239-4-5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 13c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/dashboard",  Icon: HomeIcon,      label: "Home"    },
  { href: "/journal",    Icon: JournalIcon,   label: "Journal" },
  { href: "/checkin",    Icon: CheckinIcon,   label: "Check-in", primary: true },
  { href: "/analytics",  Icon: AnalyticsIcon, label: "Stats"   },
  { href: "/circles",    Icon: CirclesIcon,   label: "Circles" },
  { href: "/coach",      Icon: CoachIcon,     label: "Coach"   },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ href, Icon, label, primary }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={isActive ? "active" : ""}
            style={primary ? {
              background: "var(--blue)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: -10,
              boxShadow: "0 0 20px rgba(79,142,247,0.4)",
              color: "#fff",
              gap: 0,
            } : undefined}
          >
            <span className="nav-icon"><Icon /></span>
            {!primary && label}
          </Link>
        );
      })}
    </nav>
  );
}