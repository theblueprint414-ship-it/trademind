import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — TradeMind",
  description: "Start free. TradeMind from $39/month — full pre-flight protocol: check-in, AI Coach, broker sync, analytics, behavioral pattern detection, and everything else. 7-day trial, cancel anytime.",
  openGraph: {
    title: "Pricing — TradeMind",
    description: "Start free. TradeMind $39/month — everything included. 7-day free trial, cancel anytime.",
    url: "https://trademindedge.com/pricing",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "Pricing — TradeMind",
    description: "Start free. TradeMind $39/month — everything included. 7-day free trial, cancel anytime.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
  alternates: { canonical: "https://trademindedge.com/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}