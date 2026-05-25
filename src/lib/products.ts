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
  published?: boolean;           // default true. Set false to hide from /shop catalog.
}

export const PRODUCTS: Product[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "150-ai-prompts",
    title: "150+ Ultimate AI Prompts for Digital Product Creators",
    subtitle: "2026 Edition",
    shortDescription:
      "157 battle-tested prompts across 11 categories. Full commercial license. Built for creators selling on Gumroad, Etsy, and beyond.",
    longDescription:
      "Every prompt is fully written, tested, and ready to copy-paste into ChatGPT, Claude, or Gemini. No fluff, no theory — these are the exact prompts working creators use to ideate, write, design, and scale their digital product businesses in 2026.",
    priceINR: 99900, // ₹999 — placeholder, update with real price
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
    fileUrl:
      "https://acquihiretech.com/shop-files/150-ai-prompts/150-ai-prompts.pdf",
    fileFormat: ".pdf (59-page designed book)",
    fileSize: "~156 KB",
    badge: "Bestseller",
    heroAccent: "growth",
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "freelancer-life-os",
    title: "Ultimate Freelancer Life OS",
    subtitle: "All-in-One Notion Dashboard · 2026",
    shortDescription:
      "The complete Notion OS for freelancers — clients, finances, ADHD-friendly daily ops, content, and goals in one connected workspace.",
    longDescription:
      "Stop juggling 8 tabs. This is the single Notion workspace that runs your freelance business — built for solo operators with ADHD brains who need structure without rigidity. Every database is interconnected, every view is filtered for the next action, and every section has been tested by real freelancers shipping client work week after week.",
    priceINR: 99900,
    category: "Notion Templates",
    features: [
      "Fully linked Notion workspace (duplicate to your account in 1 click)",
      "Client CRM with project lifecycle stages",
      "Finance & invoice tracker with monthly P&L view",
      "ADHD-friendly daily planner with focus blocks",
      "Content calendar synced to your channels",
      "Quarterly goal & review system",
      "Commercial license + setup video walkthrough",
    ],
    whatsIncluded: [
      "Client CRM Database",
      "Finance & Invoice Tracker",
      "ADHD Daily Planner",
      "Content Calendar",
      "Goal & Review System",
      "Project Pipeline Board",
      "Proposal & SOW templates",
      "Setup guide (video + written)",
    ],
    fileUrl:
      "https://acquihiretech.com/shop-files/freelancer-life-os/freelancer-life-os.pdf",
    fileFormat: ".pdf (designed 38-page blueprint)",
    fileSize: "~107 KB",
    heroAccent: "conversion",
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "ai-productivity-mastery",
    title: "AI Productivity Mastery for Freelancers",
    subtitle: "65-Page Playbook + 30-Day Workbook · 2026",
    shortDescription:
      "Stop fearing AI, start shipping with it. A practical playbook + 30-day implementation track for non-technical freelancers.",
    longDescription:
      "Most AI guides are written for engineers. This one is written for the freelance designer, writer, consultant, or coach who keeps hearing 'use AI' but doesn't know where to start. By Day 30 you'll have replaced 10+ hours of weekly grunt work with reliable AI workflows you actually trust.",
    priceINR: 99900,
    category: "Ebooks & Playbooks",
    features: [
      "65-page ebook (PDF + EPUB)",
      "Companion 30-day implementation workbook",
      "50+ ready-to-use prompts you can deploy today",
      "Complete systems & workflow templates",
      "Tools-agnostic — works with ChatGPT, Claude, or Gemini",
      "Commercial license for client work",
    ],
    whatsIncluded: [
      "65-page core playbook (PDF + EPUB)",
      "30-day implementation workbook (PDF)",
      "50+ prompt library (.txt)",
      "Workflow templates pack",
      "Resource & tool stack guide",
    ],
    fileUrl:
      "https://acquihiretech.com/shop-files/ai-productivity-mastery/ai-productivity-mastery.pdf",
    fileFormat: ".pdf (designed 47-page book + workbook)",
    fileSize: "~130 KB",
    heroAccent: "operations",
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "adhd-digital-planner",
    title: "ADHD Hyperlinked Digital Planner",
    subtitle: "2026–2027 · GoodNotes + Printable",
    shortDescription:
      "An 80+ page hyperlinked planner designed for ADHD brains. Daily, weekly, monthly — plus habit, finance, and client tracking.",
    longDescription:
      "Built from the ground up for the ADHD brain — not a generic planner with ADHD slapped on the cover. Every page links to where you actually need to go next, so you never lose momentum tapping through nested menus. Works in GoodNotes, Noteshelf, Notability, and prints beautifully if you prefer paper.",
    priceINR: 99900,
    category: "Planners",
    features: [
      "80+ hyperlinked pages — tap to navigate, no scrolling",
      "Spans October 2026 → December 2027 (15 months)",
      "GoodNotes / Noteshelf / Notability compatible",
      "Print-ready PDF version included",
      "Daily, weekly, monthly, and yearly views",
      "Habit tracker, finance log, and client section",
      "Commercial license",
    ],
    whatsIncluded: [
      "Hyperlinked GoodNotes .pdf (digital)",
      "Print-ready high-DPI .pdf",
      "Daily / Weekly / Monthly trackers",
      "Habit tracker spread",
      "Finance & invoice section",
      "Client work tracker",
      "Brain dump pages",
      "Year-end review template",
    ],
    fileUrl:
      "https://acquihiretech.com/shop-files/adhd-digital-planner/adhd-digital-planner.zip",
    fileFormat: ".pdf (digital + print)",
    fileSize: "~25 MB",
    badge: "New",
    heroAccent: "presence",
    published: false, // hidden until visual planner is created
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "neurodivergent-wall-art",
    title: "50-Piece Neurodivergent Affirmation Wall Art",
    subtitle: "High-Res Posters + Editable SVGs",
    shortDescription:
      "Print-on-demand-ready: 50 affirmation posters + 20 editable SVGs designed for ADHD, autistic, and neurodivergent communities.",
    longDescription:
      "A complete print-on-demand starter pack. Drop these into your Etsy or Redbubble store and start selling — the designs, the licensing, and the mockup templates are all included. Originally created for our own community and now released with full commercial rights.",
    priceINR: 99900,
    category: "Print-on-Demand",
    features: [
      "50 high-resolution printable posters (300 DPI, A3/A4/letter sizes)",
      "20 editable SVG files for customization",
      "Mockup templates included (Etsy / Redbubble / Society6 ready)",
      "Full commercial license — sell on POD platforms",
      "Designed by and for the neurodivergent community",
      "Color palette guide included",
    ],
    whatsIncluded: [
      "50 print-ready .pdf and .png posters",
      "20 editable .svg files",
      "12 mockup .psd templates",
      "Color palette + brand guidelines",
      "Listing copy templates (titles, tags, descriptions)",
      "Commercial license document",
    ],
    fileUrl:
      "https://acquihiretech.com/shop-files/neurodivergent-wall-art/neurodivergent-wall-art.zip",
    fileFormat: ".zip (PDFs + PNGs + SVGs + PSDs)",
    fileSize: "~180 MB",
    heroAccent: "growth",
    published: false, // hidden until visual designs are produced
  },
];

/** Catalog excludes products marked published: false */
export const VISIBLE_PRODUCTS: Product[] = PRODUCTS.filter(
  (p) => p.published !== false
);

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatProductPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}
