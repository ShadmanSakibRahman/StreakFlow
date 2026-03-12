import { formatDate, isHabitDueOnDate } from "./streak-utils";
import { Habit, Completion } from "./types";

export const EMOJI_OPTIONS: string[] = [
  "🏃", "📚", "💧", "🧘", "💻", "✍️", "🎯", "💪", "🎨", "🎵",
  "🌱", "🍎", "😴", "🧹", "📝", "🏋️", "🚶", "🧠", "💊", "🦷",
  "☀️", "🌙", "🍳", "🥗", "📱", "🎸", "🐕", "💰", "🙏", "✅",
];

export const COLOR_OPTIONS = [
  { name: "blue", hex: "#3b82f6", bg: "#3b82f6", text: "#ffffff", ring: "#3b82f6" },
  { name: "green", hex: "#22c55e", bg: "#22c55e", text: "#ffffff", ring: "#22c55e" },
  { name: "purple", hex: "#8b5cf6", bg: "#8b5cf6", text: "#ffffff", ring: "#8b5cf6" },
  { name: "orange", hex: "#f97316", bg: "#f97316", text: "#ffffff", ring: "#f97316" },
  { name: "pink", hex: "#ec4899", bg: "#ec4899", text: "#ffffff", ring: "#ec4899" },
  { name: "red", hex: "#ef4444", bg: "#ef4444", text: "#ffffff", ring: "#ef4444" },
  { name: "yellow", hex: "#eab308", bg: "#eab308", text: "#ffffff", ring: "#eab308" },
  { name: "teal", hex: "#14b8a6", bg: "#14b8a6", text: "#ffffff", ring: "#14b8a6" },
  { name: "indigo", hex: "#6366f1", bg: "#6366f1", text: "#ffffff", ring: "#6366f1" },
  { name: "rose", hex: "#f43f5e", bg: "#f43f5e", text: "#ffffff", ring: "#f43f5e" },
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function generateDemoHabits(): Habit[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const createdAt = thirtyDaysAgo.toISOString();
  const updatedAt = thirtyDaysAgo.toISOString();

  return [
    {
      id: crypto.randomUUID(),
      name: "Morning Run",
      description: "Go for a morning run to start the day",
      emoji: "🏃",
      color: "#3b82f6",
      frequency: "daily",
      customDays: [],
      archived: false,
      createdAt,
      updatedAt,
    },
    {
      id: crypto.randomUUID(),
      name: "Read 30 mins",
      description: "Read a book for at least 30 minutes",
      emoji: "📚",
      color: "#8b5cf6",
      frequency: "daily",
      customDays: [],
      archived: false,
      createdAt,
      updatedAt,
    },
    {
      id: crypto.randomUUID(),
      name: "Drink Water",
      description: "Drink at least 8 glasses of water",
      emoji: "💧",
      color: "#14b8a6",
      frequency: "daily",
      customDays: [],
      archived: false,
      createdAt,
      updatedAt,
    },
    {
      id: crypto.randomUUID(),
      name: "Meditate",
      description: "Practice mindfulness meditation",
      emoji: "🧘",
      color: "#22c55e",
      frequency: "weekly",
      customDays: [],
      archived: false,
      createdAt,
      updatedAt,
    },
    {
      id: crypto.randomUUID(),
      name: "Code Practice",
      description: "Practice coding problems or work on side projects",
      emoji: "💻",
      color: "#6366f1",
      frequency: "custom",
      customDays: [1, 2, 3, 4, 5], // Mon-Fri
      archived: false,
      createdAt,
      updatedAt,
    },
    {
      id: crypto.randomUUID(),
      name: "Journal",
      description: "Write in personal journal",
      emoji: "✍️",
      color: "#f97316",
      frequency: "custom",
      customDays: [1, 3, 5], // Mon, Wed, Fri
      archived: false,
      createdAt,
      updatedAt,
    },
    {
      id: crypto.randomUUID(),
      name: "Stretch",
      description: "Do a stretching routine",
      emoji: "💪",
      color: "#ec4899",
      frequency: "daily",
      customDays: [],
      archived: false,
      createdAt,
      updatedAt,
    },
  ];
}

export function generateDemoCompletions(habits: Habit[]): Completion[] {
  const completions: Completion[] = [];
  const today = new Date();

  const completionRates: Record<string, number> = {
    "Morning Run": 0.8,
    "Read 30 mins": 0.9,
    "Drink Water": 1.0,
    "Meditate": 1.0,
    "Code Practice": 0.85,
    "Journal": 0.7,
    "Stretch": 0.75,
  };

  // Use a seeded simple random to make results deterministic per habit
  function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  for (const habit of habits) {
    const rate = completionRates[habit.name] ?? 0.5;
    const createdDate = new Date(habit.createdAt);

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      // Skip dates before creation
      if (d < createdDate) continue;

      const isDue = isHabitDueOnDate(habit, d);
      if (!isDue) continue;

      // Determine if completed based on rate
      const rand = seededRandom(i * 1000 + habit.name.charCodeAt(0));
      if (rand < rate) {
        completions.push({
          id: crypto.randomUUID(),
          habitId: habit.id,
          completedDate: formatDate(d),
          createdAt: d.toISOString(),
        });
      }
    }
  }

  return completions;
}
