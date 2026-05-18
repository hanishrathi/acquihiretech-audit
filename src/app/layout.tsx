import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Website Audit Tool — AcquiHireTech",
  description:
    "Free AI-powered website audit. Get your performance, SEO, security, and AI readiness scores in 60 seconds. 300+ checks across 10 categories.",
  keywords: [
    "website audit",
    "SEO audit",
    "site speed test",
    "accessibility checker",
    "AI readiness",
    "website grader",
    "free website analysis",
  ],
  openGraph: {
    title: "Free Website Audit — AcquiHireTech",
    description:
      "AI-powered website audit with 300+ checks. Performance, SEO, Security, AI Readiness and more.",
    url: "https://audit.acquihiretech.com",
    siteName: "AcquiHireTech Audit",
    type: "website",
    images: [
      {
        url: "https://acquihiretech.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AcquiHireTech — AI-powered website audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Website Audit — AcquiHireTech",
    description:
      "AI-powered website audit with 300+ checks across 10 categories.",
    images: ["https://acquihiretech.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1d1d1f",
          colorBackground: "#ffffff",
          fontFamily: "DM Sans, -apple-system, sans-serif",
          borderRadius: "12px",
        },
      }}
    >
      <html
        lang="en"
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="canonical" href="https://audit.acquihiretech.com" />
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground font-body">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
