import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runMobileChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── Viewport Meta Tag ──────────────────────────────────────────────────
  if (!parsed.viewport) {
    results.push({
      checkId: "mobile-viewport-missing",
      category: "mobile",
      severity: "critical",
      title: "Missing viewport meta tag",
      description: "Without a viewport tag, mobile devices render the page at desktop width.",
      suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1" />',
      fixGuide: `## Fix: Add Viewport Meta Tag\n\n\`\`\`html\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n</head>\n\`\`\`\n\nThis ensures the page scales correctly on all devices.`,
      revenueImpact: "60%+ of web traffic is mobile. Without viewport, mobile users see a tiny desktop page.",
      pageUrl: fetch.url,
    });
  } else if (!parsed.viewport.includes("width=device-width")) {
    results.push({
      checkId: "mobile-viewport-incomplete",
      category: "mobile",
      severity: "warning",
      title: "Viewport tag may not be configured correctly",
      description: `Current viewport: "${parsed.viewport}". Should include width=device-width.`,
      suggestion: "Use: width=device-width, initial-scale=1",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "mobile-viewport-pass",
      category: "mobile",
      severity: "passed",
      title: "Viewport configured correctly",
      description: "Mobile viewport is properly set.",
      pageUrl: fetch.url,
    });
  }

  // ─── Responsive Images ──────────────────────────────────────────────────
  const fixedWidthImages = parsed.images.filter((img) => {
    const width = parseInt(img.width || "0");
    return width > 600; // likely not responsive
  });

  if (fixedWidthImages.length > 0) {
    results.push({
      checkId: "mobile-fixed-width-images",
      category: "mobile",
      severity: "warning",
      title: `${fixedWidthImages.length} potentially non-responsive images`,
      description: "Images with fixed widths over 600px may overflow on mobile screens.",
      suggestion: "Use CSS max-width: 100% or responsive image techniques (srcset).",
      fixGuide: `## Fix: Make Images Responsive\n\n\`\`\`css\nimg {\n  max-width: 100%;\n  height: auto;\n}\n\`\`\`\n\nOr use srcset for serving different sizes:\n\`\`\`html\n<img srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"\n     sizes="(max-width: 600px) 480px, (max-width: 1024px) 800px, 1200px"\n     src="medium.jpg" alt="..." />\n\`\`\``,
      pageUrl: fetch.url,
    });
  }

  // ─── Font Size ──────────────────────────────────────────────────────────
  // Check if base font size is reasonable (heuristic: check for small font declarations in inline styles)
  const htmlContent = fetch.html.toLowerCase();
  const tinyFontPattern = /font-size:\s*(8|9|10)px/g;
  const tinyFontMatches = htmlContent.match(tinyFontPattern);
  if (tinyFontMatches && tinyFontMatches.length > 3) {
    results.push({
      checkId: "mobile-font-size-small",
      category: "mobile",
      severity: "warning",
      title: "Small font sizes detected",
      description: `Found ${tinyFontMatches.length} instances of fonts below 11px. Text may be unreadable on mobile.`,
      suggestion: "Use a minimum font size of 14px for body text on mobile. 16px is recommended.",
      pageUrl: fetch.url,
    });
  }

  // ─── Touch Target Sizes ─────────────────────────────────────────────────
  // Heuristic: check for very small clickable elements (inline styles)
  const smallButtonPattern = /(?:width|height):\s*(1[0-9]|2[0-9]|3[0-9])px/g;
  const hasPotentialSmallTargets =
    parsed.ctaButtons.length > 0 && (htmlContent.match(smallButtonPattern)?.length || 0) > 5;

  if (hasPotentialSmallTargets) {
    results.push({
      checkId: "mobile-tap-targets",
      category: "mobile",
      severity: "info",
      title: "Potentially small tap targets",
      description: "Some elements may be too small for comfortable tapping. Minimum recommended size is 48x48px.",
      suggestion: "Ensure all interactive elements (buttons, links) are at least 48x48px with 8px spacing.",
      pageUrl: fetch.url,
    });
  }

  // ─── iFrames on Mobile ──────────────────────────────────────────────────
  if (parsed.iframeCount > 0) {
    results.push({
      checkId: "mobile-iframes",
      category: "mobile",
      severity: "info",
      title: `${parsed.iframeCount} iframe(s) detected`,
      description: "iFrames can cause scrolling and sizing issues on mobile devices.",
      suggestion: "Ensure iframes are responsive (use aspect-ratio containers or responsive embed wrappers).",
      pageUrl: fetch.url,
    });
  }

  // ─── Content Width ──────────────────────────────────────────────────────
  // Check for hardcoded widths that might cause horizontal scroll
  const fixedWidthPattern = /(?:width|min-width):\s*(\d{4,})px/g;
  const largeFixedWidths = htmlContent.match(fixedWidthPattern);
  if (largeFixedWidths && largeFixedWidths.length > 0) {
    results.push({
      checkId: "mobile-horizontal-scroll",
      category: "mobile",
      severity: "warning",
      title: "Potential horizontal scrolling issues",
      description: "Found elements with fixed widths over 1000px that may cause horizontal overflow on mobile.",
      suggestion: "Replace fixed pixel widths with percentages or max-width for responsive layouts.",
      pageUrl: fetch.url,
    });
  }

  // ─── Mobile-Friendly Forms ──────────────────────────────────────────────
  if (parsed.forms.length > 0) {
    const hasInputTypes = parsed.forms.some((form) =>
      form.inputs.some((input) =>
        ["email", "tel", "number", "url", "search"].includes(input.type)
      )
    );
    if (!hasInputTypes) {
      results.push({
        checkId: "mobile-input-types",
        category: "mobile",
        severity: "info",
        title: "Forms may not use optimized mobile input types",
        description: "Using type='email', type='tel' etc. shows the correct keyboard on mobile.",
        suggestion: "Use appropriate HTML5 input types to trigger optimized mobile keyboards.",
        pageUrl: fetch.url,
      });
    }
  }

  return results;
}
