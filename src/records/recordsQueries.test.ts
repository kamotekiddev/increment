import type { Db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import { chartSeries, exerciseRecords, workoutRecordTags } from "./recordsQueries";

// The module reads the app's `db`; point that at an in-memory database with every migration applied.
jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

beforeEach(() => {
  db.delete(sets).run();
  db.delete(workoutExercises).run();
  db.delete(workouts).run();
  db.delete(routines).run();
  db.delete(exercises).run();
});

const DAY = 24 * 60 * 60_000;
const BASE = new Date(2026, 10, 1, 18).getTime();

function exercise(name: string, loadType: "weighted" | "bodyweight" = "weighted"): number {
  return db.insert(exercises).values({ name, equipment: "barbell", loadType }).returning().get().id;
}

function routine(name: string): number {
  return db.insert(routines).values({ name }).returning().get().id;
}

interface TestSet {
  w: number;
  r: number;
  unit?: "kg" | "lb";
  done?: boolean;
  warmup?: boolean;
}

interface TestWorkout {
  /** Day offset from 1 Nov 2026; sets the start time and the date. */
  day: number;
  routineId?: number | null;
  inProgress?: boolean;
  deload?: boolean;
  /** One or more exercises; each gets its own Workout exercise. */
  lifts: { exerciseId: number; sets: TestSet[] }[];
}

/** Saves a Workout; returns its id and the Workout exercise id of each lift. */
function save({ day, routineId = null, inProgress = false, deload = false, lifts }: TestWorkout) {
  const startedAt = BASE + day * DAY;
  const date = `2026-11-${String(1 + day).padStart(2, "0")}`;
  const workout = db
    .insert(workouts)
    .values({ routineId, date, startedAt, finishedAt: inProgress ? null : startedAt + 45 * 60_000, inProgress })
    .returning()
    .get();
  const weIds = lifts.map((lift, position) => {
    const we = db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: lift.exerciseId, position, isDeload: deload })
      .returning()
      .get();
    lift.sets.forEach((s, idx) => {
      db.insert(sets)
        .values({
          workoutExerciseId: we.id,
          exerciseId: lift.exerciseId,
          idx,
          weight: s.w,
          weightUnit: s.unit ?? "kg",
          reps: s.r,
          done: s.done ?? true,
          isWarmup: s.warmup ?? false,
        })
        .run();
    });
    return we.id;
  });
  return { id: workout.id, weIds };
}

/** The tags of the Workout's first lift. */
function tagsOf(w: { id: number; weIds: number[] }): string[] {
  return workoutRecordTags(w.id)[w.weIds[0]] ?? [];
}

