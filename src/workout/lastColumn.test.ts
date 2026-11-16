import { lastColumn } from "./lastColumn";
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
  it("gives a dash for a row beyond the past sets, such as an added set", () => {
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
