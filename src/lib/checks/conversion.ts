import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runConversionChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── CTA Presence ───────────────────────────────────────────────────────
  if (parsed.ctaButtons.length === 0) {
    results.push({
      checkId: "conv-no-cta",
      category: "conversion",
      severity: "critical",
      title: "No clear call-to-action found",
      description: "The page has no identifiable CTA buttons or links. Visitors don't know what to do next.",
      suggestion: "Add a prominent CTA above the fold with clear action language (e.g., 'Get Started', 'Book a Demo').",
      fixGuide: `## Fix: Add Clear CTAs\n\n\`\`\`html\n<!-- Primary CTA (above fold) -->\n<a href="/contact" class="btn btn-primary">\n  Book Your Free Consultation\n</a>\n\n<!-- Secondary CTA -->\n<a href="/pricing" class="btn btn-secondary">\n  See Plans & Pricing\n</a>\n\`\`\`\n\n**Best practices:**\n- One primary CTA above the fold\n- Action-oriented language (verbs, not nouns)\n- High contrast against background\n- Repeat CTA at bottom of page`,
      revenueImpact: "Pages without clear CTAs convert at 0.5-1%. Adding a strong CTA can increase conversion by 3-5x.",
      pageUrl: fetch.url,
    });
  } else if (parsed.ctaButtons.length < 2) {
    results.push({
      checkId: "conv-few-ctas",
      category: "conversion",
      severity: "info",
      title: "Only one CTA button found",
      description: "Consider adding CTAs at multiple scroll positions for longer pages.",
      suggestion: "Add CTA buttons after key value propositions and at the bottom of the page.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "conv-cta-pass",
      category: "conversion",
      severity: "passed",
      title: "Multiple CTAs present",
      description: `Found ${parsed.ctaButtons.length} CTA elements.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Contact Information ────────────────────────────────────────────────
  const hasPhone = parsed.phoneNumbers.length > 0;
  const hasEmail = parsed.emailAddresses.length > 0;
  const hasContactForm = parsed.forms.length > 0;

  if (!hasPhone && !hasEmail && !hasContactForm) {
    results.push({
      checkId: "conv-no-contact",
      category: "conversion",
      severity: "warning",
      title: "No contact information found",
      description: "Visitors cannot easily reach you. No phone, email, or contact form detected.",
      suggestion: "Add phone number, email, and/or a contact form prominently on the page.",
      revenueImpact: "48% of people cite 'contact information' as the most important credibility signal on a website.",
      pageUrl: fetch.url,
    });
  } else {
    const channels = [];
    if (hasPhone) channels.push("phone");
    if (hasEmail) channels.push("email");
    if (hasContactForm) channels.push("contact form");
    results.push({
      checkId: "conv-contact-pass",
      category: "conversion",
      severity: "passed",
      title: "Contact channels available",
      description: `Found: ${channels.join(", ")}.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Trust Signals ──────────────────────────────────────────────────────
  const trustKeywords = [
    "testimonial",
    "review",
    "client",
    "customer",
    "trusted",
    "partner",
    "certified",
    "award",
    "featured",
    "as seen",
  ];
  const htmlLower = fetch.html.toLowerCase();
  const trustSignalsFound = trustKeywords.filter((kw) =>
    htmlLower.includes(kw)
  );

  if (trustSignalsFound.length === 0) {
    results.push({
      checkId: "conv-no-trust",
      category: "conversion",
      severity: "warning",
      title: "No trust signals detected",
      description: "No testimonials, reviews, or credibility indicators found on the page.",
      suggestion: "Add client testimonials, star ratings, partner logos, certifications, or 'trusted by' sections.",
      revenueImpact: "Trust signals can increase conversion rates by 15-34%.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "conv-trust-pass",
      category: "conversion",
      severity: "passed",
      title: "Trust signals present",
      description: `Found indicators: ${trustSignalsFound.join(", ")}.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Form Usability ─────────────────────────────────────────────────────
  if (parsed.forms.length > 0) {
    const primaryForm = parsed.forms[0];
    if (primaryForm.inputs.length > 7) {
      results.push({
        checkId: "conv-form-long",
        category: "conversion",
        severity: "warning",
        title: `Form has ${primaryForm.inputs.length} fields — may deter submissions`,
        description: "Long forms create friction. Each additional field reduces completion by ~5%.",
        suggestion: "Reduce to 3-5 essential fields. Use multi-step forms for complex data collection.",
        fixGuide: `## Fix: Simplify Forms\n\n**Essential fields only:**\n1. Name\n2. Email\n3. Phone (optional)\n4. Message/enquiry type\n\n**For complex forms, use progressive disclosure:**\n- Step 1: Basic info (name, email)\n- Step 2: Details (company, need)\n- Step 3: Preferences (budget, timeline)\n\nShow a progress indicator to reduce abandonment.`,
        pageUrl: fetch.url,
      });
    }
  }

  // ─── Social Proof ───────────────────────────────────────────────────────
  if (parsed.socialLinks.length === 0) {
    results.push({
      checkId: "conv-no-social",
      category: "conversion",
      severity: "info",
      title: "No social media links found",
      description: "Social profiles build credibility and provide additional engagement channels.",
      suggestion: "Add links to active social media profiles (LinkedIn, Twitter/X, Instagram).",
      pageUrl: fetch.url,
    });
  }

  // ─── Chat/Communication Channels ────────────────────────────────────────
  const hasChatWidget =
    htmlLower.includes("intercom") ||
    htmlLower.includes("drift") ||
    htmlLower.includes("crisp") ||
    htmlLower.includes("tawk") ||
    htmlLower.includes("livechat") ||
    htmlLower.includes("whatsapp") ||
    htmlLower.includes("chat");

  if (!hasChatWidget) {
    results.push({
      checkId: "conv-no-chat",
      category: "conversion",
      severity: "info",
      title: "No live chat or messaging widget detected",
      description: "Live chat can capture leads who don't want to fill forms or call.",
      suggestion: "Consider adding WhatsApp, Intercom, or a simple chat widget for real-time engagement.",
      pageUrl: fetch.url,
    });
  }

  return results;
}
