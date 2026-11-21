import { judgedSets } from "./judgedSets";
import type { SetRow } from "./types";

const row = (weight: number, reps: number, done: boolean, unit: SetRow["unit"] = "kg"): SetRow => ({ weight, unit, reps, done, edited: false });

describe("judgedSets", () => {
  it("returns done sets as working sets for the engine", () => {
    const rows = [row(60, 10, true), row(60, 9, true)];
    expect(judgedSets(rows, 2)).toEqual([
      { weightKg: 60, reps: 10, done: true, isWarmup: false, unit: "kg" },
      { weightKg: 60, reps: 9, done: true, isWarmup: false, unit: "kg" },
    ]);
  });

  it("leaves out sets that are not done", () => {
    const rows = [row(60, 10, true), row(60, 10, false), row(60, 10, true)];
    expect(judgedSets(rows, 3).map((s) => s.reps)).toEqual([10, 10]);
    expect(judgedSets(rows, 3)).toHaveLength(2);
  });

  it("skips rows with a blank weight", () => {
    expect(judgedSets([{ weight: null, unit: "kg", reps: 8, done: true, edited: false }], 1)).toEqual([]);
  });

  it("gives the engine kg in memory: 135 lb is 61.23 kg, the row keeps 135 lb", () => {
    const rows = [row(135, 5, true, "lb")];
    expect(judgedSets(rows, 1)[0].weightKg).toBeCloseTo(61.23497, 5);
    expect(rows[0]).toMatchObject({ weight: 135, unit: "lb" });
  });
});
