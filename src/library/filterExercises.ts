/** An exercise as the Library lists it. */
export type ExerciseSummary = {
  id: number;
  name: string;
  muscles: string[];
  equipment: string;
};

/** The browse state: search words plus at most one muscle and one equipment chip. */
export type ExerciseFilter = {
  /** Every word must appear in the name. */
  search: string;
  muscle: string | null;
  equipment: string | null;
};

export type FilterOptions = {
  muscles: string[];
  equipment: string[];
};

/** Pure: returns the exercises matching all set filters, A-Z by name. */
export function filterExercises<T extends ExerciseSummary>(
  exercises: readonly T[],
  { search, muscle, equipment }: ExerciseFilter,
): T[] {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return exercises
    .filter((exercise) => {
      const name = exercise.name.toLowerCase();
      if (!words.every((word) => name.includes(word))) return false;
      if (muscle && !exercise.muscles.includes(muscle)) return false;
      if (equipment && exercise.equipment !== equipment) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Pure: the muscle and equipment values present in the library, A-Z, for the chip rows. */
export function getFilterOptions(exercises: readonly ExerciseSummary[]): FilterOptions {
  const muscles = new Set<string>();
  const equipment = new Set<string>();
  for (const exercise of exercises) {
    for (const muscle of exercise.muscles) muscles.add(muscle);
    equipment.add(exercise.equipment);
  }
  const alphabetical = (a: string, b: string) => a.localeCompare(b);
  return {
    muscles: [...muscles].sort(alphabetical),
    equipment: [...equipment].sort(alphabetical),
  };
}
