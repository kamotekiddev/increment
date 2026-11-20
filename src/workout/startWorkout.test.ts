import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { DEFAULT_JUMPS_KG, effectiveJumps } from "@/settings";
import { readJumps } from "@/settings/jumpSetting";
import { readUnit, writeUnit } from "@/settings/unitSetting";
import { formatWeight } from "@/units";

import { finishWorkout, startWorkout } from "./workoutQueries";

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
    expect(startedTarget(startWorkout(earnedRoutine("dumbbell"), jumps, "kg"))).toEqual({ weightKg: 9, reps: 8 });
    expect(startedTarget(startWorkout(earnedRoutine("machine"), jumps, "kg"))).toEqual({ weightKg: 10, reps: 8 });
  });

  it("steps a weighted twin (weighted, equipment bodyweight) by the Bodyweight added weight Jump", () => {
    // 1 kg differs from every other Jump, so a twin that fell back to the Barbell Jump would step to 10 kg.
    const jumps = { ...DEFAULT_JUMPS_KG, bodyweight: 1 };
    expect(startedTarget(startWorkout(earnedRoutine("bodyweight"), jumps, "kg"))).toEqual({ weightKg: 9, reps: 8 });
  });
});

describe("startWorkout after a unit switch", () => {
  const LB = 0.45359237;

  /** A dumbbell routine with one finished Clean workout at a Target logged in `unit`, saved before Targets recorded their unit. */
  function dumbbellRoutine(weightKg: number, unit: "kg" | "lb"): { routineId: number; workoutExerciseId: number } {
    const exercise = db.insert(exercises).values({ name: "Hammer curl", equipment: "dumbbell", loadType: "weighted" }).returning().get();
    const routine = db.insert(routines).values({ name: "Arms" }).returning().get();
    db.insert(routineExercises)
      .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
      .run();
    const workout = db
      .insert(workouts)
      .values({ routineId: routine.id, startedAt: 1, finishedAt: 2, date: "2026-11-17", inProgress: false })
      .returning()
      .get();
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: weightKg, targetReps: 8 })
      .returning()
      .get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weightKg, enteredUnit: unit, reps: 8, done: true }).run();
    }
    return { routineId: routine.id, workoutExerciseId: we.id };
  }

  const start = (routineId: number) => startWorkout(routineId, effectiveJumps(readJumps(db), readUnit(db)), readUnit(db), new Date(2026, 10, 19));
  const startedUnit = (workoutId: number | null) =>
    db.select({ unit: workoutExercises.targetUnit }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId ?? -1)).get()?.unit;
  const startedSets = (workoutId: number | null) =>
    db
      .select({ id: sets.id, weightKg: sets.weightKg })
      .from(sets)
      .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
      .where(eq(workoutExercises.workoutId, workoutId ?? -1))
      .all();
  /** Checks every prefilled set in `unit` and finishes the workout. */
  function doAllAndFinish(workoutId: number, unit: "kg" | "lb") {
    for (const s of startedSets(workoutId)) db.update(sets).set({ done: true, enteredUnit: unit }).where(eq(sets.id, s.id)).run();
    finishWorkout(workoutId, new Date(2026, 10, 19, 1));
  }

  it("a 10 kg dumbbell Target started in kg shows 20 lb after switching to lb, with 20 lb prefilled sets", () => {
    const { routineId, workoutExerciseId } = dumbbellRoutine(10, "kg");
    writeUnit(db, "kg");
    const inKg = start(routineId)!;
    expect(startedTarget(inKg)).toEqual({ weightKg: 10, reps: 8 });
    expect(startedUnit(inKg)).toBe("kg");
    doAllAndFinish(inKg, "kg");

    writeUnit(db, "lb");
    const inLb = start(routineId);
    const target = startedTarget(inLb)!;
    expect(formatWeight(target.weightKg!, "lb")).toBe("20");
    expect(target.reps).toBe(8);
    expect(startedUnit(inLb)).toBe("lb");
    const prefilled = startedSets(inLb);
    expect(prefilled).toHaveLength(3);
    expect(prefilled.map((s) => formatWeight(s.weightKg, "lb"))).toEqual(["20", "20", "20"]);

    // Stored sets never change.
    const logged = db.select({ weightKg: sets.weightKg }).from(sets).where(eq(sets.workoutExerciseId, workoutExerciseId)).all();
    expect(logged.map((s) => s.weightKg)).toEqual([10, 10, 10]);
  });

  it("an old row with no stored unit falls back to its sets' unit: 135 lb (61.23 kg) started in kg is 62 kg on the 2 kg Dumbbell grid", () => {
    const { routineId } = dumbbellRoutine(135 * LB, "lb");
    writeUnit(db, "kg");
    expect(startedTarget(start(routineId))).toEqual({ weightKg: 62, reps: 8 });
  });

  it("never snaps because a Jump changed in the same unit: 10 kg stays 10 kg with a 4 kg Dumbbell Jump", () => {
    const { routineId } = dumbbellRoutine(10, "kg");
    writeUnit(db, "kg");
    expect(startedTarget(startWorkout(routineId, { ...DEFAULT_JUMPS_KG, dumbbell: 4 }, "kg"))).toEqual({ weightKg: 10, reps: 8 });
  });
});
