import type { AuditCategory, AuditTier } from "@/lib/db/schema";
import type { CheckResult } from "@/lib/scoring";
import { TIER_CATEGORIES, TIER_ISSUES_SHOWN } from "@/lib/scoring";

/**
 * Filter audit results based on the user's tier.
 * The crawler runs ALL checks regardless of tier.
 * Gating happens here at the response layer.
 */
export function gateResultsByTier(
  results: CheckResult[],
  tier: AuditTier
): {
  visibleResults: CheckResult[];
  hiddenCount: number;
  lockedCategories: AuditCategory[];
  totalIssuesCount: number;
} {
  const allowedCategories = TIER_CATEGORIES[tier] as AuditCategory[];
  const allCategories: AuditCategory[] = [
    "performance", "seo", "mobile", "accessibility", "security",
    "content", "technical", "ai-readiness", "conversion", "brand",
  ];

  // Determine locked categories
  const lockedCategories = allCategories.filter(
    (c) => !allowedCategories.includes(c)
  );

  // Filter to allowed categories
  const categoryResults = results.filter((r) =>
    allowedCategories.includes(r.category as AuditCategory)
  );

  // Apply issue limit per category for basic tier
  const maxIssues = TIER_ISSUES_SHOWN[tier];
  let visibleResults: CheckResult[];

  if (maxIssues > 0) {
    // Group by category and take top N issues (prioritize by severity)
    const grouped = new Map<string, CheckResult[]>();
    for (const result of categoryResults) {
      const existing = grouped.get(result.category) || [];
      existing.push(result);
      grouped.set(result.category, existing);
    }

    visibleResults = [];
    for (const [, catResults] of grouped) {
      const sorted = catResults.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2, passed: 3 };
        return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
      });
      visibleResults.push(...sorted.slice(0, maxIssues));
    }
  } else {
    visibleResults = categoryResults;
  }

  // Strip fix guides and revenue impact for non-pro tiers
  if (tier !== "pro") {
    visibleResults = visibleResults.map((r) => ({
      ...r,
      fixGuide: undefined,
      revenueImpact: undefined,
    }));
  }

  // Strip suggestions for basic tier
  if (tier === "basic") {
    visibleResults = visibleResults.map((r) => ({
      ...r,
      suggestion: undefined,
    }));
  }

  const totalIssuesCount = results.filter((r) => r.severity !== "passed").length;
  const hiddenCount = totalIssuesCount - visibleResults.filter((r) => r.severity !== "passed").length;

  return {
    visibleResults,
    hiddenCount,
    lockedCategories,
    totalIssuesCount,
  };
}

/**
 * Get upgrade message based on what's hidden.
 */
export function getUpgradeMessage(
  tier: AuditTier,
  hiddenCount: number,
  lockedCategories: AuditCategory[]
): string {
  if (tier === "basic") {
    return `Unlock ${hiddenCount} more issues across ${lockedCategories.length} additional categories. Upgrade to Starter for full analysis with improvement suggestions.`;
  }
  if (tier === "starter") {
    return `Get step-by-step fix guides with code examples, revenue impact estimates, and ${lockedCategories.length} additional audit categories. Upgrade to Pro.`;
  }
  return "";
}
