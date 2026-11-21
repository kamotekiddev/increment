import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { DEFAULT_JUMP } from "@/units";

import { loadWorkout, markSetDone, startWorkout } from "./workoutQueries";

// The real write path runs against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

/** Pullups, a bodyweight exercise since the split, with one finished workout logged with a 20 kg belt. */
function pullupsLoggedWithABelt(): number {
  const exerciseId = db.insert(exercises).values({ name: "Pullups", equipment: "bodyweight", loadType: "bodyweight" }).returning().get().id;
  const routineId = db.insert(routines).values({ name: "Pull" }).returning().get().id;
  db.insert(routineExercises)
    .values({ routineId, exerciseId, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("bodyweight") })
    .run();
  const past = db.insert(workouts).values({ routineId, startedAt: 1, date: "2026-11-02", inProgress: false }).returning().get();
  const we = db.insert(workoutExercises).values({ workoutId: past.id, exerciseId, position: 0 }).returning().get();
  [9, 8, 8].forEach((reps, idx) =>
    db.insert(sets).values({ workoutExerciseId: we.id, exerciseId, idx, weight: 20, weightUnit: "kg", reps, done: true }).run(),
  );
  return routineId;
}

describe("a bodyweight exercise in the live workout", () => {
  it("carries no weight logged before the split into the Target or the prefilled sets, and saves done sets at 0", async () => {
    const workoutId = startWorkout(pullupsLoggedWithABelt(), "kg", new Date(2026, 10, 9))!;

    const workout = await loadWorkout(workoutId);
    const pullups = workout!.exercises[0];
    expect(pullups.target).toEqual({ weightKg: 0, reps: 8 });
    const stored = () => db.select().from(sets).where(eq(sets.workoutExerciseId, pullups.id)).orderBy(sets.idx).all();
    expect(stored().map((s) => s.weight)).toEqual([0, 0, 0]);

    // Even a row that still carries a weight (a workout started before the split) saves 0 when checked.
    const rows = pullups.rows.map((r, i) => (i === 0 ? { ...r, weight: 20 } : r));
    const next = markSetDone(rows, 0, true, "kg", "bodyweight", DEFAULT_JUMP.kg);
    expect(next[0]).toMatchObject({ weight: 0, done: true });
    expect(stored()[0]).toMatchObject({ weight: 0, done: true, reps: 8 });
  });
});
