import type { HistorySession } from "../engine";

/** One finished workout's record of one routine exercise, as read from the database. */
export interface PastExercise {
  startedAt: number;
  date: string;
  targetWeightKg: number | null;
  targetReps: number | null;
  progressAccepted: boolean;
  /** The accepted stepped-up Target; null after Stay and on rows saved before it was stored. */
  acceptedTargetWeightKg?: number | null;
  acceptedTargetReps?: number | null;
  isDeload: boolean;
  sets: { idx: number; weightKg: number; reps: number; done: boolean; isWarmup: boolean }[];
}

/**
 * The saved sets the engine judges: those at a plan position, idx below `plannedSets`. Finish keeps
 * each set's idx, so an unchecked set leaves a gap.
 */
export function judgedPastSets(sets: PastExercise["sets"], plannedSets: number): PastExercise["sets"] {
  return sets.filter((s) => s.idx < plannedSets);
}

/** Turns past workout rows into the engine's history: newest first, sets in order, judged sets only. */
export function toHistory(rows: PastExercise[], plannedSets: number): HistorySession[] {
  return [...rows]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((r) => ({
      date: r.date,
      target: r.targetWeightKg !== null && r.targetReps !== null ? { weightKg: r.targetWeightKg, reps: r.targetReps } : null,
      progressAccepted: r.progressAccepted,
      acceptedTarget:
        r.acceptedTargetWeightKg != null && r.acceptedTargetReps != null ? { weightKg: r.acceptedTargetWeightKg, reps: r.acceptedTargetReps } : null,
      isDeload: r.isDeload,
      sets: judgedPastSets(r.sets, plannedSets)
        .sort((a, b) => a.idx - b.idx)
        .map((s) => ({ weightKg: s.weightKg, reps: s.reps, done: s.done, isWarmup: s.isWarmup })),
    }));
}
