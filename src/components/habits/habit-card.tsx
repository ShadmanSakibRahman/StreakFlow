"use client";

import { useState } from "react";
import { Check, MoreVertical, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StreakBadge } from "./streak-badge";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: { current: number; longest: number };
  onToggleComplete: () => void | Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function HabitCard({
  habit,
  isCompleted,
  streak,
  onToggleComplete,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: HabitCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggleComplete();
    } finally {
      // Small delay for animation feel
      setTimeout(() => setIsToggling(false), 300);
    }
  };

  const frequencyLabel = habit.frequency === "custom"
    ? "Custom"
    : habit.frequency === "weekly"
    ? "Weekly"
    : "Daily";

  return (
    <>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200 hover:shadow-md",
          isCompleted && "bg-green-50/50 dark:bg-green-950/20",
          habit.archived && "opacity-60"
        )}
      >
        {/* Color accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: habit.color }}
        />

        <div className="flex items-center gap-3 p-4 pl-5">
          {/* Emoji */}
          <span className="text-2xl flex-shrink-0">{habit.emoji}</span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold truncate",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {habit.name}
              </h3>
              {habit.archived && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Archived</Badge>
              )}
            </div>
            {habit.description && (
              <p className="text-sm text-muted-foreground truncate">{habit.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                {frequencyLabel}
              </Badge>
              <StreakBadge current={streak.current} longest={streak.longest} size="sm" />
            </div>
          </div>

          {/* Completion toggle */}
          {!habit.archived && (
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={cn(
                "flex-shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                isCompleted
                  ? "bg-green-500 border-green-500 text-white scale-100"
                  : "border-muted-foreground/30 hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-950/30",
                isToggling && "animate-pulse"
              )}
              aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
            >
              {isCompleted && <Check className="h-5 w-5" />}
            </button>
          )}

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {habit.archived ? (
                <DropdownMenuItem onClick={onRestore}>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{habit.name}&quot;?</DialogTitle>
            <DialogDescription>
              This will permanently delete this habit and all its completion history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
