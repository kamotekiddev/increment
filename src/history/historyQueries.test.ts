import { eq } from "drizzle-orm";

import { exercises, routines, sets, workoutExercises, workouts } from "../db/schema";
import { createTestDb } from "../../test-support/testDb";
import { exerciseHistory } from "./historyQueries";
import { buildHistoryRows } from "./historyRows";

function setup() {
  const db = createTestDb();
  const [bench, squat] = db
    .insert(exercises)
    .values([
      { name: "Bench press", equipment: "barbell", loadType: "weighted" },
      { name: "Squat", equipment: "barbell", loadType: "weighted" },
    ])
    .returning()
    .all();
  const [push, upper] = db
    .insert(routines)
    .values([
      { name: "Push day A", days: 1 },
      { name: "Upper", days: 2 },
    ])
    .returning()
    .all();

  function workout(opts: { routineId: number | null; startedAt: number; date: string; inProgress?: boolean }, exId: number, rows: { weightKg: number; reps: number; done?: boolean; isWarmup?: boolean }[], isDeload = false) {
    const w = db
      .insert(workouts)
      .values({ routineId: opts.routineId, startedAt: opts.startedAt, date: opts.date, inProgress: opts.inProgress ?? false })
      .returning()
      .get();
    const we = db.insert(workoutExercises).values({ workoutId: w.id, exerciseId: exId, position: 0, isDeload }).returning().get();
    rows.forEach((r, idx) =>
      db
        .insert(sets)
        .values({ workoutExerciseId: we.id, exerciseId: exId, idx, weightKg: r.weightKg, enteredUnit: "kg", reps: r.reps, done: r.done ?? true, isWarmup: r.isWarmup ?? false })
        .run(),
    );
    return we.id;
  }
  return { db, bench, squat, push, upper, workout };
}

describe("exerciseHistory", () => {
  it("lists finished workouts across routines, newest start first, with the current routine name", () => {
    const { db, bench, push, upper, workout } = setup();
    workout({ routineId: push.id, startedAt: 1000, date: "2026-11-09" }, bench.id, [{ weightKg: 60, reps: 8 }]);
    workout({ routineId: upper.id, startedAt: 3000, date: "2026-11-12" }, bench.id, [{ weightKg: 62.5, reps: 8 }]);
    db.update(routines).set({ name: "Chest day" }).where(eq(routines.id, push.id)).run();

    const rows = buildHistoryRows(exerciseHistory(db, bench.id), "kg", "2026-11-20");
    expect(rows.map((r) => [r.dateLabel, r.routineName, r.chips])).toEqual([
      ["Thu, 12 Nov", "Upper", ["62.5 × 8"]],
      ["Mon, 9 Nov", "Chest day", ["60 × 8"]],
    ]);
  });

  it("leaves out a workout in progress and other exercises", () => {
    const { db, bench, squat, push, workout } = setup();
    workout({ routineId: push.id, startedAt: 1000, date: "2026-11-09", inProgress: true }, bench.id, [{ weightKg: 60, reps: 8 }]);
    workout({ routineId: push.id, startedAt: 2000, date: "2026-11-10" }, squat.id, [{ weightKg: 100, reps: 5 }]);
    expect(exerciseHistory(db, bench.id)).toEqual([]);
  });

  it("keeps a workout with no routine, flags a Deload and drops a warm-up-only workout", () => {
    const { db, bench, push, workout } = setup();
    workout({ routineId: null, startedAt: 1000, date: "2026-11-09" }, bench.id, [{ weightKg: 50, reps: 8 }], true);
    workout({ routineId: push.id, startedAt: 2000, date: "2026-11-10" }, bench.id, [{ weightKg: 40, reps: 10, isWarmup: true }]);
    const rows = buildHistoryRows(exerciseHistory(db, bench.id), "kg", "2026-11-20");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ routineName: null, isDeload: true, chips: ["50 × 8"] });
  });

  it("orders two workouts on one day by start time and sets by position", () => {
    const { db, bench, push, workout } = setup();
    workout({ routineId: push.id, startedAt: 1000, date: "2026-11-12" }, bench.id, [{ weightKg: 60, reps: 8 }]);
    workout({ routineId: push.id, startedAt: 5000, date: "2026-11-12" }, bench.id, [{ weightKg: 62.5, reps: 8 }, { weightKg: 62.5, reps: 7 }]);
    const rows = buildHistoryRows(exerciseHistory(db, bench.id), "kg", "2026-11-20");
    expect(rows.map((r) => r.chips)).toEqual([["62.5 × 8", "62.5 × 7"], ["60 × 8"]]);
  });
});
