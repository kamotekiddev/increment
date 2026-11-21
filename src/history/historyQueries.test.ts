import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import { workoutHistory } from "./historyQueries";

// workoutHistory reads the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

beforeEach(() => {
  db.delete(sets).run();
  db.delete(workoutExercises).run();
  db.delete(workouts).run();
  db.delete(routines).run();
  db.delete(exercises).run();
});

const MIN = 60_000;

interface SavedWorkout {
  /** Routine id, or null for a Workout saved with none. */
  routineId: number | null;
  /** Local `YYYY-MM-DD`. */
  date: string;
  /** Epoch ms. */
  startedAt: number;
  /** Minutes from start to finish. */
  minutes?: number;
  /** Workout exercises kept on the Workout. */
  exercises?: number;
  inProgress?: boolean;
}

function routine(name: string): number {
  return db.insert(routines).values({ name }).returning().get().id;
}

function saveWorkout({ routineId, date, startedAt, minutes = 45, exercises: count = 1, inProgress = false }: SavedWorkout): number {
  const workout = db
    .insert(workouts)
    .values({ routineId, date, startedAt, finishedAt: inProgress ? null : startedAt + minutes * MIN, inProgress })
    .returning()
    .get();
  for (let position = 0; position < count; position++) {
    const exercise = db.insert(exercises).values({ name: `Exercise ${workout.id}.${position}`, equipment: "barbell", loadType: "weighted" }).returning().get();
    const we = db.insert(workoutExercises).values({ workoutId: workout.id, exerciseId: exercise.id, position, targetWeightKg: 60, targetReps: 8 }).returning().get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weightKg: 60, enteredUnit: "kg", reps: 8, done: true }).run();
    }
  }
  return workout.id;
}

/** Epoch ms of a local time, the way the app stamps startedAt. */
const at = (y: number, m: number, d: number, h = 18) => new Date(y, m - 1, d, h).getTime();

describe("workoutHistory", () => {
  it("returns no sections when no Workout is finished", () => {
    expect(workoutHistory("kg")).toEqual([]);
  });

  it("shows a finished Workout under its month with date, Routine, exercise count and duration", () => {
    const id = saveWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12), minutes: 48, exercises: 5 });
    expect(workoutHistory("kg")).toEqual([
      {
        title: "November 2026",
        data: [{ workoutId: id, dateLabel: "Thu, 12 Nov", routineLabel: "Push day A", detail: "5 exercises · 48 min" }],
      },
    ]);
  });

  it("leaves out a Workout in progress", () => {
    const legs = routine("Legs");
    const done = saveWorkout({ routineId: legs, date: "2026-11-11", startedAt: at(2026, 11, 11) });
    saveWorkout({ routineId: legs, date: "2026-11-12", startedAt: at(2026, 11, 12), inProgress: true });
    const rows = workoutHistory("kg").flatMap((s) => s.data);
    expect(rows.map((r) => r.workoutId)).toEqual([done]);
  });

  it("lists Workouts of every Routine newest first, a later Workout on the same day above the earlier one", () => {
    const push = routine("Push day A");
    const legs = routine("Legs");
    const morning = saveWorkout({ routineId: legs, date: "2026-11-12", startedAt: at(2026, 11, 12, 7) });
    const older = saveWorkout({ routineId: push, date: "2026-11-09", startedAt: at(2026, 11, 9) });
    const evening = saveWorkout({ routineId: push, date: "2026-11-12", startedAt: at(2026, 11, 12, 19) });
    const rows = workoutHistory("kg").flatMap((s) => s.data);
    expect(rows.map((r) => [r.workoutId, r.dateLabel, r.routineLabel])).toEqual([
      [evening, "Thu, 12 Nov", "Push day A"],
      [morning, "Thu, 12 Nov", "Legs"],
      [older, "Mon, 9 Nov", "Push day A"],
    ]);
  });

  it("splits months across a year boundary, the year on the month title only", () => {
    const push = routine("Push day A");
    saveWorkout({ routineId: push, date: "2025-12-30", startedAt: at(2025, 12, 30) });
    saveWorkout({ routineId: push, date: "2026-01-02", startedAt: at(2026, 1, 2) });
    saveWorkout({ routineId: push, date: "2026-02-01", startedAt: at(2026, 2, 1) });
    saveWorkout({ routineId: push, date: "2026-01-05", startedAt: at(2026, 1, 5) });
    expect(workoutHistory("kg").map((s) => [s.title, s.data.map((r) => r.dateLabel)])).toEqual([
      ["February 2026", ["Sun, 1 Feb"]],
      ["January 2026", ["Mon, 5 Jan", "Fri, 2 Jan"]],
      ["December 2025", ["Tue, 30 Dec"]],
    ]);
  });

  it("keeps a Workout that ran past midnight on the day and month it was started", () => {
    // Started 23:30 on 31 Oct, finished 00:40 on 1 Nov.
    saveWorkout({ routineId: routine("Legs"), date: "2026-10-31", startedAt: new Date(2026, 9, 31, 23, 30).getTime(), minutes: 70 });
    const [section] = workoutHistory("kg");
    expect([section.title, section.data[0].dateLabel]).toEqual(["October 2026", "Sat, 31 Oct"]);
  });

  it("shows a renamed Routine's current name, and `Workout` for a Workout with no Routine", () => {
    const push = routine("Push");
    saveWorkout({ routineId: push, date: "2026-11-10", startedAt: at(2026, 11, 10) });
    saveWorkout({ routineId: null, date: "2026-11-11", startedAt: at(2026, 11, 11) });
    db.update(routines).set({ name: "Push day A" }).where(eq(routines.id, push)).run();
    expect(workoutHistory("kg")[0].data.map((r) => r.routineLabel)).toEqual(["Workout", "Push day A"]);
  });

  it("counts the Workout exercises: `1 exercise`, `4 exercises`", () => {
    const legs = routine("Legs");
    saveWorkout({ routineId: legs, date: "2026-11-11", startedAt: at(2026, 11, 11), exercises: 1, minutes: 30 });
    saveWorkout({ routineId: legs, date: "2026-11-10", startedAt: at(2026, 11, 10), exercises: 4, minutes: 30 });
    expect(workoutHistory("kg")[0].data.map((r) => r.detail)).toEqual(["1 exercise · 30 min", "4 exercises · 30 min"]);
  });

  it("shows the duration floored to minutes, in hours past an hour, with no cap", () => {
    const legs = routine("Legs");
    const durations: [number, string][] = [
      [0.5, "0 min"],
      [48, "48 min"],
      [60, "1 h"],
      [72.9, "1 h 12 min"],
      [185, "3 h 5 min"],
    ];
    durations.forEach(([minutes], i) => saveWorkout({ routineId: legs, date: "2026-11-01", startedAt: at(2026, 11, 1, 6 - i), minutes, exercises: 2 }));
    expect(workoutHistory("kg")[0].data.map((r) => r.detail)).toEqual(durations.map(([, text]) => `2 exercises · ${text}`));
  });
});
