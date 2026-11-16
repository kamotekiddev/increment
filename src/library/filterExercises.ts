/** The fields the library filter reads. Any exercise row with these fields works. */
export type FilterableExercise = {
  name: string;
  muscles: string[];
  equipment: string;
};

export type ExerciseFilter = {
  /** Words typed in the search box; every word must appear in the name. */
  search?: string;
  muscle?: string | null;
  equipment?: string | null;
};

export type FilterOptions = {
  muscles: string[];
  equipment: string[];
};

/** Pure: returns the exercises matching all set filters, A-Z by name. */
export function filterExercises<T extends FilterableExercise>(exercises: readonly T[], filter: ExerciseFilter): T[] {
  const words = (filter.search ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const { muscle, equipment } = filter;

  return exercises
    .filter((e) => {
      const name = e.name.toLowerCase();
      if (!words.every((w) => name.includes(w))) return false;
      if (muscle && !e.muscles.includes(muscle)) return false;
      if (equipment && e.equipment !== equipment) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Pure: the muscle and equipment values present in the library, A-Z, for the chip rows. */
export function getFilterOptions(exercises: readonly FilterableExercise[]): FilterOptions {
  const muscles = new Set<string>();
  const equipment = new Set<string>();
  for (const e of exercises) {
    for (const m of e.muscles) muscles.add(m);
    equipment.add(e.equipment);
  }
  const az = (a: string, b: string) => a.localeCompare(b);
  return { muscles: [...muscles].sort(az), equipment: [...equipment].sort(az) };
}
