import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

const BASE = "https://audit.acquihiretech.com";

// The public, indexable pages only — the same set that sets its own canonical.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/shop`, changeFrequency: "weekly", priority: 0.6 },
    ...PRODUCTS.map((p) => ({
      url: `${BASE}/shop/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
