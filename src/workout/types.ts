import type { Unit } from "../units";

/** One set row on the live workout screen: the weight as saved, in the unit it was saved in. */
export interface SetRow {
  /** The number as typed or pre-filled, in `unit`. Null while blank (first workout with no Target). */
  weight: number | null;
  /** The unit `weight` is in. */
  unit: Unit;
  reps: number;
  done: boolean;
  /** The lifter typed or nudged this row themselves. Edited rows never follow. */
  edited: boolean;
}

/** The workout in progress, as the bar, the Resume prompt and the routine lock read it. */
export interface InProgressWorkout {
  id: number;
  /** Null when the routine was deleted. */
  routineId: number | null;
  /** Null when the routine was deleted. */
  routineName: string | null;
  startedAt: number;
  /** When the lifter last changed a set; null until the first change. */
  lastEditedAt: number | null;
}
