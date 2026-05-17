"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScoreGauge } from "@/components/audit/ScoreGauge";
import { CategoryCard } from "@/components/audit/CategoryCard";
import { IssueList } from "@/components/audit/IssueList";

interface AuditData {
  id: string;
  url: string;
  status: string;
  tier: string;
  result: {
    overallScore: number;
    scores: Record<string, number>;
    issues: any[];
    hiddenCount: number;
    lockedCategories: string[];
    totalIssuesCount: number;
    metadata: {
      domain: string;
      pagesCrawled: number;
      totalIssues: number;
      criticalIssues: number;
      crawlTimeMs: number;
    };
    pageData: any[];
    error?: string;
  };
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  performance: { label: "Performance", icon: "⚡", color: "#f97316" },
  seo: { label: "SEO", icon: "🔍", color: "#3b82f6" },
  mobile: { label: "Mobile", icon: "📱", color: "#06b6d4" },
  accessibility: { label: "Accessibility", icon: "👁", color: "#8b5cf6" },
  security: { label: "Security", icon: "🛡", color: "#ef4444" },
  content: { label: "Content Quality", icon: "📝", color: "#10b981" },
  technical: { label: "Technical", icon: "🔧", color: "#6366f1" },
  "ai-readiness": { label: "AI Readiness", icon: "🤖", color: "#a855f7" },
  conversion: { label: "Conversion", icon: "🎯", color: "#ec4899" },
  brand: { label: "Brand", icon: "🎨", color: "#14b8a6" },
};

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress while loading
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    async function fetchAudit() {
      try {
        const res = await fetch(`/api/audit/${id}`);
        const data = await res.json();

        if (data.status === "complete" || data.status === "failed") {
          setAudit(data);
          setProgress(100);
          setLoading(false);
          clearInterval(interval);
        } else {
          // Poll again
          setTimeout(fetchAudit, 2000);
        }
      } catch {
        setLoading(false);
        clearInterval(interval);
      }
    }

    fetchAudit();
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[480px] w-full text-center">
          <div className="w-full h-2 rounded-full bg-border-light overflow-hidden mb-6">
            <div
              className="h-full crawl-progress-bar rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <h2 className="font-display text-xl font-bold text-text mb-2">
            Analyzing your website...
          </h2>
          <p className="text-sm text-text-secondary">
            Running 300+ checks across performance, SEO, security, and more.
          </p>
        </div>
      </div>
    );
  }

  if (!audit || audit.status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[480px] w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-display text-xl font-bold text-text mb-2">
            Audit Failed
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            {audit?.result?.error || "We couldn't reach the website. Please check the URL and try again."}
          </p>
          <a
            href="/"
            className="inline-flex px-6 py-3 bg-bg-dark text-white rounded-[12px] font-medium text-sm hover:bg-black transition-all"
          >
            Try Another URL
          </a>
        </div>
      </div>
    );
  }

  const { result } = audit;
  const visibleCategories = Object.entries(result.scores).filter(
    ([cat]) => !result.lockedCategories.includes(cat)
  );
  const lockedCategories = Object.entries(result.scores).filter(
    ([cat]) => result.lockedCategories.includes(cat)
  );

  return (
    <div className="min-h-screen bg-bg-near-white">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-light">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm">
            <svg width="20" height="20" viewBox="0 0 44 44">
              <circle cx="22" cy="7" r="6.5" fill="#f97316" />
              <circle cx="37" cy="22" r="6.5" fill="#3b82f6" />
              <circle cx="22" cy="37" r="6.5" fill="#10b981" />
              <circle cx="7" cy="22" r="6.5" fill="#a855f7" />
            </svg>
            <span className="font-display font-bold text-text">Audit Report</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-dim font-mono">{result.metadata.domain}</span>
            <a href="/pricing" className="text-xs px-3 py-1 bg-engine-growth text-white rounded-full font-medium hover:opacity-90 transition-opacity">
              Upgrade
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Score Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <ScoreGauge score={result.overallScore} size={160} />
          <div className="text-center md:text-left">
            <h1 className="font-display text-3xl font-bold text-text mb-2">
              {result.metadata.domain}
            </h1>
            <p className="text-text-secondary mb-4">
              Scanned {result.metadata.pagesCrawled} page in{" "}
              {(result.metadata.crawlTimeMs / 1000).toFixed(1)}s
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {result.metadata.criticalIssues} Critical
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                {result.totalIssuesCount} Total Issues
              </span>
              {result.hiddenCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                  🔒 {result.hiddenCount} more hidden
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <h2 className="font-display text-xl font-bold text-text mb-4">Audit Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {visibleCategories.map(([category, score]) => (
            <CategoryCard
              key={category}
              category={category}
              score={score as number}
              meta={CATEGORY_META[category]}
              locked={false}
            />
          ))}
          {lockedCategories.map(([category, score]) => (
            <CategoryCard
              key={category}
              category={category}
              score={score as number}
              meta={CATEGORY_META[category]}
              locked={true}
            />
          ))}
        </div>

        {/* Issues */}
        <h2 className="font-display text-xl font-bold text-text mb-4">Issues Found</h2>
        <IssueList issues={result.issues} tier={audit.tier} />

        {/* Upgrade CTA */}
        {result.hiddenCount > 0 && (
          <div className="mt-8 p-8 rounded-[18px] bg-gradient-to-br from-bg-tint to-white border border-border-light text-center">
            <h3 className="font-display text-xl font-bold text-text mb-2">
              Unlock {result.hiddenCount} more issues
            </h3>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
              Get detailed improvement suggestions, step-by-step fix guides,
              and access to all 10 audit categories including AI Readiness and Conversion analysis.
            </p>
            <a
              href="/pricing"
              className="inline-flex px-8 py-3 bg-bg-dark text-white rounded-[12px] font-medium text-sm hover:bg-black transition-all hover:shadow-lg"
            >
              View Plans — Starting at ₹1,499/mo
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
