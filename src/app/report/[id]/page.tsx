import type { Metadata } from "next";
import { ReportClient } from "./ReportClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Server-side: fetch audit summary for social meta tags
async function fetchAuditMeta(id: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${process.env.VERCEL_URL || "audit.acquihiretech.com"}`;
    const res = await fetch(`${baseUrl}/api/audit/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await fetchAuditMeta(id);

  if (!audit || !audit.result) {
    return {
      title: "Website Audit Report — AcquiHireTech",
      description: "Free AI-powered website audit. 300+ checks across 10 categories.",
    };
  }

  const score = Math.round(audit.result.overallScore || 0);
  const domain = audit.result.metadata?.domain || "this website";
  const issues = audit.result.totalIssuesCount || 0;
  const grade =
    score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  const title = `${domain} scored ${score}/100 (${grade}) — AcquiHire Audit`;
  const description = `Full audit of ${domain}: ${issues} issues across performance, SEO, AI readiness, and 7 other categories. Get your own free audit at audit.acquihiretech.com.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://audit.acquihiretech.com/report/${id}`,
      siteName: "AcquiHire Audit",
      images: [
        {
          url: "https://acquihiretech.com/og-image.png",
          width: 1200,
          height: 630,
          alt: `${domain} scored ${score}/100`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://acquihiretech.com/og-image.png"],
    },
    robots: {
      index: false, // Don't let Google index individual reports
      follow: true,
    },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params;
  return <ReportClient id={id} />;
}