describe("workoutRecordTags", () => {
  it("returns no tags for the first Workout of an exercise", () => {
    const bench = exercise("Bench");
    const first = save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    expect(workoutRecordTags(first.id)).toEqual({});
  });

  it("tags Heaviest set, 1-rep max and Most volume on a heavier second Workout", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 62.5, r: 8 }] }] });
    expect(tagsOf(second)).toEqual(["Heaviest set", "1-rep max", "Most volume"]);
  });

  it("tags nothing when the same weight and reps repeat", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    expect(workoutRecordTags(second.id)).toEqual({});
  });

  it("tags Heaviest set for more reps at the same weight", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 62.5, r: 3 }] }] });
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 62.5, r: 5 }] }] });
    expect(tagsOf(second)).toContain("Heaviest set");
  });

  it("credits 60 x 10 after 65 x 6 with 1-rep max but not Heaviest set", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 65, r: 6 }] }] });
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 10 }] }] });
    const tags = tagsOf(second);
    expect(tags).toContain("1-rep max");
    expect(tags).not.toContain("Heaviest set");
  });

  it("ignores a set above 12 reps for the 1-rep max but not for volume or heaviest", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 30, r: 5 }] }] });
    // 40 x 20: Epley would give 66.7, above 30 x 5 (35); ignored. Heaviest 40 > 30, volume 800 > 150.
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 40, r: 20 }] }] });
    expect(tagsOf(second)).toEqual(["Heaviest set", "Most volume"]);
  });

  it("counts a 12-rep set for the 1-rep max", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 40, r: 5 }] }] });
    // 40 x 12 = 56 > 46.67
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 40, r: 12 }] }] });
    expect(tagsOf(second)).toContain("1-rep max");
  });

  it("counts a 1-rep set as its own weight", () => {
    const bench = exercise("Bench");
    // best estimate 60 x 5 = 70
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 5 }] }] });
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 71, r: 1 }] }] });
    expect(tagsOf(second)).toContain("1-rep max");
    const third = save({ day: 4, lifts: [{ exerciseId: bench, sets: [{ w: 71, r: 1 }] }] });
    expect(workoutRecordTags(third.id)).toEqual({});
  });

  it("tags Most volume for a lighter Workout with more total volume", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 80, r: 5 }] }] });
    const second = save({
      day: 2,
      lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }, { w: 60, r: 8 }, { w: 60, r: 8 }] }],
    });
    expect(tagsOf(second)).toEqual(["Most volume"]);
  });

  it("never counts warm-up, unchecked, discarded or in-progress sets", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    const second = save({
      day: 2,
      lifts: [{ exerciseId: bench, sets: [{ w: 100, r: 5, warmup: true }, { w: 100, r: 5, done: false }, { w: 60, r: 8 }] }],
    });
    expect(workoutRecordTags(second.id)).toEqual({});
    // An in-progress Workout of a heavier lift is not a best to beat, and has no tags itself.
    const live = save({ day: 3, inProgress: true, lifts: [{ exerciseId: bench, sets: [{ w: 200, r: 5 }] }] });
    expect(workoutRecordTags(live.id)).toEqual({});
    const third = save({ day: 4, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    expect(workoutRecordTags(third.id)).toEqual({});
  });

  it("does not let a later Workout's sets count against an earlier one", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 50, r: 8 }] }] });
    const middle = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    save({ day: 4, lifts: [{ exerciseId: bench, sets: [{ w: 100, r: 8 }] }] });
    expect(tagsOf(middle)).toContain("Heaviest set");
  });

  it("counts a Deload Workout like any other", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    const second = save({ day: 2, deload: true, lifts: [{ exerciseId: bench, sets: [{ w: 65, r: 8 }] }] });
    expect(tagsOf(second)).toContain("Heaviest set");
  });

  it("compares sets in lb against a kg best", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    // 135 lb = 61.23 kg beats 60 kg.
    const heavier = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 135, r: 8, unit: "lb" }] }] });
    expect(tagsOf(heavier)).toContain("Heaviest set");
    // 60 kg typed as lb (a hair of float noise) is a tie with 60 kg, not a record.
    const squat = exercise("Squat");
    save({ day: 3, lifts: [{ exerciseId: squat, sets: [{ w: 60, r: 8 }] }] });
    const tie = save({ day: 4, lifts: [{ exerciseId: squat, sets: [{ w: 60 / 0.45359237, r: 8, unit: "lb" }] }] });
    expect(workoutRecordTags(tie.id)).toEqual({});
  });

  it("shares an exercise's records across routines", () => {
    const bench = exercise("Bench");
    save({ day: 0, routineId: routine("Push"), lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    const second = save({ day: 2, routineId: routine("Upper"), lifts: [{ exerciseId: bench, sets: [{ w: 65, r: 8 }] }] });
    expect(tagsOf(second)).toContain("Heaviest set");
  });

  it("tags a bodyweight exercise by reps and ignores weight", () => {
    const pullup = exercise("Pull-up", "bodyweight");
    save({ day: 0, lifts: [{ exerciseId: pullup, sets: [{ w: 0, r: 8 }, { w: 0, r: 7 }] }] });
    const more = save({ day: 2, lifts: [{ exerciseId: pullup, sets: [{ w: 0, r: 10 }, { w: 0, r: 7 }] }] });
    expect(tagsOf(more)).toEqual(["Most reps in a set", "Most reps in a workout"]);
    // Added weight logged on a bodyweight exercise is ignored: same reps, heavier weight is no record.
    const weighted = save({ day: 4, lifts: [{ exerciseId: pullup, sets: [{ w: 20, r: 10 }, { w: 20, r: 7 }] }] });
    expect(workoutRecordTags(weighted.id)).toEqual({});
  });

  it("tags only Most reps in a workout when the set best is not beaten", () => {
    const pullup = exercise("Pull-up", "bodyweight");
    save({ day: 0, lifts: [{ exerciseId: pullup, sets: [{ w: 0, r: 10 }] }] });
    const second = save({ day: 2, lifts: [{ exerciseId: pullup, sets: [{ w: 0, r: 8 }, { w: 0, r: 8 }] }] });
    expect(tagsOf(second)).toEqual(["Most reps in a workout"]);
  });

  it("tags each exercise of a Workout on its own Workout exercise", () => {
    const bench = exercise("Bench");
    const row = exercise("Row");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }, { exerciseId: row, sets: [{ w: 50, r: 8 }] }] });
    const second = save({
      day: 2,
      lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }, { exerciseId: row, sets: [{ w: 55, r: 8 }] }],
    });
    expect(workoutRecordTags(second.id)).toEqual({ [second.weIds[1]]: ["Heaviest set", "1-rep max", "Most volume"] });
  });

  it("returns nothing for an unknown id or a Workout in progress", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    const live = save({ day: 2, inProgress: true, lifts: [{ exerciseId: bench, sets: [{ w: 90, r: 8 }] }] });
    expect(workoutRecordTags(live.id)).toEqual({});
    expect(workoutRecordTags(9999)).toEqual({});
  });
});

