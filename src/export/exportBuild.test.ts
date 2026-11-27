import type { Db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import { buildExport, csvText, exportFileName, previewLines, rangeStartDate } from "./exportBuild";

jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

beforeEach(() => {
  db.delete(sets).run();
  db.delete(workoutExercises).run();
  db.delete(workouts).run();
  db.delete(routines).run();
  db.delete(exercises).run();
});

const NOW = new Date(2026, 10, 27, 12).getTime();

interface Lift {
  w: number;
  r: number;
  unit?: "kg" | "lb";
  done?: boolean;
  warmup?: boolean;
}

function workout(date: string, exercise: string, lifts: Lift[], opts: { routine?: string | null; inProgress?: boolean } = {}): void {
  const exerciseId = db.insert(exercises).values({ name: exercise, equipment: "barbell", loadType: "weighted", muscles: ["chest"], isCustom: true }).returning().get().id;
  const routineId = opts.routine ? db.insert(routines).values({ name: opts.routine }).returning().get().id : null;
  const startedAt = new Date(`${date}T10:00:00`).getTime();
  const inProgress = opts.inProgress ?? false;
  const w = db.insert(workouts).values({ routineId, date, startedAt, finishedAt: inProgress ? null : startedAt + 1000, inProgress }).returning().get();
  const we = db.insert(workoutExercises).values({ workoutId: w.id, exerciseId, position: 0 }).returning().get();
  lifts.forEach((s, idx) =>
    db.insert(sets).values({ workoutExerciseId: we.id, exerciseId, idx, weight: s.w, weightUnit: s.unit ?? "kg", reps: s.r, done: s.done ?? true, isWarmup: s.warmup ?? false }).run(),
  );
}

const lines = (text: string) => text.replace(/^﻿/, "").split("\r\n");

describe("the CSV", () => {
  it("has the header and one row per done set, weight as typed with its unit and kg to two decimals", () => {
    workout("2026-11-20", "Bench Press", [{ w: 60, r: 8 }, { w: 135, r: 5, unit: "lb" }], { routine: "Push" });
    const out = buildExport("all", NOW);
    expect(lines(csvText(out.rows))).toEqual([
      "date,workout,exercise,set,reps,weight,unit,weight_kg,is_warmup",
      "2026-11-20,Push,Bench Press,1,8,60,kg,60.00,false",
      "2026-11-20,Push,Bench Press,2,5,135,lb,61.23,false",
      "",
    ]);
  });

  it("leaves out skipped sets, a Workout in progress and keeps warm-ups marked", () => {
    workout("2026-11-20", "Squat", [{ w: 20, r: 5, warmup: true }, { w: 100, r: 5 }, { w: 100, r: 5, done: false }]);
    workout("2026-11-21", "Deadlift", [{ w: 150, r: 3 }], { inProgress: true });
    const out = buildExport("all", NOW);
    expect(out.rows.map((r) => [r.exercise, r.set, r.isWarmup])).toEqual([
      ["Squat", 1, true],
      ["Squat", 2, false],
    ]);
    expect(out.rows[0].workout).toBe("Workout");
  });

  it("quotes commas, quotes and line breaks in names", () => {
    workout("2026-11-20", 'Press, "Strict"\nSeated', [{ w: 40, r: 5 }], { routine: "Push, Pull" });
    const text = csvText(buildExport("all", NOW).rows);
    expect(text).toContain('"Push, Pull","Press, ""Strict""\nSeated"');
  });

  it("defuses a name a spreadsheet would run as a formula, leaving numbers and other names as they are", () => {
    workout("2026-11-20", "=HYPERLINK(\"x\")", [{ w: 40, r: 5 }], { routine: "+Push" });
    workout("2026-11-21", "Curl-up", [{ w: 12.5, r: 5 }]);
    const [a, b] = lines(csvText(buildExport("all", NOW).rows)).slice(1);
    expect(a).toBe("2026-11-20,'+Push,\"'=HYPERLINK(\"\"x\"\")\",1,5,40,kg,40.00,false");
    expect(b).toBe("2026-11-21,Workout,Curl-up,1,5,12.5,kg,12.50,false");
  });

  it("keeps decimals of a typed weight and a bodyweight 0", () => {
    workout("2026-11-20", "Curl", [{ w: 12.5, r: 10 }, { w: 0, r: 10 }]);
    const [a, b] = buildExport("all", NOW).rows;
    expect([a.weight, a.weightKg, b.weight, b.weightKg]).toEqual([12.5, 12.5, 0, 0]);
  });
});

describe("the time range", () => {
  it("includes a workout exactly 30 days old and excludes the day before", () => {
    workout("2026-10-28", "A", [{ w: 1, r: 1 }]);
    workout("2026-10-27", "B", [{ w: 1, r: 1 }]);
    expect(rangeStartDate("30d", NOW)).toBe("2026-10-28");
    expect(buildExport("30d", NOW).rows.map((r) => r.exercise)).toEqual(["A"]);
  });

  it("3 months starts the same day three months back; all time has no start", () => {
    workout("2026-08-27", "A", [{ w: 1, r: 1 }]);
    workout("2026-08-26", "B", [{ w: 1, r: 1 }]);
    expect(rangeStartDate("3m", NOW)).toBe("2026-08-27");
    expect(rangeStartDate("all", NOW)).toBeNull();
    expect(buildExport("3m", NOW).rows.map((r) => r.exercise)).toEqual(["A"]);
    expect(buildExport("all", NOW).rows).toHaveLength(2);
  });

  it("3 months clamps to the last day of a shorter target month, and 30 days crosses months and years", () => {
    expect(rangeStartDate("3m", new Date(2026, 4, 31).getTime())).toBe("2026-02-28");
    expect(rangeStartDate("3m", new Date(2026, 7, 31).getTime())).toBe("2026-05-31");
    expect(rangeStartDate("3m", new Date(2026, 11, 31).getTime())).toBe("2026-09-30");
    expect(rangeStartDate("3m", new Date(2028, 4, 31).getTime())).toBe("2028-02-29");
    expect(rangeStartDate("3m", new Date(2026, 1, 15).getTime())).toBe("2025-11-15");
    expect(rangeStartDate("30d", new Date(2026, 2, 1).getTime())).toBe("2026-01-30");
    expect(rangeStartDate("30d", new Date(2027, 0, 5).getTime())).toBe("2026-12-06");
  });

  it("orders rows oldest first, and the count equals the row count; an empty range has zero rows", () => {
    workout("2026-11-22", "Late", [{ w: 1, r: 1 }]);
    workout("2026-11-20", "Early", [{ w: 1, r: 1 }, { w: 1, r: 2 }]);
    const out = buildExport("all", NOW);
    expect(out.rows.map((r) => r.exercise)).toEqual(["Early", "Early", "Late"]);
    expect(out.setCount).toBe(3);
    const empty = buildExport("30d", new Date(2027, 5, 1).getTime());
    expect(empty.setCount).toBe(0);
    expect(empty.rows).toEqual([]);
    expect(lines(csvText(empty.rows))).toEqual(["date,workout,exercise,set,reps,weight,unit,weight_kg,is_warmup", ""]);
  });
});

describe("preview and file name", () => {
  it("previews the first 3 rows", () => {
    workout("2026-11-20", "Bench", [{ w: 60, r: 8 }, { w: 60, r: 8 }, { w: 60, r: 7 }, { w: 60, r: 6 }]);
    expect(previewLines(buildExport("all", NOW).rows)).toEqual([
      "2026-11-20 · Bench · set 1 · 8 × 60 kg",
      "2026-11-20 · Bench · set 2 · 8 × 60 kg",
      "2026-11-20 · Bench · set 3 · 7 × 60 kg",
    ]);
  });

  it("names the file with the local date, never a .increment", () => {
    expect(exportFileName(new Date(2026, 10, 7))).toBe("Increment export 2026-11-07.csv");
  });
});
