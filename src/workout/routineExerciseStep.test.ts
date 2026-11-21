import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { jumpKgFor, type Jumps } from "@/units";

import { followUnitRows } from "./followUnit";
import { loadWorkout, startWorkout } from "./workoutQueries";

// The queries run against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

/** A bench routine whose first workout (no Target) was 3 × 8 at 102.5 kg, with the routine exercise's saved Jumps. */
function benchAt102(jumps: Jumps): { routineId: number; routineExerciseId: number } {
  const exercise = db.insert(exercises).values({ name: "Bench press", equipment: "barbell", loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: "Push" }).returning().get();
  const routineExerciseId = db
    .insert(routineExercises)
    .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted"), ...jumps })
    .returning()
    .get().id;
  const past = db.insert(workouts).values({ routineId: routine.id, startedAt: 1, finishedAt: 2, date: "2026-11-14", inProgress: false }).returning().get();
  const we = db.insert(workoutExercises).values({ workoutId: past.id, exerciseId: exercise.id, position: 0 }).returning().get();
  for (let idx = 0; idx < 3; idx++) {
    db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: 102.5, weightUnit: "kg", reps: 8, done: true }).run();
  }
  return { routineId: routine.id, routineExerciseId };
}

describe("the live workout rounds by the routine exercise's Jump", () => {
  it("carries the saved Jumps, so untouched 102.5 kg rows show as 220 lb with a 10 lb step after a switch to lb", async () => {
    const { routineId } = benchAt102({ stepKg: 5, stepLb: 10 });
    const workoutId = startWorkout(routineId, "kg", new Date(2026, 10, 21))!;
    const bench = (await loadWorkout(workoutId))!.exercises[0];
    expect(bench.jumps).toEqual({ stepKg: 5, stepLb: 10 });
    expect(followUnitRows(bench.rows, "lb", jumpKgFor(bench.jumps, "lb")).map((r) => [r.weight, r.unit])).toEqual([
      [220, "lb"],
      [220, "lb"],
      [220, "lb"],
    ]);
  });

  it("uses the 2.5 kg / 5 lb default when the workout's routine exercise was deleted: 102.5 kg shows as 225 lb", async () => {
    const { routineId, routineExerciseId } = benchAt102({ stepKg: 5, stepLb: 10 });
    const workoutId = startWorkout(routineId, "kg", new Date(2026, 10, 21))!;
    db.delete(routineExercises).where(eq(routineExercises.id, routineExerciseId)).run();
    const bench = (await loadWorkout(workoutId))!.exercises[0];
    expect(bench.jumps).toEqual({ stepKg: null, stepLb: null });
    expect(jumpKgFor(bench.jumps, "kg")).toBe(2.5);
    expect(followUnitRows(bench.rows, "lb", jumpKgFor(bench.jumps, "lb"))[0]).toMatchObject({ weight: 225, unit: "lb" });
  });
});
