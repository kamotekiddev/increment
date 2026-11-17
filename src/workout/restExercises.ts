import type { RestExercise } from "./restTimer";
import type { LiveExercise } from "./workoutQueries";

/** The rules' view of the live workout's exercises. Only a bodyweight-only exercise hides the weight. */
export function toRestExercises(exercises: LiveExercise[]): RestExercise[] {
  return exercises.map((e) => ({
    name: e.name,
    restSeconds: e.restSeconds,
    bodyweight: e.loadType === "bodyweight",
    rows: e.rows,
  }));
}
