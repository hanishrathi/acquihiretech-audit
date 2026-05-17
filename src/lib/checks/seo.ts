import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runSEOChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── Title Tag ──────────────────────────────────────────────────────────
  if (!parsed.title) {
    results.push({
      checkId: "seo-title-missing",
      category: "seo",
      severity: "critical",
      title: "Missing page title",
      description: "The <title> tag is empty or missing. This is critical for SEO and click-through rates.",
      suggestion: "Add a descriptive title tag between 50-60 characters.",
      fixGuide: `## Fix: Add a Title Tag\n\n\`\`\`html\n<head>\n  <title>Your Primary Keyword — Brand Name</title>\n</head>\n\`\`\`\n\n**Best practices:**\n- 50-60 characters (Google truncates at ~60)\n- Primary keyword near the beginning\n- Brand name at the end\n- Unique per page`,
      revenueImpact: "Pages without titles get 20-40% fewer clicks in search results.",
      pageUrl: fetch.url,
    });
  } else if (parsed.title.length < 30) {
    results.push({
      checkId: "seo-title-short",
      category: "seo",
      severity: "warning",
      title: "Title tag is too short",
      description: `Title is ${parsed.title.length} characters. Aim for 50-60 characters to maximize SERP real estate.`,
      suggestion: "Expand your title with relevant keywords and value proposition.",
      pageUrl: fetch.url,
    });
  } else if (parsed.title.length > 60) {
    results.push({
      checkId: "seo-title-long",
      category: "seo",
      severity: "warning",
      title: "Title tag may be truncated in search results",
      description: `Title is ${parsed.title.length} characters. Google typically shows 50-60.`,
      suggestion: "Shorten title to under 60 characters. Keep keywords at the start.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "seo-title-pass",
      category: "seo",
      severity: "passed",
      title: "Title tag is well-optimized",
      description: `Title is ${parsed.title.length} characters.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Meta Description ──────────────────────────────────────────────────
  if (!parsed.metaDescription) {
    results.push({
      checkId: "seo-meta-desc-missing",
      category: "seo",
      severity: "critical",
      title: "Missing meta description",
      description: "No meta description found. Google may auto-generate one, often poorly.",
      suggestion: "Write a compelling 120-160 character meta description with your target keyword.",
      fixGuide: `## Fix: Add Meta Description\n\n\`\`\`html\n<meta name="description" content="Your compelling description here. Include primary keyword naturally. Add a call-to-action. 120-160 characters." />\n\`\`\``,
      revenueImpact: "Good meta descriptions can increase click-through rates by 5-10%.",
      pageUrl: fetch.url,
    });
  } else if (parsed.metaDescription.length > 160) {
    results.push({
      checkId: "seo-meta-desc-long",
      category: "seo",
      severity: "info",
      title: "Meta description may be truncated",
      description: `Description is ${parsed.metaDescription.length} characters. Google shows ~155-160.`,
      suggestion: "Trim to 155 characters to avoid truncation.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "seo-meta-desc-pass",
      category: "seo",
      severity: "passed",
      title: "Meta description present and well-sized",
      description: `${parsed.metaDescription.length} characters.`,
      pageUrl: fetch.url,
    });
  }

  // ─── H1 Tag ─────────────────────────────────────────────────────────────
  if (!parsed.h1 || parsed.h1Count === 0) {
    results.push({
      checkId: "seo-h1-missing",
      category: "seo",
      severity: "critical",
      title: "Missing H1 heading",
      description: "Every page should have exactly one H1 that describes the page content.",
      suggestion: "Add a single H1 tag with your primary keyword.",
      pageUrl: fetch.url,
    });
  } else if (parsed.h1Count > 1) {
    results.push({
      checkId: "seo-h1-multiple",
      category: "seo",
      severity: "warning",
      title: `Multiple H1 tags found (${parsed.h1Count})`,
      description: "Best practice is one H1 per page for clear content hierarchy.",
      suggestion: "Keep one H1 and change others to H2 or H3.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "seo-h1-pass",
      category: "seo",
      severity: "passed",
      title: "Single H1 tag present",
      description: `H1: "${parsed.h1}"`,
      pageUrl: fetch.url,
    });
  }

  // ─── Heading Hierarchy ──────────────────────────────────────────────────
  let hasHierarchyIssue = false;
  for (let i = 1; i < parsed.headings.length; i++) {
    if (parsed.headings[i].level - parsed.headings[i - 1].level > 1) {
      hasHierarchyIssue = true;
      break;
    }
  }
  if (hasHierarchyIssue) {
    results.push({
      checkId: "seo-heading-hierarchy",
      category: "seo",
      severity: "info",
      title: "Heading hierarchy has gaps",
      description: "Headings skip levels (e.g., H1 directly to H3). This can confuse search engines.",
      suggestion: "Maintain sequential heading levels: H1 > H2 > H3.",
      pageUrl: fetch.url,
    });
  }

  // ─── Canonical URL ──────────────────────────────────────────────────────
  if (!parsed.canonicalUrl) {
    results.push({
      checkId: "seo-canonical-missing",
      category: "seo",
      severity: "warning",
      title: "Missing canonical URL",
      description: "Without canonical tags, duplicate content issues may arise.",
      suggestion: "Add a canonical link pointing to the preferred URL version.",
      fixGuide: `## Fix: Add Canonical Tag\n\n\`\`\`html\n<link rel="canonical" href="https://yourdomain.com/page" />\n\`\`\`\n\nThis tells search engines which URL is the \"original\" when duplicate versions exist.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Structured Data ────────────────────────────────────────────────────
  if (!parsed.hasSchemaOrg) {
    results.push({
      checkId: "seo-schema-missing",
      category: "seo",
      severity: "warning",
      title: "No structured data (Schema.org) found",
      description: "Structured data helps search engines understand your content and enables rich snippets.",
      suggestion: "Add JSON-LD structured data for your business type (Organization, LocalBusiness, Product, etc.).",
      fixGuide: `## Fix: Add Structured Data\n\n\`\`\`html\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Business",\n  "url": "https://yourdomain.com",\n  "logo": "https://yourdomain.com/logo.png"\n}\n</script>\n\`\`\``,
      revenueImpact: "Rich snippets can increase CTR by 20-30% in search results.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "seo-schema-pass",
      category: "seo",
      severity: "passed",
      title: "Structured data found",
      description: `${parsed.schemaOrg.length} JSON-LD block(s) detected.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Open Graph Tags ────────────────────────────────────────────────────
  if (!parsed.ogTitle || !parsed.ogDescription || !parsed.ogImage) {
    const missing = [];
    if (!parsed.ogTitle) missing.push("og:title");
    if (!parsed.ogDescription) missing.push("og:description");
    if (!parsed.ogImage) missing.push("og:image");
    results.push({
      checkId: "seo-og-incomplete",
      category: "seo",
      severity: "warning",
      title: "Incomplete Open Graph tags",
      description: `Missing: ${missing.join(", ")}. Social shares will look unprofessional.`,
      suggestion: "Add complete Open Graph meta tags for rich social media previews.",
      pageUrl: fetch.url,
    });
  }

  // ─── Images Alt Text ────────────────────────────────────────────────────
  if (parsed.imagesWithoutAlt > 0) {
    const severity = parsed.imagesWithoutAlt > 5 ? "warning" : "info";
    results.push({
      checkId: "seo-img-alt-missing",
      category: "seo",
      severity,
      title: `${parsed.imagesWithoutAlt} images missing alt text`,
      description: "Alt text helps search engines understand images and improves accessibility.",
      suggestion: "Add descriptive alt text to all meaningful images.",
      pageUrl: fetch.url,
    });
  }

  // ─── Internal Links ─────────────────────────────────────────────────────
  if (parsed.internalLinks.length < 3) {
    results.push({
      checkId: "seo-internal-links-low",
      category: "seo",
      severity: "warning",
      title: "Too few internal links",
      description: `Only ${parsed.internalLinks.length} internal links found. Internal linking distributes authority.`,
      suggestion: "Add relevant internal links to other important pages on your site.",
      pageUrl: fetch.url,
    });
  }

  // ─── Language Tag ───────────────────────────────────────────────────────
  if (!parsed.language) {
    results.push({
      checkId: "seo-lang-missing",
      category: "seo",
      severity: "info",
      title: "Missing language attribute",
      description: "The <html> tag should have a lang attribute for localization.",
      suggestion: 'Add lang="en" (or appropriate language) to the <html> tag.',
      pageUrl: fetch.url,
    });
  }

  return results;
}
