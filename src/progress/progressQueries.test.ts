import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import { defaultExerciseId, exerciseProgress, pickerExercises } from "./progressQueries";

// The module reads the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

beforeEach(() => {
  db.delete(sets).run();
  db.delete(workoutExercises).run();
  db.delete(workouts).run();
  db.delete(routineExercises).run();
  db.delete(routines).run();
  db.delete(exercises).run();
});

const DAY = 24 * 60 * 60_000;
const BASE = new Date(2026, 10, 1, 18).getTime();

function exercise(name: string, loadType: "weighted" | "bodyweight" = "weighted", equipment = "barbell"): number {
  return db.insert(exercises).values({ name, equipment, loadType }).returning().get().id;
}

function routine(name: string, exerciseIds: number[] = [], position = 0): number {
  const id = db.insert(routines).values({ name, position }).returning().get().id;
  exerciseIds.forEach((exerciseId, i) =>
    db
      .insert(routineExercises)
      .values({ routineId: id, exerciseId, position: i, sets: 3, repMin: 6, repMax: 8, restS: 90, rule: { v: 1 } as never })
      .run(),
  );
  return id;
}

interface TestSet {
  w: number;
  r: number;
  unit?: "kg" | "lb";
  done?: boolean;
  warmup?: boolean;
}

interface TestWorkout {
  /** Day offset from 1 Nov 2026; sets the start time and the date. */
  day: number;
  inProgress?: boolean;
  lifts: { exerciseId: number; sets: TestSet[] }[];
}

function save({ day, inProgress = false, lifts }: TestWorkout) {
  const startedAt = BASE + day * DAY;
  const date = `2026-11-${String(1 + day).padStart(2, "0")}`;
  const workout = db
    .insert(workouts)
    .values({ routineId: null, date, startedAt, finishedAt: inProgress ? null : startedAt + 45 * 60_000, inProgress })
    .returning()
    .get();
  lifts.forEach((lift, position) => {
    const we = db.insert(workoutExercises).values({ workoutId: workout.id, exerciseId: lift.exerciseId, position }).returning().get();
    lift.sets.forEach((s, idx) => {
      db.insert(sets)
        .values({
          workoutExerciseId: we.id,
          exerciseId: lift.exerciseId,
          idx,
          weight: s.w,
          weightUnit: s.unit ?? "kg",
          reps: s.r,
          done: s.done ?? true,
          isWarmup: s.warmup ?? false,
        })
        .run();
    });
  });
  return workout.id;
}

const one = (w: number, r: number, extra: Partial<TestSet> = {}): TestSet => ({ w, r, ...extra });

describe("pickerExercises", () => {
  it("lists exercises with a finished workout, most recently done first, then routine-only ones", () => {
    const bench = exercise("Barbell bench press");
    const squat = exercise("Barbell squat");
    exercise("Barbell row");
    const dips = exercise("Dips");
    routine("Push", [dips, bench]);
    save({ day: 1, lifts: [{ exerciseId: bench, sets: [one(60, 8)] }] });
    save({ day: 4, lifts: [{ exerciseId: squat, sets: [one(80, 5)] }] });

    expect(pickerExercises().map((e) => [e.name, e.lastDoneLabel])).toEqual([
      ["Barbell squat", "Thu, 5 Nov"],
      ["Barbell bench press", "Mon, 2 Nov"],
      ["Dips", null],
    ]);
  });

  it("lists an exercise in two routines once, and a weighted twin as its own entry", () => {
    const pullUp = exercise("Pull-up", "bodyweight");
    const weighted = exercise("Weighted pull-up");
    routine("A", [pullUp, weighted], 0);
    routine("B", [pullUp], 1);
    expect(pickerExercises().map((e) => e.name)).toEqual(["Pull-up", "Weighted pull-up"]);
  });

  it("does not count an open workout or sets that were not done or were warm-ups", () => {
    const bench = exercise("Bench");
    const squat = exercise("Squat");
    save({ day: 0, inProgress: true, lifts: [{ exerciseId: bench, sets: [one(60, 8)] }] });
    save({ day: 1, lifts: [{ exerciseId: squat, sets: [one(80, 5, { done: false }), one(40, 5, { warmup: true })] }] });
    expect(pickerExercises()).toEqual([]);
  });

  it("is empty with no routines and no finished workout", () => {
    exercise("Bench");
    expect(pickerExercises()).toEqual([]);
  });
});

