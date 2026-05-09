import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mental Patterns — TradeMind",
  description: "See exactly how your sleep quality, caffeine intake, exercise habits, and alcohol consumption affect your trading P&L and win rate. Data-driven insights no other trading tool provides.",
  alternates: { canonical: "https://trademindedge.com/mind" },
  openGraph: {
    title: "Mental Patterns — TradeMind",
    description: "How does sleep affect your P&L? Does caffeine hurt your win rate? TradeMind correlates your lifestyle with your actual trading performance.",
    url: "https://trademindedge.com/mind",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
};

export default function MindLayout({ children }: { children: React.ReactNode }) {
  return children;
}