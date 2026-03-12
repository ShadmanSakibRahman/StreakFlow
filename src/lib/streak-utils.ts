import { Habit } from "./types";

export function formatDate(date: Date): string {
  // returns "YYYY-MM-DD" using local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  // Daily: always due
  // Weekly: due on the same weekday as createdAt
  // Custom: due on selected days (customDays array, 0=Sun..6=Sat)
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekly") {
    const createdDay = new Date(habit.createdAt).getDay();
    return date.getDay() === createdDay;
  }
  if (habit.frequency === "custom") {
    return habit.customDays.includes(date.getDay());
  }
  return false;
}

export function getCurrentStreak(habit: Habit, completionDates: string[]): number {
  // Count consecutive completed due dates going backwards from today
  // If today is due and not completed, start from yesterday (day isn't over)
  const completionSet = new Set(completionDates);
  const today = new Date();
  const current = new Date(today);

  // If today is due but not completed, that's ok - start from today still
  // but don't count today as a miss
  const todayStr = formatDate(today);
  const todayIsDue = isHabitDueOnDate(habit, today);
  const todayCompleted = completionSet.has(todayStr);

  if (todayIsDue && !todayCompleted) {
    // Skip today, start checking from yesterday
    current.setDate(current.getDate() - 1);
  }

  let streak = 0;
  // Go back up to 365 days max
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(current);
    const isDue = isHabitDueOnDate(habit, current);

    // Only check the creation date boundary
    if (current < new Date(habit.createdAt)) break;

    if (isDue) {
      if (completionSet.has(dateStr)) {
        streak++;
      } else {
        break; // streak broken
      }
    }
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export function getLongestStreak(habit: Habit, completionDates: string[]): number {
  // Find the longest consecutive streak of completed due dates
  if (completionDates.length === 0) return 0;

  const completionSet = new Set(completionDates);
  const createdDate = new Date(habit.createdAt);
  const today = new Date();
  let longest = 0;
  let current = 0;

  // Iterate from creation date to today
  const d = new Date(createdDate);
  while (d <= today) {
    if (isHabitDueOnDate(habit, d)) {
      if (completionSet.has(formatDate(d))) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    d.setDate(d.getDate() + 1);
  }

  return longest;
}

export function getCompletionRate(habit: Habit, completionDates: string[], days: number): number {
  // Percentage of due dates completed in last N days
  const completionSet = new Set(completionDates);
  let due = 0;
  let completed = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (isHabitDueOnDate(habit, d)) {
      due++;
      if (completionSet.has(formatDate(d))) completed++;
    }
  }

  return due === 0 ? 0 : Math.round((completed / due) * 100);
}

export function getWeekDates(): string[] {
  // Returns 7 date strings for current week (Mon to Sun)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}
