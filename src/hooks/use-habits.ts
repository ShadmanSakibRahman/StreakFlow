"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { generateDemoHabits, generateDemoCompletions } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Habit } from "@/lib/types";

function toHabit(id: string, data: Record<string, unknown>): Habit {
  return {
    id,
    name: (data.name as string) || "",
    description: (data.description as string) || "",
    emoji: (data.emoji as string) || "✅",
    color: (data.color as string) || "blue",
    frequency: (data.frequency as Habit["frequency"]) || "daily",
    customDays: (data.customDays as number[]) || [],
    archived: (data.archived as boolean) || false,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString(),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string) || new Date().toISOString(),
  };
}

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const habitsRef = collection(db, "users", userId, "habits");
    const q = query(habitsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitList = snapshot.docs.map((doc) =>
        toHabit(doc.id, doc.data())
      );
      setHabits(habitList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching habits:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setHabits([]);
      setLoading(false);
    };
  }, [userId]);

  const addHabit = useCallback(
    async (data: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
      if (!userId) return;
      const habitsRef = collection(db, "users", userId, "habits");
      await addDoc(habitsRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [userId]
  );

  const updateHabit = useCallback(
    async (id: string, data: Partial<Habit>) => {
      if (!userId) return;
      const habitRef = doc(db, "users", userId, "habits", id);
      const { id: _, createdAt: __, ...updateData } = data as Record<string, unknown>;
      await updateDoc(habitRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    },
    [userId]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      if (!userId) return;
      // Delete the habit
      const habitRef = doc(db, "users", userId, "habits", id);
      await deleteDoc(habitRef);
      // Delete completions for this habit using a targeted query
      const completionsRef = collection(db, "users", userId, "completions");
      const q = query(completionsRef, where("habitId", "==", id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    },
    [userId]
  );

  const archiveHabit = useCallback(
    async (id: string) => {
      if (!userId) return;
      const habitRef = doc(db, "users", userId, "habits", id);
      await updateDoc(habitRef, { archived: true, updatedAt: serverTimestamp() });
    },
    [userId]
  );

  const restoreHabit = useCallback(
    async (id: string) => {
      if (!userId) return;
      const habitRef = doc(db, "users", userId, "habits", id);
      await updateDoc(habitRef, { archived: false, updatedAt: serverTimestamp() });
    },
    [userId]
  );

  const loadDemoData = useCallback(
    async () => {
      if (!userId) return;
      const demoHabits = generateDemoHabits();
      const demoCompletions = generateDemoCompletions(demoHabits);

      // Step 1: Add all habits individually to get their Firestore-assigned IDs.
      // We need the real IDs before we can create completions that reference them.
      const idMap = new Map<string, string>(); // demo ID -> Firestore ID
      const habitsRef = collection(db, "users", userId, "habits");

      for (const habit of demoHabits) {
        const docRef = await addDoc(habitsRef, {
          name: habit.name,
          description: habit.description,
          emoji: habit.emoji,
          color: habit.color,
          frequency: habit.frequency,
          customDays: habit.customDays,
          archived: habit.archived,
          createdAt: new Date(habit.createdAt),
          updatedAt: new Date(habit.updatedAt),
        });
        idMap.set(habit.id, docRef.id);
      }

      // Step 2: Batch-add all completions using the real Firestore habit IDs.
      const completionsRef = collection(db, "users", userId, "completions");
      const mappedCompletions = demoCompletions
        .map((c) => ({ ...c, habitId: idMap.get(c.habitId) }))
        .filter((c) => c.habitId);

      for (let i = 0; i < mappedCompletions.length; i += 500) {
        const batch = writeBatch(db);
        mappedCompletions.slice(i, i + 500).forEach((completion) => {
          const cRef = doc(completionsRef);
          batch.set(cRef, {
            habitId: completion.habitId,
            completedDate: completion.completedDate,
            createdAt: new Date(completion.createdAt),
          });
        });
        await batch.commit();
      }
    },
    [userId]
  );

  const clearAllHabits = useCallback(
    async () => {
      if (!userId) return;
      const allDocs = [
        ...(await getDocs(collection(db, "users", userId, "habits"))).docs,
        ...(await getDocs(collection(db, "users", userId, "completions"))).docs,
      ];
      // Firestore batch limit is 500
      for (let i = 0; i < allDocs.length; i += 500) {
        const batch = writeBatch(db);
        allDocs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    },
    [userId]
  );

  return {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    loadDemoData,
    clearAllHabits,
  };
}
