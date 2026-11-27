import type { Db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import { buildReport, isExportFileName, reportFileName, reportHtml, reportSummary } from "./reportBuild";

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

function workout(date: string, exercise: string, lifts: Lift[], opts: { inProgress?: boolean; loadType?: "weighted" | "bodyweight" } = {}): void {
  const loadType = opts.loadType ?? "weighted";
  const existing = db.select().from(exercises).all().find((e) => e.name === exercise);
  const id = existing?.id ?? db.insert(exercises).values({ name: exercise, equipment: "barbell", loadType, muscles: ["chest"], isCustom: true }).returning().get().id;
  const startedAt = new Date(`${date}T10:00:00`).getTime();
  const inProgress = opts.inProgress ?? false;
  const w = db.insert(workouts).values({ routineId: null, date, startedAt, finishedAt: inProgress ? null : startedAt + 1000, inProgress }).returning().get();
  const we = db.insert(workoutExercises).values({ workoutId: w.id, exerciseId: id, position: 0 }).returning().get();
  lifts.forEach((s, idx) =>
    db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: id, idx, weight: s.w, weightUnit: s.unit ?? "kg", reps: s.r, done: s.done ?? true, isWarmup: s.warmup ?? false }).run(),
  );
}

describe("the PDF data model", () => {
  it("totals workouts, sets and the date range, sets agreeing with the CSV count", () => {
    workout("2026-11-10", "Bench Press", [{ w: 60, r: 8 }, { w: 20, r: 8, warmup: true }]);
    workout("2026-11-20", "Bench Press", [{ w: 62.5, r: 8 }, { w: 62.5, r: 8, done: false }]);
    workout("2026-11-21", "Squat", [{ w: 100, r: 5 }], { inProgress: true });
    const report = buildReport("all", NOW, "kg");
    expect([report.workouts, report.sets, report.firstDate, report.lastDate]).toEqual([2, 3, "2026-11-10", "2026-11-20"]);
  });

  it("lists a records row per exercise with the Records rules (warm-ups never count)", () => {
    workout("2026-11-10", "Bench Press", [{ w: 100, r: 5, warmup: true }, { w: 60, r: 8 }]);
    workout("2026-11-20", "Bench Press", [{ w: 62.5, r: 8 }]);
    const [bench] = buildReport("all", NOW, "kg").exercises;
    expect(bench.name).toBe("Bench Press");
    expect(bench.records).toMatchObject({ loadType: "weighted", heaviestSet: { text: "62.5 × 8", date: "2026-11-20" }, mostVolume: { value: 500, date: "2026-11-20" } });
  });

  it("charts one weight point per finished workout, oldest first, skipping a workout with no value", () => {
    workout("2026-11-10", "Bench Press", [{ w: 60, r: 8 }]);
    workout("2026-11-12", "Bench Press", [{ w: 70, r: 8, done: false }]);
    workout("2026-11-20", "Bench Press", [{ w: 62.5, r: 8 }]);
    const [bench] = buildReport("all", NOW, "kg").exercises;
    expect(bench.chartTitle).toBe("Weight over time");
    expect(bench.points).toEqual([
      { date: "2026-11-10", value: 60 },
      { date: "2026-11-20", value: 62.5 },
    ]);
    expect(bench.tooFewPoints).toBe(false);
  });

  it("marks an exercise with under 2 points", () => {
    workout("2026-11-20", "Bench Press", [{ w: 60, r: 8 }]);
    const [bench] = buildReport("all", NOW, "kg").exercises;
    expect(bench.points).toHaveLength(1);
    expect(bench.tooFewPoints).toBe(true);
  });

  it("charts reps in a set for a bodyweight exercise", () => {
    workout("2026-11-10", "Pull-up", [{ w: 0, r: 6 }, { w: 0, r: 8 }], { loadType: "bodyweight" });
    workout("2026-11-20", "Pull-up", [{ w: 0, r: 9 }], { loadType: "bodyweight" });
    const [pull] = buildReport("all", NOW, "kg").exercises;
    expect(pull.chartTitle).toBe("Reps in a set");
    expect(pull.points.map((p) => p.value)).toEqual([8, 9]);
  });

  it("follows the time range: an older workout is out of the records and the chart", () => {
    workout("2026-10-01", "Bench Press", [{ w: 100, r: 5 }]);
    workout("2026-11-20", "Bench Press", [{ w: 60, r: 8 }]);
    const report = buildReport("30d", NOW, "kg");
    expect(report.workouts).toBe(1);
    expect(report.exercises[0].points).toEqual([{ date: "2026-11-20", value: 60 }]);
  });

  it("is empty with no sets in range", () => {
    const report = buildReport("all", NOW, "kg");
    expect([report.sets, report.exercises]).toEqual([0, []]);
  });
});

