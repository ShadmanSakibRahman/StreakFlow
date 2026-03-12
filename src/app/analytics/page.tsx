"use client";

import { useMemo } from "react";
import { BarChart3, Flame, Trophy, TrendingUp } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { EmptyState } from "@/components/habits/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useCompletions } from "@/hooks/use-completions";
import { useHabits } from "@/hooks/use-habits";
import { DAY_NAMES } from "@/lib/constants";
import {
  getCurrentStreak,
  getLongestStreak,
  getCompletionRate,
  isHabitDueOnDate,
  getWeekDates,
} from "@/lib/streak-utils";
import { cn } from "@/lib/utils";

function AnalyticsContent() {
  const { user } = useAuth();
  const { habits, loading: habitsLoading } = useHabits(user?.uid);
  const {
    completions,
    getCompletionsForHabit,
    loading: completionsLoading,
  } = useCompletions(user?.uid);

  const loading = habitsLoading || completionsLoading;
  const activeHabits = habits.filter((h) => !h.archived);

  // Weekly chart data
  const weekData = useMemo(() => {
    const weekDates = getWeekDates();
    return weekDates.map((dateStr) => {
      const date = new Date(dateStr + "T00:00:00");
      const due = activeHabits.filter((h) => isHabitDueOnDate(h, date));
      const completed = due.filter((h) =>
        completions.some(
          (c) => c.habitId === h.id && c.completedDate === dateStr
        )
      );
      return {
        day: DAY_NAMES[date.getDay()],
        date: dateStr,
        completed: completed.length,
        total: due.length,
        percentage:
          due.length === 0
            ? 0
            : Math.round((completed.length / due.length) * 100),
      };
    });
  }, [activeHabits, completions]);

  // Streak leaderboard
  const streakBoard = useMemo(() => {
    return activeHabits
      .map((h) => ({
        habit: h,
        current: getCurrentStreak(h, getCompletionsForHabit(h.id)),
        longest: getLongestStreak(h, getCompletionsForHabit(h.id)),
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 5);
  }, [activeHabits, getCompletionsForHabit]);

  // Overall 7-day completion rate
  const overallRate = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const rates = activeHabits.map((h) =>
      getCompletionRate(h, getCompletionsForHabit(h.id), 7)
    );
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  }, [activeHabits, getCompletionsForHabit]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (activeHabits.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No data yet"
          description="Create some habits and start tracking to see your analytics."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Overall rate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overallRate}%</p>
              <p className="text-xs text-muted-foreground">
                7-day completion
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {streakBoard[0]?.current || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Best active streak
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeHabits.length}</p>
              <p className="text-xs text-muted-foreground">Active habits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-40">
            {weekData.map((day) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-muted-foreground">
                  {day.total > 0 ? `${day.completed}/${day.total}` : "-"}
                </span>
                <div
                  className="w-full bg-muted rounded-t-sm relative"
                  style={{ height: "100px" }}
                >
                  <div
                    className={cn(
                      "absolute bottom-0 w-full rounded-t-sm transition-all duration-500",
                      day.percentage >= 80
                        ? "bg-green-500"
                        : day.percentage >= 50
                          ? "bg-yellow-500"
                          : day.percentage > 0
                            ? "bg-red-400"
                            : "bg-muted"
                    )}
                    style={{ height: `${day.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Streak Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {streakBoard.map((item) => (
              <div key={item.habit.id} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">
                  {item.habit.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.habit.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame
                    className={cn(
                      "h-4 w-4",
                      item.current > 0 && "fill-orange-500"
                    )}
                  />
                  <span className="font-semibold text-sm">
                    {item.current}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="text-xs">{item.longest}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}
