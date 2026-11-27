import { and, eq, gte } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, sets, workoutExercises, workouts } from "@/db/schema";
import { chartGeometry } from "@/progress/chartGeometry";
import { thousands } from "@/progress/progressQueries";
import {
  chartSeriesFrom,
  COUNTED_ROW_COLUMNS,
  COUNTED_ROW_ORDER,
  isCountedSet,
  recordsOfSessions,
  sessionsFromRows,
  type ChartPoint,
  type CountedRow,
  type ExerciseRecords,
} from "@/records/recordsQueries";
import { chart, lightColors } from "@/theme/tokens";
import { formatNumber, type Unit } from "@/units";

import { buildExport, dateString, rangeStartDate, type ExportRange, type ExportRow } from "./exportBuild";

/**
 * The PDF report: a data model (totals, a records row and a chart series per exercise) and the HTML built from it.
 * It reads the same selection as the CSV for the totals, and the Records and Progress chart rules for the rest;
 * it adds no rule of its own. Nothing is stored.
 */

export interface ReportExercise {
  exerciseId: number;
  name: string;
  loadType: "weighted" | "bodyweight";
  /** The Records of the exercise inside the time range, in the lifter's unit. */
  records: ExerciseRecords;
  /** "Weight over time", or "Reps in a set" for a bodyweight exercise. */
  chartTitle: string;
  /** One per finished workout with a value, oldest first; a workout with no value is skipped, never 0. */
  points: ChartPoint[];
  /** Under 2 points: the report shows the muted line instead of a chart. */
  tooFewPoints: boolean;
}

export interface Report {
  workouts: number;
  /** Every done set in the range, the CSV's count. */
  sets: number;
  /** First and last workout date (`YYYY-MM-DD`), or null with no set. */
  firstDate: string | null;
  lastDate: string | null;
  /** Exercises with a counted set in the range, most recently done first. */
  exercises: ReportExercise[];
}