describe("exerciseRecords", () => {
  it("returns none when no set counts", () => {
    const bench = exercise("Bench");
    expect(exerciseRecords(bench, "kg")).toBeNull();
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8, done: false }, { w: 40, r: 8, warmup: true }] }] });
    expect(exerciseRecords(bench, "kg")).toBeNull();
  });

  it("returns the current best of each weighted record with the date of the Workout that set it", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }, { w: 60, r: 8 }, { w: 60, r: 8 }] }] });
    save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 80, r: 3 }] }] });
    save({ day: 4, lifts: [{ exerciseId: bench, sets: [{ w: 70, r: 6 }] }] });
    expect(exerciseRecords(bench, "kg")).toEqual({
      loadType: "weighted",
      heaviestSet: { text: "80 × 3", date: "2026-11-03" },
      // 80 x 3 = 88; 70 x 6 = 84; 60 x 8 = 76. Best 88.
      estimatedOneRepMax: { value: 88, date: "2026-11-03" },
      // Volume 1440 on day 0; 240; 420.
      mostVolume: { value: 1440, date: "2026-11-01" },
    });
  });

  it("shows the Heaviest set as History does, and the 1-rep max and volume in the asked unit as whole numbers", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 135, r: 5, unit: "lb" }] }] });
    expect(exerciseRecords(bench, "kg")).toEqual({
      loadType: "weighted",
      heaviestSet: { text: "≈61.2 × 5", date: "2026-11-01" },
      // 61.2349 x (1 + 5/30) = 71.44 kg; volume 306.17 kg.
      estimatedOneRepMax: { value: 71, date: "2026-11-01" },
      mostVolume: { value: 306, date: "2026-11-01" },
    });
    // 135 x (1 + 5/30) = 157.5 lb, rounds to 158; volume 675 lb.
    expect(exerciseRecords(bench, "lb")).toMatchObject({
      heaviestSet: { text: "135 × 5" },
      estimatedOneRepMax: { value: 158 },
      mostVolume: { value: 675 },
    });
  });

  it("ignores a done set with 0 reps on a weighted exercise", () => {
    const bench = exercise("Bench");
    const first = save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    // 100 x 0 would be a full-weight 1-rep max and Heaviest set if it counted.
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 100, r: 0 }, { w: 60, r: 8 }] }] });
    expect(workoutRecordTags(second.id)).toEqual({});
    expect(exerciseRecords(bench, "kg")).toMatchObject({
      heaviestSet: { text: "60 × 8", date: "2026-11-01" },
      estimatedOneRepMax: { value: 76, date: "2026-11-01" },
    });
    expect(first.id).toBeGreaterThan(0);
  });

  it("ignores a set with no weight on a weighted exercise", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    // A blank weight is stored as 0: 0 x 20 must not take Most volume or the 1-rep max.
    const second = save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 0, r: 20 }, { w: 0, r: 5 }] }] });
    expect(workoutRecordTags(second.id)).toEqual({});
    expect(exerciseRecords(bench, "kg")).toMatchObject({ heaviestSet: { date: "2026-11-01" } });
    // A Workout with only blank-weight sets has nothing to count.
    const other = exercise("Row");
    save({ day: 4, lifts: [{ exerciseId: other, sets: [{ w: 0, r: 10 }] }] });
    expect(exerciseRecords(other, "kg")).toBeNull();
  });

  it("has no 1-rep max when every counted set is above 12 reps", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 40, r: 20 }] }] });
    expect(exerciseRecords(bench, "kg")).toEqual({
      loadType: "weighted",
      heaviestSet: { text: "40 × 20", date: "2026-11-01" },
      estimatedOneRepMax: null,
      mostVolume: { value: 800, date: "2026-11-01" },
    });
  });

  it("keeps a tied record on the earliest Workout", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    expect(exerciseRecords(bench, "kg")).toMatchObject({
      heaviestSet: { date: "2026-11-01" },
      estimatedOneRepMax: { date: "2026-11-01" },
      mostVolume: { date: "2026-11-01" },
    });
  });

  it("returns the bodyweight records", () => {
    const pullup = exercise("Pull-up", "bodyweight");
    save({ day: 0, lifts: [{ exerciseId: pullup, sets: [{ w: 0, r: 8 }, { w: 0, r: 7 }] }] });
    save({ day: 2, lifts: [{ exerciseId: pullup, sets: [{ w: 10, r: 10 }] }] });
    expect(exerciseRecords(pullup, "kg")).toEqual({
      loadType: "bodyweight",
      mostRepsInSet: { value: 10, date: "2026-11-03" },
      mostRepsInWorkout: { value: 15, date: "2026-11-01" },
    });
  });
});

