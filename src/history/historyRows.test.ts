import { buildHistoryRows, chipText, historyDateLabel, type PastWorkoutExercise } from "./historyRows";

describe("historyDateLabel", () => {
  it("omits the year in the current year", () => {
    expect(historyDateLabel("2026-11-12", "2026-11-20")).toBe("Thu, 12 Nov");
  });
  it("adds the year for another year", () => {
    expect(historyDateLabel("2025-12-28", "2026-11-20")).toBe("Sun, 28 Dec 2025");
  });
  it("uses the year of today at a year boundary", () => {
    expect(historyDateLabel("2025-12-31", "2026-01-01")).toBe("Wed, 31 Dec 2025");
    expect(historyDateLabel("2026-01-01", "2026-01-01")).toBe("Thu, 1 Jan");
  });
});

describe("chipText", () => {
  it("shows weight and reps in kg", () => expect(chipText(62.5, 8, "kg")).toBe("62.5 × 8"));
  it("converts for display in lb", () => expect(chipText(62.5, 8, "lb")).toBe("137.79 × 8"));
  it("shows reps only at no weight", () => {
    expect(chipText(0, 9, "kg")).toBe("9 reps");
    expect(chipText(0, 1, "lb")).toBe("1 rep");
  });
  it("keeps belt weight logged on a bodyweight exercise", () => expect(chipText(10, 8, "kg")).toBe("10 × 8"));
});

const set = (idx: number, weightKg: number, reps: number, extra: Partial<PastWorkoutExercise["sets"][number]> = {}) => ({
  idx,
  weightKg,
  reps,
  done: true,
  isWarmup: false,
  ...extra,
});
const past = (sets: PastWorkoutExercise["sets"], extra: Partial<PastWorkoutExercise> = {}): PastWorkoutExercise => ({
  workoutExerciseId: 1,
  startedAt: 1,
  date: "2026-11-12",
  routineName: "Push day A",
  isDeload: false,
  sets,
  ...extra,
});

describe("buildHistoryRows", () => {
  it("lists done working sets in set order, leaving out warm-ups and undone sets", () => {
    const rows = buildHistoryRows(
      [past([set(2, 62.5, 7), set(0, 40, 10, { isWarmup: true }), set(1, 62.5, 8), set(3, 62.5, 5, { done: false })])],
      "kg",
      "2026-11-20",
    );
    expect(rows).toEqual([{ key: "1", dateLabel: "Thu, 12 Nov", routineName: "Push day A", isDeload: false, chips: ["62.5 × 8", "62.5 × 7"] }]);
  });
  it("drops a workout with no done working set", () => {
    expect(buildHistoryRows([past([set(0, 40, 10, { isWarmup: true }), set(1, 60, 8, { done: false })])], "kg", "2026-11-20")).toEqual([]);
  });
  it("carries the Deload flag and a missing routine", () => {
    const [row] = buildHistoryRows([past([set(0, 50, 8)], { isDeload: true, routineName: null })], "kg", "2026-11-20");
    expect(row.isDeload).toBe(true);
    expect(row.routineName).toBeNull();
  });
  it("follows the unit", () => {
    expect(buildHistoryRows([past([set(0, 62.5, 8)])], "lb", "2026-11-20")[0].chips).toEqual(["137.79 × 8"]);
  });
});
