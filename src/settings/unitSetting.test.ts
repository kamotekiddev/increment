import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, sets, userSettings, workoutExercises, workouts } from "@/db/schema";
import { KG_PER_LB } from "@/units";
import { weightFromTyped } from "@/workout";
import { editSet, markSetDone, type LiveSet } from "@/workout/workoutQueries";

import { createTestDb } from "../../test-support/testDb";
import { readUnit, writeUnit } from "./unitSetting";

// The real write path (`markSetDone`, `editSet`) runs against the app's `db`; point that at an
// in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const appDb: Db = jest.requireMock("@/db/client").db;

/** The settings rows, unit column only (the Jump columns are covered in jumpSetting.test.ts). */
const unitRows = (db: Db) => db.select({ id: userSettings.id, unit: userSettings.unit }).from(userSettings).all();

describe("unit setting", () => {
  it("starts in kg and creates the single row on first read", () => {
    const db = createTestDb();
    expect(db.select().from(userSettings).all()).toHaveLength(0);
    expect(readUnit(db)).toBe("kg");
    expect(unitRows(db)).toEqual([{ id: 1, unit: "kg" }]);
    expect(readUnit(db)).toBe("kg");
    expect(db.select().from(userSettings).all()).toHaveLength(1);
  });

  it("keeps the choice and never adds a second row", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    expect(readUnit(db)).toBe("lb");
    writeUnit(db, "kg");
    writeUnit(db, "lb");
    expect(unitRows(db)).toEqual([{ id: 1, unit: "lb" }]);
  });

  it("changes no stored weight or entered unit when the unit is switched 10 times", () => {
    const db = appDb;
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
    const setIds = [0, 1].map(
      (idx) =>
        db
          .insert(sets)
          .values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weightKg: 100, enteredUnit: "kg", reps: 5 })
          .returning({ id: sets.id })
          .get().id,
    );
    let rows: LiveSet[] = setIds.map((setId) => ({ setId, weightKg: 100, reps: 5, done: false, edited: false }));

    // Set 1: 135 typed in lb, then checked in lb.
    rows = editSet(rows, 0, { weightKg: weightFromTyped("135", "lb") }, "lb");
    rows = markSetDone(rows, 0, true, "lb", "weighted");
    // Set 2: checked in kg, then its weight retyped as 225 lb while checked.
    rows = markSetDone(rows, 1, true, "kg", "weighted");
    editSet(rows, 1, { weightKg: weightFromTyped("225", "lb") }, "lb");

    const read = () =>
      db
        .select()
        .from(sets)
        .orderBy(sets.idx)
        .all()
        .map((r) => ({ weightKg: r.weightKg, enteredUnit: r.enteredUnit, done: r.done }));
    const before = read();
    expect(before[0]).toEqual({ weightKg: 135 * KG_PER_LB, enteredUnit: "lb", done: true });
    expect(before[1]).toEqual({ weightKg: 225 * KG_PER_LB, enteredUnit: "lb", done: true });

    for (let i = 0; i < 10; i++) writeUnit(db, i % 2 === 0 ? "kg" : "lb");

    // toEqual compares numbers exactly: full precision, not 0.01.
    expect(read()).toEqual(before);
    expect(db.select().from(workoutExercises).where(eq(workoutExercises.id, we.id)).get()?.targetWeightKg).toBe(61.2349);
  });
});
