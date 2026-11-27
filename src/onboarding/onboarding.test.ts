import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, userSettings } from "@/db/schema";
import { seedLibrary } from "@/db/seed";
import { deleteAllData } from "@/backup/deleteAllData";
import { buildBackup, parseBackup } from "@/backup/backupFile";
import { restoreBackup } from "@/backup/restoreBackup";
import { canCreateRoutine, lockedRoutineIds } from "@/routines/routineLimit";
import { readUnit } from "@/settings/unitSetting";

import { finishOnboarding, finishQuickStart, isOnboarded, startRoute } from "./onboarding";
import { createTestDb } from "../../test-support/testDb";

function seededDb(): Db {
  const db = createTestDb();
  seedLibrary(db);
  return db;
}

const counts = (db: Db) => ({
  routines: db.select().from(routines).all().length,
  routineExercises: db.select().from(routineExercises).all().length,
  settingsRows: db.select().from(userSettings).all().length,
});

function backupOf(db: Db): string {
  return buildBackup(
    {
      exercises: db.select().from(exercises).all(),
      routines: db.select().from(routines).all(),
      routineExercises: db.select().from(routineExercises).all(),
      workouts: [],
      workoutExercises: [],
      sets: [],
      userSettings: db.select().from(userSettings).get() ?? null,
    },
    { exportedAt: 1, appVersion: "test" },
  );
}

describe("onboarded flag", () => {
  it("a fresh database reads not onboarded and has no routines", () => {
    const db = seededDb();
    expect(isOnboarded(db)).toBe(false);
    expect(counts(db)).toEqual({ routines: 0, routineExercises: 0, settingsRows: 0 });
  });

  it("reading it never writes anything", () => {
    const db = seededDb();
    isOnboarded(db);
    isOnboarded(db);
    expect(counts(db)).toEqual({ routines: 0, routineExercises: 0, settingsRows: 0 });
  });

  it("finishOnboarding writes only the flag", () => {
    const db = seededDb();
    readUnit(db);
    db.update(userSettings).set({ unit: "lb" }).run();
    finishOnboarding(db);
    expect(isOnboarded(db)).toBe(true);
    expect(readUnit(db)).toBe("lb");
    expect(counts(db).routines).toBe(0);
  });

  it("finishOnboarding works with no settings row yet", () => {
    const db = seededDb();
    finishOnboarding(db);
    expect(isOnboarded(db)).toBe(true);
    expect(readUnit(db)).toBe("kg");
  });
});

describe("startRoute", () => {
  it("is welcome when not onboarded and tabs when onboarded", () => {
    expect(startRoute(false)).toBe("welcome");
    expect(startRoute(true)).toBe("tabs");
  });
});

describe("finishQuickStart", () => {
  function plan(db: Db) {
    return db
      .select()
      .from(routines)
      .all()
      .map((r) => ({
        name: r.name,
        days: r.days,
        rows: db
          .select({ name: exercises.name, slug: exercises.slug, isCustom: exercises.isCustom, re: routineExercises })
          .from(routineExercises)
          .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
          .where(eq(routineExercises.routineId, r.id))
          .orderBy(routineExercises.position)
          .all(),
      }));
  }

  it("creates the 2 routines with the right days, exercises, sets, rep range and rest", () => {
    const db = seededDb();
    finishQuickStart(db, "kg");
    const result = plan(db);
    expect(result.map((r) => [r.name, r.days])).toEqual([
      ["Full body A", 0b0010001], // Mon + Fri
      ["Full body B", 0b0000100], // Wed
    ]);
    for (const r of result) {
      expect(r.rows).toHaveLength(4);
      r.rows.forEach((row, i) => {
        expect(row.isCustom).toBe(false);
        expect(row.slug).not.toBeNull();
        expect(row.re).toMatchObject({ position: i, sets: 3, repMin: 10, repMax: 15, restS: 60, stepKg: null, stepLb: null });
      });
    }
    expect(isOnboarded(db)).toBe(true);
    expect(readUnit(db)).toBe("kg");
  });

  it("saves lb when asked and changes nothing else", () => {
    const kg = seededDb();
    const lb = seededDb();
    finishQuickStart(kg, "kg");
    finishQuickStart(lb, "lb");
    expect(readUnit(lb)).toBe("lb");
    expect(plan(lb)).toEqual(plan(kg));
    expect(isOnboarded(lb)).toBe(true);
  });

  it("fits the free routine limit", () => {
    const db = seededDb();
    finishQuickStart(db, "kg");
    const ids = db.select({ id: routines.id }).from(routines).all().map((r) => r.id);
    expect(lockedRoutineIds(ids, false)).toEqual([]);
    expect(canCreateRoutine(ids.length, false)).toBe(true);
  });

  it("is all-or-nothing: a failure part way leaves no routine, no unit change and no flag", () => {
    const db = seededDb();
    // Routine A is built first; Leg Press (last exercise of B) is missing, so the failure comes late.
    db.delete(exercises).where(eq(exercises.name, "Leg Press")).run();
    expect(() => finishQuickStart(db, "lb")).toThrow(/Leg Press/);
    expect(counts(db)).toEqual({ routines: 0, routineExercises: 0, settingsRows: 0 });
    expect(isOnboarded(db)).toBe(false);
    expect(readUnit(db)).toBe("kg");
  });
});

describe("restore and Delete all data keep onboarded", () => {
  it("restoreBackup leaves onboarded true, even when the backup has no settings row", () => {
    const db = seededDb();
    finishQuickStart(db, "lb");
    const text = backupOf(db);
    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error("backup should parse");
    expect(restoreBackup(db, parsed.data)).toBe("restored");
    expect(isOnboarded(db)).toBe(true);
  });

  it("a fresh database that is restored then marked done stays onboarded, and so after Delete all data", () => {
    const source = seededDb();
    finishQuickStart(source, "lb");
    const text = backupOf(source);
    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error("backup should parse");

    const fresh = seededDb();
    expect(restoreBackup(fresh, parsed.data)).toBe("restored");
    expect(isOnboarded(fresh)).toBe(false); // the file never carries the flag
    finishOnboarding(fresh);
    expect(isOnboarded(fresh)).toBe(true);
    expect(restoreBackup(fresh, parsed.data)).toBe("restored");
    expect(isOnboarded(fresh)).toBe(true);
    expect(deleteAllData(fresh)).toBe("deleted");
    expect(isOnboarded(fresh)).toBe(true);
    expect(readUnit(fresh)).toBe("kg"); // preferences still reset
  });

  it("Delete all data on a not onboarded database leaves it not onboarded", () => {
    const db = seededDb();
    expect(deleteAllData(db)).toBe("deleted");
    expect(isOnboarded(db)).toBe(false);
  });
});
