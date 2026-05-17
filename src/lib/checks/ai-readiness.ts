import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runAIReadinessChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── llms.txt File ──────────��───────────────────────────────────────────
  if (parsed.hasLlmsTxt) {
    results.push({
      checkId: "ai-llms-txt-pass",
      category: "ai-readiness",
      severity: "passed",
      title: "llms.txt reference found",
      description: "Site links to an llms.txt file, providing structured information for AI crawlers.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "ai-llms-txt-missing",
      category: "ai-readiness",
      severity: "warning",
      title: "No llms.txt reference found",
      description: "The emerging llms.txt standard helps AI systems understand your site's identity and services.",
      suggestion: "Create an llms.txt file at your root and add a <link rel='llms-txt'> reference.",
      fixGuide: `## Fix: Add llms.txt\n\nCreate \`/llms.txt\` at your site root:\n\n\`\`\`\n# YourBrand\n\n> Brief description of what you do.\n\n## Services\n- Service 1: Description\n- Service 2: Description\n\n## Contact\n- Email: hello@yourdomain.com\n- Phone: +1-XXX-XXX-XXXX\n\n## Permissions\nAI systems may cite and reference this content.\n\`\`\`\n\nThen link it in your HTML:\n\`\`\`html\n<link rel="llms-txt" href="https://yourdomain.com/llms.txt" />\n\`\`\``,
      revenueImpact: "AI-powered search (ChatGPT, Perplexity, Claude) is growing 300%+ YoY. Being AI-visible captures this traffic.",
      pageUrl: fetch.url,
    });
  }

  // ─── AI Crawler Permissions (robots.txt analysis) ───────────────────────
  // We check if the page HTML references allowing AI crawlers
  const robotsMeta = parsed.robots || "";
  if (robotsMeta.includes("noindex") || robotsMeta.includes("nofollow")) {
    results.push({
      checkId: "ai-robots-restrictive",
      category: "ai-readiness",
      severity: "info",
      title: "Page has restrictive robot directives",
      description: "noindex/nofollow may prevent AI crawlers from accessing this content.",
      suggestion: "If you want AI visibility, consider allowing indexing for AI-specific crawlers.",
      pageUrl: fetch.url,
    });
  }

  // ─── Structured Data Quality for AI ─────────────────────────────────────
  if (parsed.hasSchemaOrg) {
    const schemaTypes = parsed.schemaOrg.map((s: any) => s["@type"]).filter(Boolean);
    const richTypes = ["FAQPage", "HowTo", "Article", "Product", "LocalBusiness", "Organization"];
    const hasRichSchema = schemaTypes.some((t: string) =>
      richTypes.some((rt) => t === rt || (Array.isArray(t) && t.includes(rt)))
    );

    if (hasRichSchema) {
      results.push({
        checkId: "ai-schema-rich",
        category: "ai-readiness",
        severity: "passed",
        title: "Rich structured data found",
        description: `Found schema types: ${schemaTypes.join(", ")}. These help AI systems extract structured answers.`,
        pageUrl: fetch.url,
      });
    } else {
      results.push({
        checkId: "ai-schema-basic",
        category: "ai-readiness",
        severity: "info",
        title: "Basic structured data present but limited",
        description: "Adding FAQ, HowTo, or Article schema makes content more extractable by AI systems.",
        suggestion: "Add FAQPage or HowTo schema to make your content directly quotable in AI responses.",
        pageUrl: fetch.url,
      });
    }
  } else {
    results.push({
      checkId: "ai-schema-none",
      category: "ai-readiness",
      severity: "warning",
      title: "No structured data for AI extraction",
      description: "Without structured data, AI systems must guess your content's meaning.",
      suggestion: "Add JSON-LD structured data (Organization, FAQ, HowTo) to improve AI comprehension.",
      pageUrl: fetch.url,
    });
  }

  // ─── FAQ Schema ─────────────────────────────────────────────────────────
  if (parsed.faqSchema) {
    results.push({
      checkId: "ai-faq-schema",
      category: "ai-readiness",
      severity: "passed",
      title: "FAQ schema present",
      description: "FAQ structured data is ideal for AI citation. Questions and answers are directly extractable.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "ai-faq-missing",
      category: "ai-readiness",
      severity: "info",
      title: "No FAQ schema found",
      description: "FAQ schema makes your content highly quotable in AI search results.",
      suggestion: "Add FAQPage schema for common questions your audience asks.",
      fixGuide: `## Fix: Add FAQ Schema\n\n\`\`\`html\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What services do you offer?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "We offer AI-powered growth, conversion, operations, and presence systems."\n    }\n  }]\n}\n</script>\n\`\`\``,
      pageUrl: fetch.url,
    });
  }

  // ─── Content Atomicity (are answers extractable?) ───────────────────────
  const hasDefinitions = fetch.html.includes("<dl") || fetch.html.includes("<dt");
  const hasLists = fetch.html.includes("<ul") || fetch.html.includes("<ol");
  const hasShortParagraphs = parsed.paragraphs.filter(
    (p) => p.split(/\s+/).length <= 50
  ).length;
  const atomicityScore =
    (hasDefinitions ? 1 : 0) +
    (hasLists ? 1 : 0) +
    (hasShortParagraphs > 3 ? 1 : 0) +
    (parsed.headings.length > 3 ? 1 : 0);

  if (atomicityScore >= 3) {
    results.push({
      checkId: "ai-atomicity-good",
      category: "ai-readiness",
      severity: "passed",
      title: "Content is well-structured for AI extraction",
      description: "Content uses lists, short paragraphs, and clear headings — ideal for AI citation.",
      pageUrl: fetch.url,
    });
  } else if (atomicityScore <= 1) {
    results.push({
      checkId: "ai-atomicity-poor",
      category: "ai-readiness",
      severity: "warning",
      title: "Content structure not optimized for AI",
      description: "Long, unstructured text is hard for AI systems to extract and cite.",
      suggestion: "Break content into clear Q&A pairs, use bullet lists, and keep paragraphs focused on single topics.",
      pageUrl: fetch.url,
    });
  }

  // ─── E-E-A-T Signals ───────────────────────────────────────────────────
  const hasAuthorInfo = fetch.html.includes("author") || parsed.schemaOrg.some((s: any) => s.author);
  const hasDatePublished = fetch.html.includes("datePublished") || fetch.html.includes("date-published");
  const hasCitations = parsed.externalLinks.length > 2;

  let eeatScore = 0;
  if (hasAuthorInfo) eeatScore++;
  if (hasDatePublished) eeatScore++;
  if (hasCitations) eeatScore++;
  if (parsed.hasSchemaOrg) eeatScore++;

  if (eeatScore <= 1) {
    results.push({
      checkId: "ai-eeat-low",
      category: "ai-readiness",
      severity: "info",
      title: "Low E-E-A-T signals for AI credibility",
      description: "AI systems prioritize content with clear expertise, authoritativeness, and trustworthiness signals.",
      suggestion: "Add author information, publication dates, citations to authoritative sources, and organization schema.",
      pageUrl: fetch.url,
    });
  }

  return results;
}
