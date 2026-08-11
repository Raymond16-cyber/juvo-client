import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JUVO | Trading Journal for Discipline",
    template: "%s | JUVO",
  },
  description:
    "JUVO is a premium trading journal and trader-development platform built to help traders build discipline, understand behavior, and improve over time.",
  keywords: [
    "trading journal",
    "trader psychology",
    "trading discipline",
    "trading performance",
    "forex journal",
    "trader development",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JUVO | Trading Journal for Discipline",
    description:
      "A premium trading journal and trader-development platform built around discipline, reflection, and consistency.",
    url: "/",
    siteName: "JUVO",
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 64,
        height: 64,
        alt: "JUVO logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JUVO | Trading Journal for Discipline",
    description:
      "A premium trading journal and trader-development platform built around discipline, reflection, and consistency.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
