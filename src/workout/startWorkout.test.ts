import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { readUnit, writeUnit } from "@/settings/unitSetting";
import { formatWeight, kgIn, type Steps, type Unit } from "@/units";

import { discardWorkout, finishWorkout, startWorkout } from "./workoutQueries";

// startWorkout runs against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

/**
 * A routine with one exercise and three finished Clean workouts at `weightKg` × 8 (logged in kg), the newest Offer
 * accepted, and the routine exercise's saved steps.
 */
function earnedRoutine(steps: Steps, weightKg = 8, equipment = "dumbbell"): { routineId: number; routineExerciseId: number } {
  const exercise = db.insert(exercises).values({ name: `Lateral raise (${equipment})`, equipment, loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: `${equipment} ${exercise.id}` }).returning().get();
  const routineExercise = db
    .insert(routineExercises)
    .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted"), ...steps })
    .returning()
    .get();
  ["2026-11-03", "2026-11-10", "2026-11-17"].forEach((date, i) => {
    const workout = db
      .insert(workouts)
      .values({ routineId: routine.id, startedAt: i + 1, finishedAt: i + 2, date, inProgress: false })
      .returning()
      .get();
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: weightKg, targetReps: 8, targetUnit: "kg", progressAccepted: i === 2 })
      .returning()
      .get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: weightKg, weightUnit: "kg", reps: 8, done: true }).run();
    }
  });
  return { routineId: routine.id, routineExerciseId: routineExercise.id };
}

function startedTarget(workoutId: number | null) {
  return db
    .select({ weightKg: workoutExercises.targetWeightKg, reps: workoutExercises.targetReps })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId ?? -1))
    .get();
}

const untouched: Steps = { stepKg: null, stepLb: null };

describe("startWorkout steps by the routine exercise's step", () => {
  it("steps by the 2.5 kg default while no step is set, whatever the equipment: a dumbbell curl goes 10 kg to 12.5 kg (not 12 kg)", () => {
    expect(startedTarget(startWorkout(earnedRoutine(untouched, 10).routineId, "kg"))).toEqual({ weightKg: 12.5, reps: 8 });
    expect(startedTarget(startWorkout(earnedRoutine(untouched, 10, "machine").routineId, "kg"))).toEqual({ weightKg: 12.5, reps: 8 });
  });

  it("steps up from 60 kg with a saved 5 kg step to 65 kg", () => {
    expect(startedTarget(startWorkout(earnedRoutine({ stepKg: 5, stepLb: null }, 60, "barbell").routineId, "kg"))).toEqual({ weightKg: 65, reps: 8 });
  });

  it("ignores a saved kg step in lb: 60 kg with a 5 kg step, started in lb, rounds down to 130 lb and adds the 5 lb default", () => {
    const target = startedTarget(startWorkout(earnedRoutine({ stepKg: 5, stepLb: null }, 60, "barbell").routineId, "lb"));
    expect(formatWeight(target?.weightKg ?? 0, "lb")).toBe("135");
  });

  it("steps by the saved lb step in lb: 60 kg with a 2.5 lb step, started in lb, is 130 lb then 132.5 lb", () => {
    const target = startedTarget(startWorkout(earnedRoutine({ stepKg: 5, stepLb: 2.5 }, 60, "barbell").routineId, "lb"));
    expect(formatWeight(target?.weightKg ?? 0, "lb")).toBe("132.5");
  });

  it("switching unit 10 times, starting and discarding each time, leaves both steps unchanged", () => {
    const { routineId, routineExerciseId } = earnedRoutine({ stepKg: 1, stepLb: 2.5 });
    for (let i = 0; i < 10; i++) {
      writeUnit(db, i % 2 === 0 ? "lb" : "kg");
      const workoutId = startWorkout(routineId, readUnit(db));
      if (workoutId !== null) discardWorkout(workoutId);
    }
    expect(
      db.select({ stepKg: routineExercises.stepKg, stepLb: routineExercises.stepLb }).from(routineExercises).where(eq(routineExercises.id, routineExerciseId)).get(),
    ).toEqual({ stepKg: 1, stepLb: 2.5 });
  });
});

