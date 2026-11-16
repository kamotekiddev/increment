import { muscleGroupsOf, type MuscleGroup } from "./muscleGroups";

/** An exercise as the Library lists it. */
export type ExerciseSummary = {
  id: number;
  name: string;
  muscles: string[];
  /** Present where the list shows an equipment icon (the routine picker). */
  equipment?: string;
};

/** The browse state: search words plus at most one muscle group chip. */
export type ExerciseFilter = {
  /** Every word must appear in the name. */
  search: string;
  group: MuscleGroup | null;
};

/** Pure: returns the exercises matching all set filters, A-Z by name. */
export function filterExercises<T extends ExerciseSummary>(
  exercises: readonly T[],
  { search, group }: ExerciseFilter,
): T[] {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return exercises
    .filter((exercise) => {
      const name = exercise.name.toLowerCase();
      if (!words.every((word) => name.includes(word))) return false;
      if (group && !muscleGroupsOf(exercise.muscles).includes(group)) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
