import { canMarkDone, setDone } from "./markDone";
import type { SetRow } from "./types";

const row = (weightKg: number | null, done = false): SetRow => ({ weightKg, reps: 8, done, edited: false });

describe("canMarkDone", () => {
  it("is false while the weight is blank", () => {
    expect(canMarkDone(row(null))).toBe(false);
  });
  it("is true once a weight is set", () => {
    expect(canMarkDone(row(60))).toBe(true);
  });
});

describe("setDone", () => {
  it("marks a row with a weight done and leaves others alone", () => {
    const next = setDone([row(60), row(60)], 0, true);
    expect(next.map((r) => r.done)).toEqual([true, false]);
  });
  it("does nothing for a row with a blank weight", () => {
    const rows = [row(null)];
    expect(setDone(rows, 0, true)).toBe(rows);
  });
  it("always allows unmarking", () => {
    const next = setDone([row(60, true)], 0, false);
    expect(next[0].done).toBe(false);
  });
});
