import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runBrandChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── Favicon & Logo ─────────────────────────────────────────────────────
  if (!parsed.hasFavicon) {
    results.push({
      checkId: "brand-favicon-missing",
      category: "brand",
      severity: "warning",
      title: "Missing favicon",
      description: "A favicon is your brand's icon in browser tabs, bookmarks, and search results.",
      suggestion: "Add a favicon that matches your logo. Include SVG for modern browsers and ICO for legacy support.",
      pageUrl: fetch.url,
    });
  }

  // ─── Open Graph Image ───────────────────────────────────────────────────
  if (!parsed.ogImage) {
    results.push({
      checkId: "brand-og-image-missing",
      category: "brand",
      severity: "warning",
      title: "Missing social share image",
      description: "Without og:image, social shares look unprofessional with no visual.",
      suggestion: "Create a branded 1200x630px image for Open Graph (social sharing).",
      pageUrl: fetch.url,
    });
  }

  // ─── Consistent Typography (heuristic) ──────────────────────────────────
  const fontFamilyMatches = fetch.html.match(/font-family:\s*([^;}"]+)/gi);
  if (fontFamilyMatches && fontFamilyMatches.length > 0) {
    const uniqueFonts = new Set(
      fontFamilyMatches.map((f) => f.replace(/font-family:\s*/i, "").trim().toLowerCase())
    );
    if (uniqueFonts.size > 4) {
      results.push({
        checkId: "brand-fonts-inconsistent",
        category: "brand",
        severity: "info",
        title: `${uniqueFonts.size} different font declarations found`,
        description: "Too many font families suggest inconsistent design. A strong brand typically uses 2-3 fonts.",
        suggestion: "Establish a type system: one display font, one body font, optionally one mono font. Remove all others.",
        pageUrl: fetch.url,
      });
    }
  }

  // ─── Color Consistency (heuristic) ──────────────────────────────────────
  const colorMatches = fetch.html.match(/#[0-9a-fA-F]{3,8}/g);
  if (colorMatches) {
    const uniqueColors = new Set(colorMatches.map((c) => c.toLowerCase()));
    if (uniqueColors.size > 15) {
      results.push({
        checkId: "brand-colors-inconsistent",
        category: "brand",
        severity: "info",
        title: `${uniqueColors.size} unique colors detected in inline styles`,
        description: "Many unique colors suggest inconsistent branding. A design system typically has 8-12 core colors.",
        suggestion: "Define brand colors as CSS variables and reference them consistently. Remove ad-hoc color values.",
        pageUrl: fetch.url,
      });
    }
  }

  // ─── Brand Name Consistency ─────────────────────────────────────────────
  // Check if the site title/name appears consistently
  const siteName = parsed.ogTitle || parsed.title || "";
  const brandNameInTitle = siteName.length > 0;
  const brandNameInSchema = parsed.schemaOrg.some(
    (s: any) => s.name && s.name.length > 0
  );

  if (!brandNameInTitle && !brandNameInSchema) {
    results.push({
      checkId: "brand-name-unclear",
      category: "brand",
      severity: "info",
      title: "Brand name not clearly established",
      description: "Could not identify a clear brand name from title, og:title, or structured data.",
      suggestion: "Ensure your brand name appears in the title tag, Open Graph data, and Organization schema.",
      pageUrl: fetch.url,
    });
  }

  // ─── Navigation Presence ────────────────────────────────────────────────
  const hasNav = fetch.html.includes("<nav") || fetch.html.includes('role="navigation"');
  const hasFooter = fetch.html.includes("<footer");
  const hasHeader = fetch.html.includes("<header");

  if (!hasNav) {
    results.push({
      checkId: "brand-no-navigation",
      category: "brand",
      severity: "warning",
      title: "No navigation element found",
      description: "A consistent navigation is fundamental to brand experience and usability.",
      suggestion: "Add a clear, consistent navigation that appears on all pages.",
      pageUrl: fetch.url,
    });
  }

  if (!hasFooter) {
    results.push({
      checkId: "brand-no-footer",
      category: "brand",
      severity: "info",
      title: "No footer element found",
      description: "Footers provide important links, contact info, and reinforce brand identity.",
      suggestion: "Add a footer with contact information, key links, and copyright notice.",
      pageUrl: fetch.url,
    });
  }

  // ─── Professional Touches ───────────────────────────────────────────────
  const hasCustom404 = false; // Would need separate request
  const hasBreadcrumbs = fetch.html.includes("breadcrumb");
  const hasLanguageSelector = fetch.html.includes("language") || parsed.hreflangTags.length > 1;

  let professionalScore = 0;
  if (parsed.hasFavicon) professionalScore++;
  if (parsed.ogImage) professionalScore++;
  if (hasNav) professionalScore++;
  if (hasFooter) professionalScore++;
  if (hasHeader) professionalScore++;
  if (hasBreadcrumbs) professionalScore++;
  if (parsed.hasSchemaOrg) professionalScore++;

  if (professionalScore >= 5) {
    results.push({
      checkId: "brand-professional-pass",
      category: "brand",
      severity: "passed",
      title: "Site shows professional brand presentation",
      description: `Found ${professionalScore}/7 professional brand signals (favicon, og:image, nav, footer, header, breadcrumbs, schema).`,
      pageUrl: fetch.url,
    });
  } else if (professionalScore <= 2) {
    results.push({
      checkId: "brand-professional-low",
      category: "brand",
      severity: "warning",
      title: "Site lacks professional brand presentation",
      description: `Only ${professionalScore}/7 professional signals found. The site may appear amateurish to visitors.`,
      suggestion: "Add consistent header/footer/nav, favicon, social image, and structured data for a polished impression.",
      pageUrl: fetch.url,
    });
  }

  return results;
}
