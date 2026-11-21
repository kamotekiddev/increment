import { toRestExercises } from "./restExercises";
import type { LiveExercise } from "./workoutQueries";

const ex = (over: Partial<LiveExercise>): LiveExercise => ({
  id: 1,
  name: "Bench press",
  jumps: { stepKg: null, stepLb: null },
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
    const [r] = toRestExercises([ex({})], "kg");
    expect(r).toEqual({ name: "Bench press", restSeconds: 90, bodyweight: false, rows: expect.any(Array) });
  });
  it("is bodyweight only for the bodyweight load type", () => {
    const flags = toRestExercises([ex({ loadType: "bodyweight" }), ex({ loadType: "weighted" })], "kg").map((e) => e.bodyweight);
    expect(flags).toEqual([true, false]);
  });
  it("shows untouched rows in the current unit, rounded down to the 5 lb default: 102.5 kg is 225 lb", () => {
    const [r] = toRestExercises([ex({ rows: [{ setId: 1, weight: 102.5, unit: "kg", reps: 5, done: false, edited: false }] })], "lb");
    expect(r.rows[0]).toMatchObject({ weight: 225, unit: "lb" });
  });
  it("rounds down to the routine exercise's lb Jump: 102.5 kg with a 10 lb step is 220 lb", () => {
    const rows = [{ setId: 1, weight: 102.5, unit: "kg" as const, reps: 5, done: false, edited: false }];
    const [r] = toRestExercises([ex({ rows, jumps: { stepKg: 5, stepLb: 10 } })], "lb");
    expect(r.rows[0]).toMatchObject({ weight: 220, unit: "lb" });
  });
});
