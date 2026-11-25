import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { workoutHistory } from "@/history/historyQueries";
import { pickerExercises } from "@/progress/progressQueries";
import { refreshReminders } from "@/reminders";
import { loadRoutineExercises, loadRoutines } from "@/routines/routineQueries";
import { findFinishedThisWeek } from "@/today/todayQueries";

import { newExerciseRow } from "./customExerciseDraft";
import { validateExerciseName } from "./customExerciseName";
import { exerciseNameRefs, insertCustomExercise } from "./customExerciseQueries";
import { deleteCustomExercise, exerciseDeleteInfo } from "./deleteCustomExercise";

jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
jest.mock("@/reminders", () => ({ refreshReminders: jest.fn(() => Promise.resolve()) }));
const db: Db = jest.requireMock("@/db/client").db;
const refresh = refreshReminders as jest.Mock;

const rule = { v: 1, step: "weight", repStep: 1, sessionsToEarn: 2 } as never;

function routineWith(name: string, position: number, exerciseIds: number[]) {
  const routine = db.insert(routines).values({ name, days: 1, position }).returning().get();
  exerciseIds.forEach((exerciseId, i) =>
    db.insert(routineExercises).values({ routineId: routine.id, exerciseId, position: i, sets: 3, repMin: 8, repMax: 10, restS: 60, rule }).run(),
  );
  return routine;
}

/** One workout with a done set per exercise. */
function workoutWith(exerciseIds: number[], opts: { inProgress?: boolean; routineId?: number } = {}) {
  const startedAt = Date.now();
  const workout = db
    .insert(workouts)
    .values({
      routineId: opts.routineId ?? null,
      startedAt,
      finishedAt: opts.inProgress ? null : startedAt + 60_000,
      date: "2026-11-20",
      inProgress: opts.inProgress ?? false,
    })
    .returning()
    .get();
  exerciseIds.forEach((exerciseId, position) => {
    const we = db.insert(workoutExercises).values({ workoutId: workout.id, exerciseId, position }).returning().get();
    db.insert(sets).values({ workoutExerciseId: we.id, exerciseId, idx: 0, weight: 40, weightUnit: "kg", reps: 8, done: true }).run();
  });
  return workout;
}

function seed() {
  const custom = insertCustomExercise(db, newExerciseRow({ name: "Ring rows", group: "Back", equipment: "barbell", steps: [] }));
  const bench = db.insert(exercises).values({ slug: "bench", name: "Bench press", equipment: "barbell", loadType: "weighted" }).returning().get();
  const squat = db.insert(exercises).values({ slug: "squat", name: "Squat", equipment: "barbell", loadType: "weighted" }).returning().get();
  return { custom, bench: bench.id, squat: squat.id };
}

beforeEach(() => {
  db.delete(sets).run();
  db.delete(workoutExercises).run();
  db.delete(workouts).run();
  db.delete(routineExercises).run();
  db.delete(routines).run();
  db.delete(exercises).run();
  refresh.mockClear();
});

describe("exerciseDeleteInfo", () => {
  it("names the routines it is in, in routine order, and counts finished workouts", () => {
    const { custom, bench } = seed();
    routineWith("Pull day B", 1, [custom]);
    routineWith("Push day A", 0, [bench, custom]);
    workoutWith([custom, bench]);
    workoutWith([custom]);
    workoutWith([bench]);
    expect(exerciseDeleteInfo(db, custom)).toEqual({ routineNames: ["Push day A", "Pull day B"], workoutCount: 2, inProgress: false });
  });

  it("is empty for an exercise nowhere", () => {
    const { custom } = seed();
    expect(exerciseDeleteInfo(db, custom)).toEqual({ routineNames: [], workoutCount: 0, inProgress: false });
  });

  it("flags a Workout in progress that has it, and does not count that workout as history", () => {
    const { custom, bench } = seed();
    workoutWith([custom], { inProgress: true });
    expect(exerciseDeleteInfo(db, custom)).toMatchObject({ inProgress: true, workoutCount: 0 });
    expect(exerciseDeleteInfo(db, bench).inProgress).toBe(false);
  });
});

