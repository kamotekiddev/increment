import { toRestExercises } from "./restExercises";
import type { LiveExercise } from "./workoutQueries";

const ex = (over: Partial<LiveExercise>): LiveExercise => ({
  id: 1,
  name: "Bench press",
  target: null,
  range: null,
  restSeconds: 90,
  loadType: "weighted",
  rows: [{ setId: 1, weightKg: 60, reps: 8, done: false, edited: false }],
  ...over,
});

describe("toRestExercises", () => {
  it("carries name, rest length and rows", () => {
    const [r] = toRestExercises([ex({})]);
    expect(r).toEqual({ name: "Bench press", restSeconds: 90, bodyweight: false, rows: expect.any(Array) });
  });
  it("is bodyweight only for the bodyweight load type", () => {
    const flags = toRestExercises([
      ex({ loadType: "bodyweight" }),
      ex({ loadType: "weighted" }),
    ]).map((e) => e.bodyweight);
    expect(flags).toEqual([true, false]);
  });
});
