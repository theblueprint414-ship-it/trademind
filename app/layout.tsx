import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Bebas_Neue } from "next/font/google";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ErrorBoundary from "@/components/ErrorBoundary";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import PostHogProvider from "@/components/PostHogProvider";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import ThemeProvider from "@/components/ThemeProvider";
import Toast from "@/components/Toast";
import TopLoadingBar from "@/components/TopLoadingBar";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trademindedge.com"),
  title: "TradeMind — Mental Edge for Traders",
  description: "Daily mental check-in protocol, trade limit enforcement, and accountability partners for serious traders.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TradeMind",
    startupImage: [],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "TradeMind — Mental Edge for Traders",
    description: "Know your mental state before you trade. Daily 5-question check-in. GO, CAUTION, or NO-TRADE — in 60 seconds.",
    type: "website",
    url: "https://trademindedge.com",
    images: [{ url: "https://trademindedge.com/api/og?score=82", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trademindedge",
    title: "TradeMind — Mental Edge for Traders",
    description: "Know your mental state before you trade. Daily 5-question check-in. GO, CAUTION, or NO-TRADE — in 60 seconds.",
    images: ["https://trademindedge.com/api/og?score=82"],
  },
};

export const viewport: Viewport = {
  themeColor: "#070B14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full`}
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className="min-h-full"
        style={{ background: "var(--bg)", color: "white" }}
      >
        <ThemeProvider />
        <ErrorBoundary>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </ErrorBoundary>
        <KeyboardShortcuts />
        <CookieBanner />
        <PWAInstallPrompt />
        <AccessibilityWidget />
        <Toast />
        <TopLoadingBar />
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function() {
                    // Re-schedule reminder on every app open (setTimeout is lost after browser restart)
                    var savedTime = localStorage.getItem('trademind_reminder_time');
                    if (savedTime && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                      navigator.serviceWorker.ready.then(function(reg) {
                        var parts = savedTime.split(' ');
                        var timeParts = parts[0].split(':').map(Number);
                        var meridiem = parts[1];
                        var hour = meridiem === 'PM' && timeParts[0] !== 12 ? timeParts[0] + 12 : meridiem === 'AM' && timeParts[0] === 12 ? 0 : timeParts[0];
                        // Pass yesterday's score so the push notification is contextual
                        var history = JSON.parse(localStorage.getItem('trademind_history') || '[]');
                        var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                        var yStr = yesterday.toISOString().split('T')[0];
                        var yEntry = history.find(function(h) { return h.date === yStr; });
                        var yScore = yEntry ? yEntry.score : null;
                        reg.active && reg.active.postMessage({ type: 'SCHEDULE_REMINDER_WITH_SCORE', hour: hour, minute: timeParts[1], yesterdayScore: yScore });
                      });
                    }
                  }).catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
