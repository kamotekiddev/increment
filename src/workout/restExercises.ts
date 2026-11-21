import { jumpKgFor, type Jumps } from "../settings/jumps";
import type { Unit } from "../units";
import { followUnitRows } from "./followUnit";
import type { RestExercise } from "./restTimer";
import type { LiveExercise } from "./workoutQueries";

/**
 * The rules' view of the live workout's exercises, with rows as shown in `unit`. Only a bodyweight-only
 * exercise hides the weight.
 */
export function toRestExercises(exercises: LiveExercise[], unit: Unit, jumps: Jumps): RestExercise[] {
  return exercises.map((e) => ({
    name: e.name,
    restSeconds: e.restSeconds,
    bodyweight: e.loadType === "bodyweight",
    rows: followUnitRows(e.rows, unit, jumpKgFor(e.equipment, jumps)),
  }));
}
