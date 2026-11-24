import { eq } from "drizzle-orm";

import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { isRoutineLocked } from "@/routines/routineLimit";

import { FakeProStoreAdapter, ownedAnswer } from "../../test-support/fakeProStoreAdapter";
import type { Db } from "@/db/client";
import { createProStore } from "@/pro/proStore";
import { findInProgressWorkout } from "./inProgressQueries";
import { answerOffer, loadOffers } from "./summaryQueries";
import { finishWorkout, startWorkout } from "./workoutQueries";

// The queries run against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

/** Two older routines, then a third (past the 2 free) with three Clean 60 kg × 8 workouts. */
function thirdRoutineWithHistory(): number {
  db.insert(routines).values({ name: "Pull" }).run();
  db.insert(routines).values({ name: "Legs" }).run();
  const exercise = db.insert(exercises).values({ name: "Bench press", equipment: "barbell", loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: "Push" }).returning().get();
  db.insert(routineExercises)
    .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
    .run();
  ["2026-11-03", "2026-11-10", "2026-11-17"].forEach((date, i) => {
    const workout = db.insert(workouts).values({ routineId: routine.id, startedAt: i + 1, finishedAt: i + 2, date, inProgress: false }).returning().get();
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: 60, targetReps: 8 })
      .returning()
      .get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: 60, weightUnit: "kg", reps: 8, done: true }).run();
    }
  });
  return routine.id;
}

describe("a refund lands in the middle of a workout on a routine past the 2 oldest", () => {
  it("lets the lifter resume, finish, take the Offer and carry the accepted Target into the next workout", async () => {
    const routineId = thirdRoutineWithHistory();
    const adapter = new FakeProStoreAdapter();
    adapter.answer = ownedAnswer();
    const pro = createProStore(db, adapter);
    await pro.getState().refresh();
    expect(pro.getState().isPro).toBe(true);

    const workoutId = startWorkout(routineId, "kg", new Date(2026, 10, 24))!;
    const ids = db.select({ id: routines.id }).from(routines).all().map((r) => r.id);

    // The refund lands: the store no longer owns Pro, and the routine is Locked.
    adapter.answer = { kind: "not-owned" };
    await pro.getState().refresh();
    expect(pro.getState().isPro).toBe(false);
    expect(isRoutineLocked(routineId, ids, pro.getState().isPro)).toBe(true);

    // The in-progress bar still finds the workout, so Resume has something to open.
    expect(findInProgressWorkout()).toMatchObject({ id: workoutId, routineId, routineName: "Push" });

    // Sets, Finish, the Offer and Go up all work.
    const row = db.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).get()!;
    db.update(sets).set({ done: true, weight: 60, reps: 8 }).where(eq(sets.workoutExerciseId, row.id)).run();
    finishWorkout(workoutId, new Date(2026, 10, 24, 1));
    expect(findInProgressWorkout()).toBeNull();

    const [offer] = loadOffers(workoutId, "kg");
    expect(offer.stepped).toEqual({ weightKg: 62.5, reps: 8 });
    answerOffer(offer.workoutExerciseId, true, offer.stepped, "kg");

    // The routine is still Locked after the workout ends, and Go up wrote the Target through the accept path.
    expect(isRoutineLocked(routineId, ids, pro.getState().isPro)).toBe(true);
    const next = startWorkout(routineId, "kg", new Date(2026, 10, 25))!;
    const target = db
      .select({ weightKg: workoutExercises.targetWeightKg, reps: workoutExercises.targetReps })
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, next))
      .get();
    expect(target).toEqual({ weightKg: 62.5, reps: 8 });
  });
});
