import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — TradeMind",
  description: "Start free. Upgrade when you're ready. TradeMind Pro and Premium plans for serious traders who want to stop losing money to psychology.",
  openGraph: {
    title: "Pricing — TradeMind",
    description: "Start free. Upgrade when you're ready. TradeMind Pro and Premium plans for serious traders who want to stop losing money to psychology.",
    url: "https://trademindedge.com/pricing",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trademindedge.com/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}