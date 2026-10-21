import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MetaPixel } from "@/components/MetaPixel";
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
  // Relative URLs in metadata resolve against this. Each indexable page sets
  // its own alternates.canonical; there is deliberately no canonical here,
  // because a page without one would inherit it (every page used to point its
  // canonical at the home page, telling Google the others were duplicates).
  metadataBase: new URL("https://audit.acquihiretech.com"),
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
  // Origin only, even within this site: a full-page load from /report/<id> or
  // /checkout/... must not hand that URL to the next page's tags as referrer.
  referrer: "strict-origin",
};

// Structured data for search and answer engines. The tool is tied to the
// AcquihireTech organisation by the same @id the marketing site uses, so it
// reads as part of that entity rather than a separate one.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://audit.acquihiretech.com/#app",
      name: "AcquihireTech Website Audit",
      url: "https://audit.acquihiretech.com/",
      description:
        "Website audit tool with 300+ checks across 10 categories: performance, SEO, security, accessibility, mobile, content, conversion, brand, technical and AI readiness.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Basic", price: "0", priceCurrency: "INR" },
        { "@type": "Offer", name: "Starter", price: "1499", priceCurrency: "INR" },
        { "@type": "Offer", name: "Pro", price: "4999", priceCurrency: "INR" },
      ],
      publisher: { "@id": "https://acquihiretech.com/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://acquihiretech.com/#organization",
      name: "AcquihireTech",
      url: "https://acquihiretech.com/",
    },
  ],
};

// Clerk is wrapped only when configured — otherwise the free audit tool
// renders without it, so a missing key can't crash page rendering.
const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
        />
        {children}
        {/* GA4 and Meta Pixel, production deployments only — see src/lib/analytics.ts */}
        <GoogleAnalytics enabled={process.env.VERCEL_ENV === "production"} />
        <MetaPixel enabled={process.env.VERCEL_ENV === "production"} />
      </body>
    </html>
  );

  if (!clerkConfigured) {
    return shell;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1d1d1f",
          colorBackground: "#ffffff",
          fontFamily: "Syne, -apple-system, sans-serif",
          borderRadius: "12px",
        },
      }}
    >
      {shell}
    </ClerkProvider>
  );
}
