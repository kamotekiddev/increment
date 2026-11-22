import type { Db } from "@/db/client";
import { exercises, routines } from "@/db/schema";
import { defaultRule, nextTarget, type HistorySession } from "@/engine";
import { session } from "@/engine/testing";
import { KG_PER_LB, jumpIn, jumpKgFor, jumpPatch } from "@/units";

import { addRoutineExercise, loadRoutineExercises, updateRoutineExercise } from "./routineQueries";
import { withChoices } from "./ruleChoices";

// The queries run against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

const curlSetup = { sets: 3, repMin: 10, repMax: 12, restS: 60 };

/** A Curls routine; returns its id and the curl exercise id. */
function curlRoutine(): { routineId: number; exerciseId: number } {
  const exercise = db.insert(exercises).values({ name: "Dumbbell curl", equipment: "dumbbell", loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: "Arms" }).returning().get();
  return { routineId: routine.id, exerciseId: exercise.id };
}

/** Three clean workouts in a row at 12 kg × 12: progression is Earned. */
const earnedAt12: HistorySession[] = ["2026-11-18", "2026-11-16", "2026-11-14"].map((d) => session(d, { weightKg: 12, reps: 12 }, [12, 12, 12]));

describe("saving Add each time on a routine exercise", () => {
  it("adds a curl with a 2 kg step in kg: kg steps by 2 kg, lb keeps its own 5 lb default", async () => {
    const { routineId, exerciseId } = curlRoutine();
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup, jumpPatch("kg", 2));
    const [curl] = await loadRoutineExercises(routineId);
    expect([curl.stepKg, curl.stepLb]).toEqual([2, null]);

    const planned = { sets: 3, repMin: 10, repMax: 12 };
    const inKg = nextTarget({ rule: curl.rule, planned, loadType: "weighted", history: earnedAt12, jumpKg: jumpKgFor(curl, "kg"), unit: "kg" });
    expect(inKg.proposal).toEqual({ weightKg: 14, reps: 12 });
    expect(jumpIn(curl, "lb")).toBe(5);
    expect(jumpIn(curl, "kg")).toBe(2);
  });

  it("adds with no step saved when the panel was not used: both steps stay null (2.5 kg / 5 lb)", async () => {
    const { routineId, exerciseId } = curlRoutine();
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup);
    const [curl] = await loadRoutineExercises(routineId);
    expect([curl.stepKg, curl.stepLb]).toEqual([null, null]);
  });

  it("saving in lb writes only the lb step; the kg step is untouched", async () => {
    const { routineId, exerciseId } = curlRoutine();
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup, jumpPatch("kg", 2));
    const [before] = await loadRoutineExercises(routineId);
    await updateRoutineExercise(before.id, curlSetup, jumpPatch("lb", 2.5));
    const [after] = await loadRoutineExercises(routineId);
    expect([after.stepKg, after.stepLb]).toEqual([2, 2.5]);
    expect(jumpKgFor(after, "lb")).toBe(2.5 * KG_PER_LB);
  });

  it("adds with the rule saved in the panel, and loads it back with its version", async () => {
    const { routineId, exerciseId } = curlRoutine();
    const rule = withChoices(defaultRule("weighted"), { type: "double", missDrop: true, deload: true });
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup, {}, rule);
    const [curl] = await loadRoutineExercises(routineId);
    expect(curl.rule).toEqual({
      v: 1,
      step: "both",
      repStep: 1,
      sessionsToEarn: 3,
      miss: { after: 2, action: { kind: "drop", percent: 10 } },
      deload: { everyWeeks: 6, percent: 40 },
    });
  });

  it("saves a changed rule on edit, and turning the miss rule and Deload off removes them", async () => {
    const { routineId, exerciseId } = curlRoutine();
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup, {}, withChoices(defaultRule("weighted"), { type: "double", missDrop: true, deload: true }));
    const [before] = await loadRoutineExercises(routineId);
    await updateRoutineExercise(before.id, curlSetup, {}, withChoices(before.rule, { type: "reps-only", missDrop: false, deload: false }));
    const [after] = await loadRoutineExercises(routineId);
    expect(after.rule).toEqual({ v: 1, step: "reps", repStep: 1, sessionsToEarn: 3 });
  });

  it("saving the setup without a rule keeps the saved rule", async () => {
    const { routineId, exerciseId } = curlRoutine();
    const rule = withChoices(defaultRule("weighted"), { type: "double", missDrop: false, deload: true });
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup, {}, rule);
    const [before] = await loadRoutineExercises(routineId);
    await updateRoutineExercise(before.id, { ...curlSetup, sets: 4 });
    const [after] = await loadRoutineExercises(routineId);
    expect(after.rule).toEqual(rule);
  });

  it("adds with the default rule when the panel was not used", async () => {
    const { routineId, exerciseId } = curlRoutine();
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup);
    const [curl] = await loadRoutineExercises(routineId);
    expect(curl.rule).toEqual(defaultRule("weighted"));
  });

  it("saving the setup without a step leaves both steps as they were", async () => {
    const { routineId, exerciseId } = curlRoutine();
    addRoutineExercise(routineId, exerciseId, "weighted", curlSetup, jumpPatch("kg", 1));
    const [before] = await loadRoutineExercises(routineId);
    await updateRoutineExercise(before.id, { ...curlSetup, sets: 4 });
    const [after] = await loadRoutineExercises(routineId);
    expect([after.sets, after.stepKg, after.stepLb]).toEqual([4, 1, null]);
  });
});
