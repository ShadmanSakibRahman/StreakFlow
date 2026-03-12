"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTodayString } from "@/lib/streak-utils";
import type { Completion } from "@/lib/types";

function toCompletion(id: string, data: Record<string, unknown>): Completion {
  return {
    id,
    habitId: (data.habitId as string) || "",
    completedDate: (data.completedDate as string) || "",
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString(),
  };
}

export function useCompletions(userId: string | undefined) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const completionsRef = collection(db, "users", userId, "completions");
    const unsubscribe = onSnapshot(completionsRef, (snapshot) => {
      const list = snapshot.docs.map((doc) => toCompletion(doc.id, doc.data()));
      setCompletions(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching completions:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setCompletions([]);
      setLoading(false);
    };
  }, [userId]);

  const toggleCompletion = useCallback(
    async (habitId: string, date?: string) => {
      if (!userId) return;
      const targetDate = date || getTodayString();
      const completionsRef = collection(db, "users", userId, "completions");

      // Check if already completed
      const q = query(
        completionsRef,
        where("habitId", "==", habitId),
        where("completedDate", "==", targetDate)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Add completion
        await addDoc(completionsRef, {
          habitId,
          completedDate: targetDate,
          createdAt: serverTimestamp(),
        });
      } else {
        // Remove completion
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
        }
      }
    },
    [userId]
  );

  const isCompleted = useCallback(
    (habitId: string, date?: string): boolean => {
      const targetDate = date || getTodayString();
      return completions.some(
        (c) => c.habitId === habitId && c.completedDate === targetDate
      );
    },
    [completions]
  );

  const getCompletionsForHabit = useCallback(
    (habitId: string): string[] => {
      return completions
        .filter((c) => c.habitId === habitId)
        .map((c) => c.completedDate);
    },
    [completions]
  );

  return {
    completions,
    loading,
    toggleCompletion,
    isCompleted,
    getCompletionsForHabit,
  };
}
