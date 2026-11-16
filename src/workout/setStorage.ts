import type { SetRow } from "./types";

/** `sets.weight_kg` is not null, so a blank weight is stored as 0 until it is typed. */
export function weightToStore(weightKg: number | null): number {
  return weightKg ?? 0;
}

/** A set that is not done and stored at 0 kg was never given a weight: it reads back as blank. */
export function rowFromStored(stored: { weightKg: number; reps: number; done: boolean }): SetRow {
  const blank = !stored.done && stored.weightKg === 0;
  return { weightKg: blank ? null : stored.weightKg, reps: stored.reps, done: stored.done, edited: false };
}