describe("startWorkout after a unit switch", () => {
  const LB = 0.45359237;

  /** A dumbbell routine with one finished Clean workout at a Target logged in `unit`, saved before Targets recorded their unit. */
  function dumbbellRoutine(weightKg: number, unit: "kg" | "lb", steps: Steps = untouched): { routineId: number; workoutExerciseId: number } {
    const exercise = db.insert(exercises).values({ name: "Hammer curl", equipment: "dumbbell", loadType: "weighted" }).returning().get();
    const routine = db.insert(routines).values({ name: "Arms" }).returning().get();
    db.insert(routineExercises)
      .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted"), ...steps })
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
      // Saved as typed: the Target as a number in the unit it was logged in.
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: kgIn(weightKg, unit), weightUnit: unit, reps: 8, done: true }).run();
    }
    return { routineId: routine.id, workoutExerciseId: we.id };
  }

  const start = (routineId: number) => startWorkout(routineId, readUnit(db), new Date(2026, 10, 19));
  const startedUnit = (workoutId: number | null) =>
    db.select({ unit: workoutExercises.targetUnit }).from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId ?? -1)).get()?.unit;
  const startedSets = (workoutId: number | null) =>
    db
      .select({ id: sets.id, weight: sets.weight, weightUnit: sets.weightUnit })
      .from(sets)
      .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
      .where(eq(workoutExercises.workoutId, workoutId ?? -1))
      .all();
  /** Checks every prefilled set as it was prefilled and finishes the workout. */
  function doAllAndFinish(workoutId: number) {
    for (const s of startedSets(workoutId)) db.update(sets).set({ done: true }).where(eq(sets.id, s.id)).run();
    finishWorkout(workoutId, new Date(2026, 10, 19, 1));
  }

  it("a 10 kg dumbbell Target started in kg shows 20 lb after switching to lb, with 20 lb prefilled sets", () => {
    const { routineId, workoutExerciseId } = dumbbellRoutine(10, "kg");
    writeUnit(db, "kg");
    const inKg = start(routineId)!;
    expect(startedTarget(inKg)).toEqual({ weightKg: 10, reps: 8 });
    expect(startedUnit(inKg)).toBe("kg");
    doAllAndFinish(inKg);

    writeUnit(db, "lb");
    const inLb = start(routineId);
    const target = startedTarget(inLb)!;
    expect(formatWeight(target.weightKg!, "lb")).toBe("20");
    expect(target.reps).toBe(8);
    expect(startedUnit(inLb)).toBe("lb");
    const prefilled = startedSets(inLb);
    expect(prefilled).toHaveLength(3);
    // Prefilled in lb, as a lb number: exactly 20, no float noise.
    expect(prefilled.map((s) => [s.weight, s.weightUnit])).toEqual([
      [20, "lb"],
      [20, "lb"],
      [20, "lb"],
    ]);

    // Stored sets never change.
    const logged = db.select({ weight: sets.weight, weightUnit: sets.weightUnit }).from(sets).where(eq(sets.workoutExerciseId, workoutExerciseId)).all();
    expect(logged).toEqual([
      { weight: 10, weightUnit: "kg" },
      { weight: 10, weightUnit: "kg" },
      { weight: 10, weightUnit: "kg" },
    ]);
  });

  it("a 62.5 kg Target set in kg, started in lb, pre-fills 135 lb (137.79 rounds down, not up to 140)", () => {
    const { routineId } = dumbbellRoutine(62.5, "kg");
    writeUnit(db, "kg");
    doAllAndFinish(start(routineId)!);
    writeUnit(db, "lb");
    const inLb = start(routineId);
    expect(formatWeight(startedTarget(inLb)!.weightKg!, "lb")).toBe("135");
    expect(startedSets(inLb).map((s) => [s.weight, s.weightUnit])).toEqual([
      [135, "lb"],
      [135, "lb"],
      [135, "lb"],
    ]);
  });

  it("an old row with no stored unit falls back to its sets' unit: 135 lb (61.23 kg) started in kg rounds down to 60 kg on a 2 kg step's grid", () => {
    const { routineId } = dumbbellRoutine(135 * LB, "lb", { stepKg: 2, stepLb: null });
    writeUnit(db, "kg");
    expect(startedTarget(start(routineId))).toEqual({ weightKg: 60, reps: 8 });
  });

  it("never snaps because the step changed in the same unit: 10 kg stays 10 kg with a 4 kg step", () => {
    const { routineId } = dumbbellRoutine(10, "kg", { stepKg: 4, stepLb: null });
    writeUnit(db, "kg");
    expect(startedTarget(startWorkout(routineId, "kg"))).toEqual({ weightKg: 10, reps: 8 });
  });
});

