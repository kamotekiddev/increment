import { finishCheck } from "./finishCheck";
import type { SetRow } from "./types";

const row = (done: boolean): SetRow => ({ weightKg: 60, reps: 10, done, edited: false });

describe("finishCheck", () => {
  it("reports nothing to warn about when every set is done", () => {
    expect(finishCheck([[row(true), row(true)], [row(true)]])).toEqual({
      uncheckedSets: 0,
      skippedExercises: [],
      noSetsDone: false,
    });
  });

  it("counts unchecked sets in exercises that have some done sets", () => {
    const result = finishCheck([[row(true), row(false), row(false)], [row(true)]]);
    expect(result.uncheckedSets).toBe(2);
    expect(result.skippedExercises).toEqual([]);
    expect(result.noSetsDone).toBe(false);
  });

  it("reports an exercise with no done sets as skipped, not as unchecked sets", () => {
    const result = finishCheck([[row(true)], [row(false), row(false)]]);
    expect(result.skippedExercises).toEqual([1]);
    expect(result.uncheckedSets).toBe(0);
    expect(result.noSetsDone).toBe(false);
  });

  it("reports the no-sets-done case when nothing is done anywhere", () => {
    const result = finishCheck([[row(false)], [row(false), row(false)]]);
    expect(result.noSetsDone).toBe(true);
    expect(result.skippedExercises).toEqual([0, 1]);
  });

  it("counts an unchecked set", () => {
    const result = finishCheck([[row(true), row(true), row(false)]]);
    expect(result.uncheckedSets).toBe(1);
  });
});
