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

// ── ATLAS SERIES VOL. IV–IX · The Trading Codex ───────────────────────────
PRODUCTS.push(
  {
    slug: "trading-open-field",
    title: "The Open Field",
    subtitle: "25 AI Strategies for Long-Term Equity Investors · Vol. IV",
    shortDescription:
      "Twenty-five copy-paste AI prompts for value investing, dividend strategies, GARP, special situations, and portfolio construction.",
    longDescription:
      "Buffett-style value audits, Magic Formula screens, Piotroski F-Score, Greenblatt's edges, spin-off investing, activist tracking, DCA optimisation — every long-term equity strategy expressed as a copy-paste prompt that turns ChatGPT, Claude, Gemini, Grok, or KIMI into your fundamental research analyst.",
    priceINR: 149900,
    category: "Trading & Investing",
    features: [
      "25 fully-written AI prompts across 4 ordered parts",
      "Quality + value, momentum, special situations, portfolio rules",
      "Works with ChatGPT, Claude, Gemini, Grok, KIMI, DeepSeek",
      "Compatible with US and Indian equity markets",
      "Risk-management notes baked into every strategy",
      "Full commercial license (use in client work)",
    ],
    whatsIncluded: [
      "Quality + Value Screener",
      "Buffett-Style Value Audit",
      "Magic Formula (Greenblatt)",
      "Piotroski F-Score Filter",
      "Dividend Aristocrat Tracker",
      "GARP (Lynch)",
      "Wide-Moat Identification",
      "ROIC-Focused Compounders",
      "Insider Buying Pattern",
      "52-Week High Momentum",
      "Mean Reversion (Long)",
      "Sector Rotation",
      "Seasonality Patterns",
      "Post-Earnings Drift",
      "Stock-Split Watch",
      "Spin-off Investing",
      "Distressed Asset Recovery",
      "IPO Quiet Period Strategy",
      "Merger Arbitrage (Long)",
      "Activist Investor Tracking",
      "DCA-Plus Optimisation",
      "Tax-Loss Harvesting",
      "Portfolio Rebalancing Rules",
      "Concentration vs Diversification",
      "Annual Portfolio Review",
    ],
    fileUrl: "https://acquihiretech.com/shop-files/trading-open-field/trading-open-field.pdf",
    fileFormat: ".pdf (designed 36-page book)",
    fileSize: "~135 KB",
    heroAccent: "operations",
  },
  {
    slug: "trading-tactical-hand",
    title: "The Tactical Hand",
    subtitle: "25 AI Strategies for Swing & Position Traders · Vol. V",
    shortDescription:
      "Chart patterns, indicator-driven setups, catalyst trading, and risk-execution discipline — every swing-trading edge as an AI prompt.",
    longDescription:
      "Cup-and-handle, bull flags, head-and-shoulders, RSI divergence, MACD, Ichimoku, anchored VWAP, pre/post-earnings drift, multi-timeframe confirmation, ATR-based sizing, weekly review — the full operator's toolkit for hold-times from 2 days to 4 weeks.",
    priceINR: 149900,
    category: "Trading & Investing",
    features: [
      "25 swing-trading AI prompts across 4 ordered parts",
      "Classic chart patterns + indicator setups + catalyst plays",
      "Position sizing and risk-management discipline included",
      "Multi-timeframe confirmation framework",
      "Works with any liquid equity market",
      "Commercial license",
    ],
    whatsIncluded: [
      "Cup-and-Handle Breakout",
      "Bullish Flag Pattern",
      "Head-and-Shoulders Reversal",
      "Double Bottom Reversal",
      "Triangle Breakout",
      "Pullback to Moving Average",
      "Pivot Point Trading",
      "Anchored VWAP Strategy",
      "Bollinger Band Squeeze",
      "RSI Divergence",
      "MACD Crossover",
      "Ichimoku Cloud Strategy",
      "Stochastic (Range Markets)",
      "ADX Trend Strength Filter",
      "Fibonacci Retracement Entries",
      "Pre-Earnings Run-Up",
      "Post-Earnings Drift (PEAD)",
      "Gap and Go (Swing)",
      "News Catalyst Trading",
      "Sector Rotation (Tactical)",
      "Multi-Timeframe Confirmation",
      "ATR-Based Position Sizing",
      "Trailing Stop Strategies",
      "Time Stop Discipline",
      "Weekly Trade Review",
    ],
    fileUrl: "https://acquihiretech.com/shop-files/trading-tactical-hand/trading-tactical-hand.pdf",
    fileFormat: ".pdf (designed 36-page book)",
    fileSize: "~136 KB",
    badge: "Bestseller",
    heroAccent: "growth",
  },
  {
    slug: "trading-quick-tide",
    title: "The Quick Tide",
    subtitle: "25 AI Strategies for Intraday & Day Trading · Vol. VI",
    shortDescription:
      "Opening range breakouts, VWAP plays, momentum scalping, news-driven spikes, halts, and the discipline that separates day traders who survive from those who don't.",
    longDescription:
      "Pre-market mover scans, gap-and-go, gap fills, opening range breakouts, VWAP trend and reversion, momentum scalping, news spikes, level 2 reading, short squeezes, power hour reversals, daily loss limits, revenge trade detection — the most operational volume in the series.",
    priceINR: 149900,
    category: "Trading & Investing",
    features: [
      "25 day-trading AI prompts across 4 ordered parts",
      "Open, midday, power hour, and close playbooks",
      "Level 2 + tape reading framework",
      "Daily loss limit + revenge trade discipline",
      "Setup quality grading (A/B/C/D) framework",
      "Commercial license",
    ],
    whatsIncluded: [
      "Opening Range Breakout (ORB)",
      "Gap and Go (Day Trade)",
      "Gap Fill Strategy",
      "Pre-Market Movers Analysis",
      "First Pullback After Breakout",
      "Earnings-Day Volatility Trading",
      "IPO Day 1 Strategy",
      "VWAP Reversion (Mean Reversion)",
      "VWAP Trend Trading",
      "Momentum Scalping",
      "News-Driven Spike Trading",
      "ABCD Pattern Day Trade",
      "Bull Flag Day Trade",
      "Halt and Resumption",
      "Sector Leader/Laggard Pair",
      "Level 2 / Order Book Reading",
      "Tape Reading (Time & Sales)",
      "Short Squeeze Identification",
      "Closing Range Strategy",
      "Power Hour Reversal",
      "Float Analysis for Small Caps",
      "Daily Loss Limit Enforcement",
      "Revenge Trade Detection",
      "Setup Quality Grading",
      "Weekly Performance Review",
    ],
    fileUrl: "https://acquihiretech.com/shop-files/trading-quick-tide/trading-quick-tide.pdf",
    fileFormat: ".pdf (designed 36-page book)",
    fileSize: "~126 KB",
    heroAccent: "conversion",
  },
  {
    slug: "trading-hedge",
    title: "The Hedge",
    subtitle: "25 AI Strategies for Options & Derivatives · Vol. VII",
    shortDescription:
      "Cash-secured puts, iron condors, calendars, debit spreads, collars, VIX hedges, IV rank trading, earnings volatility crush, rolling defense — every options playbook as an AI prompt.",
    longDescription:
      "Income strategies (CSP, covered call wheel, iron condors), directional plays (debit spreads, long calls/puts), hedging (collar, married put, VIX), and advanced topics (delta-neutral, gamma scalping, IV skew, rolling). The complete options operator's manual.",
    priceINR: 149900,
    category: "Trading & Investing",
    features: [
      "25 options & derivatives AI prompts across 4 ordered parts",
      "Income, directional, hedging, and advanced strategies",
      "Greeks analysis baked in (delta, theta, vega)",
      "IV Rank + earnings IV crush playbooks",
      "Defined-risk discipline emphasized throughout",
      "Commercial license",
    ],
    whatsIncluded: [
      "Cash-Secured Put",
      "Covered Call (Wheel)",
      "Iron Condor (Neutral)",
      "Iron Butterfly",
      "Credit Put Spread (Bullish)",
      "Credit Call Spread (Bearish)",
      "Calendar Spread",
      "Debit Call Spread",
      "Debit Put Spread",
      "Long Call",
      "Long Put",
      "Long Straddle",
      "Long Strangle",
      "Collar Strategy",
      "Married Put",
      "Protective Put",
      "VIX Spike Hedge",
      "Synthetic Long Stock",
      "IV Rank Trading",
      "Earnings Volatility Crush",
      "Delta-Neutral Strategies",
      "Rolling Strategies (Defense)",
      "Theta Decay Optimization",
      "IV Skew Analysis",
      "Trade Review & Greeks Audit",
    ],
    fileUrl: "https://acquihiretech.com/shop-files/trading-hedge/trading-hedge.pdf",
    fileFormat: ".pdf (designed 36-page book)",
    fileSize: "~125 KB",
    heroAccent: "presence",
  },
  {
    slug: "trading-macro-lens",
    title: "The Macro Lens",
    subtitle: "25 AI Strategies for Macro, Sector & Crypto · Vol. VIII",
    shortDescription:
      "Yield curves, Fed meetings, CPI/NFP trades, sector rotation, country ETFs, crypto trend-following, halving cycle, on-chain analytics, tail hedges — the full cross-asset toolkit.",
    longDescription:
      "Macro events (FOMC, CPI, NFP, Treasury auctions, VIX spikes), sector and cross-asset (rotations, country ETFs, commodities, currencies, carry trades), crypto (trend-following, halving, ETH/BTC ratio, funding rates, on-chain), and portfolio-level (correlations, tail hedges, crisis playbook).",
    priceINR: 149900,
    category: "Trading & Investing",
    features: [
      "25 macro & crypto AI prompts across 4 ordered parts",
      "Cross-asset analysis (equity / bonds / FX / commodities / crypto)",
      "Crisis playbook with pre-defined activation triggers",
      "On-chain crypto analytics framework",
      "Long-volatility tail hedging structures",
      "Commercial license",
    ],
    whatsIncluded: [
      "Yield Curve Analysis",
      "Fed FOMC Meeting Strategy",
      "CPI / Inflation Print Trade",
      "NFP / Jobs Report Trade",
      "VIX Spike Trading",
      "Risk-On / Risk-Off Rotation",
      "Treasury Auction Strategy",
      "Sector ETF Rotation",
      "Country ETF Strategy",
      "Commodity Cycle Trading",
      "Gold/USD Inverse Trade",
      "Currency Pair Strategy",
      "Carry Trade Construction",
      "Crypto Trend Following",
      "Bitcoin Halving Cycle",
      "Ethereum vs Bitcoin Ratio",
      "Crypto Funding Rate Strategy",
      "Stablecoin Yield Strategies",
      "On-Chain Metrics Analysis",
      "Whale Movement Tracking",
      "DeFi Yield Pool Analysis",
      "Cross-Asset Correlations",
      "Long-Volatility Tail Hedge",
      "Crisis Playbook",
      "Macro Thesis Tracker",
    ],
    fileUrl: "https://acquihiretech.com/shop-files/trading-macro-lens/trading-macro-lens.pdf",
    fileFormat: ".pdf (designed 36-page book)",
    fileSize: "~125 KB",
    heroAccent: "growth",
  },
  {
    slug: "trading-agent-engine",
    title: "The Practitioner's Engine",
    subtitle: "Build Your AI Trading Agent · Vol. IX",
    shortDescription:
      "Step-by-step setup for an AI trading agent in ChatGPT, Claude, Gemini, Grok, KIMI, DeepSeek, or any capable AI. System prompts, workflows, multi-agent orchestration, and compliance notes.",
    longDescription:
      "The companion to the strategy volumes — turns those 125 prompts into a structured daily and weekly trading workflow. Universal system prompt template, per-AI setup walkthrough (ChatGPT / Claude / Gemini / Grok / KIMI / DeepSeek / Local), data integration patterns (manual → API → broker), multi-agent orchestration, agent personas, common pitfalls, compliance notes for India / US / EU.",
    priceINR: 199900,
    category: "Trading & Investing",
    features: [
      "20 chapters across 5 parts",
      "Universal system prompt template (one prompt, six AIs)",
      "Per-AI setup walkthroughs (ChatGPT, Claude, Gemini, Grok, KIMI, DeepSeek)",
      "Daily, weekly, and monthly trading workflows",
      "Multi-agent orchestration patterns",
      "Compliance notes for India (SEBI), US (SEC/FINRA), EU (MiFID)",
      "Commercial license",
    ],
    whatsIncluded: [
      "What an AI Trading Agent Is",
      "Why Different AIs Excel Differently",
      "The Universal System Prompt",
      "ChatGPT Setup",
      "Claude Setup",
      "Gemini Setup",
      "Grok Setup",
      "KIMI Setup",
      "DeepSeek / Local LLM Setup",
      "Manual Data Workflow",
      "API-Driven Workflow",
      "Broker Integration (Advanced)",
      "Daily Trading Workflow",
      "Weekly Review Workflow",
      "Monthly Strategy Review",
      "Multi-Agent Workflows",
      "Sample Agent Personas",
      "Common Pitfalls & Avoidance",
      "Compliance & Regulatory Notes",
      "The Future of AI Trading",
    ],
    fileUrl: "https://acquihiretech.com/shop-files/trading-agent-engine/trading-agent-engine.pdf",
    fileFormat: ".pdf (designed 57-page guide)",
    fileSize: "~149 KB",
    badge: "New",
    heroAccent: "conversion",
  }
);

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
