import * as cheerio from "cheerio";

// ─── Parsed Page Data ───────────────────────────────────────────────────────

export interface ParsedPage {
  // Meta
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  robots: string | null;
  viewport: string | null;
  charset: string | null;
  language: string | null;
  hreflangTags: { lang: string; url: string }[];

  // Headings
  h1: string | null;
  h1Count: number;
  headings: { level: number; text: string }[];

  // Content
  wordCount: number;
  textContent: string;
  paragraphs: string[];

  // Links
  internalLinks: { href: string; text: string; nofollow: boolean }[];
  externalLinks: { href: string; text: string; nofollow: boolean }[];
  brokenLinkCandidates: string[]; // links with suspicious patterns

  // Images
  images: {
    src: string;
    alt: string | null;
    width: string | null;
    height: string | null;
    loading: string | null;
  }[];
  imagesWithoutAlt: number;
  imagesWithoutDimensions: number;

  // Structured Data
  schemaOrg: object[];
  hasSchemaOrg: boolean;

  // Forms
  forms: {
    action: string | null;
    method: string;
    inputs: { type: string; name: string | null; label: string | null }[];
  }[];

  // Scripts & Styles
  scripts: { src: string | null; async: boolean; defer: boolean; inline: boolean }[];
  stylesheets: { href: string | null; inline: boolean }[];
  inlineScriptCount: number;
  inlineStyleCount: number;

  // Accessibility
  ariaLabels: number;
  ariaRoles: number;
  tabindexElements: number;
  skipNavigation: boolean;
  formLabels: number;
  formInputs: number;

  // Technical
  iframeCount: number;
  htmlSize: number;
  hasServiceWorker: boolean;
  hasFavicon: boolean;
  hasOpenSearch: boolean;

  // Social / CTAs
  socialLinks: string[];
  phoneNumbers: string[];
  emailAddresses: string[];
  ctaButtons: { text: string; href: string | null }[];

  // AI Readiness
  hasLlmsTxt: boolean;
  faqSchema: boolean;
  howToSchema: boolean;
}

// ─── HTML Parser ────────────────────────────────────────────────────────────

