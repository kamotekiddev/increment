import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { workoutHistory } from "@/history/historyQueries";
import { createProStore } from "@/pro/proStore";
import { exerciseProgress, pickerExercises } from "@/progress/progressQueries";
import { refreshReminders } from "@/reminders";
import { addRoutineExercise, loadRoutineExercises } from "@/routines/routineQueries";
import { findInProgressWorkout } from "@/workout/inProgressQueries";
import { loadOffers } from "@/workout/summaryQueries";
import { finishWorkout, startWorkout } from "@/workout/workoutQueries";

import { FakeProStoreAdapter, ownedAnswer } from "../../test-support/fakeProStoreAdapter";
import { newExerciseRow } from "./customExerciseDraft";
import { saveButtonKind } from "./customExerciseGate";
import { exerciseNameRefs, insertCustomExercise } from "./customExerciseQueries";
import { deleteCustomExercise } from "./deleteCustomExercise";

jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
jest.mock("@/reminders", () => ({ refreshReminders: jest.fn(() => Promise.resolve()) }));
const db: Db = jest.requireMock("@/db/client").db;

const SETUP = { sets: 3, repMin: 8, repMax: 10, restS: 90 };

/** Starts and finishes one workout of the routine per day, every set done at 40 kg × 8. */
function doWorkouts(routineId: number, days: number[]) {
  for (const day of days) {
    const id = startWorkout(routineId, "kg", new Date(2026, 10, day))!;
    const we = db.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, id)).get()!;
    db.update(sets).set({ done: true, weight: 40, reps: 8 }).where(eq(sets.workoutExerciseId, we.id)).run();
    finishWorkout(id, new Date(2026, 10, day, 1));
  }
}

/** A custom exercise in a routine with three finished workouts (40 kg × 8); Pro was owned, then refunded. */
async function freeLifterWithCustomExercise() {
  const adapter = new FakeProStoreAdapter();
  adapter.answer = ownedAnswer();
  const pro = createProStore(db, adapter);
  await pro.getState().refresh();
  expect(pro.getState().isPro).toBe(true);

  const exerciseId = insertCustomExercise(db, newExerciseRow({ name: "Landmine press", group: "Shoulders", equipment: "Barbell", steps: [] }));
  const routine = db.insert(routines).values({ name: "Push", days: 1 }).returning().get();
  expect(addRoutineExercise(routine.id, exerciseId, "weighted", SETUP)).toBe(true);
  doWorkouts(routine.id, [3, 10, 17]);

  // The refund lands.
  adapter.answer = { kind: "not-owned" };
  await pro.getState().refresh();
  expect(pro.getState().isPro).toBe(false);
  return { pro, exerciseId, routineId: routine.id };
}

describe("custom exercises after a refund", () => {
  beforeEach(() => {
    // Every test starts from an empty app (the library seed is not needed here); sets, workout exercises and routine exercises cascade.
    db.delete(routines).run();
    db.delete(workouts).run();
    db.delete(exercises).run();
  });

  it("keeps working everywhere with Pro off, and the save button is Unlock Pro", async () => {
    const { pro, exerciseId, routineId } = await freeLifterWithCustomExercise();
    const rowsBefore = db.select().from(exercises).all().length;

    // The gate: Unlock Pro for a free lifter; the dev source Pro flips it, Free flips it back.
    expect(saveButtonKind(pro.getState().isPro)).toBe("unlock");
    pro.getState().setSource("pro");
    expect(saveButtonKind(pro.getState().isPro)).toBe("save");
    pro.getState().setSource("free");
    expect(saveButtonKind(pro.getState().isPro)).toBe("unlock");
    pro.getState().setSource("store");

    // Library and the name check still see it.
    expect(db.select().from(exercises).where(eq(exercises.id, exerciseId)).get()).toMatchObject({ name: "Landmine press", isCustom: true });
    expect(exerciseNameRefs(db).some((e) => e.name === "Landmine press")).toBe(true);

    // The routine picker can add it to another routine.
    const other = db.insert(routines).values({ name: "Shoulders", days: 2 }).returning().get();
    expect(addRoutineExercise(other.id, exerciseId, "weighted", SETUP)).toBe(true);
    expect((await loadRoutineExercises(other.id)).map((r) => r.exerciseId)).toEqual([exerciseId]);

    // Progress picker, hero and Records.
    expect(pickerExercises().map((e) => e.name)).toContain("Landmine press");
    const progress = exerciseProgress(exerciseId, "kg")!;
    expect(progress.name).toBe("Landmine press");
    expect(progress.hero).not.toBeNull();

    // Workout history keeps it.
    expect(workoutHistory().flatMap((s) => s.data)).toHaveLength(3);

    // A routine with it starts and finishes, with the Target carried over and an Offer.
    const id = startWorkout(routineId, "kg", new Date(2026, 10, 24))!;
    const we = db.select().from(workoutExercises).where(eq(workoutExercises.workoutId, id)).get()!;
    expect(we).toMatchObject({ exerciseId, targetWeightKg: 40, targetReps: 8 });
    db.update(sets).set({ done: true, weight: 40, reps: 8 }).where(eq(sets.workoutExerciseId, we.id)).run();
    finishWorkout(id, new Date(2026, 10, 24, 1));
    expect(findInProgressWorkout()).toBeNull();
    expect(loadOffers(id, "kg")).toHaveLength(1);

    // Nothing above created an exercise.
    expect(db.select().from(exercises).all().length).toBe(rowsBefore);
  });

  it("still deletes, with its history", async () => {
    const { exerciseId } = await freeLifterWithCustomExercise();
    expect(deleteCustomExercise(db, exerciseId)).toBe("deleted");
    expect(db.select().from(exercises).where(eq(exercises.id, exerciseId)).get()).toBeUndefined();
    expect(db.select().from(routineExercises).where(eq(routineExercises.exerciseId, exerciseId)).all()).toEqual([]);
    expect(workoutHistory()).toEqual([]);
    expect(refreshReminders).toHaveBeenCalled();
  });

  it("never costs a workout with a custom exercise in it when the refund lands mid-workout", async () => {
    const adapter = new FakeProStoreAdapter();
    adapter.answer = ownedAnswer();
    const pro = createProStore(db, adapter);
    await pro.getState().refresh();

    const exerciseId = insertCustomExercise(db, newExerciseRow({ name: "Sled push", group: "Legs", equipment: "Other", steps: [] }));
    const routine = db.insert(routines).values({ name: "Conditioning", days: 4 }).returning().get();
    addRoutineExercise(routine.id, exerciseId, "weighted", SETUP);
    doWorkouts(routine.id, [3, 10, 17]);
    const workoutId = startWorkout(routine.id, "kg", new Date(2026, 10, 24))!;

    adapter.answer = { kind: "not-owned" };
    await pro.getState().refresh();
    expect(pro.getState().isPro).toBe(false);

    expect(findInProgressWorkout()).toMatchObject({ id: workoutId, routineId: routine.id });
    const we = db.select().from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).get()!;
    db.update(sets).set({ done: true, weight: 40, reps: 8 }).where(eq(sets.workoutExerciseId, we.id)).run();
    finishWorkout(workoutId, new Date(2026, 10, 24, 1));
    expect(findInProgressWorkout()).toBeNull();
    const [offer] = loadOffers(workoutId, "kg");
    expect(offer.stepped).toEqual({ weightKg: 42.5, reps: 8 });
  });
});