describe("chartSeries", () => {
  it("Last 8 of 12 workouts returns the latest 8, oldest first; All returns every one; Last 20 returns 12", () => {
    const bench = exercise("Bench");
    for (let day = 0; day < 12; day++) save({ day, lifts: [{ exerciseId: bench, sets: [{ w: 60 + day, r: 5 }] }] });
    const last8 = chartSeries(bench, "weight", "last8", "kg");
    expect(last8?.points.map((p) => p.value)).toEqual([64, 65, 66, 67, 68, 69, 70, 71]);
    expect(last8?.points[0].date).toBe("2026-11-05");
    expect(chartSeries(bench, "weight", "all", "kg")?.points).toHaveLength(12);
    expect(chartSeries(bench, "weight", "last20", "kg")?.points).toHaveLength(12);
  });

  it("charts Weight, Est. 1RM and Volume from known sets", () => {
    const bench = exercise("Bench");
    // Heaviest 100; Epley 100 x 5 = 116.67 and 90 x 10 = 120; volume 500 + 900.
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 100, r: 5 }, { w: 90, r: 10 }] }] });
    expect(chartSeries(bench, "weight", "all", "kg")?.points).toEqual([{ date: "2026-11-01", value: 100 }]);
    expect(chartSeries(bench, "oneRepMax", "all", "kg")?.points).toEqual([{ date: "2026-11-01", value: 120 }]);
    expect(chartSeries(bench, "volume", "all", "kg")?.points).toEqual([{ date: "2026-11-01", value: 1400 }]);
  });

  it("skips a workout with no Est. 1RM (all sets above 12 reps) but still counts it for Volume", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 50, r: 10 }] }] });
    save({ day: 1, lifts: [{ exerciseId: bench, sets: [{ w: 40, r: 15 }] }] });
    save({ day: 2, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 8 }] }] });
    const oneRepMax = chartSeries(bench, "oneRepMax", "all", "kg");
    expect(oneRepMax?.points.map((p) => p.date)).toEqual(["2026-11-01", "2026-11-03"]);
    expect(oneRepMax?.workouts).toBe(3);
    expect(chartSeries(bench, "volume", "all", "kg")?.points.map((p) => p.value)).toEqual([500, 600, 480]);
  });

  it("never counts warm-up, unchecked or in-progress sets", () => {
    const bench = exercise("Bench");
    save({
      day: 0,
      lifts: [{ exerciseId: bench, sets: [{ w: 100, r: 5, warmup: true }, { w: 90, r: 5, done: false }, { w: 50, r: 5 }] }],
    });
    save({ day: 1, inProgress: true, lifts: [{ exerciseId: bench, sets: [{ w: 200, r: 5 }] }] });
    expect(chartSeries(bench, "weight", "all", "kg")?.points).toEqual([{ date: "2026-11-01", value: 50 }]);
  });

  it("compares lb against kg in kg and shows the current unit", () => {
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 135, r: 5, unit: "lb" }] }] });
    save({ day: 1, lifts: [{ exerciseId: bench, sets: [{ w: 60, r: 5, unit: "kg" }] }] });
    expect(chartSeries(bench, "weight", "all", "lb")?.points.map((p) => p.value)).toEqual([135, 132.3]);
    expect(chartSeries(bench, "weight", "all", "kg")?.points.map((p) => p.value)).toEqual([61.2, 60]);
    expect(chartSeries(bench, "volume", "all", "kg")?.points.map((p) => p.value)).toEqual([306, 300]);
  });

  it("charts a bodyweight exercise by reps and refuses weighted metrics (and the reverse)", () => {
    const pullUp = exercise("Pull-up", "bodyweight");
    const bench = exercise("Bench");
    save({ day: 0, lifts: [{ exerciseId: pullUp, sets: [{ w: 0, r: 8 }, { w: 0, r: 6 }] }] });
    expect(chartSeries(pullUp, "repsInSet", "all", "kg")?.points).toEqual([{ date: "2026-11-01", value: 8 }]);
    expect(chartSeries(pullUp, "repsInWorkout", "all", "kg")?.points).toEqual([{ date: "2026-11-01", value: 14 }]);
    expect(() => chartSeries(pullUp, "weight", "all", "kg")).toThrow();
    expect(() => chartSeries(bench, "repsInSet", "all", "kg")).toThrow();
  });

  it("charts a custom exercise like a library one", () => {
    const custom = db.insert(exercises).values({ name: "Mine", equipment: "barbell", loadType: "weighted", isCustom: true }).returning().get().id;
    save({ day: 0, lifts: [{ exerciseId: custom, sets: [{ w: 20, r: 5 }] }] });
    expect(chartSeries(custom, "weight", "all", "kg")?.points).toHaveLength(1);
  });

  it("reports how many workouts counted, for the fewer-than-2-points message; null for an unknown exercise", () => {
    const bench = exercise("Bench");
    expect(chartSeries(bench, "weight", "last8", "kg")).toEqual({ points: [], workouts: 0 });
    save({ day: 0, lifts: [{ exerciseId: bench, sets: [{ w: 50, r: 5 }] }] });
    expect(chartSeries(bench, "weight", "last8", "kg")?.workouts).toBe(1);
    expect(chartSeries(9999, "weight", "last8", "kg")).toBeNull();
  });
});
