import { eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { defaultRule } from "@/engine";
import { jumpKgFor } from "@/units";
import { writeUnit } from "@/settings/unitSetting";

import { loadSummary } from "./summaryQueries";
import { editSet, finishWorkout, loadWorkout, markSetDone, startWorkout } from "./workoutQueries";

// The real write path runs against the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

/** A bench press routine with no history: Start leaves the weights blank, so the test types them. */
function benchRoutine(): number {
  const exercise = db.insert(exercises).values({ name: "Bench press", equipment: "barbell", loadType: "weighted" }).returning().get();
  const routine = db.insert(routines).values({ name: "Push" }).returning().get();
  db.insert(routineExercises)
    .values({ routineId: routine.id, exerciseId: exercise.id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: defaultRule("weighted") })
    .run();
  return routine.id;
}

describe("a unit change in Settings during a workout", () => {
  it("writes nothing on the switch; an untouched row is saved in the new unit, rounded, only when checked", async () => {
    const [kgJump, lbJump] = [jumpKgFor(null, "kg"), jumpKgFor(null, "lb")];
    writeUnit(db, "kg");
    const workoutId = startWorkout(benchRoutine(), "kg", new Date(2026, 10, 21))!;
    let rows = (await loadWorkout(workoutId))!.exercises[0].rows;

    // In kg: 100 typed into set 1 (sets 2 and 3 follow), set 1 checked, then set 2 retyped as 102.5 (set 3 follows, untyped).
    rows = editSet(rows, 0, { weight: 100, unit: "kg" }, "kg", kgJump);
    rows = markSetDone(rows, 0, true, "kg", "weighted", kgJump);
    rows = editSet(rows, 1, { weight: 102.5, unit: "kg" }, "kg", kgJump);
    const stored = () =>
      db
        .select({ weight: sets.weight, weightUnit: sets.weightUnit, done: sets.done, edited: sets.edited })
        .from(sets)
        .orderBy(sets.idx)
        .all();
    const before = stored();
    expect(before).toEqual([
      { weight: 100, weightUnit: "kg", done: true, edited: true },
      { weight: 102.5, weightUnit: "kg", done: false, edited: true },
      { weight: 102.5, weightUnit: "kg", done: false, edited: false },
    ]);

    // The lifter switches to lb in Settings: nothing is written.
    writeUnit(db, "lb");
    expect(stored()).toEqual(before);

    // Checking each row in lb: the done row is untouched, the typed row keeps 102.5 kg, the untouched one is 225 lb (225.97 rounds down to 225).
    rows = markSetDone(rows, 1, true, "lb", "weighted", lbJump);
    rows = markSetDone(rows, 2, true, "lb", "weighted", lbJump);
    expect(stored()).toEqual([
      { weight: 100, weightUnit: "kg", done: true, edited: true },
      { weight: 102.5, weightUnit: "kg", done: true, edited: true },
      { weight: 225, weightUnit: "lb", done: true, edited: false },
    ]);
    expect(rows.map((r) => [r.weight, r.unit])).toEqual([
      [100, "kg"],
      [102.5, "kg"],
      [225, "lb"],
    ]);
    // Unchecking writes only the done mark.
    markSetDone(rows, 2, false, "lb", "weighted", lbJump);
    expect(db.select().from(sets).where(eq(sets.idx, 2)).get()).toMatchObject({ weight: 225, weightUnit: "lb", done: false });
  });
});

describe("judging a workout after a unit change in Settings", () => {
  /** A bench routine whose first workout (no Target) was 3 × 8 at `weight` kg, so the next Target is that × 8. */
  function benchAt100(weight = 100): number {
    const routineId = benchRoutine();
    const exerciseId = db.select().from(routineExercises).where(eq(routineExercises.routineId, routineId)).get()!.exerciseId;
    const past = db.insert(workouts).values({ routineId, startedAt: 1, finishedAt: 2, date: "2026-11-14", inProgress: false }).returning().get();
    const we = db.insert(workoutExercises).values({ workoutId: past.id, exerciseId, position: 0 }).returning().get();
    for (let idx = 0; idx < 3; idx++) {
      db.insert(sets).values({ workoutExerciseId: we.id, exerciseId, idx, weight, weightUnit: "kg", reps: 8, done: true }).run();
    }
    return routineId;
  }

  it("a 100 kg Target lifted as the 220 lb shown (99.79 kg) is Clean, not Held", async () => {
    const lbJump = jumpKgFor(null, "lb");
    writeUnit(db, "kg");
    const workoutId = startWorkout(benchAt100(), "kg", new Date(2026, 10, 21))!;
    const exercise = (await loadWorkout(workoutId))!.exercises[0];
    expect(exercise.target).toEqual({ weightKg: 100, reps: 8 });

    // Switched to lb in Settings before any set: every untouched row shows and is checked as 220 lb.
    writeUnit(db, "lb");
    let rows = exercise.rows;
    for (let i = 0; i < rows.length; i++) rows = markSetDone(rows, i, true, "lb", "weighted", lbJump);
    expect(rows.map((r) => [r.weight, r.unit])).toEqual([
      [220, "lb"],
      [220, "lb"],
      [220, "lb"],
    ]);
    finishWorkout(workoutId, new Date(2026, 10, 21, 1));

    const card = loadSummary(workoutId, "lb")!.summary.cards[0];
    expect(card.outcome).toBe("clean");
    expect(card.streak).toBe(1);
  });

  it("a 62.5 kg Target lifted as the 135 lb shown (rounded down from 137.79) is Clean; 130 lb is a Hold", async () => {
    const lbJump = jumpKgFor(null, "lb");
    /** Starts in kg at a 62.5 kg Target, switches to lb, checks every row (set 1 typed as `firstLb` when given), finishes. */
    async function liftInLb(day: number, firstLb?: number) {
      writeUnit(db, "kg");
      const workoutId = startWorkout(benchAt100(62.5), "kg", new Date(2026, 10, day))!;
      const exercise = (await loadWorkout(workoutId))!.exercises[0];
      expect(exercise.target).toEqual({ weightKg: 62.5, reps: 8 });
      writeUnit(db, "lb");
      let rows = exercise.rows;
      if (firstLb !== undefined) rows = editSet(rows, 0, { weight: firstLb, unit: "lb" }, "lb", lbJump);
      for (let i = 0; i < rows.length; i++) rows = markSetDone(rows, i, true, "lb", "weighted", lbJump);
      finishWorkout(workoutId, new Date(2026, 10, day, 1));
      return { rows, card: loadSummary(workoutId, "lb")!.summary.cards[0] };
    }

    const shown = await liftInLb(21);
    expect(shown.rows.map((r) => [r.weight, r.unit])).toEqual([
      [135, "lb"],
      [135, "lb"],
      [135, "lb"],
    ]);
    expect(shown.card.outcome).toBe("clean");
    expect((await liftInLb(22, 130)).card.outcome).toBe("hold");
  });

  it("a set lighter than the Target as shown in its unit is still Held", async () => {
    const lbJump = jumpKgFor(null, "lb");
    writeUnit(db, "kg");
    const workoutId = startWorkout(benchAt100(), "kg", new Date(2026, 10, 21))!;
    let rows = (await loadWorkout(workoutId))!.exercises[0].rows;
    writeUnit(db, "lb");
    rows = editSet(rows, 0, { weight: 215, unit: "lb" }, "lb", lbJump);
    for (let i = 0; i < rows.length; i++) rows = markSetDone(rows, i, true, "lb", "weighted", lbJump);
    finishWorkout(workoutId, new Date(2026, 10, 21, 1));
    expect(loadSummary(workoutId, "lb")!.summary.cards[0].outcome).toBe("hold");
  });
});
