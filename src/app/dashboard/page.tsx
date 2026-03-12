"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { DailySummary } from "@/components/habits/daily-summary";
import { EmptyState } from "@/components/habits/empty-state";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCompletions } from "@/hooks/use-completions";
import { useHabits } from "@/hooks/use-habits";
import {
  getCurrentStreak,
  getLongestStreak,
  isHabitDueOnDate,
} from "@/lib/streak-utils";
import type { Habit } from "@/lib/types";

function DashboardContent() {
  const { user } = useAuth();
  const {
    habits,
    loading: habitsLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    loadDemoData,
  } = useHabits(user?.uid);
  const {
    isCompleted,
    toggleCompletion,
    getCompletionsForHabit,
    loading: completionsLoading,
  } = useCompletions(user?.uid);

  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const loading = habitsLoading || completionsLoading;

  // Get habits due today (non-archived)
  const today = new Date();
  const habitsDueToday = habits.filter(
    (h) => !h.archived && isHabitDueOnDate(h, today)
  );

  const completedToday = habitsDueToday.filter((h) =>
    isCompleted(h.id)
  ).length;
  const totalToday = habitsDueToday.length;
  const percentage =
    totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.displayName?.split(" ")[0] || "there";

  const handleSubmit = async (
    data: Omit<Habit, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
      toast.success("Habit updated!");
    } else {
      await addHabit(data);
      toast.success("Habit created!");
    }
    setEditingHabit(undefined);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleLoadDemo = async () => {
    await loadDemoData();
    toast.success("Demo data loaded!");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-32 bg-muted rounded" />
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {firstName}!
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingHabit(undefined);
            setFormOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Habit
        </Button>
      </div>

      {/* Summary */}
      {habits.length > 0 && (
        <div className="flex justify-center mb-8">
          <DailySummary
            completed={completedToday}
            total={totalToday}
            percentage={percentage}
          />
        </div>
      )}

      {/* Habits due today */}
      {habits.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="No habits yet"
          description="Create your first habit or load demo data to get started."
          action={{ label: "Load Demo Data", onClick: handleLoadDemo }}
        />
      ) : habitsDueToday.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="Nothing due today"
          description="You have no habits scheduled for today. Enjoy your day off!"
        />
      ) : (
        <div className="space-y-3">
          {habitsDueToday.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted(habit.id)}
              streak={{
                current: getCurrentStreak(
                  habit,
                  getCompletionsForHabit(habit.id)
                ),
                longest: getLongestStreak(
                  habit,
                  getCompletionsForHabit(habit.id)
                ),
              }}
              onToggleComplete={() => toggleCompletion(habit.id)}
              onEdit={() => handleEdit(habit)}
              onDelete={() => {
                deleteHabit(habit.id);
                toast.success("Habit deleted");
              }}
              onArchive={() => {
                archiveHabit(habit.id);
                toast.success("Habit archived");
              }}
              onRestore={() => {
                restoreHabit(habit.id);
                toast.success("Habit restored");
              }}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingHabit(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingHabit}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
