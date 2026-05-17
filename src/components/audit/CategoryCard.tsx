"use client";

interface CategoryCardProps {
  category: string;
  score: number;
  meta: { label: string; icon: string; color: string };
  locked: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-score-excellent";
  if (score >= 70) return "text-score-good";
  if (score >= 50) return "text-score-poor";
  return "text-score-critical";
}

export function CategoryCard({ category, score, meta, locked }: CategoryCardProps) {
  const roundedScore = Math.round(score);

  if (locked) {
    return (
      <div className="relative p-5 rounded-[18px] bg-bg-tint border border-border-light overflow-hidden">
        {/* Blur overlay */}
        <div className="tier-gate-blur">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{meta.icon}</span>
              <span className="font-medium text-text text-sm">{meta.label}</span>
            </div>
            <span className="font-display font-bold text-lg text-text-dim">
              {roundedScore}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-border-light">
            <div
              className="h-full rounded-full bg-text-dim"
              style={{ width: `${roundedScore}%` }}
            />
          </div>
        </div>
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[18px]">
          <div className="text-center">
            <span className="text-2xl">🔒</span>
            <p className="text-xs text-text-secondary mt-1">Upgrade to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-[18px] bg-white border border-border-light hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <span className="font-medium text-text text-sm">{meta.label}</span>
        </div>
        <span className={`font-display font-bold text-lg ${getScoreColor(roundedScore)}`}>
          {roundedScore}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-border-light overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${roundedScore}%`,
            backgroundColor: meta.color,
          }}
        />
      </div>
    </div>
  );
}
