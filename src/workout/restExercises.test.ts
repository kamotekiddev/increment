import { DEFAULT_JUMPS_KG, effectiveJumps, UNTOUCHED_JUMPS } from "../settings/jumps";
import { toRestExercises } from "./restExercises";
import type { LiveExercise } from "./workoutQueries";

const ex = (over: Partial<LiveExercise>): LiveExercise => ({
  id: 1,
  name: "Bench press",
  equipment: "barbell",
  target: null,
  targetUnit: "kg",
  range: null,
  restSeconds: 90,
  loadType: "weighted",
  rows: [{ setId: 1, weight: 60, unit: "kg", reps: 8, done: false, edited: false }],
  ...over,
});

describe("toRestExercises", () => {
  it("carries name, rest length and rows", () => {
    const [r] = toRestExercises([ex({})], "kg", DEFAULT_JUMPS_KG);
    expect(r).toEqual({ name: "Bench press", restSeconds: 90, bodyweight: false, rows: expect.any(Array) });
  });
  it("is bodyweight only for the bodyweight load type", () => {
    const flags = toRestExercises([ex({ loadType: "bodyweight" }), ex({ loadType: "weighted" })], "kg", DEFAULT_JUMPS_KG).map(
      (e) => e.bodyweight,
    );
    expect(flags).toEqual([true, false]);
  });
  it("shows untouched rows in the current unit, rounded to the exercise's Jump", () => {
    const [r] = toRestExercises([ex({ rows: [{ setId: 1, weight: 100, unit: "kg", reps: 5, done: false, edited: false }] })], "lb", effectiveJumps(UNTOUCHED_JUMPS, "lb"));
    expect(r.rows[0]).toMatchObject({ weight: 220, unit: "lb" });
  });
});
