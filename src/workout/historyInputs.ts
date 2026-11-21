import type { HistorySession, WeightUnit } from "../engine";
import { weightKg } from "../units";

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
  /** The unit the lifter was in when they tapped Go up. Null after Stay and on rows saved before it was stored. */
  acceptedTargetUnit?: WeightUnit | null;
  isDeload: boolean;
  /** The saved sets: each weight as typed (`weight`) in the unit it was typed in (`weightUnit`). */
  sets: { idx: number; weight: number; weightUnit: WeightUnit; reps: number; done: boolean; isWarmup: boolean }[];
}

/**
 * The saved sets the engine judges: those at a plan position, idx below `plannedSets`. Finish keeps
 * each set's idx, so an unchecked set leaves a gap.
 */
export function judgedPastSets(sets: PastExercise["sets"], plannedSets: number): PastExercise["sets"] {
  return sets.filter((s) => s.idx < plannedSets);
}

/** A saved set's weight in kg, in memory only: what the engine compares and adds up. */
const setKg = (s: PastExercise["sets"][number]) => weightKg({ value: s.weight, unit: s.weightUnit });

/**
 * The unit the heaviest done working set was logged in, if any: the set a baseline comes from. Sets are
 * compared in kg, so 225 lb (102.06 kg) is heavier than 100 kg.
 */
export function loggedUnit(sets: PastExercise["sets"]): WeightUnit | undefined {
  const working = sets.filter((s) => s.done && !s.isWarmup);
  if (working.length === 0) return undefined;
  return working.reduce((a, b) => (setKg(b) > setKg(a) ? b : a)).weightUnit;
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

/** Turns past workout rows into the engine's history: newest first, sets in order, judged sets only, weights in kg. */
export function toHistory(rows: PastExercise[], plannedSets: number): HistorySession[] {
  return [...rows]
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((r) => {
      const judged = judgedPastSets(r.sets, plannedSets).sort((a, b) => a.idx - b.idx);
      const target = r.targetWeightKg !== null && r.targetReps !== null ? { weightKg: r.targetWeightKg, reps: r.targetReps } : null;
      const targetUnit = targetUnitOf(r, judged, target !== null);
      return {
        date: r.date,
        target,
        targetUnit,
        // An accepted Target was offered in the unit of the Go up tap; older rows fall back to the Target's unit.
        acceptedTargetUnit: r.acceptedTargetUnit ?? targetUnit,
        progressAccepted: r.progressAccepted,
        acceptedTarget:
          r.acceptedTargetWeightKg != null && r.acceptedTargetReps != null ? { weightKg: r.acceptedTargetWeightKg, reps: r.acceptedTargetReps } : null,
        isDeload: r.isDeload,
        sets: judged.map((s) => ({ weightKg: setKg(s), reps: s.reps, done: s.done, isWarmup: s.isWarmup, unit: s.weightUnit })),
      };
    });
}
