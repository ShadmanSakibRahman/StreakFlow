export type Frequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  frequency: Frequency;
  customDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  archived: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Completion {
  id: string;
  habitId: string;
  completedDate: string; // "YYYY-MM-DD"
  createdAt: string;
}

export type SortOption = "name" | "newest" | "oldest" | "streak";
export type FilterOption = "all" | "active" | "archived" | "daily" | "weekly" | "custom";
