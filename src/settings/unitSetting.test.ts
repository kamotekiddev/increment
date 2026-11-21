import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, sets, userSettings, workoutExercises, workouts } from "@/db/schema";
import { DEFAULT_STEP, loggedWeightWithUnit } from "@/units";
import { parseWeight } from "@/workout";
import { editSet, markSetDone, type LiveSet } from "@/workout/workoutQueries";

import { createTestDb } from "../../test-support/testDb";
import { readUnit, writeUnit } from "./unitSetting";

// The real write path (`markSetDone`, `editSet`) runs against the app's `db`; point that at an
// in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const appDb: Db = jest.requireMock("@/db/client").db;

/** The settings rows, unit column only. */
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

  it("changes no stored set (value or unit) when the unit is switched kg → lb → kg 10 times", () => {
    const db = appDb;
    const exercise = db
      .insert(exercises)
      .values({ name: "Bench press", equipment: "barbell", loadType: "weighted" })
      .returning({ id: exercises.id })
      .get();
    const workout = db.insert(workouts).values({ startedAt: 1, date: "2026-11-18" }).returning({ id: workouts.id }).get();
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: 100, targetUnit: "kg" })
      .returning({ id: workoutExercises.id })
      .get();
    const setIds = [0, 1, 2].map(
      (idx) =>
        db
          .insert(sets)
          .values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: 100, weightUnit: "kg", reps: 5 })
          .returning({ id: sets.id })
          .get().id,
    );
    const jump = DEFAULT_STEP.kg;
    let rows: LiveSet[] = setIds.map((setId) => ({ setId, weight: 100, unit: "kg", reps: 5, done: false, edited: false }));

    // Set 1 stays untouched and open: shown as 220 lb in lb, but switching never writes it.
    // Set 2: 135 typed in lb, then checked in lb.
    rows = editSet(rows, 1, { weight: parseWeight("135"), unit: "lb" }, "lb", jump);
    rows = markSetDone(rows, 1, true, "lb", "weighted", jump);
    // Set 3 (which followed set 2's edit): checked in kg, then its weight retyped as 225 lb while checked.
    rows = markSetDone(rows, 2, true, "kg", "weighted", jump);
    editSet(rows, 2, { weight: parseWeight("225"), unit: "lb" }, "lb", jump);

    const read = () =>
      db
        .select()
        .from(sets)
        .orderBy(sets.idx)
        .all()
        .map((r) => ({ weight: r.weight, weightUnit: r.weightUnit, done: r.done }));
    const before = read();
    expect(before).toEqual([
      { weight: 100, weightUnit: "kg", done: false },
      { weight: 135, weightUnit: "lb", done: true },
      { weight: 225, weightUnit: "lb", done: true },
    ]);

    for (let i = 0; i < 20; i++) writeUnit(db, i % 2 === 0 ? "lb" : "kg");

    // toEqual compares numbers exactly: the typed number, not a conversion of it.
    expect(read()).toEqual(before);
    expect(db.select().from(workoutExercises).where(eq(workoutExercises.id, we.id)).get()?.targetWeightKg).toBe(100);
  });

  it("logs 45 lb as typed: history shows 45 lb in lb and ≈20.4 kg in kg, the database keeps 45, lb", () => {
    const db = appDb;
    const exercise = db.insert(exercises).values({ name: "Lat pulldown", equipment: "cable", loadType: "weighted" }).returning().get();
    const workout = db.insert(workouts).values({ startedAt: 1, date: "2026-11-21" }).returning().get();
    const we = db.insert(workoutExercises).values({ workoutId: workout.id, exerciseId: exercise.id, position: 0 }).returning().get();
    const setId = db
      .insert(sets)
      .values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx: 0, weight: 0, weightUnit: "lb", reps: 10 })
      .returning()
      .get().id;
    const jump = DEFAULT_STEP.kg;
    let rows: LiveSet[] = [{ setId, weight: null, unit: "lb", reps: 10, done: false, edited: false }];
    rows = editSet(rows, 0, { weight: parseWeight("45"), unit: "lb" }, "lb", jump);
    markSetDone(rows, 0, true, "lb", "weighted", jump);

    const saved = db.select().from(sets).where(eq(sets.id, setId)).get()!;
    expect([saved.weight, saved.weightUnit]).toEqual([45, "lb"]);
    const logged = { value: saved.weight, unit: saved.weightUnit };
    writeUnit(db, "lb");
    expect(loggedWeightWithUnit(logged, readUnit(db))).toBe("45 lb");
    writeUnit(db, "kg");
    expect(loggedWeightWithUnit(logged, readUnit(db))).toBe("≈20.4 kg");
    expect(db.select().from(sets).where(eq(sets.id, setId)).get()).toMatchObject({ weight: 45, weightUnit: "lb" });
  });
});
