import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Mental Check-In | TradeMind",
  description:
    "Run your pre-trade psychology check-in. Get your mental score — GO, CAUTION, or NO-TRADE — before the market opens.",
  openGraph: {
    title: "Daily Mental Check-In | TradeMind",
    description: "Know if you're mentally ready to trade before you place a single order.",
    url: "https://trademind.pro/checkin",
  },
};

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return children;
}