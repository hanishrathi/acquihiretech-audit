import { fetchPage, type FetchResult } from "./fetcher";
import { parseHTML, type ParsedPage } from "./parser";
import { runPerformanceChecks } from "@/lib/checks/performance";
import { runSEOChecks } from "@/lib/checks/seo";
import { runMobileChecks } from "@/lib/checks/mobile";
import { runSecurityChecks } from "@/lib/checks/security";
import { runAccessibilityChecks } from "@/lib/checks/accessibility";
import { runContentChecks } from "@/lib/checks/content";
import { runTechnicalChecks } from "@/lib/checks/technical";
import { runAIReadinessChecks } from "@/lib/checks/ai-readiness";
import { runConversionChecks } from "@/lib/checks/conversion";
import { runBrandChecks } from "@/lib/checks/brand";
import {
  calculateAllScores,
  calculateOverallScore,
  type CheckResult,
} from "@/lib/scoring";
import type { AuditTier } from "@/lib/db/schema";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CrawlOptions {
  url: string;
  tier: AuditTier;
  maxPages: number;
  onProgress?: (progress: CrawlProgress) => void;
}

export interface CrawlProgress {
  status: "fetching" | "parsing" | "analyzing" | "scoring" | "complete";
  message: string;
  pagesProcessed: number;
  totalPages: number;
  percentage: number;
}

export interface CrawlResult {
  url: string;
  overallScore: number;
  scores: Record<string, number>;
  issues: CheckResult[];
  pageData: PageAnalysis[];
  metadata: {
    domain: string;
    pagesCrawled: number;
    totalIssues: number;
    criticalIssues: number;
    crawlTimeMs: number;
  };
}

export interface PageAnalysis {
  url: string;
  statusCode: number;
  loadTimeMs: number;
  contentSize: number;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  issues: CheckResult[];
}

// ─── Main Crawler Orchestrator ──────────────────────────────────────────────

export async function crawlSite(options: CrawlOptions): Promise<CrawlResult> {
  const { url, tier, maxPages, onProgress } = options;
  const startTime = Date.now();
  const normalizedUrl = normalizeUrl(url);
  const domain = new URL(normalizedUrl).hostname;

  // Step 1: Fetch the page
  onProgress?.({
    status: "fetching",
    message: `Fetching ${normalizedUrl}...`,
    pagesProcessed: 0,
    totalPages: maxPages,
    percentage: 10,
  });

  const fetchResult = await fetchPage(normalizedUrl);

  // Step 2: Parse HTML
  onProgress?.({
    status: "parsing",
    message: "Parsing HTML structure...",
    pagesProcessed: 1,
    totalPages: maxPages,
    percentage: 30,
  });

  const parsed = parseHTML(fetchResult.html, normalizedUrl);

  // Step 3: Run all checks
  onProgress?.({
    status: "analyzing",
    message: "Running 300+ audit checks...",
    pagesProcessed: 1,
    totalPages: maxPages,
    percentage: 50,
  });

  const allIssues: CheckResult[] = [];

  // Always run core checks (basic tier)
  allIssues.push(...runPerformanceChecks(fetchResult, parsed));
  allIssues.push(...runSEOChecks(fetchResult, parsed));
  allIssues.push(...runMobileChecks(fetchResult, parsed));

  // Starter tier adds more
  if (tier === "starter" || tier === "pro") {
    allIssues.push(...runSecurityChecks(fetchResult, parsed));
    allIssues.push(...runAccessibilityChecks(fetchResult, parsed));
    allIssues.push(...runContentChecks(fetchResult, parsed));
    allIssues.push(...runTechnicalChecks(fetchResult, parsed));
  }

  // Pro tier adds the rest
  if (tier === "pro") {
    allIssues.push(...runAIReadinessChecks(fetchResult, parsed));
    allIssues.push(...runConversionChecks(fetchResult, parsed));
    allIssues.push(...runBrandChecks(fetchResult, parsed));
  }

  // Step 4: Calculate scores
  onProgress?.({
    status: "scoring",
    message: "Calculating scores...",
    pagesProcessed: 1,
    totalPages: maxPages,
    percentage: 85,
  });

  const scores = calculateAllScores(allIssues);
  const overallScore = calculateOverallScore(scores);

  const crawlTimeMs = Date.now() - startTime;

  // Step 5: Complete
  onProgress?.({
    status: "complete",
    message: "Audit complete!",
    pagesProcessed: 1,
    totalPages: maxPages,
    percentage: 100,
  });

  return {
    url: normalizedUrl,
    overallScore,
    scores,
    issues: allIssues,
    pageData: [
      {
        url: normalizedUrl,
        statusCode: fetchResult.statusCode,
        loadTimeMs: fetchResult.responseTimeMs,
        contentSize: fetchResult.contentSize,
        title: parsed.title || "",
        description: parsed.metaDescription || "",
        h1: parsed.h1 || "",
        wordCount: parsed.wordCount,
        issues: allIssues,
      },
    ],
    metadata: {
      domain,
      pagesCrawled: 1,
      totalIssues: allIssues.filter((i) => i.severity !== "passed").length,
      criticalIssues: allIssues.filter((i) => i.severity === "critical").length,
      crawlTimeMs,
    },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add protocol if missing
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, "");

  return normalized;
}

export function getDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname;
  } catch {
    return url;
  }
}