describe("deleteCustomExercise", () => {
  it("deletes the exercise, its routine exercises, workout exercises and sets", () => {
    const { custom, bench } = seed();
    routineWith("Push", 0, [custom, bench]);
    workoutWith([custom, bench]);
    expect(deleteCustomExercise(db, custom)).toBe("deleted");
    expect(db.select().from(exercises).where(eq(exercises.id, custom)).all()).toEqual([]);
    expect(db.select().from(routineExercises).all().map((r) => r.exerciseId)).toEqual([bench]);
    expect(db.select().from(workoutExercises).all().map((r) => r.exerciseId)).toEqual([bench]);
    expect(db.select().from(sets).all().map((r) => r.exerciseId)).toEqual([bench]);
  });

  it("keeps a workout that still has other exercises, and deletes one left with none", () => {
    const { custom, bench } = seed();
    const keeps = workoutWith([custom, bench]);
    const empties = workoutWith([custom]);
    const untouched = workoutWith([bench]);
    deleteCustomExercise(db, custom);
    expect(db.select().from(workouts).all().map((w) => w.id).sort()).toEqual([keeps.id, untouched.id].sort());
    expect(db.select().from(workouts).where(eq(workouts.id, empties.id)).all()).toEqual([]);
  });

  it("leaves a workout in progress that has no exercise rows alone", () => {
    const { custom } = seed();
    const bare = db.insert(workouts).values({ startedAt: 1, date: "2026-11-20", inProgress: true }).returning().get();
    expect(deleteCustomExercise(db, custom)).toBe("deleted");
    expect(db.select().from(workouts).where(eq(workouts.id, bare.id)).all()).toHaveLength(1);
  });

  it("renumbers the routine exercises left so the order has no gap", () => {
    const { custom, bench, squat } = seed();
    const routine = routineWith("Legs", 0, [bench, custom, squat]);
    deleteCustomExercise(db, custom);
    const rows = db.select().from(routineExercises).where(eq(routineExercises.routineId, routine.id)).orderBy(routineExercises.position).all();
    expect(rows.map((r) => [r.exerciseId, r.position])).toEqual([[bench, 0], [squat, 1]]);
  });

  it("leaves a routine with no exercises in place", () => {
    const { custom } = seed();
    const routine = routineWith("Solo", 0, [custom]);
    deleteCustomExercise(db, custom);
    expect(db.select().from(routines).where(eq(routines.id, routine.id)).all()).toHaveLength(1);
  });

  it("is blocked while the exercise is in the Workout in progress: nothing changes", () => {
    const { custom } = seed();
    routineWith("Push", 0, [custom]);
    workoutWith([custom], { inProgress: true });
    expect(deleteCustomExercise(db, custom)).toBe("in-progress");
    expect(db.select().from(exercises).where(eq(exercises.id, custom)).all()).toHaveLength(1);
    expect(db.select().from(sets).all()).toHaveLength(1);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("never deletes a library exercise", () => {
    const { bench } = seed();
    expect(deleteCustomExercise(db, bench)).toBe("not-custom");
    expect(db.select().from(exercises).where(eq(exercises.id, bench)).all()).toHaveLength(1);
  });

  it("frees the name for reuse, and the new exercise starts with no history", () => {
    const { custom } = seed();
    workoutWith([custom]);
    deleteCustomExercise(db, custom);
    expect(validateExerciseName("ring rows", exerciseNameRefs(db)).ok).toBe(true);
    const again = insertCustomExercise(db, newExerciseRow({ name: "Ring rows", group: "Back", equipment: "barbell", steps: [] }));
    expect(again).not.toBe(custom);
    expect(exerciseDeleteInfo(db, again)).toEqual({ routineNames: [], workoutCount: 0, inProgress: false });
  });

  it("refreshes reminders once, after the delete is committed", () => {
    const { custom } = seed();
    routineWith("Push", 0, [custom]);
    let leftWhenCalled = -1;
    refresh.mockImplementationOnce(() => {
      leftWhenCalled = db.select().from(routineExercises).all().length;
      return Promise.resolve();
    });
    deleteCustomExercise(db, custom);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(leftWhenCalled).toBe(0);
  });
});

describe("what the screens read afterwards", () => {
  it("routine list, routine exercises, history, Today, Progress and the pickers no longer see it", async () => {
    const { custom, bench } = seed();
    const routine = routineWith("Push", 0, [custom, bench]);
    const emptied = workoutWith([custom], { routineId: routine.id });
    const kept = workoutWith([custom, bench], { routineId: routine.id });
    expect(findFinishedThisWeek(Date.now())).toHaveLength(2);
    expect(workoutHistory().flatMap((s) => s.data)).toHaveLength(2);
    expect(pickerExercises().map((p) => p.exerciseId)).toContain(custom);
    expect((await loadRoutines())[0].exerciseCount).toBe(2);

    deleteCustomExercise(db, custom);

    expect((await loadRoutines())[0].exerciseCount).toBe(1);
    expect((await loadRoutineExercises(routine.id)).map((r) => r.exerciseId)).toEqual([bench]);
    expect(findFinishedThisWeek(Date.now())).toHaveLength(1);
    const history = workoutHistory().flatMap((s) => s.data).map((r) => r.workoutId);
    expect(history).toEqual([kept.id]);
    expect(history).not.toContain(emptied.id);
    expect(pickerExercises().map((p) => p.exerciseId)).not.toContain(custom);
  });
});