describe("the PDF html", () => {
  it("escapes every user-typed name", () => {
    workout("2026-11-10", '<img src=x onerror=alert(1)> & "Co"', [{ w: 60, r: 8 }]);
    workout("2026-11-20", '<img src=x onerror=alert(1)> & "Co"', [{ w: 62, r: 8 }]);
    const html = reportHtml(buildReport("all", NOW, "kg"), "kg", new Date(2026, 10, 27));
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt; &amp; &quot;Co&quot;");
  });

  it("draws a chart for 2 or more points and the muted line for fewer", () => {
    workout("2026-11-10", "Bench Press", [{ w: 60, r: 8 }]);
    workout("2026-11-12", "Squat", [{ w: 100, r: 5 }]);
    workout("2026-11-20", "Squat", [{ w: 110, r: 5 }]);
    const html = reportHtml(buildReport("all", NOW, "kg"), "kg", new Date(2026, 10, 27));
    expect(html.match(/<svg/g)).toHaveLength(1);
    expect(html).toContain("Your chart starts after your second workout.");
  });

  it("states totals and keeps each exercise block together across pages", () => {
    workout("2026-11-10", "Bench Press", [{ w: 60, r: 8 }]);
    const html = reportHtml(buildReport("all", NOW, "kg"), "kg", new Date(2026, 10, 27));
    expect(html).toContain("1 workout");
    expect(html).toContain("break-inside: avoid");
  });
});

describe("the PDF summary and name", () => {
  it("is a one-line summary", () => {
    workout("2026-11-10", "Bench Press", [{ w: 60, r: 8 }, { w: 60, r: 8 }]);
    workout("2026-11-20", "Squat", [{ w: 100, r: 5 }]);
    expect(reportSummary(buildReport("all", NOW, "kg"))).toBe("2 workouts · 3 sets · 2 exercises");
  });

  it("names the file by local date", () => {
    expect(reportFileName(new Date(2026, 10, 27))).toBe("Increment report 2026-11-27.pdf");
  });
});

describe("a range with only warm-up sets", () => {
  it("says there are no working sets instead of drawing an empty table and Progress heading", () => {
    workout("2026-11-20", "Bench Press", [{ w: 20, r: 8, warmup: true }, { w: 30, r: 8, warmup: true }]);
    const report = buildReport("all", NOW, "kg");
    expect([report.sets, report.exercises.length]).toEqual([2, 0]);
    const html = reportHtml(report, "kg", new Date(2026, 10, 27));
    expect(html).toContain("No working sets in this range yet");
    expect(html).not.toContain("<h2>Progress</h2>");
    expect(html).not.toContain("<table>");
  });
});

describe("isExportFileName", () => {
  it("matches the CSV and PDF files an export leaves in the cache, and nothing else", () => {
    expect(isExportFileName("Increment export 2026-11-27.csv")).toBe(true);
    expect(isExportFileName("Increment report 2026-11-27.pdf")).toBe(true);
    expect(isExportFileName(reportFileName(new Date(2026, 10, 27)))).toBe(true);
    expect(isExportFileName("Increment backup 2026-11-27.increment")).toBe(false);
    expect(isExportFileName("Increment auto backup 27 Nov 2026 18-42.increment")).toBe(false);
    expect(isExportFileName("notes.pdf")).toBe(false);
  });
});
