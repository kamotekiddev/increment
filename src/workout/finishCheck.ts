import type { SetRow } from "./types";

export interface FinishCheck {
  /** Not-done sets in exercises that have at least one done set. These are dropped on Finish. */
  uncheckedSets: number;
  /** Indexes (in workout order) of exercises with no done sets. They are left out of the saved workout. */
  skippedExercises: number[];
  /** No set is done in any exercise: offer Discard instead of saving. */
  noSetsDone: boolean;
}

/** What to warn the lifter about at Finish. `exercises` holds each exercise's rows in workout order. */
export function finishCheck(exercises: SetRow[][]): FinishCheck {
  let uncheckedSets = 0;
  const skippedExercises: number[] = [];
  exercises.forEach((rows, index) => {
    const done = rows.filter((r) => r.done).length;
    if (done === 0) skippedExercises.push(index);
    else uncheckedSets += rows.length - done;
  });
  return { uncheckedSets, skippedExercises, noSetsDone: skippedExercises.length === exercises.length };
}
