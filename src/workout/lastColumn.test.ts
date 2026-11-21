import { stepKgFor } from "../units";
import { lastColumn, lastSetText } from "./lastColumn";
import type { PastExercise } from "./historyInputs";

const past = (sets: PastExercise["sets"]): PastExercise => ({
  startedAt: 1, date: "2026-01-01", targetWeightKg: null, targetReps: null, progressAccepted: false, isDeload: false, sets,
});
const s = (idx: number, weight: number, reps: number, done = true) => ({ idx, weight, weightUnit: "kg" as const, reps, done, isWarmup: false });
const kgJump = stepKgFor(null, "kg");
const lbJump = stepKgFor(null, "lb");

describe("lastColumn", () => {
  it("gives dashes for every row when there is no past workout", () => {
    expect(lastColumn(null, 3)).toEqual([null, null, null]);
  });
  it("matches past sets to rows by position", () => {
    expect(lastColumn(past([s(1, 62.5, 7), s(0, 60, 8)]), 2)).toEqual([
      { weight: 60, unit: "kg", reps: 8 },
      { weight: 62.5, unit: "kg", reps: 7 },
    ]);
  });
  it("gives a dash for a row beyond the past sets", () => {
    expect(lastColumn(past([s(0, 60, 8)]), 2)).toEqual([{ weight: 60, unit: "kg", reps: 8 }, null]);
  });
  it("gives a dash for a past set that was not done", () => {
    expect(lastColumn(past([s(0, 60, 8, false)]), 1)).toEqual([null]);
  });
  it("matches by plan position when an unchecked set left a gap", () => {
    expect(lastColumn(past([s(0, 60, 8), s(1, 60, 8), s(3, 70, 6)]), 4)).toEqual([
      { weight: 60, unit: "kg", reps: 8 },
      { weight: 60, unit: "kg", reps: 8 },
      null,
      { weight: 70, unit: "kg", reps: 6 },
    ]);
  });
});

describe("lastSetText", () => {
  it("writes a set saved in the unit on screen exactly, with reps", () => {
    expect(lastSetText({ weight: 60, unit: "kg", reps: 8 }, "kg", "weighted", kgJump)).toBe("60 × 8");
    expect(lastSetText({ weight: 135, unit: "lb", reps: 5 }, "lb", "weighted", lbJump)).toBe("135 × 5");
  });
  it("never rounds a set saved in the unit on screen: 61.25 kg stays 61.25 with a 2.5 kg Jump", () => {
    expect(lastSetText({ weight: 61.25, unit: "kg", reps: 8 }, "kg", "weighted", kgJump)).toBe("61.25 × 8");
  });
  it("converts a set saved in the other unit and rounds it down to the Jump", () => {
    expect(lastSetText({ weight: 100, unit: "kg", reps: 8 }, "lb", "weighted", lbJump)).toBe("220 × 8");
    expect(lastSetText({ weight: 135, unit: "lb", reps: 8 }, "kg", "weighted", kgJump)).toBe("60 × 8");
    // 62.5 kg is 137.79 lb, nearer 140 but rounded down.
    expect(lastSetText({ weight: 62.5, unit: "kg", reps: 8 }, "lb", "weighted", lbJump)).toBe("135 × 8");
  });
  it("writes a dash when there is no past set", () => {
    expect(lastSetText(null, "kg", "weighted", kgJump)).toBe("–");
  });
  it("writes reps only on a bodyweight exercise, hiding weight logged before the split", () => {
    expect(lastSetText({ weight: 0, unit: "kg", reps: 8 }, "kg", "bodyweight", kgJump)).toBe("8 reps");
    expect(lastSetText({ weight: 20, unit: "kg", reps: 1 }, "lb", "bodyweight", lbJump)).toBe("1 rep");
  });
});
