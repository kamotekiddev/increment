import type { Db } from "@/db/client";
import { exercises, routines, sets, settings, userSettings, workoutExercises, workouts } from "@/db/schema";

import { parseBackup } from "./backupFile";
import { createBackup, readLastBackup, writeLastBackup, yourDataStats } from "./backupQueries";

// The module reads the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

beforeEach(() => {
  db.delete(sets).run();
  db.delete(workoutExercises).run();
  db.delete(workouts).run();
  db.delete(routines).run();
  db.delete(exercises).run();
  db.delete(settings).run();
  db.delete(userSettings).run();
});

const BASE = new Date(2026, 10, 1, 18).getTime();

function workout(day: number, lifts: { w: number; r: number; done?: boolean; warmup?: boolean }[], inProgress = false): void {
  const exerciseId = db.insert(exercises).values({ name: `Lift ${day}`, equipment: "barbell", loadType: "weighted", muscles: ["chest"], isCustom: true }).returning().get().id;
  const startedAt = BASE + day * 86_400_000;
  const w = db
    .insert(workouts)
    .values({ date: `2026-11-${String(1 + day).padStart(2, "0")}`, startedAt, finishedAt: inProgress ? null : startedAt + 1000, inProgress })
    .returning()
    .get();
  const we = db.insert(workoutExercises).values({ workoutId: w.id, exerciseId, position: 0 }).returning().get();
  lifts.forEach((s, idx) =>
    db.insert(sets).values({ workoutExerciseId: we.id, exerciseId, idx, weight: s.w, weightUnit: "kg", reps: s.r, done: s.done ?? true, isWarmup: s.warmup ?? false }).run(),
  );
}

describe("Last backup date", () => {
  it("is null until a share finishes, then reads back what was stored", () => {
    expect(readLastBackup()).toBeNull();
    writeLastBackup(BASE);
    expect(readLastBackup()).toBe(BASE);
    writeLastBackup(BASE + 5);
    expect(readLastBackup()).toBe(BASE + 5);
  });
});

describe("yourDataStats", () => {
  it("counts finished workouts, counted sets and records, leaving a workout in progress out", () => {
    workout(0, [{ w: 60, r: 8 }, { w: 60, r: 8 }, { w: 20, r: 5, warmup: true }, { w: 60, r: 8, done: false }]);
    workout(1, [{ w: 70, r: 5 }]);
    workout(2, [{ w: 100, r: 5 }], true);
    const stats = yourDataStats("kg");
    expect(stats.workouts).toBe(2);
    expect(stats.sets).toBe(3);
    expect(stats.records).toBe(6);
  });
  it("is all zeros on an empty phone", () => {
    expect(yourDataStats("kg")).toEqual({ workouts: 0, sets: 0, records: 0 });
  });
});

describe("createBackup", () => {
  it("builds a named file whose parsed rows leave the workout in progress out, and leaves that workout running", () => {
    workout(0, [{ w: 60, r: 8 }, { w: 60, r: 8 }]);
    workout(1, [{ w: 100, r: 5 }], true);
    const now = new Date(2026, 10, 14, 10).getTime();
    const backup = createBackup(now, "1.0.0");
    expect(backup.fileName).toBe("Increment backup 14 Nov 2026.increment");
    const parsed = parseBackup(backup.text);
    expect(parsed.ok && parsed.data.workouts).toHaveLength(1);
    expect(backup.counts).toEqual({ routines: 0, customExercises: 2, workouts: 1, sets: 2, records: 3 });
    expect(backup.settingsText).toBe("kg, 1:30 rest");
    expect(db.select().from(workouts).all().filter((w) => w.inProgress)).toHaveLength(1);
    expect(readLastBackup()).toBeNull();
  });
  it("keeps the Last backup date out of the file", () => {
    writeLastBackup(BASE);
    const backup = createBackup(BASE, "1.0.0");
    expect(backup.text).not.toContain("last_backup");
  });
});
