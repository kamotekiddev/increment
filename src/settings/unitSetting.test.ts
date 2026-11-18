import { eq } from "drizzle-orm";

import { exercises, sets, userSettings, workoutExercises, workouts } from "@/db/schema";
import { toKg } from "@/units";

import { createTestDb } from "./testDb";
import { readUnit, writeUnit } from "./unitSetting";

describe("unit setting", () => {
  it("starts in kg and creates the single row on first read", () => {
    const db = createTestDb();
    expect(db.select().from(userSettings).all()).toHaveLength(0);
    expect(readUnit(db)).toBe("kg");
    expect(db.select().from(userSettings).all()).toEqual([{ id: 1, unit: "kg" }]);
    expect(readUnit(db)).toBe("kg");
    expect(db.select().from(userSettings).all()).toHaveLength(1);
  });

  it("keeps the choice and never adds a second row", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    expect(readUnit(db)).toBe("lb");
    writeUnit(db, "kg");
    writeUnit(db, "lb");
    expect(db.select().from(userSettings).all()).toEqual([{ id: 1, unit: "lb" }]);
  });

  it("changes no stored weight or entered unit when the unit is switched 10 times", () => {
    const db = createTestDb();
    const exercise = db
      .insert(exercises)
      .values({ name: "Bench press", equipment: "barbell", loadType: "weighted" })
      .returning({ id: exercises.id })
      .get();
    const workout = db.insert(workouts).values({ startedAt: 1, date: "2026-11-18" }).returning({ id: workouts.id }).get();
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: 61.2349 })
      .returning({ id: workoutExercises.id })
      .get();
    // 135 lb typed in lb: stored as kg at full precision, with the unit it was typed in.
    const typedKg = toKg(135, "lb");
    const row = db
      .insert(sets)
      .values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx: 0, weightKg: typedKg, enteredUnit: "lb", reps: 5, done: true })
      .returning({ id: sets.id })
      .get();

    for (let i = 0; i < 10; i++) writeUnit(db, i % 2 === 0 ? "kg" : "lb");

    const after = db.select().from(sets).where(eq(sets.id, row.id)).get();
    expect(after?.weightKg).toBe(typedKg);
    expect(after?.weightKg).toBe(135 * 0.45359237);
    expect(after?.enteredUnit).toBe("lb");
    expect(db.select().from(workoutExercises).where(eq(workoutExercises.id, we.id)).get()?.targetWeightKg).toBe(61.2349);
  });
});
