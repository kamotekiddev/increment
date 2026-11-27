import { and, asc, eq, gte } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { formatNumber, toKg, type Unit } from "@/units";
import { routineLabel } from "@/workout/routineLabel";

/**
 * The export build: one pure selection of what an export holds (done sets of finished workouts in a time range),
 * and the CSV made from it. The PDF report (a later ticket) reads the same `buildExport` rows, so both formats agree
 * on the count. Nothing is stored and nothing is converted on the way: a weight is exported as typed (ADR 0003).
 */

/** The Time range choices on Export progress. */
export type ExportRange = "30d" | "3m" | "all";

export const EXPORT_RANGES: { value: ExportRange; label: string }[] = [
  { value: "30d", label: "30 days" },
  { value: "3m", label: "3 months" },
  { value: "all", label: "All time" },
];

/** One exported set. */
export interface ExportRow {
  /** Workout date, `YYYY-MM-DD`. */
  date: string;
  /** The workout's routine name, or "Workout" when it had none. */
  workout: string;
  exercise: string;
  /** 1-based set number within its exercise. */
  set: number;
  reps: number;
  /** As typed. */
  weight: number;
  unit: Unit;
  /** `weight` in kg, for sorting across units. */
  weightKg: number;
  isWarmup: boolean;
}

export interface ExportBuild {
  rows: ExportRow[];
  /** The number on the "Export N sets" button: always the row count. */
  setCount: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const dateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The first workout date (local, `YYYY-MM-DD`) the range includes, or null for All time. */
export function rangeStartDate(range: ExportRange, now: number): string | null {
  if (range === "all") return null;
  const d = new Date(now);
  const start = range === "30d" ? new Date(d.getFullYear(), d.getMonth(), d.getDate() - 30) : new Date(d.getFullYear(), d.getMonth() - 3, d.getDate());
  return dateString(start);
}

/**
 * Every done set (warm-ups included) of a finished workout whose date is in the range, oldest workout first, each
 * workout's exercises and sets in logged order. Skipped sets and a Workout in progress are left out.
 */
export function buildExport(range: ExportRange, now: number): ExportBuild {
  const start = rangeStartDate(range, now);
  const rows = db
    .select({
      date: workouts.date,
      routineName: routines.name,
      exercise: exercises.name,
      idx: sets.idx,
      reps: sets.reps,
      weight: sets.weight,
      unit: sets.weightUnit,
      isWarmup: sets.isWarmup,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(routines, eq(routines.id, workouts.routineId))
    .where(and(eq(sets.done, true), eq(workouts.inProgress, false), start === null ? undefined : gte(workouts.date, start)))
    .orderBy(asc(workouts.date), asc(workouts.startedAt), asc(workouts.id), asc(workoutExercises.position), asc(sets.idx))
    .all()
    .map<ExportRow>((r) => ({
      date: r.date,
      workout: routineLabel(r.routineName),
      exercise: r.exercise,
      set: r.idx + 1,
      reps: r.reps,
      weight: r.weight,
      unit: r.unit,
      weightKg: toKg(r.weight, r.unit),
      isWarmup: r.isWarmup,
    }));
  return { rows, setCount: rows.length };
}

const CSV_HEADER = ["date", "workout", "exercise", "set", "reps", "weight", "unit", "weight_kg", "is_warmup"];

/** A field in quotes when it holds a comma, a quote or a line break (quotes doubled). */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** The CSV text: a header, then a row per set, CRLF line ends, behind a UTF-8 BOM so Excel reads names right. */
export function csvText(rows: ExportRow[]): string {
  const lines = rows.map((r) =>
    [r.date, csvField(r.workout), csvField(r.exercise), r.set, r.reps, formatNumber(r.weight, 4), r.unit, r.weightKg.toFixed(2), r.isWarmup].join(","),
  );
  return `﻿${[CSV_HEADER.join(","), ...lines].join("\r\n")}\r\n`;
}

/** The first 3 rows as short lines for the Preview card. */
export function previewLines(rows: ExportRow[]): string[] {
  return rows.slice(0, 3).map((r) => `${r.date} · ${r.exercise} · set ${r.set} · ${r.reps} × ${formatNumber(r.weight, 4)} ${r.unit}`);
}

/** The file name the share sheet offers, like `Increment export 2026-11-27.csv` (local date). */
export function exportFileName(date: Date): string {
  return `Increment export ${dateString(date)}.csv`;
}