/** The report for the range: totals from the export rows, records and chart points per exercise, in `unit`. */
export function buildReport(range: ExportRange, now: number, unit: Unit, rows: ExportRow[] = buildExport(range, now).rows): Report {
  const dates = rows.map((r) => r.date).sort();
  const start = rangeStartDate(range, now);

  const counted = db
    .select({ ...COUNTED_ROW_COLUMNS, exerciseId: exercises.id, name: exercises.name, loadType: exercises.loadType, startedAt: workouts.startedAt })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(and(eq(sets.done, true), eq(sets.isWarmup, false), eq(workouts.inProgress, false), start === null ? undefined : gte(workouts.date, start)))
    .orderBy(...COUNTED_ROW_ORDER)
    .all();

  const byExercise = new Map<number, { name: string; loadType: "weighted" | "bodyweight"; rows: CountedRow[]; last: number }>();
  for (const row of counted) {
    if (!isCountedSet(row, row.loadType)) continue;
    const own = byExercise.get(row.exerciseId) ?? { name: row.name, loadType: row.loadType, rows: [], last: 0 };
    own.rows.push(row);
    own.last = row.startedAt;
    byExercise.set(row.exerciseId, own);
  }

  const result: ReportExercise[] = [];
  for (const [exerciseId, own] of byExercise) {
    const sessions = sessionsFromRows(own.rows, own.loadType);
    const records = recordsOfSessions(sessions, own.loadType, unit);
    if (!records) continue;
    const metric = own.loadType === "bodyweight" ? "repsInSet" : "weight";
    const { points } = chartSeriesFrom({ loadType: own.loadType, sessions }, metric, "all", unit);
    result.push({
      exerciseId,
      name: own.name,
      loadType: own.loadType,
      records,
      chartTitle: own.loadType === "bodyweight" ? "Reps in a set" : "Weight over time",
      points,
      tooFewPoints: points.length < 2,
    });
  }
  // Most recently done first (the order All records uses); ties keep the order read.
  const lastOf = (id: number) => byExercise.get(id)?.last ?? 0;
  result.sort((a, b) => lastOf(b.exerciseId) - lastOf(a.exerciseId));

  return {
    workouts: new Set(rows.map((r) => r.workoutId)).size,
    sets: rows.length,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    exercises: result,
  };
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The Preview card's one line for the PDF. */
export function reportSummary(report: Report): string {
  return `${plural(report.workouts, "workout")} · ${plural(report.sets, "set")} · ${plural(report.exercises.length, "exercise")}`;
}

/** The file name the share sheet offers, like `Increment report 2026-11-27.pdf` (local date). */
export function reportFileName(date: Date): string {
  return `Increment report ${dateString(date)}.pdf`;
}

/** True for a file an export leaves in the cache: `Increment export {date}.csv` or `Increment report {date}.pdf`. */
export function isExportFileName(name: string): boolean {
  return /^Increment (export .*\.csv|report .*\.pdf)$/.test(name);
}

/** Every user-typed string goes through this before it meets the HTML. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const WIDTH = 318;
const HEIGHT = 110;
const DASH = "–";
const number = (n: number) => {
  const [whole, decimal] = String(n).split(".");
  return decimal ? `${thousands(Number(whole))}.${decimal}` : thousands(n);
};

interface RecordsRow {
  best: string;
  oneRepMax: string;
  volume: string;
  reps: string;
  date: string;
}

function recordsRow(records: ExerciseRecords, unit: Unit): RecordsRow {
  if (records.loadType === "bodyweight") {
    return { best: DASH, oneRepMax: DASH, volume: DASH, reps: `${records.mostRepsInSet.value}`, date: records.mostRepsInSet.date };
  }
  const max = records.estimatedOneRepMax;
  return {
    best: `${records.heaviestSet.text} ${unit}`,
    oneRepMax: max ? `${number(max.value)} ${unit}` : DASH,
    volume: `${number(records.mostVolume.value)} ${unit}`,
    reps: DASH,
    date: records.heaviestSet.date,
  };
}

function chartSvg(points: ChartPoint[]): string {
  const g = chartGeometry(points.map((p) => p.value), WIDTH, HEIGHT);
  const { accent, line } = lightColors;
  const dots = g.points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${chart.dotRadius}" fill="${accent}"/>`).join("");
  return (
    `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M0 ${g.ticks[1].y}H${WIDTH}" stroke="${line}" fill="none"/>` +
    `<path d="${g.areaPath}" fill="${accent}" opacity="${chart.fillOpacity}"/>` +
    `<path d="${g.linePath}" stroke="${accent}" stroke-width="${chart.lineWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `${dots}</svg>`
  );
}

function exerciseBlock(e: ReportExercise, unit: Unit): string {
  const unitLabel = e.loadType === "bodyweight" ? "reps" : unit;
  const first = e.points[0];
  const last = e.points[e.points.length - 1];
  const body = e.tooFewPoints
    ? `<p class="muted">Your chart starts after your second workout.</p>`
    : `${chartSvg(e.points)}<p class="muted">${escapeHtml(`${first.date}: ${formatNumber(first.value, 1)} ${unitLabel}`)} → ${escapeHtml(`${last.date}: ${formatNumber(last.value, 1)} ${unitLabel}`)}</p>`;
  return `<section class="block"><h3>${escapeHtml(e.name)}</h3><p class="muted">${e.chartTitle}</p>${body}</section>`;
}

/** The report as one HTML document for `expo-print`: totals, the records table, then a chart block per exercise. */
export function reportHtml(report: Report, unit: Unit, generated: Date): string {
  const { ink, inkMuted, line, accent } = lightColors;
  const span = report.firstDate && report.lastDate ? `${report.firstDate} to ${report.lastDate}` : "No workouts";
  const rows = report.exercises
    .map((e) => {
      const r = recordsRow(e.records, unit);
      return `<tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(r.best)}</td><td>${escapeHtml(r.oneRepMax)}</td><td>${escapeHtml(r.volume)}</td><td>${escapeHtml(r.reps)}</td><td>${escapeHtml(r.date)}</td></tr>`;
    })
    .join("");
  // Only working sets count toward Records, so a range of warm-ups alone has no exercises to list.
  const body =
    report.exercises.length === 0
      ? `<h2>Records</h2><p class="muted">No working sets in this range yet. Warm-ups don't count toward Records.</p>`
      : `<h2>Records</h2>
<table><thead><tr><th>Exercise</th><th>Best weight</th><th>Est. 1RM</th><th>Best volume</th><th>Reps</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Progress</h2>
${report.exercises.map((e) => exerciseBlock(e, unit)).join("\n")}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: ${ink}; margin: 0; padding: 24px; font-size: 12px; }
h1 { font-size: 22px; margin: 0 0 4px; color: ${accent}; }
h2 { font-size: 15px; margin: 22px 0 8px; }
h3 { font-size: 13px; margin: 0 0 2px; }
.muted { color: ${inkMuted}; margin: 2px 0 6px; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 6px 4px; border-bottom: 1px solid ${line}; }
th { color: ${inkMuted}; font-weight: 600; }
tr { break-inside: avoid; page-break-inside: avoid; }
.block { break-inside: avoid; page-break-inside: avoid; margin-bottom: 16px; }
</style></head><body>
<h1>Increment report</h1>
<p class="muted">${escapeHtml(`${plural(report.workouts, "workout")} · ${plural(report.sets, "set")} · ${span}`)}</p>
<p class="muted">${escapeHtml(`Made ${dateString(generated)}`)}</p>
${body}
</body></html>`;
}
