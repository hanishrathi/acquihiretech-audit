/**
 * Product catalog — all paid digital products sold in /shop.
 *
 * Add new products: append a new entry to PRODUCTS.
 * Upload the actual file to cPanel at:
 *   /public_html/shop-files/{slug}/{filename}
 * Then set fileUrl to the public URL of that file.
 *
 * All prices in paise (INR / 100). Example: 99900 = ₹999.
 */

export interface Product {
  slug: string;                  // URL slug: /shop/{slug}
  title: string;
  subtitle?: string;
  shortDescription: string;      // one-liner for catalog cards
  longDescription: string;       // full description on product page
  priceINR: number;              // in paise
  category: string;              // grouping label
  features: string[];            // bullet list on product page
  whatsIncluded?: string[];      // detailed deliverables section
  fileUrl: string;               // cPanel-hosted file URL (sent post-payment)
  fileFormat: string;            // ".txt" / ".pdf" / ".zip" / etc.
  fileSize: string;              // human-readable: "50 KB" / "2.4 MB"
  badge?: string;                // optional ribbon: "Bestseller" / "New" / "Limited"
  heroAccent?: "growth" | "conversion" | "operations" | "presence"; // brand color
}

export const PRODUCTS: Product[] = [
  {
    slug: "150-ai-prompts",
    title: "150+ Ultimate AI Prompts for Digital Product Creators",
    subtitle: "2026 Edition",
    shortDescription:
      "157 battle-tested prompts across 11 categories. Full commercial license. Built for creators selling on Gumroad, Etsy, and beyond.",
    longDescription:
      "Every prompt is fully written, tested, and ready to copy-paste into ChatGPT, Claude, or Gemini. No fluff, no theory — these are the exact prompts working creators use to ideate, write, design, and scale their digital product businesses in 2026.",
    priceINR: 99900, // ₹999 — UPDATE THIS to your actual price
    category: "AI Tools",
    features: [
      "157 complete prompts, ready to copy-paste",
      "11 categories covering the full creator workflow",
      "High-converting sales copy prompts",
      "Notion template & ebook creation prompts",
      "Etsy & Gumroad listing optimization",
      "Full commercial license included",
      "Instant download after purchase",
      "Lifetime updates as new prompts are added",
    ],
    whatsIncluded: [
      "Idea Generation prompts",
      "Niche Research prompts",
      "Sales Page copy prompts",
      "Notion Template prompts",
      "Ebook outline & writing prompts",
      "Printable design prompts",
      "SEO & keyword prompts",
      "Email Funnel prompts",
      "Pricing & positioning prompts",
      "Scaling & operations prompts",
      "Bonus: prompt-chaining workflows",
    ],
    // UPDATE this URL after uploading the file to cPanel:
    //   /public_html/shop-files/150-ai-prompts/150-ai-prompts.txt
    fileUrl:
      "https://acquihiretech.com/shop-files/150-ai-prompts/150-ai-prompts.txt",
    fileFormat: ".txt + .pdf",
    fileSize: "~120 KB",
    badge: "Bestseller",
    heroAccent: "growth",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatProductPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}
