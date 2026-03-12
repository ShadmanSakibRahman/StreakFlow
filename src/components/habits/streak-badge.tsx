"use client";

import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  current: number;
  longest: number;
  size?: "sm" | "md";
}

export function StreakBadge({ current, longest, size = "md" }: StreakBadgeProps) {
  const isPersonalBest = current > 0 && current >= longest;

  return (
    <div className={cn("flex items-center gap-3", size === "sm" && "gap-2")}>
      <div className={cn(
        "flex items-center gap-1",
        current > 0 ? "text-orange-500" : "text-muted-foreground",
        size === "sm" && "text-xs"
      )}>
        <Flame className={cn("h-4 w-4", size === "sm" && "h-3 w-3", current > 0 && "fill-orange-500")} />
        <span className="font-semibold">{current}</span>
        {isPersonalBest && current > 2 && (
          <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-1 rounded font-medium">Best!</span>
        )}
      </div>
      <div className={cn(
        "flex items-center gap-1 text-muted-foreground",
        size === "sm" && "text-xs"
      )}>
        <Trophy className={cn("h-3.5 w-3.5", size === "sm" && "h-3 w-3")} />
        <span>{longest}</span>
      </div>
    </div>
  );
}
