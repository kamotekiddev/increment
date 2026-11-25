import type { Db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import { allRecords } from "./allRecordsQueries";
import { exerciseRecords, workoutRecordTags } from "./recordsQueries";

// The module reads the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

beforeEach(() => {
  db.delete(sets).run();
  db.delete(workoutExercises).run();
  db.delete(workouts).run();
  db.delete(routines).run();
  db.delete(exercises).run();
});

const DAY = 24 * 60 * 60_000;
const BASE = new Date(2026, 10, 1, 18).getTime();

function exercise(name: string, loadType: "weighted" | "bodyweight" = "weighted", muscles: string[] = ["chest"], isCustom = false): number {
  return db.insert(exercises).values({ name, equipment: "barbell", loadType, muscles, isCustom }).returning().get().id;
}

interface TestSet {
  w: number;
  r: number;
  unit?: "kg" | "lb";
  done?: boolean;
  warmup?: boolean;
}

function save(day: number, lifts: { exerciseId: number; sets: TestSet[] }[], inProgress = false): number {
  const startedAt = BASE + day * DAY;
  const date = `2026-11-${String(1 + day).padStart(2, "0")}`;
  const workout = db
    .insert(workouts)
    .values({ date, startedAt, finishedAt: inProgress ? null : startedAt + 45 * 60_000, inProgress })
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

describe("allRecords", () => {
  it("lists only exercises with a counted set, most recently done first", () => {
    const bench = exercise("Bench press");
    const squat = exercise("Back squat", "weighted", ["quadriceps"]);
    const unused = exercise("My lift", "weighted", ["back"], true);
    const warmupOnly = exercise("Warm-up only");
    exercise("Never done");
    save(0, [{ exerciseId: squat, sets: [{ w: 100, r: 5 }] }]);
    save(2, [
      { exerciseId: bench, sets: [{ w: 60, r: 8 }] },
      { exerciseId: warmupOnly, sets: [{ w: 20, r: 5, warmup: true }] },
      { exerciseId: unused, sets: [{ w: 30, r: 5, done: false }] },
    ]);
    save(3, [{ exerciseId: squat, sets: [{ w: 50, r: 5 }] }], true);

    const { exercises: list } = allRecords("kg");
    expect(list.map((e) => e.name)).toEqual(["Bench press", "Back squat"]);
    expect(list[0].muscleGroup).toBe("Chest");
    expect(list[1].muscleGroup).toBe("Legs");
  });

  it("returns the records in the current unit with their dates", () => {
    const bench = exercise("Bench press");
    save(0, [{ exerciseId: bench, sets: [{ w: 135, r: 5, unit: "lb" }] }]);
    const [row] = allRecords("kg").exercises;
    if (row.records.loadType !== "weighted") throw new Error("weighted");
    expect(row.records.heaviestSet).toEqual({ text: "≈61.2 × 5", date: "2026-11-01" });
    expect(row.records.mostVolume.value).toBe(Math.round((135 * 0.45359237) * 5));
    expect(row.lastDoneDate).toBe("2026-11-01");
  });

  it("flags New for records set in the exercise's last workout only", () => {
    const bench = exercise("Bench press");
    const squat = exercise("Back squat", "weighted", ["quadriceps"]);
    save(0, [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }, { exerciseId: squat, sets: [{ w: 100, r: 5 }] }]);
    save(2, [{ exerciseId: bench, sets: [{ w: 62.5, r: 8 }] }]);
    const result = allRecords("kg");
    const benchRow = result.exercises.find((e) => e.name === "Bench press")!;
    const squatRow = result.exercises.find((e) => e.name === "Back squat")!;
    expect(benchRow.newRecords).toEqual(["Heaviest set", "1-rep max", "Most volume"]);
    expect(squatRow.newRecords).toEqual([]);
  });

  it("totals the banner: records (an empty 1-rep max is not one) and new", () => {
    const bench = exercise("Bench press");
    const pushups = exercise("Push-up", "bodyweight", ["chest"]);
    const heavy = exercise("Heavy single set", "weighted", ["back"]);
    save(0, [
      { exerciseId: bench, sets: [{ w: 60, r: 8 }] },
      { exerciseId: pushups, sets: [{ w: 0, r: 20 }] },
      { exerciseId: heavy, sets: [{ w: 10, r: 15 }] },
    ]);
    save(1, [{ exerciseId: bench, sets: [{ w: 62.5, r: 8 }] }]);
    const result = allRecords("kg");
    // bench 3 + push-up 2 + heavy 2 (1-rep max has no value above 12 reps)
    expect(result.recordCount).toBe(7);
    expect(result.newCount).toBe(3);
  });

  it("lists two reps records for a bodyweight exercise", () => {
    const pushups = exercise("Push-up", "bodyweight");
    save(0, [{ exerciseId: pushups, sets: [{ w: 0, r: 20 }, { w: 0, r: 15 }] }]);
    const [row] = allRecords("kg").exercises;
    expect(row.records).toEqual({
      loadType: "bodyweight",
      mostRepsInSet: { value: 20, date: "2026-11-01" },
      mostRepsInWorkout: { value: 35, date: "2026-11-01" },
    });
  });

  it("returns nothing when nothing was trained", () => {
    exercise("Never done");
    expect(allRecords("kg")).toEqual({ exercises: [], recordCount: 0, newCount: 0 });
  });

  it("gives exercises that share one last workout the same Records and New pills as the per-exercise queries", () => {
    const bench = exercise("Bench press");
    const squat = exercise("Back squat", "weighted", ["quadriceps"]);
    const pullUp = exercise("Pull-up", "bodyweight", ["lats"]);
    save(0, [
      { exerciseId: bench, sets: [{ w: 60, r: 8 }] },
      { exerciseId: squat, sets: [{ w: 100, r: 5 }] },
      { exerciseId: pullUp, sets: [{ w: 0, r: 8 }] },
    ]);
    const last = save(3, [
      { exerciseId: bench, sets: [{ w: 62.5, r: 8 }] },
      { exerciseId: squat, sets: [{ w: 95, r: 5 }] },
      { exerciseId: pullUp, sets: [{ w: 0, r: 10 }] },
    ]);
    const result = allRecords("kg");
    expect(result.exercises).toHaveLength(3);
    const tags = workoutRecordTags(last);
    for (const e of result.exercises) {
      expect(e.records).toEqual(exerciseRecords(e.exerciseId, "kg"));
      const expected = db
        .select()
        .from(workoutExercises)
        .all()
        .filter((we) => we.workoutId === last && we.exerciseId === e.exerciseId)
        .flatMap((we) => tags[we.id] ?? []);
      expect(e.newRecords).toEqual(expected);
    }
    expect(result.exercises.find((e) => e.name === "Bench press")!.newRecords).toEqual(["Heaviest set", "1-rep max", "Most volume"]);
    expect(result.exercises.find((e) => e.name === "Back squat")!.newRecords).toEqual([]);
    expect(result.exercises.find((e) => e.name === "Pull-up")!.newRecords).toEqual(["Most reps in a set", "Most reps in a workout"]);
  });
});
