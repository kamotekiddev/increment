import { lastColumn, lastSetText, setRowColumns } from "./lastColumn";
import type { PastExercise } from "./historyInputs";

const past = (sets: PastExercise["sets"]): PastExercise => ({
  startedAt: 1, date: "2026-01-01", targetWeightKg: null, targetReps: null, progressAccepted: false, isDeload: false, sets,
});
const s = (idx: number, weightKg: number, reps: number, done = true) => ({ idx, weightKg, reps, done, isWarmup: false });

describe("lastColumn", () => {
  it("gives dashes for every row when there is no past workout", () => {
    expect(lastColumn(null, 3)).toEqual([null, null, null]);
  });
  it("matches past sets to rows by position", () => {
    expect(lastColumn(past([s(1, 62.5, 7), s(0, 60, 8)]), 2)).toEqual([
      { weightKg: 60, reps: 8 },
      { weightKg: 62.5, reps: 7 },
    ]);
  });
  it("gives a dash for a row beyond the past sets", () => {
    expect(lastColumn(past([s(0, 60, 8)]), 2)).toEqual([{ weightKg: 60, reps: 8 }, null]);
  });
  it("gives a dash for a past set that was not done", () => {
    expect(lastColumn(past([s(0, 60, 8, false)]), 1)).toEqual([null]);
  });
  it("matches by plan position when an unchecked set left a gap", () => {
    expect(lastColumn(past([s(0, 60, 8), s(1, 60, 8), s(3, 70, 6)]), 4)).toEqual([
      { weightKg: 60, reps: 8 },
      { weightKg: 60, reps: 8 },
      null,
      { weightKg: 70, reps: 6 },
    ]);
  });
});

describe("lastSetText", () => {
  it("writes weight in the unit on screen and reps", () => {
    expect(lastSetText({ weightKg: 60, reps: 8 }, "kg", "weighted")).toBe("60 × 8");
    expect(lastSetText({ weightKg: 61.2349, reps: 5 }, "lb", "weighted")).toBe("135 × 5");
  });
  it("writes a dash when there is no past set", () => {
    expect(lastSetText(null, "kg", "weighted")).toBe("–");
  });
  it("writes reps only on a bodyweight exercise, hiding weight logged before the split", () => {
    expect(lastSetText({ weightKg: 0, reps: 8 }, "kg", "bodyweight")).toBe("8 reps");
    expect(lastSetText({ weightKg: 20, reps: 1 }, "lb", "bodyweight")).toBe("1 rep");
  });
});

describe("setRowColumns", () => {
  it("shows the Last column between Set and the inputs when on, for a weighted exercise", () => {
    expect(setRowColumns("weighted", true)).toEqual(["set", "last", "weight", "reps", "check"]);
  });
  it("drops only the Last column when off, for a weighted exercise", () => {
    expect(setRowColumns("weighted", false)).toEqual(["set", "weight", "reps", "check"]);
  });
  it("has no weight box for a bodyweight exercise, with Last on", () => {
    expect(setRowColumns("bodyweight", true)).toEqual(["set", "last", "reps", "check"]);
  });
  it("drops only the Last column when off, for a bodyweight exercise", () => {
    expect(setRowColumns("bodyweight", false)).toEqual(["set", "reps", "check"]);
  });
});
