import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — TradeMind",
  description: "Start free. Upgrade when you're ready. Pro from $19/month — unlimited journal, analytics, accountability partners. Premium from $45/month adds AI Coach and broker sync. 4-day trial, cancel anytime.",
  openGraph: {
    title: "Pricing — TradeMind",
    description: "Start free. Pro from $19/month. Premium from $45/month. 7-day free trial, cancel anytime.",
    url: "https://trademindedge.com/pricing",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "Pricing — TradeMind",
    description: "Start free. Pro from $19/month. Premium from $45/month. 7-day free trial, cancel anytime.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
  alternates: { canonical: "https://trademindedge.com/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}