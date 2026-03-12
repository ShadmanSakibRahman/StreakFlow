"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMOJI_OPTIONS, COLOR_OPTIONS, DAY_NAMES } from "@/lib/constants";
import type { Habit, Frequency } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Habit, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Habit | undefined;
}

export function HabitForm({ open, onOpenChange, onSubmit, initialData }: HabitFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("\u2705");
  const [color, setColor] = useState("#3b82f6");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setEmoji(initialData.emoji);
        setColor(initialData.color);
        setFrequency(initialData.frequency);
        setCustomDays(initialData.customDays);
      } else {
        setName("");
        setDescription("");
        setEmoji("\u2705");
        setColor("#3b82f6");
        setFrequency("daily");
        setCustomDays([]);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (name.length > 50) newErrors.name = "Max 50 characters";
    if (frequency === "custom" && customDays.length === 0) {
      newErrors.customDays = "Select at least one day";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        emoji,
        color,
        frequency,
        customDays: frequency === "custom" ? customDays : [],
        archived: initialData?.archived ?? false,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting habit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Habit" : "Create New Habit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning Run"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="habit-desc">Description (optional)</Label>
            <Input
              id="habit-desc"
              placeholder="e.g., Run for 30 minutes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Emoji Picker */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-md text-xl hover:bg-accent transition-colors",
                    emoji === e && "ring-2 ring-primary bg-accent"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={cn(
                    "w-9 h-9 rounded-full transition-transform hover:scale-110",
                    color === c.hex && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              {(["daily", "weekly", "custom"] as Frequency[]).map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant={frequency === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFrequency(f)}
                  className="capitalize flex-1"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Days */}
          {frequency === "custom" && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="flex gap-1.5 justify-between">
                {DAY_NAMES.map((dayName, index) => (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={cn(
                      "w-11 h-11 rounded-full text-xs font-medium transition-all",
                      customDays.includes(index)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {dayName}
                  </button>
                ))}
              </div>
              {errors.customDays && (
                <p className="text-xs text-destructive">{errors.customDays}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
