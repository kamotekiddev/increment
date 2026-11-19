import type { HistorySession, WeightUnit } from "../engine";

/** One finished workout's record of one routine exercise, as read from the database. */
export interface PastExercise {
  startedAt: number;
  date: string;
  targetWeightKg: number | null;
  targetReps: number | null;
  /** The unit the lifter was in when Start set the Target. Null on rows saved before it was stored. */
  targetUnit?: WeightUnit | null;
  progressAccepted: boolean;
  /** The accepted stepped-up Target; null after Stay and on rows saved before it was stored. */
  acceptedTargetWeightKg?: number | null;
  acceptedTargetReps?: number | null;
  isDeload: boolean;
  sets: { idx: number; weightKg: number; reps: number; done: boolean; isWarmup: boolean; enteredUnit?: WeightUnit }[];
}

/**
 * The saved sets the engine judges: those at a plan position, idx below `plannedSets`. Finish keeps
 * each set's idx, so an unchecked set leaves a gap.
 */
export function judgedPastSets(sets: PastExercise["sets"], plannedSets: number): PastExercise["sets"] {
  return sets.filter((s) => s.idx < plannedSets);
}

/** The unit the heaviest done working set was logged in, if any: the set a baseline comes from. */
function loggedUnit(sets: PastExercise["sets"]): WeightUnit | undefined {
  const working = sets.filter((s) => s.done && !s.isWarmup);
  if (working.length === 0) return undefined;
  return working.reduce((a, b) => (b.weightKg > a.weightKg ? b : a)).enteredUnit;
}

/**
 * The unit the row's Target was set in: the one stored at Start, or on older rows the unit its sets were
 * logged in, or kg. A first workout with no Target uses its sets' unit, since its baseline comes from them.
 */
function targetUnitOf(row: PastExercise, judged: PastExercise["sets"], hasTarget: boolean): WeightUnit {
  const logged = loggedUnit(judged);
  if (!hasTarget) return logged ?? "kg";
  return row.targetUnit ?? logged ?? "kg";
}

/** Turns past workout rows into the engine's history: newest first, sets in order, judged sets only. */
export function toHistory(rows: PastExercise[], plannedSets: number): HistorySession[] {
  return [...rows]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((r) => {
      const judged = judgedPastSets(r.sets, plannedSets).sort((a, b) => a.idx - b.idx);
      const target = r.targetWeightKg !== null && r.targetReps !== null ? { weightKg: r.targetWeightKg, reps: r.targetReps } : null;
      return {
        date: r.date,
        target,
        targetUnit: targetUnitOf(r, judged, target !== null),
        progressAccepted: r.progressAccepted,
        acceptedTarget:
          r.acceptedTargetWeightKg != null && r.acceptedTargetReps != null ? { weightKg: r.acceptedTargetWeightKg, reps: r.acceptedTargetReps } : null,
        isDeload: r.isDeload,
        sets: judged.map((s) => ({ weightKg: s.weightKg, reps: s.reps, done: s.done, isWarmup: s.isWarmup })),
      };
    });
}
