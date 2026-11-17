import { judgedSets } from "./judgedSets";
import type { SetRow } from "./types";

const row = (weightKg: number, reps: number, done: boolean): SetRow => ({ weightKg, reps, done, edited: false });

describe("judgedSets", () => {
  it("returns done sets as working sets for the engine", () => {
    const rows = [row(60, 10, true), row(60, 9, true)];
    expect(judgedSets(rows, 2)).toEqual([
      { weightKg: 60, reps: 10, done: true, isWarmup: false },
      { weightKg: 60, reps: 9, done: true, isWarmup: false },
    ]);
  });

  it("leaves out sets that are not done", () => {
    const rows = [row(60, 10, true), row(60, 10, false), row(60, 10, true)];
    expect(judgedSets(rows, 3).map((s) => s.reps)).toEqual([10, 10]);
    expect(judgedSets(rows, 3)).toHaveLength(2);
  });

  it("skips rows with a blank weight", () => {
    expect(judgedSets([{ weightKg: null, reps: 8, done: true, edited: false }], 1)).toEqual([]);
  });
});
