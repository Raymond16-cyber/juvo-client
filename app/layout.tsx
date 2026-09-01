import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import localFont from "next/font/local";
import AuthProvider from "@/Providers/auth.provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const saira = localFont({
  src: [
    {
      path: "../public/fonts/Saira/static/Saira-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Saira/static/Saira-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Saira/static/Saira-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Saira/static/Saira-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-saira",
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

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("juvo-theme") || "system";
    var dark = stored === "dark" || (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${saira.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <Providers>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
