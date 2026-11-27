import type { Db } from "@/db/client";
import { entitlements, exercises, routineExercises, routines, sets, settings, userSettings, workoutExercises, workouts } from "@/db/schema";

import { deleteAllData, deleteConfirmed, deleteSheetBackupShortcut } from "./deleteAllData";
import { createTestDb } from "../../test-support/testDb";

const RULE = { v: 1, step: "weight", repStep: 1, sessionsToEarn: 3 } as const;

/** A phone with a library lift, a custom lift, a routine, a finished workout, changed preferences and backup settings. */
function phone(): Db {
  const db = createTestDb();
  const bench = db.insert(exercises).values({ slug: "bench", name: "Bench", equipment: "barbell", loadType: "weighted" }).returning().get();
  const custom = db.insert(exercises).values({ name: "Cable fly", equipment: "cable", loadType: "weighted", isCustom: true }).returning().get();
  const r = db.insert(routines).values({ name: "Push", days: 2, position: 0 }).returning().get();
  db.insert(routineExercises).values({ routineId: r.id, exerciseId: bench.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: RULE }).run();
  db.insert(routineExercises).values({ routineId: r.id, exerciseId: custom.id, position: 1, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: RULE }).run();
  const w = db.insert(workouts).values({ routineId: r.id, startedAt: 1000, finishedAt: 2000, date: "2026-11-01", inProgress: false }).returning().get();
  const we = db.insert(workoutExercises).values({ workoutId: w.id, exerciseId: bench.id, position: 0 }).returning().get();
  db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: bench.id, idx: 0, weight: 135, weightUnit: "lb", reps: 8, done: true }).run();
  db.insert(userSettings)
    .values({ id: 1, unit: "lb", defaultRestS: 150, showPreviousSet: false, keepScreenAwake: false, remindersOn: true, reminderTimeMin: 420 })
    .run();
  db.insert(entitlements).values({ id: 1, isPro: true }).run();
  const rows: [string, unknown][] = [
    ["last_backup_at", 111],
    ["last_backup_hash", "abc"],
    ["auto_backup_on", true],
    ["auto_backup_keep", 5],
    ["auto_backup_folder", "content://x"],
    ["auto_backup_frequency", "weekly"],
    ["auto_backup_failing", true],
    ["librarySeedVersion", 3],
  ];
  for (const [key, value] of rows) db.insert(settings).values({ key, value }).run();
  return db;
}

describe("deleteAllData", () => {
  it("removes training data and custom exercises, keeping library exercises", () => {
    const db = phone();
    expect(deleteAllData(db)).toBe("deleted");
    expect(db.select().from(sets).all()).toEqual([]);
    expect(db.select().from(workoutExercises).all()).toEqual([]);
    expect(db.select().from(workouts).all()).toEqual([]);
    expect(db.select().from(routineExercises).all()).toEqual([]);
    expect(db.select().from(routines).all()).toEqual([]);
    expect(db.select().from(exercises).all().map((e) => e.slug)).toEqual(["bench"]);
  });

  it("resets preferences to the defaults", () => {
    const db = phone();
    deleteAllData(db);
    expect(db.select().from(userSettings).get()).toEqual({
      id: 1,
      unit: "kg",
      defaultRestS: 90,
      showPreviousSet: true,
      keepScreenAwake: true,
      remindersOn: false,
      reminderTimeMin: 1080,
    });
  });

  it("creates the default preferences when the phone has none yet", () => {
    const db = createTestDb();
    deleteAllData(db);
    expect(db.select().from(userSettings).get()).toMatchObject({ unit: "kg", defaultRestS: 90, remindersOn: false });
  });

  it("switches automatic backups off and clears Last backup and the fingerprint, keeping the seed version", () => {
    const db = phone();
    deleteAllData(db);
    expect(db.select().from(settings).all()).toEqual([{ key: "librarySeedVersion", value: 3 }]);
  });

  it("keeps the Pro entitlement", () => {
    const db = phone();
    deleteAllData(db);
    expect(db.select().from(entitlements).get()).toMatchObject({ id: 1, isPro: true });
  });

  it("is blocked by a Workout in progress and changes nothing", () => {
    const db = phone();
    db.insert(workouts).values({ startedAt: 3000, date: "2026-11-02", inProgress: true }).run();
    expect(deleteAllData(db)).toBe("workout-in-progress");
    expect(db.select().from(workouts).all()).toHaveLength(2);
    expect(db.select().from(sets).all()).toHaveLength(1);
    expect(db.select().from(userSettings).get()).toMatchObject({ unit: "lb" });
    expect(db.select().from(settings).all()).toHaveLength(8);
  });

  it("is safe to run twice", () => {
    const db = phone();
    deleteAllData(db);
    expect(deleteAllData(db)).toBe("deleted");
    expect(db.select().from(workouts).all()).toEqual([]);
  });
});

describe("deleteConfirmed", () => {
  it("accepts DELETE ignoring case and surrounding spaces", () => {
    expect(deleteConfirmed("DELETE")).toBe(true);
    expect(deleteConfirmed("  delete ")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(deleteConfirmed("")).toBe(false);
    expect(deleteConfirmed("delet")).toBe(false);
    expect(deleteConfirmed("de lete")).toBe(false);
  });
});

describe("deleteSheetBackupShortcut", () => {
  it("shows the Create a backup first row to a Pro lifter only", () => {
    expect(deleteSheetBackupShortcut(true)).toBe(true);
    expect(deleteSheetBackupShortcut(false)).toBe(false);
  });
});