describe("startWorkout pre-fills a weight that can be loaded in the lifter's unit", () => {
  /** A barbell routine with one finished first workout (no Target), three sets of `weight` × 8 saved in `unit`. */
  function firstWorkout(weight: number, unit: Unit): number {
    const exercise = db.insert(exercises).values({ name: "Bench press", equipment: "barbell", loadType: "weighted" }).returning().get();
    const routine = db.insert(routines).values({ name: "Push" }).returning().get();
    db.insert(routineExercises)
      .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
      .run();
    const workout = db.insert(workouts).values({ routineId: routine.id, startedAt: 1, finishedAt: 2, date: "2026-11-17", inProgress: false }).returning().get();
    const we = db.insert(workoutExercises).values({ workoutId: workout.id, exerciseId: exercise.id, position: 0 }).returning().get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight, weightUnit: unit, reps: 8, done: true }).run();
    }
    return routine.id;
  }

  /** The first pre-filled set of a workout started in `unit` with no step set (2.5 kg, 5 lb). */
  function prefill(routineId: number, unit: Unit) {
    writeUnit(db, unit);
    const workoutId = startWorkout(routineId, unit, new Date(2026, 10, 21));
    return db
      .select({ weight: sets.weight, weightUnit: sets.weightUnit })
      .from(sets)
      .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
      .where(eq(workoutExercises.workoutId, workoutId ?? -1))
      .get();
  }

  it("last set 100 kg, lifter in lb, 5 lb step: pre-fill is 220 lb", () => {
    expect(prefill(firstWorkout(100, "kg"), "lb")).toEqual({ weight: 220, weightUnit: "lb" });
  });

  it("last set 62.5 kg, lifter in lb: pre-fill is 135 lb (137.79 rounds down, not up to 140)", () => {
    expect(prefill(firstWorkout(62.5, "kg"), "lb")).toEqual({ weight: 135, weightUnit: "lb" });
  });

  it("last set 60 kg, lifter in lb: pre-fill is 130 lb (132.28 rounds down to 130)", () => {
    expect(prefill(firstWorkout(60, "kg"), "lb")).toEqual({ weight: 130, weightUnit: "lb" });
  });

  it("last set 135 lb, lifter in kg, 2.5 kg step: pre-fill is 60 kg (61.23 rounds down to 60)", () => {
    expect(prefill(firstWorkout(135, "lb"), "kg")).toEqual({ weight: 60, weightUnit: "kg" });
  });

  it("last set in the lifter's own unit is pre-filled as is: 61.25 kg stays 61.25 kg", () => {
    expect(prefill(firstWorkout(61.25, "kg"), "kg")).toEqual({ weight: 61.25, weightUnit: "kg" });
  });
});

describe("startWorkout with Deload weeks on", () => {
  /** A barbell row with Deload every 2 weeks at 60%, and one finished workout at 60 kg × 8 on each of `dates`. */
  function deloadRoutine(dates: string[]): number {
    const exercise = db.insert(exercises).values({ name: "Barbell row", equipment: "barbell", loadType: "weighted" }).returning().get();
    const routine = db.insert(routines).values({ name: `Pull ${exercise.id}` }).returning().get();
    const rule = { ...defaultRule("weighted"), deload: { everyWeeks: 2, percent: 40 } };
    db.insert(routineExercises)
      .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule })
      .run();
    dates.forEach((date, i) => {
      const workout = db.insert(workouts).values({ routineId: routine.id, startedAt: i + 1, finishedAt: i + 2, date, inProgress: false }).returning().get();
      const we = db
        .insert(workoutExercises)
        .values({ workoutId: workout.id, exerciseId: exercise.id, position: 0, targetWeightKg: 60, targetReps: 8, targetUnit: "kg" })
        .returning()
        .get();
      for (let idx = 0; idx < 3; idx++) {
        db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: exercise.id, idx, weight: 60, weightUnit: "kg", reps: 8, done: true }).run();
      }
    });
    return routine.id;
  }

  const started = (workoutId: number | null) =>
    db
      .select({ weightKg: workoutExercises.targetWeightKg, isDeload: workoutExercises.isDeload })
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workoutId ?? -1))
      .get();

  it("marks the workout exercise as a Deload when one is due, at the lighter Target: 60 kg becomes 35 kg", () => {
    const routineId = deloadRoutine(["2026-11-09", "2026-11-16"]);
    expect(started(startWorkout(routineId, "kg", new Date(2026, 10, 19)))).toEqual({ weightKg: 35, isDeload: true });
  });

  it("does not mark a regular workout as a Deload", () => {
    const routineId = deloadRoutine(["2026-11-16"]);
    expect(started(startWorkout(routineId, "kg", new Date(2026, 10, 19)))).toEqual({ weightKg: 60, isDeload: false });
  });

  it("after the Deload is done, the next workout is back at 60 kg and not another Deload", () => {
    const routineId = deloadRoutine(["2026-11-09", "2026-11-16"]);
    const deloadId = startWorkout(routineId, "kg", new Date(2026, 10, 19))!;
    db.update(sets).set({ done: true }).where(eq(sets.workoutExerciseId, db.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, deloadId)).get()!.id)).run();
    finishWorkout(deloadId, new Date(2026, 10, 19, 1));
    expect(started(startWorkout(routineId, "kg", new Date(2026, 10, 21)))).toEqual({ weightKg: 60, isDeload: false });
  });
});
