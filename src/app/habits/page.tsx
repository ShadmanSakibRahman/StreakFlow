"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, ArrowUpDown, ListX } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { EmptyState } from "@/components/habits/empty-state";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useCompletions } from "@/hooks/use-completions";
import { useHabits } from "@/hooks/use-habits";
import { getCurrentStreak, getLongestStreak } from "@/lib/streak-utils";
import type { Habit, SortOption, FilterOption } from "@/lib/types";

function HabitsContent() {
  const { user } = useAuth();
  const {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
  } = useHabits(user?.uid);
  const { isCompleted, toggleCompletion, getCompletionsForHabit } =
    useCompletions(user?.uid);

  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("active");
  const [sort, setSort] = useState<SortOption>("newest");

  const filteredHabits = useMemo(() => {
    let result = habits;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q)
      );
    }

    // Filter
    switch (filter) {
      case "active":
        result = result.filter((h) => !h.archived);
        break;
      case "archived":
        result = result.filter((h) => h.archived);
        break;
      case "daily":
        result = result.filter(
          (h) => h.frequency === "daily" && !h.archived
        );
        break;
      case "weekly":
        result = result.filter(
          (h) => h.frequency === "weekly" && !h.archived
        );
        break;
      case "custom":
        result = result.filter(
          (h) => h.frequency === "custom" && !h.archived
        );
        break;
    }

    // Sort
    switch (sort) {
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result = [...result].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "streak":
        result = [...result].sort((a, b) => {
          const aStreak = getCurrentStreak(
            a,
            getCompletionsForHabit(a.id)
          );
          const bStreak = getCurrentStreak(
            b,
            getCompletionsForHabit(b.id)
          );
          return bStreak - aStreak;
        });
        break;
    }

    return result;
  }, [habits, search, filter, sort, getCompletionsForHabit]);

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

  const filterLabels: Record<FilterOption, string> = {
    all: "All",
    active: "Active",
    archived: "Archived",
    daily: "Daily",
    weekly: "Weekly",
    custom: "Custom",
  };

  const sortLabels: Record<SortOption, string> = {
    name: "Name (A-Z)",
    newest: "Newest",
    oldest: "Oldest",
    streak: "Streak",
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Habits</h1>
        <Button
          onClick={() => {
            setEditingHabit(undefined);
            setFormOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> New Habit
        </Button>
      </div>

      {/* Toolbar */}
      {habits.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search habits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  {filterLabels[filter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.keys(filterLabels) as FilterOption[]).map((f) => (
                  <DropdownMenuItem key={f} onClick={() => setFilter(f)}>
                    {filterLabels[f]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortLabels[sort]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.keys(sortLabels) as SortOption[]).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setSort(s)}>
                    {sortLabels[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Habit list */}
      {habits.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-12 w-12" />}
          title="No habits yet"
          description="Create your first habit to start building better routines."
          action={{ label: "Create Habit", onClick: () => setFormOpen(true) }}
        />
      ) : filteredHabits.length === 0 ? (
        <EmptyState
          icon={<ListX className="h-12 w-12" />}
          title="No matches"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
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
              onEdit={() => {
                setEditingHabit(habit);
                setFormOpen(true);
              }}
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

export default function HabitsPage() {
  return (
    <AuthGuard>
      <HabitsContent />
    </AuthGuard>
  );
}
