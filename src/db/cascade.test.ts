import { eq } from "drizzle-orm";

import { createTestDb } from "../../test-support/testDb";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "./schema";

/** ADR 0005: deleting an exercise deletes everything that belongs to it. */
describe("deleting an exercise", () => {
  function setup() {
    const db = createTestDb();
    const [custom, other] = db
      .insert(exercises)
      .values([
        { name: "Ring rows", equipment: "bodyweight", loadType: "bodyweight", isCustom: true },
        { name: "Bench press", equipment: "barbell", loadType: "weighted" },
      ])
      .returning()
      .all();
    const routine = db.insert(routines).values({ name: "Push", days: 1, position: 0 }).returning().get();
    const rule = { v: 1, step: "weight", repStep: 1, sessionsToEarn: 2 } as never;
    db.insert(routineExercises)
      .values([
        { routineId: routine.id, exerciseId: custom.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 60, rule },
        { routineId: routine.id, exerciseId: other.id, position: 1, sets: 3, repMin: 8, repMax: 10, restS: 60, rule },
      ])
      .run();
    const workout = db.insert(workouts).values({ startedAt: 1, date: "2026-11-01", inProgress: false }).returning().get();
    const [weCustom, weOther] = db
      .insert(workoutExercises)
      .values([
        { workoutId: workout.id, exerciseId: custom.id, position: 0 },
        { workoutId: workout.id, exerciseId: other.id, position: 1 },
      ])
      .returning()
      .all();
    db.insert(sets)
      .values([
        { workoutExerciseId: weCustom.id, exerciseId: custom.id, idx: 0, weight: 0, weightUnit: "kg", reps: 8, done: true },
        { workoutExerciseId: weOther.id, exerciseId: other.id, idx: 0, weight: 60, weightUnit: "kg", reps: 8, done: true },
      ])
      .run();
    return { db, custom, other, routine, workout };
  }

  it("removes its routine exercises, workout exercises and sets", () => {
    const { db, custom } = setup();
    db.delete(exercises).where(eq(exercises.id, custom.id)).run();
    expect(db.select().from(routineExercises).where(eq(routineExercises.exerciseId, custom.id)).all()).toEqual([]);
    expect(db.select().from(workoutExercises).where(eq(workoutExercises.exerciseId, custom.id)).all()).toEqual([]);
    expect(db.select().from(sets).where(eq(sets.exerciseId, custom.id)).all()).toEqual([]);
  });

  it("leaves every other exercise, routine, workout and their rows alone", () => {
    const { db, custom, other, routine, workout } = setup();
    db.delete(exercises).where(eq(exercises.id, custom.id)).run();
    expect(db.select().from(exercises).where(eq(exercises.id, other.id)).all()).toHaveLength(1);
    expect(db.select().from(routines).all().map((r) => r.id)).toEqual([routine.id]);
    expect(db.select().from(workouts).all().map((w) => w.id)).toEqual([workout.id]);
    expect(db.select().from(routineExercises).all().map((r) => r.exerciseId)).toEqual([other.id]);
    expect(db.select().from(workoutExercises).all().map((w) => w.exerciseId)).toEqual([other.id]);
    expect(db.select().from(sets).all().map((s) => s.exerciseId)).toEqual([other.id]);
  });
});
