import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — TradeMind",
  description: "Get help with your TradeMind account, report a bug, or send feedback. We respond to every message.",
  alternates: { canonical: "https://trademindedge.com/contact" },
  openGraph: {
    title: "Contact — TradeMind",
    description: "Questions about your account, billing, or a feature? We respond to every message.",
    url: "https://trademindedge.com/contact",
    siteName: "TradeMind",
    type: "website",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "Contact — TradeMind",
    description: "Questions about your account, billing, or a feature? We respond to every message.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}