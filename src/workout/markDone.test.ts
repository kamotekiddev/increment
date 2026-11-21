import { canMarkDone, setDone } from "./markDone";
import type { SetRow } from "./types";

const row = (weight: number | null, done = false): SetRow => ({ weight, unit: "kg", reps: 8, done, edited: false });

describe("canMarkDone", () => {
  it("is false while the weight is blank", () => {
    expect(canMarkDone(row(null), "weighted")).toBe(false);
  });
  it("is true once a weight is set", () => {
    expect(canMarkDone(row(60), "weighted")).toBe(true);
  });
});

describe("setDone", () => {
  it("marks a row with a weight done and leaves others alone", () => {
    const next = setDone([row(60), row(60)], 0, true, "weighted");
    expect(next.map((r) => r.done)).toEqual([true, false]);
  });
  it("does nothing for a row with a blank weight", () => {
    const rows = [row(null)];
    expect(setDone(rows, 0, true, "weighted")).toBe(rows);
  });
  it("always allows unmarking", () => {
    const next = setDone([row(60, true)], 0, false, "weighted");
    expect(next[0].done).toBe(false);
  });
});

describe("on a bodyweight exercise", () => {
  it("a set can be marked done with reps only", () => {
    expect(canMarkDone(row(null), "bodyweight")).toBe(true);
  });
  it("a done set saves weight 0, whatever weight it carried", () => {
    expect(setDone([row(null), row(20)], 0, true, "bodyweight")[0]).toEqual({ weight: 0, unit: "kg", reps: 8, done: true, edited: false });
    expect(setDone([row(20)], 0, true, "bodyweight")[0].weight).toBe(0);
  });
});
