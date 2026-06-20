import type { Metadata } from "next";

// Forces dynamic rendering so proxy.ts (auth/onboarding gate) always runs —
// otherwise this page is statically cached and the gate is bypassed on cache hits.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trading Analytics | TradeMind",
  description:
    "See the correlation between your mental score and P&L. Discover behavioral patterns, streaks, and score-range performance across 90 days.",
  openGraph: {
    title: "Trading Analytics | TradeMind",
    description: "Psychology meets performance. See exactly how your mental state affects your trading results.",
    url: "https://trademind.pro/analytics",
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}