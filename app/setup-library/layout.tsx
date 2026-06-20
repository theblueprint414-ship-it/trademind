import type { Metadata } from "next";

// Forces dynamic rendering so proxy.ts (auth/onboarding gate) always runs —
// otherwise this page is statically cached and the gate is bypassed on cache hits.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ICT / SMC Setup Library — TradeMind",
  description: "Complete reference guide for ICT and Smart Money Concepts: Fair Value Gap, Order Block, BOS, ChoCh, SMT Divergence, Liquidity Sweep, Displacement, EQH/EQL. Step-by-step trade instructions for each setup.",
  alternates: { canonical: "https://trademindedge.com/setup-library" },
  openGraph: {
    title: "ICT / SMC Setup Library — TradeMind",
    description: "9 Smart Money Concepts with step-by-step trade instructions, confluence factors, timeframes, and common pitfalls. The reference guide serious ICT traders bookmark.",
    url: "https://trademindedge.com/setup-library",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  keywords: ["ICT setup", "SMC trading", "Fair Value Gap", "Order Block", "BOS trading", "Smart Money Concepts", "ChoCh", "Liquidity Sweep", "ICT reference"],
};

export default function SetupLibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}