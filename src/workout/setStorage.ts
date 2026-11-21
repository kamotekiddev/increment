import type { Unit } from "../units";
import type { SetRow } from "./types";

/** `sets.weight` is not null, so a blank weight is stored as 0 until it is typed. */
export function weightToStore(weight: number | null): number {
  return weight ?? 0;
}

/** A set that is not done and stored at 0 was never given a weight: it reads back as blank. */
export function rowFromStored(stored: { weight: number; weightUnit: Unit; reps: number; done: boolean; edited: boolean }): SetRow {
  const blank = !stored.done && stored.weight === 0;
  return { weight: blank ? null : stored.weight, unit: stored.weightUnit, reps: stored.reps, done: stored.done, edited: stored.edited };
}
