import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { DEFAULT_JUMPS_KG, effectiveJumps, UNTOUCHED_JUMPS } from "@/settings";

import { answerOffer, loadOffers, loadSummary } from "./summaryQueries";
import { finishWorkout, startWorkout } from "./workoutQueries";

// The queries run against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

const fiveKgBarbell = { ...DEFAULT_JUMPS_KG, barbell: 5 };

/** A barbell routine with three finished Clean workouts at 60 kg × 8. Returns the routine and the newest workout. */
function earnedBarbellRoutine(newest: { progressAccepted?: boolean } = {}): { routineId: number; workoutId: number } {
  const exercise = db.insert(exercises).values({ name: "Bench press", equipment: "barbell", loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: "Push" }).returning().get();
  db.insert(routineExercises)
    .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
    .run();
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
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weightKg: 60, enteredUnit: "kg", reps: 8, done: true }).run();
    }
    workoutId = workout.id;
  });
  return { routineId: routine.id, workoutId };
}

function startedTarget(workoutId: number | null) {
  return db
    .select({ weightKg: workoutExercises.targetWeightKg, reps: workoutExercises.targetReps })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId ?? -1))
    .get();
}

/** Taps Go up on the workout's only Offer, as the Offer screen does, with the Jumps of that moment. */
function goUp(workoutId: number) {
  const [offer] = loadOffers(workoutId, "kg", DEFAULT_JUMPS_KG);
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
        db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weightKg: 62.5, enteredUnit: "kg", reps: 8, done: true }).run();
      }
    });
    return routine.id;
  }

  it("Go up at 145 lb after a mid-workout switch to lb starts back in kg on the kg grid at 65 kg, never 65.77 kg", () => {
    const routineId = twoCleanAt62();
    const workoutId = startWorkout(routineId, DEFAULT_JUMPS_KG, "kg", new Date(2026, 10, 17))!;
    expect(startedTarget(workoutId)).toEqual({ weightKg: 62.5, reps: 8 });

    // Switch to lb during the workout: every set is checked in lb, then Finish.
    const started = db.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).get()!;
    db.update(sets).set({ done: true, enteredUnit: "lb" }).where(eq(sets.workoutExerciseId, started.id)).run();
    finishWorkout(workoutId, new Date(2026, 10, 17, 1));

    const lbJumps = effectiveJumps(UNTOUCHED_JUMPS, "lb");
    const [offer] = loadOffers(workoutId, "lb", lbJumps);
    expect([inLb(offer.current.weightKg), inLb(offer.stepped.weightKg)]).toEqual([140, 145]);
    answerOffer(offer.workoutExerciseId, true, offer.stepped, "lb");

    const next = startedTarget(startWorkout(routineId, DEFAULT_JUMPS_KG, "kg", new Date(2026, 10, 24)));
    expect(next).toEqual({ weightKg: 65, reps: 8 });
  });
});

describe("an accepted Offer keeps the Target it showed", () => {
  it("starts the next workout at the accepted 62.5 kg after the Barbell Jump changes to 5 kg", () => {
    const { routineId, workoutId } = earnedBarbellRoutine();
    goUp(workoutId);
    expect(startedTarget(startWorkout(routineId, fiveKgBarbell, "kg"))).toEqual({ weightKg: 62.5, reps: 8 });
  });

  it("shows the accepted 62.5 kg as the summary's next Target after the Jump changes", () => {
    const { workoutId } = earnedBarbellRoutine();
    goUp(workoutId);
    expect(loadSummary(workoutId, "kg", fiveKgBarbell)?.summary.cards[0].next).toEqual({ weightKg: 62.5, reps: 8 });
  });

  it("recomputes with the current Jump for an accepted row saved before the Target was stored", () => {
    const { routineId } = earnedBarbellRoutine({ progressAccepted: true });
    expect(startedTarget(startWorkout(routineId, fiveKgBarbell, "kg"))).toEqual({ weightKg: 65, reps: 8 });
  });
});
