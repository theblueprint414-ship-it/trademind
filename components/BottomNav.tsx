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

const CoachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 5l1.5-1.5M16 7.5h1.5M14 10l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/dashboard",  Icon: HomeIcon,      label: "Home"     },
  { href: "/journal",    Icon: JournalIcon,   label: "Journal"  },
  { href: "/checkin",    Icon: CheckinIcon,   label: "Check-in", primary: true },
  { href: "/analytics",  Icon: AnalyticsIcon, label: "Stats"    },
  { href: "/coach",      Icon: CoachIcon,     label: "Coach"    },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
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
    </nav>
  );
}