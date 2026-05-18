"use client";

import { useEffect, useState } from "react";

interface BenchmarkData {
  ready: boolean;
  sampleSize: number;
  median?: number;
  mean?: number;
  p25?: number;
  p75?: number;
  max?: number;
  min?: number;
}

export function BenchmarkStrip({ score }: { score: number }) {
  const [data, setData] = useState<BenchmarkData | null>(null);

  useEffect(() => {
    fetch("/api/benchmark")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, []);

  if (!data || !data.ready) {
    return null; // Hide until we have ≥5 audits in DB
  }

  const { median = 0, sampleSize, p25 = 0, p75 = 0 } = data;

  // Calculate percentile of this site's score
  // Quick approximation using the quartile data we have
  let percentile: number;
  let percentileLabel: string;
  let percentileColor: string;

  if (score >= p75) {
    percentile = 75 + Math.round(((score - p75) / (100 - p75 || 1)) * 25);
    percentile = Math.min(99, percentile);
    percentileLabel = `Top ${100 - percentile}%`;
    percentileColor = "text-score-excellent";
  } else if (score >= median) {
    percentile = 50 + Math.round(((score - median) / (p75 - median || 1)) * 25);
    percentileLabel = `Top ${100 - percentile}%`;
    percentileColor = "text-score-good";
  } else if (score >= p25) {
    percentile = 25 + Math.round(((score - p25) / (median - p25 || 1)) * 25);
    percentileLabel = `Bottom ${percentile}%`;
    percentileColor = "text-score-poor";
  } else {
    percentile = Math.round((score / (p25 || 1)) * 25);
    percentileLabel = `Bottom ${percentile}%`;
    percentileColor = "text-score-critical";
  }

  const diff = score - median;
  const diffText =
    diff >= 0
      ? `${Math.abs(diff).toFixed(1)} points above`
      : `${Math.abs(diff).toFixed(1)} points below`;

  return (
    <div className="p-5 rounded-[18px] bg-white border border-border-light">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              How you compare
            </span>
            <span className="text-xs text-text-dim">
              (across {sampleSize} sites audited)
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className={`font-display text-2xl font-bold ${percentileColor}`}>
              {percentileLabel}
            </span>
            <span className="text-sm text-text-secondary">
              · {diffText} the median ({median.toFixed(1)})
            </span>
          </div>
        </div>

        {/* Mini distribution bar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="relative h-2 rounded-full bg-gradient-to-r from-score-critical via-score-poor via-score-good to-score-excellent overflow-visible">
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-5 bg-text rounded-full shadow-md"
              style={{ left: `${Math.min(100, Math.max(0, score))}%` }}
              title={`Your score: ${score.toFixed(1)}`}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-text-dim font-mono">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
