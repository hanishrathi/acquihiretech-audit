import type { AuditCategory, AuditScores, IssueSeverity } from "@/lib/db/schema";

// ─── Category Weights (must sum to 1.0) ─────────────────────────────────────

export const CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  performance: 0.2,
  seo: 0.2,
  security: 0.15,
  mobile: 0.1,
  accessibility: 0.1,
  content: 0.08,
  technical: 0.07,
  "ai-readiness": 0.05,
  conversion: 0.03,
  brand: 0.02,
};

// ─── Severity Point Deductions ──────────────────────────────────────────────

export const SEVERITY_POINTS: Record<IssueSeverity, number> = {
  critical: 10,
  warning: 5,
  info: 1,
  passed: 0,
};

// ─── Category Labels & Descriptions ─────────────────────────────────────────

export const CATEGORY_META: Record<
  AuditCategory,
  { label: string; description: string; icon: string; color: string }
> = {
  performance: {
    label: "Performance",
    description: "Page speed, Core Web Vitals, resource optimization",
    icon: "Zap",
    color: "#f97316",
  },
  seo: {
    label: "SEO",
    description: "Search engine optimization, meta tags, structured data",
    icon: "Search",
    color: "#3b82f6",
  },
  accessibility: {
    label: "Accessibility",
    description: "WCAG compliance, screen readers, keyboard navigation",
    icon: "Eye",
    color: "#8b5cf6",
  },
  security: {
    label: "Security",
    description: "HTTPS, headers, vulnerabilities, data protection",
    icon: "Shield",
    color: "#ef4444",
  },
  mobile: {
    label: "Mobile",
    description: "Responsive design, tap targets, mobile speed",
    icon: "Smartphone",
    color: "#06b6d4",
  },
  content: {
    label: "Content Quality",
    description: "Readability, thin content, freshness, media richness",
    icon: "FileText",
    color: "#10b981",
  },
  technical: {
    label: "Technical Health",
    description: "Broken links, redirects, server config, compression",
    icon: "Wrench",
    color: "#6366f1",
  },
  "ai-readiness": {
    label: "AI Readiness",
    description: "AI crawler access, structured data, citation potential",
    icon: "Brain",
    color: "#a855f7",
  },
  conversion: {
    label: "Conversion",
    description: "CTAs, forms, trust signals, page flow",
    icon: "Target",
    color: "#ec4899",
  },
  brand: {
    label: "Brand Consistency",
    description: "Design system, typography, colors, tone",
    icon: "Palette",
    color: "#14b8a6",
  },
};

// ─── Tier Access Control ─────────────────────────────────────────────────────

export const TIER_CATEGORIES: Record<string, AuditCategory[]> = {
  basic: ["performance", "seo", "mobile"],
  starter: [
    "performance",
    "seo",
    "mobile",
    "accessibility",
    "security",
    "content",
    "technical",
  ],
  pro: [
    "performance",
    "seo",
    "mobile",
    "accessibility",
    "security",
    "content",
    "technical",
    "ai-readiness",
    "conversion",
    "brand",
  ],
};

export const TIER_PAGES_LIMIT: Record<string, number> = {
  basic: 1,
  starter: 50,
  pro: 500,
};

export const TIER_ISSUES_SHOWN: Record<string, number> = {
  basic: 3, // top 3 per category
  starter: -1, // all
  pro: -1, // all + fix guides
};

// ─── Scoring Functions ──────────────────────────────────────────────────────

export interface CheckResult {
  checkId: string;
  category: AuditCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  suggestion?: string;
  fixGuide?: string;
  revenueImpact?: string;
  pageUrl?: string;
  rawData?: Record<string, unknown>;
}

/**
 * Calculate score for a single category based on check results.
 * Score = 100 - sum(deductions), clamped to [0, 100].
 */
export function calculateCategoryScore(
  results: CheckResult[],
  category: AuditCategory
): number {
  const categoryResults = results.filter((r) => r.category === category);

  if (categoryResults.length === 0) return 100;

  const totalDeductions = categoryResults.reduce((sum, result) => {
    return sum + SEVERITY_POINTS[result.severity];
  }, 0);

  return Math.max(0, Math.min(100, 100 - totalDeductions));
}

/**
 * Calculate overall score as weighted average of category scores.
 */
export function calculateOverallScore(scores: Partial<AuditScores>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [category, score] of Object.entries(scores)) {
    const weight = CATEGORY_WEIGHTS[category as AuditCategory] || 0;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Calculate all category scores from check results.
 */
export function calculateAllScores(results: CheckResult[]): AuditScores {
  const scores = {} as AuditScores;
  const categories: AuditCategory[] = [
    "performance",
    "seo",
    "accessibility",
    "security",
    "mobile",
    "content",
    "technical",
    "ai-readiness",
    "conversion",
    "brand",
  ];

  for (const category of categories) {
    scores[category] = calculateCategoryScore(results, category);
  }

  return scores;
}

/**
 * Get letter grade from score.
 */
export function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Get score color based on value.
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "var(--score-excellent)";
  if (score >= 70) return "var(--score-good)";
  if (score >= 50) return "var(--score-poor)";
  return "var(--score-critical)";
}

/**
 * Get severity counts from results.
 */
export function getSeverityCounts(results: CheckResult[]) {
  return {
    critical: results.filter((r) => r.severity === "critical").length,
    warning: results.filter((r) => r.severity === "warning").length,
    info: results.filter((r) => r.severity === "info").length,
    passed: results.filter((r) => r.severity === "passed").length,
  };
}
