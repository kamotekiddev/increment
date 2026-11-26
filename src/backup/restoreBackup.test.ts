import type { Db } from "@/db/client";
import { entitlements, exercises, routineExercises, routines, sets, settings, userSettings, workoutExercises, workouts } from "@/db/schema";

import { buildBackup, parseBackup, type BackupData } from "./backupFile";
import { restoreBackup } from "./restoreBackup";
import { createTestDb } from "../../test-support/testDb";

const RULE = { v: 1, kind: "double" } as never;

/** A phone with two seeded library exercises (slugs bench, squat) and the settings rows restore must keep. */
function phone(libraryIds: { bench: number; squat: number }): Db {
  const db = createTestDb();
  db.insert(exercises).values({ id: libraryIds.bench, slug: "bench", name: "Bench", equipment: "barbell", loadType: "weighted" }).run();
  db.insert(exercises).values({ id: libraryIds.squat, slug: "squat", name: "Squat", equipment: "barbell", loadType: "weighted" }).run();
  db.insert(settings).values({ key: "last_backup_at", value: 111 }).run();
  db.insert(settings).values({ key: "seed_version", value: 3 }).run();
  return db;
}

/** Fills a phone with a routine, a custom lift and one finished workout, and returns its backup text. */
function backupFrom(db: Db): string {
  const custom = db.insert(exercises).values({ name: "Cable fly", equipment: "cable", loadType: "weighted", isCustom: true }).returning().get();
  const bench = db.select().from(exercises).all().find((e) => e.slug === "bench")!;
  const r = db.insert(routines).values({ name: "Push", days: 2, position: 0 }).returning().get();
  db.insert(routineExercises).values({ routineId: r.id, exerciseId: bench.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: RULE }).run();
  db.insert(routineExercises).values({ routineId: r.id, exerciseId: custom.id, position: 1, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: RULE }).run();
  const w = db.insert(workouts).values({ routineId: r.id, startedAt: 1000, finishedAt: 2000, date: "2026-11-01", inProgress: false }).returning().get();
  const we = db.insert(workoutExercises).values({ workoutId: w.id, exerciseId: bench.id, position: 0 }).returning().get();
  db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: bench.id, idx: 0, weight: 135, weightUnit: "lb", reps: 8, done: true }).run();
  db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: bench.id, idx: 1, weight: 60, weightUnit: "kg", reps: 8, done: true }).run();
  db.insert(userSettings).values({ id: 1, unit: "lb", defaultRestS: 150 }).run();
  return buildBackup(
    {
      exercises: db.select().from(exercises).all(),
      routines: db.select().from(routines).all(),
      routineExercises: db.select().from(routineExercises).all(),
      workouts: db.select().from(workouts).all(),
      workoutExercises: db.select().from(workoutExercises).all(),
      sets: db.select().from(sets).all(),
      userSettings: db.select().from(userSettings).get() ?? null,
    },
    { exportedAt: 5, appVersion: "1.0.0" },
  );
}

function parsed(text: string): BackupData {
  const p = parseBackup(text);
  if (!p.ok) throw new Error("bad");
  return p.data;
}

describe("restoreBackup", () => {
  it("restores onto another phone with different library ids, remapping every key", () => {
    const text = backupFrom(phone({ bench: 1, squat: 2 }));
    const target = phone({ bench: 40, squat: 41 });
    target.insert(routines).values({ name: "Old", position: 0 }).run();
    target.insert(exercises).values({ name: "Old custom", equipment: "x", loadType: "weighted", isCustom: true }).run();

    expect(restoreBackup(target, parsed(text))).toBe("restored");

    expect(target.select().from(routines).all().map((r) => r.name)).toEqual(["Push"]);
    const ex = target.select().from(exercises).all();
    expect(ex.filter((e) => e.isCustom).map((e) => e.name)).toEqual(["Cable fly"]);
    const bench = ex.find((e) => e.slug === "bench")!;
    expect(bench.id).toBe(40);
    const re = target.select().from(routineExercises).all();
    expect(re.map((r) => r.exerciseId).sort()).toEqual([bench.id, ex.find((e) => e.isCustom)!.id].sort());
    const w = target.select().from(workouts).all();
    expect(w).toHaveLength(1);
    expect(w[0].inProgress).toBe(false);
    expect(w[0].routineId).toBe(target.select().from(routines).get()!.id);
    const s = target.select().from(sets).all();
    expect(s.map((x) => [x.weight, x.weightUnit, x.exerciseId])).toEqual([[135, "lb", 40], [60, "kg", 40]]);
    expect(s[0].workoutExerciseId).toBe(target.select().from(workoutExercises).get()!.id);
    expect(target.select().from(userSettings).get()).toMatchObject({ unit: "lb", defaultRestS: 150 });
  });

  it("leaves entitlements, Last backup and the seed version alone", () => {
    const text = backupFrom(phone({ bench: 1, squat: 2 }));
    const target = phone({ bench: 1, squat: 2 });
    target.insert(entitlements).values({ id: 1, isPro: true, productId: "p", unlockScreenOwed: true }).run();
    restoreBackup(target, parsed(text));
    expect(target.select().from(entitlements).get()).toMatchObject({ isPro: true, productId: "p", unlockScreenOwed: true });
    const keys = Object.fromEntries(target.select().from(settings).all().map((r) => [r.key, r.value]));
    expect(keys).toEqual({ last_backup_at: 111, seed_version: 3 });
  });

  it("is blocked while a workout is in progress and changes nothing", () => {
    const text = backupFrom(phone({ bench: 1, squat: 2 }));
    const target = phone({ bench: 1, squat: 2 });
    target.insert(routines).values({ name: "Keep", position: 0 }).run();
    target.insert(workouts).values({ startedAt: 1, date: "2026-11-02", inProgress: true }).run();
    expect(restoreBackup(target, parsed(text))).toBe("workout-in-progress");
    expect(target.select().from(routines).all().map((r) => r.name)).toEqual(["Keep"]);
  });

  it("rolls back when a library slug is unknown here", () => {
    const text = backupFrom(phone({ bench: 1, squat: 2 }));
    const target = createTestDb();
    target.insert(routines).values({ name: "Keep", position: 0 }).run();
    expect(() => restoreBackup(target, parsed(text))).toThrow();
    expect(target.select().from(routines).all().map((r) => r.name)).toEqual(["Keep"]);
  });

  it("keeps the current settings when the file has none", () => {
    const target = phone({ bench: 1, squat: 2 });
    target.insert(userSettings).values({ id: 1, unit: "lb" }).run();
    const data = { ...parsed(backupFrom(phone({ bench: 1, squat: 2 }))), userSettings: null };
    restoreBackup(target, data);
    expect(target.select().from(userSettings).get()!.unit).toBe("lb");
  });
});
