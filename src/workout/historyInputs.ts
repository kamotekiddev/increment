import type { HistorySession } from "../engine";

/** One finished workout's record of one routine exercise, as read from the database. */
export interface PastExercise {
  startedAt: number;
  date: string;
  targetWeightKg: number | null;
  targetReps: number | null;
  progressAccepted: boolean;
  isDeload: boolean;
  sets: { idx: number; weightKg: number; reps: number; done: boolean; isWarmup: boolean }[];
}

/** Turns past workout rows into the engine's history: newest first, sets in order. */
export function toHistory(rows: PastExercise[]): HistorySession[] {
  return [...rows]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((r) => ({
      date: r.date,
      target: r.targetWeightKg !== null && r.targetReps !== null ? { weightKg: r.targetWeightKg, reps: r.targetReps } : null,
      progressAccepted: r.progressAccepted,
      isDeload: r.isDeload,
      sets: [...r.sets]
        .sort((a, b) => a.idx - b.idx)
        .map((s) => ({ weightKg: s.weightKg, reps: s.reps, done: s.done, isWarmup: s.isWarmup })),
    }));
}
