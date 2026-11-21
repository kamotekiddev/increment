import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import { pastWorkout, workoutHistory } from "./historyQueries";

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

interface LoggedSet {
  weightKg: number;
  reps: number;
  /** Set index; defaults to the order given. */
  idx?: number;
  done?: boolean;
  warmup?: boolean;
}

interface LoggedExercise {
  name: string;
  loadType?: "weighted" | "bodyweight";
  position: number;
  /** Stored Target `[kg, reps]`, or null for none. */
  target?: [number, number] | null;
  deload?: boolean;
  sets?: LoggedSet[];
}

/** A Workout with exercises in the given shape; returns its id. */
function logWorkout(workout: SavedWorkout, logged: LoggedExercise[]): number {
  const id = saveWorkout({ ...workout, exercises: 0 });
  for (const { name, loadType = "weighted", position, target = null, deload = false, sets: loggedSets = [] } of logged) {
    const exercise = db.insert(exercises).values({ name, equipment: "barbell", loadType }).returning().get();
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: id, exerciseId: exercise.id, position, targetWeightKg: target?.[0] ?? null, targetReps: target?.[1] ?? null, isDeload: deload })
      .returning()
      .get();
    loggedSets.forEach(({ weightKg, reps, idx, done = true, warmup = false }, i) => {
      db.insert(sets)
        .values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx: idx ?? i, weightKg, enteredUnit: "kg", reps, done, isWarmup: warmup })
        .run();
    });
  }
  return id;
}

describe("pastWorkout", () => {
  it("heads the Workout with its Routine's current name, and the date and duration as History shows them", () => {
    const push = routine("Push");
    const id = logWorkout({ routineId: push, date: "2026-11-12", startedAt: at(2026, 11, 12), minutes: 72 }, []);
    db.update(routines).set({ name: "Push day A" }).where(eq(routines.id, push)).run();
    expect(pastWorkout(id, "kg")).toMatchObject({ routineLabel: "Push day A", detail: "Thu, 12 Nov · 1 h 12 min" });
  });

  it("shows one card per Workout exercise, in the order they had in the Workout", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Overhead press", position: 1 },
      { name: "Dips", position: 2 },
      { name: "Barbell bench press", position: 0 },
    ]);
    expect(pastWorkout(id, "kg")?.cards.map((c) => c.name)).toEqual(["Barbell bench press", "Overhead press", "Dips"]);
  });

  it("shows a weighted Target in the current Unit, converted for display and never snapped to the Jump grid", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Barbell bench press", position: 0, target: [62.5, 8] },
    ]);
    expect(pastWorkout(id, "kg")?.cards[0].target).toBe("Target 62.5 × 8");
    expect(pastWorkout(id, "lb")?.cards[0].target).toBe("Target 137.79 × 8");
  });

  it("shows a bodyweight exercise's Target in reps", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Dips", loadType: "bodyweight", position: 0, target: [0, 10] },
    ]);
    expect(pastWorkout(id, "lb")?.cards[0].target).toBe("Target 10 reps");
  });

  it("shows no Target on an exercise's first workout", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Barbell bench press", position: 0, target: null, sets: [{ weightKg: 60, reps: 8 }] },
    ]);
    expect(pastWorkout(id, "kg")?.cards[0].target).toBeNull();
  });

  it("flags a Workout exercise done as a Deload", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Barbell bench press", position: 0, target: [55, 8], deload: true },
      { name: "Overhead press", position: 1, target: [40, 8] },
    ]);
    expect(pastWorkout(id, "kg")?.cards.map((c) => c.deload)).toEqual([true, false]);
  });

  it("shows one chip per done Working set, in set order, leaving out warm-ups and sets not done", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      {
        name: "Barbell bench press",
        position: 0,
        target: [62.5, 8],
        sets: [
          { idx: 3, weightKg: 62.5, reps: 7 },
          { idx: 0, weightKg: 40, reps: 10, warmup: true },
          { idx: 1, weightKg: 62.5, reps: 8 },
          { idx: 4, weightKg: 62.5, reps: 6, done: false },
          { idx: 2, weightKg: 60, reps: 8 },
        ],
      },
    ]);
    expect(pastWorkout(id, "kg")?.cards[0].chips).toEqual(["62.5 × 8", "60 × 8", "62.5 × 7"]);
  });

  it("shows a chip in the current Unit, matching a Target it hit", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Barbell bench press", position: 0, target: [62.5, 8], sets: [{ weightKg: 62.5, reps: 8 }] },
    ]);
    expect(pastWorkout(id, "lb")?.cards[0]).toMatchObject({ target: "Target 137.79 × 8", chips: ["137.79 × 8"] });
  });

  it("shows a set with no weight in reps: `9 reps`, `1 rep`", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Dips", loadType: "bodyweight", position: 0, target: [0, 10], sets: [{ weightKg: 0, reps: 9 }, { weightKg: 0, reps: 1 }] },
    ]);
    expect(pastWorkout(id, "kg")?.cards[0].chips).toEqual(["9 reps", "1 rep"]);
  });

  it("keeps added weight logged on a bodyweight exercise: `10 × 8`", () => {
    const id = logWorkout({ routineId: routine("Push day A"), date: "2026-11-12", startedAt: at(2026, 11, 12) }, [
      { name: "Dips", loadType: "bodyweight", position: 0, target: [0, 8], sets: [{ weightKg: 10, reps: 8 }] },
    ]);
    expect(pastWorkout(id, "kg")?.cards[0].chips).toEqual(["10 × 8"]);
  });

  it("returns nothing for an unknown id or a Workout in progress", () => {
    const live = logWorkout({ routineId: routine("Legs"), date: "2026-11-12", startedAt: at(2026, 11, 12), inProgress: true }, [
      { name: "Squat", position: 0, target: [100, 5], sets: [{ weightKg: 100, reps: 5 }] },
    ]);
    expect(pastWorkout(live, "kg")).toBeNull();
    expect(pastWorkout(live + 1, "kg")).toBeNull();
  });
});
