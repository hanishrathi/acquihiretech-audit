import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runAccessibilityChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── Images Without Alt Text ────────────────────────────────────────────
  if (parsed.imagesWithoutAlt > 0) {
    const severity = parsed.imagesWithoutAlt > 5 ? "critical" : "warning";
    results.push({
      checkId: "a11y-img-alt",
      category: "accessibility",
      severity,
      title: `${parsed.imagesWithoutAlt} images missing alt text`,
      description: "Screen readers cannot describe these images to visually impaired users.",
      suggestion: "Add descriptive alt text to all meaningful images. Use alt='' for decorative images.",
      fixGuide: `## Fix: Add Alt Text to Images\n\n\`\`\`html\n<!-- Meaningful image -->\n<img src="team.jpg" alt="AcquiHire team working on client project" />\n\n<!-- Decorative image (intentionally empty alt) -->\n<img src="divider.svg" alt="" role="presentation" />\n\`\`\`\n\n**Best practices:**\n- Describe what the image shows, not what it is\n- Keep under 125 characters\n- Don't start with "Image of..." or "Photo of..."`,
      revenueImpact: "Accessibility compliance is legally required in many markets and affects 15-20% of users.",
      pageUrl: fetch.url,
    });
  } else if (parsed.images.length > 0) {
    results.push({
      checkId: "a11y-img-alt-pass",
      category: "accessibility",
      severity: "passed",
      title: "All images have alt text",
      description: `${parsed.images.length} images checked.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Language Attribute ─────────────────────────────────────────────────
  if (!parsed.language) {
    results.push({
      checkId: "a11y-lang-missing",
      category: "accessibility",
      severity: "warning",
      title: "Missing lang attribute on <html>",
      description: "Screen readers need the lang attribute to select the correct pronunciation.",
      suggestion: 'Add lang="en" (or appropriate language code) to the <html> element.',
      pageUrl: fetch.url,
    });
  }

  // ─── Skip Navigation ────────────────────────────────────────────────────
  if (!parsed.skipNavigation) {
    results.push({
      checkId: "a11y-skip-nav",
      category: "accessibility",
      severity: "warning",
      title: "Missing skip navigation link",
      description: "Keyboard users must tab through the entire navigation before reaching main content.",
      suggestion: "Add a visually hidden 'Skip to content' link as the first focusable element.",
      fixGuide: `## Fix: Add Skip Navigation\n\n\`\`\`html\n<body>\n  <a href="#main" class="skip-link">Skip to content</a>\n  <nav>...</nav>\n  <main id="main">...</main>\n</body>\n\`\`\`\n\n\`\`\`css\n.skip-link {\n  position: absolute;\n  left: -9999px;\n  top: auto;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n}\n.skip-link:focus {\n  position: fixed;\n  top: 10px;\n  left: 10px;\n  width: auto;\n  height: auto;\n  z-index: 9999;\n  padding: 8px 16px;\n  background: #000;\n  color: #fff;\n}\n\`\`\``,
      pageUrl: fetch.url,
    });
  }

  // ─── Form Labels ────────────────────────────────────────────────────────
  if (parsed.formInputs > 0 && parsed.formLabels < parsed.formInputs) {
    const unlabeled = parsed.formInputs - parsed.formLabels;
    results.push({
      checkId: "a11y-form-labels",
      category: "accessibility",
      severity: "warning",
      title: `${unlabeled} form input(s) without associated labels`,
      description: "Screen readers rely on labels to announce form field purposes.",
      suggestion: "Associate every input with a <label> using the 'for' attribute matching the input's 'id'.",
      fixGuide: `## Fix: Add Form Labels\n\n\`\`\`html\n<!-- Correct: label with 'for' matching input 'id' -->\n<label for="email">Email address</label>\n<input type="email" id="email" name="email" />\n\n<!-- Alternative: wrap input in label -->\n<label>\n  Email address\n  <input type="email" name="email" />\n</label>\n\`\`\``,
      pageUrl: fetch.url,
    });
  }

  // ─── ARIA Usage ─────────────────────────────────────────────────────────
  if (parsed.ariaLabels === 0 && parsed.ariaRoles === 0) {
    results.push({
      checkId: "a11y-aria-missing",
      category: "accessibility",
      severity: "info",
      title: "No ARIA attributes detected",
      description: "ARIA landmarks and labels improve navigation for assistive technologies.",
      suggestion: "Add ARIA roles (main, navigation, banner) and aria-labels to interactive elements.",
      pageUrl: fetch.url,
    });
  }

  // ─── Color Contrast (heuristic) ────────────────────────────────────────
  // Check for common low-contrast patterns in inline styles
  const lowContrastPatterns = [
    /color:\s*#(?:ccc|ddd|eee|aaa|bbb)/i,
    /color:\s*(?:lightgray|lightgrey|silver)/i,
  ];
  const hasLowContrast = lowContrastPatterns.some((p) => p.test(fetch.html));
  if (hasLowContrast) {
    results.push({
      checkId: "a11y-contrast-possible",
      category: "accessibility",
      severity: "info",
      title: "Possible low color contrast detected",
      description: "Some text colors appear to be light gray which may not meet WCAG AA contrast ratio (4.5:1).",
      suggestion: "Use a contrast checker tool to verify all text meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).",
      pageUrl: fetch.url,
    });
  }

  // ─── Document Structure ─────────────────────────────────────────────────
  const hasMain = fetch.html.includes("<main") || fetch.html.includes('role="main"');
  const hasNav = fetch.html.includes("<nav") || fetch.html.includes('role="navigation"');

  if (!hasMain) {
    results.push({
      checkId: "a11y-landmark-main",
      category: "accessibility",
      severity: "info",
      title: "Missing <main> landmark",
      description: "The <main> element helps screen readers skip to primary content.",
      suggestion: "Wrap your primary content in a <main> element.",
      pageUrl: fetch.url,
    });
  }

  if (!hasNav) {
    results.push({
      checkId: "a11y-landmark-nav",
      category: "accessibility",
      severity: "info",
      title: "Missing <nav> landmark",
      description: "The <nav> element identifies navigation for assistive technologies.",
      suggestion: "Wrap your navigation links in a <nav> element.",
      pageUrl: fetch.url,
    });
  }

  return results;
}
