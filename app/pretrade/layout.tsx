import type { Metadata } from "next";

// Forces dynamic rendering so proxy.ts (auth/onboarding gate) always runs —
// otherwise this page is statically cached and the gate is bypassed on cache hits.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pre-Trade Ritual — TradeMind",
  description: "A 60-second ritual before every trade: rate your conviction, write your thesis, confirm your stop loss. The traders who write down their edge before entering take better trades.",
  alternates: { canonical: "https://trademindedge.com/pretrade" },
  openGraph: {
    title: "Pre-Trade Ritual — TradeMind",
    description: "Rate conviction 1–10, articulate your edge in writing, confirm your stop loss — before every single trade. Compulsory for funded traders.",
    url: "https://trademindedge.com/pretrade",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
};

export default function PretradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}