describe("defaultExerciseId", () => {
  it("is the most recently done exercise, the later exercise of one workout winning", () => {
    const bench = exercise("Bench");
    const fly = exercise("Fly");
    const squat = exercise("Squat");
    save({ day: 0, lifts: [{ exerciseId: squat, sets: [one(80, 5)] }] });
    save({ day: 2, lifts: [{ exerciseId: bench, sets: [one(60, 8)] }, { exerciseId: fly, sets: [one(10, 12)] }] });
    expect(defaultExerciseId()).toBe(fly);
  });

  it("is the first routine exercise when nothing is finished, else null", () => {
    expect(defaultExerciseId()).toBeNull();
    const bench = exercise("Bench");
    const fly = exercise("Fly");
    routine("Push", [bench, fly]);
    expect(defaultExerciseId()).toBe(bench);
  });
});


describe("exerciseProgress hero", () => {
  const PREV = 3; // Wed, 4 Nov
  const LAST = 11; // Thu, 12 Nov
  const lift = (exerciseId: number, ...rows: TestSet[]) => [{ exerciseId, sets: rows }];
  const heroOf = (id: number, unit: "kg" | "lb" = "kg") => exerciseProgress(id, unit)?.hero;

  it("shows the top set and 'up 2.5 kg' after a heavier workout", () => {
    const id = exercise("Barbell bench press");
    save({ day: PREV, lifts: lift(id, one(60, 8)) });
    save({ day: LAST, lifts: lift(id, one(62.5, 8)) });
    expect(heroOf(id)).toMatchObject({
      dateLabel: "Thu, 12 Nov",
      topSet: { text: "62.5 × 8", unit: "kg" },
      line: "Thu, 12 Nov · up 2.5 kg since 4 Nov",
    });
  });

  it("says 'down 2.5 kg' after a lighter workout, such as a Deload", () => {
    const id = exercise("Bench");
    save({ day: PREV, lifts: lift(id, one(62.5, 8)) });
    save({ day: LAST, lifts: lift(id, one(60, 8)) });
    expect(heroOf(id)?.line).toBe("Thu, 12 Nov · down 2.5 kg since 4 Nov");
  });

  it("says 'same as' for an equal top set", () => {
    const id = exercise("Bench");
    save({ day: PREV, lifts: lift(id, one(62.5, 8)) });
    save({ day: LAST, lifts: lift(id, one(62.5, 8)) });
    expect(heroOf(id)?.line).toBe("Thu, 12 Nov · same as 4 Nov");
  });

  it("counts reps when the weight is the same", () => {
    const id = exercise("Bench");
    save({ day: PREV, lifts: lift(id, one(62.5, 8)) });
    save({ day: LAST, lifts: lift(id, one(62.5, 10)) });
    expect(heroOf(id)?.line).toBe("Thu, 12 Nov · up 2 reps since 4 Nov");
  });

  it("says 'first workout' with no earlier workout", () => {
    const id = exercise("Bench");
    save({ day: LAST, lifts: lift(id, one(62.5, 8)) });
    expect(heroOf(id)?.line).toBe("Thu, 12 Nov · first workout");
  });

  it("compares a bodyweight exercise in reps and shows the top set as reps", () => {
    const id = exercise("Pull-up", "bodyweight");
    save({ day: PREV, lifts: lift(id, one(0, 9)) });
    save({ day: LAST, lifts: lift(id, one(0, 6), one(0, 10)) });
    expect(heroOf(id)).toMatchObject({ topSet: { text: "10 reps", unit: null }, line: "Thu, 12 Nov · up 1 rep since 4 Nov" });
  });

  it("picks the heaviest set, more reps on a tie, and ignores warm-up and unchecked sets", () => {
    const id = exercise("Bench");
    save({
      day: LAST,
      lifts: lift(id, one(100, 3, { warmup: true }), one(70, 3, { done: false }), one(62.5, 6), one(62.5, 8), one(60, 12)),
    });
    expect(heroOf(id)?.topSet.text).toBe("62.5 × 8");
  });

  it("ignores an open workout and a workout with no counted set when comparing", () => {
    const id = exercise("Bench");
    save({ day: 1, lifts: lift(id, one(50, 8)) });
    save({ day: 5, lifts: lift(id, one(90, 8, { done: false })) });
    save({ day: 7, inProgress: true, lifts: lift(id, one(100, 8)) });
    save({ day: LAST, lifts: lift(id, one(52.5, 8)) });
    expect(heroOf(id)?.line).toBe("Thu, 12 Nov · up 2.5 kg since 2 Nov");
  });

  it("compares a set in the other unit in kg and shows it with '≈'", () => {
    const id = exercise("Bench");
    save({ day: PREV, lifts: lift(id, one(60, 8)) });
    save({ day: LAST, lifts: lift(id, one(145, 8, { unit: "lb" })) }); // 65.77 kg
    expect(heroOf(id, "kg")).toMatchObject({
      topSet: { text: "≈65.8 × 8", unit: "kg" },
      line: "Thu, 12 Nov · up ≈5.8 kg since 4 Nov",
    });
  });

  it("shows the weight change in the current unit when both sets are in it", () => {
    const id = exercise("Bench");
    save({ day: PREV, lifts: lift(id, one(135, 8, { unit: "lb" })) });
    save({ day: LAST, lifts: lift(id, one(140, 8, { unit: "lb" })) });
    expect(heroOf(id, "lb")?.line).toBe("Thu, 12 Nov · up 5 lb since 4 Nov");
  });

  it("has no hero for an exercise with no finished workout, and null for an unknown id", () => {
    const id = exercise("Bench");
    expect(exerciseProgress(id, "kg")).toMatchObject({ exerciseId: id, name: "Bench", hero: null });
    expect(exerciseProgress(9999, "kg")).toBeNull();
  });
});

