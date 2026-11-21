import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";

import { answerOffer, loadOffers, loadSummary } from "./summaryQueries";
import { finishWorkout, startWorkout } from "./workoutQueries";

// The queries run against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

/** The lifter changes the routine exercise's kg Jump (ticket 03's panel; written directly here). */
function setKgStep(routineExerciseId: number, stepKg: number) {
  db.update(routineExercises).set({ stepKg }).where(eq(routineExercises.id, routineExerciseId)).run();
}

/** A barbell routine with three finished Clean workouts at 60 kg × 8. Returns the routine, its exercise and the newest workout. */
function earnedBarbellRoutine(newest: { progressAccepted?: boolean } = {}): { routineId: number; routineExerciseId: number; workoutId: number } {
  const exercise = db.insert(exercises).values({ name: "Bench press", equipment: "barbell", loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: "Push" }).returning().get();
  const routineExerciseId = db
    .insert(routineExercises)
    .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
    .returning()
    .get().id;
  let workoutId = -1;
  ["2026-11-03", "2026-11-10", "2026-11-17"].forEach((date, i) => {
    const workout = db
      .insert(workouts)
      .values({ routineId: routine.id, startedAt: i + 1, finishedAt: i + 2, date, inProgress: false })
      .returning()
      .get();
    const we = db
      .insert(workoutExercises)
      .values({
        workoutId: workout.id,
        exerciseId: exercise.id,
        position: 0,
        targetWeightKg: 60,
        targetReps: 8,
        progressAccepted: i === 2 && (newest.progressAccepted ?? false),
      })
      .returning()
      .get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: 60, weightUnit: "kg", reps: 8, done: true }).run();
    }
    workoutId = workout.id;
  });
  return { routineId: routine.id, routineExerciseId, workoutId };
}

function startedTarget(workoutId: number | null) {
  return db
    .select({ weightKg: workoutExercises.targetWeightKg, reps: workoutExercises.targetReps })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId ?? -1))
    .get();
}

/** Taps Go up on the workout's only Offer, as the Offer screen does, with the step of that moment (the 2.5 kg default). */
function goUp(workoutId: number) {
  const [offer] = loadOffers(workoutId, "kg");
  expect(offer.stepped).toEqual({ weightKg: 62.5, reps: 8 });
  answerOffer(offer.workoutExerciseId, true, offer.stepped, "kg");
}

describe("an accepted Offer answered in lb", () => {
  const LB = 0.45359237;
  const inLb = (kg: number) => Number((kg / LB).toFixed(2));

  /** A barbell routine with two finished Clean workouts at a 62.5 kg × 8 Target set in kg. */
  function twoCleanAt62(): number {
    const exercise = db.insert(exercises).values({ name: "Squat", equipment: "barbell", loadType: "weighted" }).returning().get();
    const routine = db.insert(routines).values({ name: "Legs" }).returning().get();
    db.insert(routineExercises)
      .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
      .run();
    ["2026-11-03", "2026-11-10"].forEach((date, i) => {
      const workout = db.insert(workouts).values({ routineId: routine.id, startedAt: i + 1, finishedAt: i + 2, date, inProgress: false }).returning().get();
      const we = db
        .insert(workoutExercises)
        .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: 62.5, targetReps: 8, targetUnit: "kg" })
        .returning()
        .get();
      for (let idx = 0; idx < 3; idx++) {
        db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: 62.5, weightUnit: "kg", reps: 8, done: true }).run();
      }
    });
    return routine.id;
  }

  it("Go up at 140 lb after a mid-workout switch to lb starts back in kg rounded down to the kg grid at 62.5 kg, never 63.5 kg", () => {
    const routineId = twoCleanAt62();
    const workoutId = startWorkout(routineId, "kg", new Date(2026, 10, 17))!;
    expect(startedTarget(workoutId)).toEqual({ weightKg: 62.5, reps: 8 });

    // Switch to lb during the workout: every untouched 62.5 kg row shows as 135 lb, rounded down to the 5 lb grid, and is checked as that, then Finish.
    const started = db.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).get()!;
    db.update(sets).set({ done: true, weight: 135, weightUnit: "lb" }).where(eq(sets.workoutExerciseId, started.id)).run();
    finishWorkout(workoutId, new Date(2026, 10, 17, 1));

    const [offer] = loadOffers(workoutId, "lb");
    expect([inLb(offer.current.weightKg), inLb(offer.stepped.weightKg)]).toEqual([135, 140]);
    answerOffer(offer.workoutExerciseId, true, offer.stepped, "lb");

    const next = startedTarget(startWorkout(routineId, "kg", new Date(2026, 10, 24)));
    expect(next).toEqual({ weightKg: 62.5, reps: 8 });
  });
});

describe("an accepted Offer keeps the Target it showed", () => {
  it("starts the next workout at the accepted 62.5 kg after the routine exercise's Jump changes to 5 kg", () => {
    const { routineId, routineExerciseId, workoutId } = earnedBarbellRoutine();
    goUp(workoutId);
    setKgStep(routineExerciseId, 5);
    expect(startedTarget(startWorkout(routineId, "kg"))).toEqual({ weightKg: 62.5, reps: 8 });
  });

  it("shows the accepted 62.5 kg as the summary's next Target after the step changes", () => {
    const { routineExerciseId, workoutId } = earnedBarbellRoutine();
    goUp(workoutId);
    setKgStep(routineExerciseId, 5);
    expect(loadSummary(workoutId, "kg")?.summary.cards[0].next).toEqual({ weightKg: 62.5, reps: 8 });
  });

  it("recomputes with the current step for an accepted row saved before the Target was stored", () => {
    const { routineId, routineExerciseId } = earnedBarbellRoutine({ progressAccepted: true });
    setKgStep(routineExerciseId, 5);
    expect(startedTarget(startWorkout(routineId, "kg"))).toEqual({ weightKg: 65, reps: 8 });
  });
});
