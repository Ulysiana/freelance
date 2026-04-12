import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
