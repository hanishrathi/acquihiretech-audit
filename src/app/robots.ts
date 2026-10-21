import type { MetadataRoute } from "next";

// Every crawler, AI answer engines included, may read the public tool pages.
// Signed-in, payment and API routes are closed. Report pages stay crawlable on
// purpose: they carry noindex, which a crawler can only see if it may fetch them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/dashboard", "/checkout/"],
    },
    sitemap: "https://audit.acquihiretech.com/sitemap.xml",
  };
}
