import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { DEFAULT_JUMPS_KG } from "@/settings";

import { startWorkout } from "./workoutQueries";

// startWorkout runs against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

/** A routine with one exercise and three finished Clean workouts at 8 kg × 8, the newest Offer accepted. */
function earnedRoutine(equipment: string): number {
  const exercise = db.insert(exercises).values({ name: `Lateral raise (${equipment})`, equipment, loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: equipment }).returning().get();
  db.insert(routineExercises)
    .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
    .run();
  ["2026-11-03", "2026-11-10", "2026-11-17"].forEach((date, i) => {
    const workout = db
      .insert(workouts)
      .values({ routineId: routine.id, startedAt: i + 1, finishedAt: i + 2, date, inProgress: false })
      .returning()
      .get();
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: 8, targetReps: 8, progressAccepted: i === 2 })
      .returning()
      .get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weightKg: 8, enteredUnit: "kg", reps: 8, done: true }).run();
    }
  });
  return routine.id;
}

function startedTarget(workoutId: number | null) {
  return db
    .select({ weightKg: workoutExercises.targetWeightKg, reps: workoutExercises.targetReps })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId ?? -1))
    .get();
}

describe("startWorkout", () => {
  it("steps each exercise by the Jump of its equipment", () => {
    const jumps = { ...DEFAULT_JUMPS_KG, dumbbell: 1 };
    expect(startedTarget(startWorkout(earnedRoutine("dumbbell"), jumps))).toEqual({ weightKg: 9, reps: 8 });
    expect(startedTarget(startWorkout(earnedRoutine("machine"), jumps))).toEqual({ weightKg: 10, reps: 8 });
  });

  it("steps a weighted twin (weighted, equipment bodyweight) by the Bodyweight added weight Jump", () => {
    // 1 kg differs from every other Jump, so a twin that fell back to the Barbell Jump would step to 10 kg.
    const jumps = { ...DEFAULT_JUMPS_KG, bodyweight: 1 };
    expect(startedTarget(startWorkout(earnedRoutine("bodyweight"), jumps))).toEqual({ weightKg: 9, reps: 8 });
  });
});
