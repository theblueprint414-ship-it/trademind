import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EdgeBridge — Desktop Sync for MT4, MT5, NinjaTrader & Tradovate",
  description: "Free desktop app that syncs your MT4/MT5, NinjaTrader 8, and Tradovate trades to TradeMind in real-time. No MetaAPI required. Install the Expert Advisor and your trades sync automatically.",
  alternates: { canonical: "https://trademindedge.com/bridge" },
  openGraph: {
    title: "EdgeBridge — Desktop Sync for MT4, MT5, NinjaTrader & Tradovate",
    description: "Free desktop app for MT4/MT5, NinjaTrader 8, and Tradovate. Runs in your system tray. Syncs trades to TradeMind automatically in real-time.",
    url: "https://trademindedge.com/bridge",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  keywords: ["MT4 trade journal sync", "MT5 journal", "NinjaTrader sync", "Tradovate trade journal", "MetaTrader TradeMind", "EdgeBridge"],
};

export default function BridgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}