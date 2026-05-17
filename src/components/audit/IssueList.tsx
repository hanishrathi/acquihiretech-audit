"use client";

interface Issue {
  checkId: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  suggestion?: string;
  fixGuide?: string;
  revenueImpact?: string;
  pageUrl?: string;
}

interface IssueListProps {
  issues: Issue[];
  tier: string;
}

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "text-red-700", bg: "bg-red-50" },
  warning: { label: "Warning", color: "text-orange-700", bg: "bg-orange-50" },
  info: { label: "Info", color: "text-blue-700", bg: "bg-blue-50" },
  passed: { label: "Passed", color: "text-green-700", bg: "bg-green-50" },
};

export function IssueList({ issues, tier }: IssueListProps) {
  // Sort: critical first, then warning, then info, passed last
  const sortedIssues = [...issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2, passed: 3 };
    return (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3);
  });

  // Separate passed from issues
  const activeIssues = sortedIssues.filter((i) => i.severity !== "passed");
  const passedChecks = sortedIssues.filter((i) => i.severity === "passed");

  return (
    <div className="space-y-3">
      {/* Active Issues */}
      {activeIssues.map((issue) => {
        const config = severityConfig[issue.severity] || severityConfig.info;
        return (
          <div
            key={issue.checkId}
            className="p-4 rounded-[12px] bg-white border border-border-light hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <span
                className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bg}`}
              >
                {config.label}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text mb-1">
                  {issue.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {issue.description}
                </p>
                {issue.suggestion && (
                  <div className="mt-2 p-2 rounded bg-bg-tint border border-border-light">
                    <p className="text-xs text-text-dim">
                      <strong className="text-text">Suggestion:</strong>{" "}
                      {issue.suggestion}
                    </p>
                  </div>
                )}
                {issue.fixGuide && tier === "pro" && (
                  <details className="mt-2">
                    <summary className="text-xs text-link cursor-pointer hover:text-link-hover">
                      View fix guide
                    </summary>
                    <div className="mt-2 p-3 rounded bg-bg-tint border border-border-light">
                      <pre className="text-xs text-text-dim whitespace-pre-wrap font-mono">
                        {issue.fixGuide}
                      </pre>
                    </div>
                  </details>
                )}
                {!issue.suggestion && tier === "basic" && (
                  <p className="mt-2 text-xs text-purple-600">
                    🔒 Upgrade to see improvement suggestions
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Passed Checks */}
      {passedChecks.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm font-medium text-score-excellent cursor-pointer hover:opacity-80">
            ✓ {passedChecks.length} checks passed
          </summary>
          <div className="mt-3 space-y-2">
            {passedChecks.map((issue) => (
              <div
                key={issue.checkId}
                className="flex items-center gap-3 p-3 rounded-[8px] bg-green-50/50 border border-green-100"
              >
                <span className="text-green-500 text-sm">✓</span>
                <div>
                  <p className="text-xs font-medium text-text">{issue.title}</p>
                  <p className="text-xs text-text-dim">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
