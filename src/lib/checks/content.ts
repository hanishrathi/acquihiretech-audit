import type { FetchResult } from "@/lib/crawler/fetcher";
import type { ParsedPage } from "@/lib/crawler/parser";
import type { CheckResult } from "@/lib/scoring";

export function runContentChecks(
  fetch: FetchResult,
  parsed: ParsedPage
): CheckResult[] {
  const results: CheckResult[] = [];

  // ─── Word Count (Thin Content) ──────────────────────────────────────────
  if (parsed.wordCount < 100) {
    results.push({
      checkId: "content-thin-critical",
      category: "content",
      severity: "critical",
      title: "Extremely thin content",
      description: `Only ${parsed.wordCount} words on the page. Search engines may consider this low-quality.`,
      suggestion: "Add substantive, valuable content. Aim for at least 300-500 words on key pages.",
      revenueImpact: "Thin content pages rarely rank. Adding quality content can increase organic traffic by 50-200%.",
      pageUrl: fetch.url,
    });
  } else if (parsed.wordCount < 300) {
    results.push({
      checkId: "content-thin-warning",
      category: "content",
      severity: "warning",
      title: "Page has relatively thin content",
      description: `${parsed.wordCount} words found. Pages with fewer than 300 words may struggle to rank.`,
      suggestion: "Expand content with useful information, FAQs, or detailed descriptions.",
      pageUrl: fetch.url,
    });
  } else {
    results.push({
      checkId: "content-word-count-pass",
      category: "content",
      severity: "passed",
      title: "Adequate content length",
      description: `${parsed.wordCount} words found.`,
      pageUrl: fetch.url,
    });
  }

  // ─── Readability (Flesch-Kincaid approximation) ─────────────────────────
  const readabilityScore = calculateReadability(parsed.textContent);
  if (readabilityScore < 30) {
    results.push({
      checkId: "content-readability-hard",
      category: "content",
      severity: "warning",
      title: "Content is very difficult to read",
      description: `Readability score: ${readabilityScore}/100. Content uses complex language that may alienate visitors.`,
      suggestion: "Simplify language: use shorter sentences, common words, and active voice. Aim for grade 8-10 reading level.",
      fixGuide: `## Fix: Improve Readability\n\n**Tips:**\n1. Keep sentences under 20 words\n2. Use simple, common words\n3. Write in active voice ("We build" not "Systems are built by us")\n4. Break long paragraphs into 2-3 sentences\n5. Use bullet points and subheadings\n6. Target a Flesch score of 60-70 (grade 8 level)`,
      pageUrl: fetch.url,
    });
  } else if (readabilityScore < 50) {
    results.push({
      checkId: "content-readability-medium",
      category: "content",
      severity: "info",
      title: "Content readability could be improved",
      description: `Readability score: ${readabilityScore}/100. Some users may find the content complex.`,
      suggestion: "Consider simplifying for a broader audience.",
      pageUrl: fetch.url,
    });
  }

  // ─── Media Richness ─────────────────────────────────────────────────────
  if (parsed.images.length === 0 && parsed.wordCount > 300) {
    results.push({
      checkId: "content-no-images",
      category: "content",
      severity: "warning",
      title: "No images on a content-heavy page",
      description: "Pages with images get 94% more views than text-only pages.",
      suggestion: "Add relevant images, diagrams, or screenshots to break up text and improve engagement.",
      pageUrl: fetch.url,
    });
  }

  // ─── Paragraphs ─────────────────────────────────────────────────────────
  const longParagraphs = parsed.paragraphs.filter(
    (p) => p.split(/\s+/).length > 100
  );
  if (longParagraphs.length > 2) {
    results.push({
      checkId: "content-long-paragraphs",
      category: "content",
      severity: "info",
      title: `${longParagraphs.length} very long paragraphs`,
      description: "Long paragraphs (100+ words) reduce readability, especially on mobile.",
      suggestion: "Break long paragraphs into shorter ones (3-4 sentences max). Use subheadings between sections.",
      pageUrl: fetch.url,
    });
  }

  // ─── Headings as Content Structure ──────────────────────────────────────
  if (parsed.headings.length < 3 && parsed.wordCount > 500) {
    results.push({
      checkId: "content-few-headings",
      category: "content",
      severity: "info",
      title: "Few subheadings for long content",
      description: `Only ${parsed.headings.length} headings for ${parsed.wordCount} words. Content may feel like a wall of text.`,
      suggestion: "Add H2/H3 subheadings every 200-300 words to improve scannability.",
      pageUrl: fetch.url,
    });
  }

  // ─── Content Freshness ──────────────────────────────────────────────────
  const lastModified = fetch.headers["last-modified"];
  if (lastModified) {
    const lastMod = new Date(lastModified);
    const daysSinceUpdate = Math.floor(
      (Date.now() - lastMod.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate > 365) {
      results.push({
        checkId: "content-stale",
        category: "content",
        severity: "info",
        title: "Content may be outdated",
        description: `Last modified ${daysSinceUpdate} days ago. Stale content can lose rankings over time.`,
        suggestion: "Review and update content regularly. Add a 'last updated' date for users.",
        pageUrl: fetch.url,
      });
    }
  }

  return results;
}

// ─── Readability Score (simplified Flesch-Kincaid) ────────────────────────

function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score =
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;

  // Adjust for silent e
  if (word.endsWith("e")) count--;
  // Adjust for -le ending
  if (word.endsWith("le") && word.length > 3) count++;

  return Math.max(1, count);
}