describe("exerciseProgress records and New", () => {
  const PREV = 3; // Wed, 4 Nov
  const LAST = 11; // Thu, 12 Nov
  const lift = (exerciseId: number, ...rows: TestSet[]) => [{ exerciseId, sets: rows }];

  it("tags only the Records the last workout set, and shows them as the board does", () => {
    const id = exercise("Barbell bench press");
    save({ day: PREV, lifts: lift(id, one(60, 8), one(60, 8), one(60, 8)) }); // volume 1440
    save({ day: LAST, lifts: lift(id, one(62.5, 8)) });
    const progress = exerciseProgress(id, "kg");
    expect(progress?.hero?.newRecord).toBe(true);
    expect(progress?.records).toEqual([
      { name: "Heaviest set", label: "Heaviest set", value: "62.5 × 8", dateLabel: "Thu, 12 Nov", isNew: true },
      { name: "1-rep max", label: "Estimated 1-rep max", value: "79 kg", dateLabel: "Thu, 12 Nov", isNew: true },
      { name: "Most volume", label: "Most volume", value: "1,440 kg", dateLabel: "Wed, 4 Nov", isNew: false },
    ]);
  });

  it("shows no New on a first workout", () => {
    const id = exercise("Bench");
    save({ day: LAST, lifts: lift(id, one(62.5, 8)) });
    const progress = exerciseProgress(id, "kg");
    expect(progress?.hero?.newRecord).toBe(false);
    expect(progress?.records?.map((r) => r.isNew)).toEqual([false, false, false]);
  });

  it("shows no New when the last workout equals the one before", () => {
    const id = exercise("Bench");
    save({ day: PREV, lifts: lift(id, one(62.5, 8)) });
    save({ day: LAST, lifts: lift(id, one(62.5, 8)) });
    const progress = exerciseProgress(id, "kg");
    expect(progress?.hero?.newRecord).toBe(false);
    expect(progress?.records?.map((r) => r.isNew)).toEqual([false, false, false]);
    // A tied best stays with the earliest workout.
    expect(progress?.records?.[0].dateLabel).toBe("Wed, 4 Nov");
  });

  it("shows the Records in the lifter's unit, with '≈' for a set logged in the other", () => {
    const id = exercise("Bench");
    save({ day: LAST, lifts: lift(id, one(135, 5, { unit: "lb" })) }); // 61.23 kg
    expect(exerciseProgress(id, "kg")?.records?.map((r) => r.value)).toEqual(["≈61.2 × 5", "71 kg", "306 kg"]);
  });

  it("leaves the 1-rep max empty when every counted set is above 12 reps", () => {
    const id = exercise("Bench");
    save({ day: LAST, lifts: lift(id, one(30, 15)) });
    const row = exerciseProgress(id, "kg")?.records?.[1];
    expect(row).toMatchObject({ name: "1-rep max", value: null, dateLabel: null, isNew: false });
  });

  it("has two Records for an exercise with no weight", () => {
    const id = exercise("Pull-up", "bodyweight");
    save({ day: PREV, lifts: lift(id, one(0, 9), one(0, 8)) });
    save({ day: LAST, lifts: lift(id, one(0, 10), one(0, 9), one(0, 9)) });
    expect(exerciseProgress(id, "kg")?.records).toEqual([
      { name: "Most reps in a set", label: "Most reps in a set", value: "10 reps", dateLabel: "Thu, 12 Nov", isNew: true },
      { name: "Most reps in a workout", label: "Most reps in a workout", value: "28 reps", dateLabel: "Thu, 12 Nov", isNew: true },
    ]);
  });

  it("has no Records for an exercise with no finished workout", () => {
    const id = exercise("Bench");
    expect(exerciseProgress(id, "kg")?.records).toBeNull();
  });
});
