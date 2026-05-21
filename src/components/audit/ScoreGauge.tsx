"use client";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#f97316";
  if (score >= 50) return "#ef4444";
  return "#991b1b";
}

function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function ScoreGauge({ score, size = 120, label }: ScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;
  const color = getScoreColor(score);
  const grade = getGrade(score);
  const roundedScore = Math.round(score);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-light)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className="animate-score-fill transition-all duration-1000"
          style={{ ["--score-offset" as string]: progress }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-semibold leading-none"
          style={{ fontSize: size * 0.28, color }}
        >
          {roundedScore}
        </span>
        <span
          className="font-display font-bold text-text-dim"
          style={{ fontSize: size * 0.14 }}
        >
          {grade}
        </span>
      </div>
      {label && (
        <span className="mt-2 text-xs text-text-secondary font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