export function parseHTML(html: string, baseUrl: string): ParsedPage {
  const $ = cheerio.load(html);
  const domain = new URL(baseUrl).hostname;

  // Meta tags
  const title = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const canonicalUrl = $('link[rel="canonical"]').attr("href") || null;
  const ogTitle = $('meta[property="og:title"]').attr("content") || null;
  const ogDescription =
    $('meta[property="og:description"]').attr("content") || null;
  const ogImage = $('meta[property="og:image"]').attr("content") || null;
  const robots = $('meta[name="robots"]').attr("content") || null;
  const viewport = $('meta[name="viewport"]').attr("content") || null;
  const charset =
    $("meta[charset]").attr("charset") ||
    $('meta[http-equiv="Content-Type"]').attr("content") ||
    null;
  const language = $("html").attr("lang") || null;

  // Hreflang
  const hreflangTags: { lang: string; url: string }[] = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $(el).attr("hreflang");
    const url = $(el).attr("href");
    if (lang && url) hreflangTags.push({ lang, url });
  });

  // Headings
  const headings: { level: number; text: string }[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tagName = (el as any).tagName || (el as any).name || "";
    const level = parseInt(tagName.replace("h", ""));
    const text = $(el).text().trim();
    if (!isNaN(level)) headings.push({ level, text });
  });
  const h1 = $("h1").first().text().trim() || null;
  const h1Count = $("h1").length;

  // Content
  const textContent = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const paragraphs: string[] = [];
  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 20) paragraphs.push(text);
  });

  // Links
  const internalLinks: { href: string; text: string; nofollow: boolean }[] = [];
  const externalLinks: { href: string; text: string; nofollow: boolean }[] = [];
  const brokenLinkCandidates: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    const rel = $(el).attr("rel") || "";
    const nofollow = rel.includes("nofollow");

    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return;
    }

    try {
      const linkUrl = new URL(href, baseUrl);
      if (linkUrl.hostname === domain || linkUrl.hostname.endsWith(`.${domain}`)) {
        internalLinks.push({ href: linkUrl.href, text, nofollow });
      } else {
        externalLinks.push({ href: linkUrl.href, text, nofollow });
      }
    } catch {
      brokenLinkCandidates.push(href);
    }
  });

  // Images
  const images: ParsedPage["images"] = [];
  $("img").each((_, el) => {
    images.push({
      src: $(el).attr("src") || $(el).attr("data-src") || "",
      alt: $(el).attr("alt") ?? null,
      width: $(el).attr("width") || null,
      height: $(el).attr("height") || null,
      loading: $(el).attr("loading") || null,
    });
  });
  const imagesWithoutAlt = images.filter(
    (img) => img.alt === null || img.alt === ""
  ).length;
  const imagesWithoutDimensions = images.filter(
    (img) => !img.width || !img.height
  ).length;

  // Structured Data (JSON-LD)
  const schemaOrg: object[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      schemaOrg.push(data);
    } catch {
      // Invalid JSON-LD
    }
  });

  // Forms
  const forms: ParsedPage["forms"] = [];
  $("form").each((_, el) => {
    const inputs: { type: string; name: string | null; label: string | null }[] = [];
    $(el)
      .find("input, select, textarea")
      .each((_, inp) => {
        const id = $(inp).attr("id");
        const label = id ? $(`label[for="${id}"]`).text().trim() || null : null;
        inputs.push({
          type: $(inp).attr("type") || $(inp).prop("tagName")?.toLowerCase() || "text",
          name: $(inp).attr("name") || null,
          label,
        });
      });
    forms.push({
      action: $(el).attr("action") || null,
      method: ($(el).attr("method") || "GET").toUpperCase(),
      inputs,
    });
  });

  // Scripts & Styles
  const scripts: ParsedPage["scripts"] = [];
  $("script").each((_, el) => {
    scripts.push({
      src: $(el).attr("src") || null,
      async: $(el).attr("async") !== undefined,
      defer: $(el).attr("defer") !== undefined,
      inline: !$(el).attr("src"),
    });
  });

  const stylesheets: ParsedPage["stylesheets"] = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    stylesheets.push({ href: $(el).attr("href") || null, inline: false });
  });
  $("style").each(() => {
    stylesheets.push({ href: null, inline: true });
  });

  // Accessibility
  const ariaLabels = $("[aria-label]").length;
  const ariaRoles = $("[role]").length;
  const tabindexElements = $("[tabindex]").length;
  const skipNavigation =
    $('a[href="#main"], a[href="#content"], .skip-nav, .skip-link').length > 0;
  const formLabels = $("label").length;
  const formInputs = $("input, select, textarea").length;

  // Technical
  const iframeCount = $("iframe").length;
  const htmlSize = new TextEncoder().encode(html).length;
  const hasServiceWorker = html.includes("serviceWorker") || html.includes("service-worker");
  const hasFavicon =
    $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
  const hasOpenSearch = $('link[rel="search"]').length > 0;

  // Social & CTAs
  const socialLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (
      /facebook|twitter|linkedin|instagram|youtube|tiktok/i.test(href)
    ) {
      socialLinks.push(href);
    }
  });

  const phoneNumbers: string[] = [];
  $('a[href^="tel:"]').each((_, el) => {
    phoneNumbers.push($(el).attr("href")?.replace("tel:", "") || "");
  });

  const emailAddresses: string[] = [];
  $('a[href^="mailto:"]').each((_, el) => {
    emailAddresses.push($(el).attr("href")?.replace("mailto:", "") || "");
  });

  const ctaButtons: { text: string; href: string | null }[] = [];
  $(
    'a.btn, a.button, a.cta, button, [class*="cta"], [class*="btn-primary"]'
  ).each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || null;
    if (text) ctaButtons.push({ text, href });
  });

  // AI Readiness
  const hasLlmsTxt = $('link[rel="llms-txt"]').length > 0;
  const faqSchema = schemaOrg.some(
    (s: any) => s["@type"] === "FAQPage" || s["@type"]?.includes?.("FAQPage")
  );
  const howToSchema = schemaOrg.some(
    (s: any) => s["@type"] === "HowTo" || s["@type"]?.includes?.("HowTo")
  );

  return {
    title,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    robots,
    viewport,
    charset,
    language,
    hreflangTags,
    h1,
    h1Count,
    headings,
    wordCount,
    textContent,
    paragraphs,
    internalLinks,
    externalLinks,
    brokenLinkCandidates,
    images,
    imagesWithoutAlt,
    imagesWithoutDimensions,
    schemaOrg,
    hasSchemaOrg: schemaOrg.length > 0,
    forms,
    scripts,
    stylesheets,
    inlineScriptCount: scripts.filter((s) => s.inline).length,
    inlineStyleCount: stylesheets.filter((s) => s.inline).length,
    ariaLabels,
    ariaRoles,
    tabindexElements,
    skipNavigation,
    formLabels,
    formInputs,
    iframeCount,
    htmlSize,
    hasServiceWorker,
    hasFavicon,
    hasOpenSearch,
    socialLinks,
    phoneNumbers,
    emailAddresses,
    ctaButtons,
    hasLlmsTxt,
    faqSchema,
    howToSchema,
  };
}
