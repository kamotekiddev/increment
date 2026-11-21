import type { LoadType, OverloadRule, Planned } from "../engine";
import { jumpKgFor, weightKg, type Jumps, type Unit } from "../units";
import { toHistory, type PastExercise } from "./historyInputs";
import type { SummaryExercise, SummaryInput } from "./summary";

/** One exercise of the finished workout as read from the database, before it becomes builder input. */
export interface SavedExercise {
  /** The Workout exercise id. */
  id: number;
  name: string;
  /** The routine exercise's saved Jumps; both null when it left the routine (the 2.5 kg / 5 lb default). */
  jumps: Jumps;
  loadType: LoadType;
  /** The routine's plan and rule for this exercise now. Null when the exercise left the routine. */
  plan: { planned: Planned; rule: OverloadRule } | null;
  /** The sets saved in this workout. Finish keeps only done sets. */
  sets: PastExercise["sets"];
  /** Finished workouts of this routine exercise, this workout included, in any order. */
  past: PastExercise[];
}

export interface SavedWorkout {
  startedAt: number;
  finishedAt: number | null;
  exercises: SavedExercise[];
}

/**
 * Shapes the saved workout into the summary builder's input. History is newest first, so this
 * workout is history[0] with its own progressAccepted. An exercise that left the routine has no
 * plan to judge against and is left out. Each exercise steps by its routine exercise's Jump for `unit`.
 */
export function toSummaryInput(saved: SavedWorkout, unit: Unit): SummaryInput {
  const exercises: SummaryExercise[] = [];
  for (const ex of saved.exercises) {
    if (!ex.plan) continue;
    exercises.push({
      id: ex.id,
      name: ex.name,
      sets: [...ex.sets]
        .sort((a, b) => a.idx - b.idx)
        // In kg in memory only, for judging and the volume total.
        .map((s) => ({ weightKg: weightKg({ value: s.weight, unit: s.weightUnit }), reps: s.reps, done: s.done, isWarmup: s.isWarmup, unit: s.weightUnit })),
      planned: ex.plan.planned,
      rule: ex.plan.rule,
      loadType: ex.loadType,
      jumpKg: jumpKgFor(ex.jumps, unit),
      history: toHistory(ex.past, ex.plan.planned.sets),
    });
  }
  return { startedAt: saved.startedAt, finishedAt: saved.finishedAt ?? saved.startedAt, exercises, unit };
}
