import type { Db } from "@/db/client";
import { exercises, routineExercises, workouts } from "@/db/schema";
import { refreshReminders } from "@/reminders";
import { addRoutineExercise, createRoutine, deleteRoutine, removeRoutineExercise, renameRoutine, setRoutineDays } from "@/routines/routineQueries";
import { DEFAULT_SETUP } from "@/routines/routineSetup";

import { discardAndStartWorkout, discardWorkout, finishWorkout, startWorkout } from "./workoutQueries";

jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
jest.mock("@/reminders", () => ({ refreshReminders: jest.fn(() => Promise.resolve()) }));
const db: Db = jest.requireMock("@/db/client").db;
const refresh = refreshReminders as jest.Mock;

function routineWithExercise(): { routineId: number; exerciseId: number } {
  const exercise = db.insert(exercises).values({ name: "Row", equipment: "barbell", loadType: "weighted" }).returning().get();
  const routineId = createRoutine("Pull", 0b1);
  addRoutineExercise(routineId, exercise.id, "weighted", DEFAULT_SETUP);
  return { routineId, exerciseId: exercise.id };
}

describe("reminders stay in step", () => {
  beforeEach(() => refresh.mockClear());

  it("refreshes after a workout is started, not when the routine is empty", () => {
    const { routineId } = routineWithExercise();
    refresh.mockClear();
    expect(startWorkout(routineId, "kg")).not.toBeNull();
    expect(refresh).toHaveBeenCalledTimes(1);
    const empty = createRoutine("Empty", 0);
    refresh.mockClear();
    expect(startWorkout(empty, "kg")).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes after a discard, once the workout is gone", () => {
    const id = db.insert(workouts).values({ routineId: null, startedAt: 1, date: "2026-11-20", inProgress: true }).returning().get().id;
    let leftWhenCalled = -1;
    refresh.mockImplementationOnce(() => {
      leftWhenCalled = db.select().from(workouts).all().filter((w) => w.id === id).length;
      return Promise.resolve();
    });
    discardWorkout(id);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(leftWhenCalled).toBe(0);
  });

  it("refreshes when discarding and starting", () => {
    const { routineId } = routineWithExercise();
    const first = startWorkout(routineId, "kg")!;
    refresh.mockClear();
    discardAndStartWorkout(first, routineId, "kg");
    expect(refresh).toHaveBeenCalled();
  });

  it("does not refresh on finish", () => {
    const { routineId } = routineWithExercise();
    const id = startWorkout(routineId, "kg")!;
    refresh.mockClear();
    finishWorkout(id);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes on routine create, rename, days change and delete", async () => {
    const id = createRoutine("Push", 0);
    expect(refresh).toHaveBeenCalledTimes(1);
    await renameRoutine(id, "Push A");
    expect(refresh).toHaveBeenCalledTimes(2);
    await setRoutineDays(id, 0b101);
    expect(refresh).toHaveBeenCalledTimes(3);
    deleteRoutine(id);
    expect(refresh).toHaveBeenCalledTimes(4);
  });

  it("refreshes when an exercise is added or removed, not when the add is a duplicate", () => {
    const { routineId, exerciseId } = routineWithExercise();
    refresh.mockClear();
    expect(addRoutineExercise(routineId, exerciseId, "weighted", DEFAULT_SETUP)).toBe(false);
    expect(refresh).not.toHaveBeenCalled();
    const other = db.insert(exercises).values({ name: "Curl", equipment: "dumbbell", loadType: "weighted" }).returning().get();
    expect(addRoutineExercise(routineId, other.id, "weighted", DEFAULT_SETUP)).toBe(true);
    expect(refresh).toHaveBeenCalledTimes(1);
    const row = db.select().from(routineExercises).get();
    removeRoutineExercise(row!.id);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
