import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { DEFAULT_JUMPS_KG } from "@/settings/jumps";

import { answerOffer, loadOffers, loadSummary } from "./summaryQueries";
import { startWorkout } from "./workoutQueries";

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
  answerOffer(offer.workoutExerciseId, true, offer.stepped);
}

describe("an accepted Offer keeps the Target it showed", () => {
  it("starts the next workout at the accepted 62.5 kg after the Barbell Jump changes to 5 kg", () => {
    const { routineId, workoutId } = earnedBarbellRoutine();
    goUp(workoutId);
    expect(startedTarget(startWorkout(routineId, fiveKgBarbell))).toEqual({ weightKg: 62.5, reps: 8 });
  });

  it("shows the accepted 62.5 kg as the summary's next Target after the Jump changes", () => {
    const { workoutId } = earnedBarbellRoutine();
    goUp(workoutId);
    expect(loadSummary(workoutId, "kg", fiveKgBarbell)?.summary.cards[0].next).toEqual({ weightKg: 62.5, reps: 8 });
  });

  it("recomputes with the current Jump for an accepted row saved before the Target was stored", () => {
    const { routineId } = earnedBarbellRoutine({ progressAccepted: true });
    expect(startedTarget(startWorkout(routineId, fiveKgBarbell))).toEqual({ weightKg: 65, reps: 8 });
  });
});
