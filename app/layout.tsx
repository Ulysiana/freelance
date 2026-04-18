import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import PWARegister from "@/components/PWARegister";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://creahub-solutions.fr"),
  manifest: "/manifest.webmanifest",
  title: "Creahub Solutions – Développeuse Freelance · Python, React, WordPress, Cloud",
  description:
    "Creahub Solutions — développeuse freelance full-stack. Python, React, Node, Rust, WordPress, Shopify, Cloud Run, Neon. Audit SEO, migrations, apps desktop & mobile. 100 % remote · 590 €/j.",
  keywords: [
    "développeuse freelance",
    "python freelance",
    "react freelance",
    "wordpress freelance",
    "shopify freelance",
    "cloud run",
    "audit SEO",
    "migration base de données",
    "100% remote",
  ],
  openGraph: {
    title: "Creahub Solutions – Développeuse Freelance",
    description: "Python, React, WordPress, Cloud Run · 100 % remote · 590 €/j",
    url: "https://creahub-solutions.fr",
    siteName: "Creahub Solutions",
    images: [{ url: "/images/OG_creahub-solutions.png", width: 1200, height: 630, alt: "Creahub Solutions" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creahub Solutions – Développeuse Freelance",
    description: "Python, React, WordPress, Cloud Run · 100 % remote · 590 €/j",
    images: ["/images/OG_creahub-solutions.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Creahub",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0806",
  colorScheme: "dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body suppressHydrationWarning>{children}<CookieBanner /><PWARegister /></body>
    </html>
  );
}
