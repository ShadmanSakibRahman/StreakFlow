"use client";

import { cn } from "@/lib/utils";

interface DailySummaryProps {
  completed: number;
  total: number;
  percentage: number;
}

export function DailySummary({ completed, total, percentage }: DailySummaryProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage === 100) return "text-green-500";
    if (percentage >= 50) return "text-blue-500";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width="120" height="120" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={cn("transition-all duration-700 ease-out", getColor())}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-2xl font-bold", getColor())}>
            {total === 0 ? "\u2014" : `${percentage}%`}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "No habits due today"
          : `${completed} of ${total} completed`}
      </p>
      {percentage === 100 && total > 0 && (
        <p className="text-sm font-medium text-green-500">All done for today!</p>
      )}
    </div>
  );
}
