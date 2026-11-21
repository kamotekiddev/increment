import { count, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { routines, workoutExercises, workouts } from "@/db/schema";
import type { Unit } from "@/units";

/** One month of History: its title (`November 2026`) and its rows, newest first. */
export interface HistorySection {
  title: string;
  data: HistoryRow[];
}

/** One finished Workout on History, as display text. */
export interface HistoryRow {
  workoutId: number;
  /** `Thu, 12 Nov` */
  dateLabel: string;
  /** The Routine's current name, or `Workout`. */
  routineLabel: string;
  /** `5 exercises · 48 min` */
  detail: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The parts of a stored local `YYYY-MM-DD`, split by hand so it is never read as UTC. */
function dateParts(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function dateLabel(date: string): string {
  const { year, month, day } = dateParts(date);
  const weekday = new Date(year, month - 1, day).getDay();
  return `${WEEKDAYS[weekday]}, ${day} ${MONTHS[month - 1].slice(0, 3)}`;
}

function monthTitle(date: string): string {
  const { year, month } = dateParts(date);
  return `${MONTHS[month - 1]} ${year}`;
}

function durationText(startedAt: number, finishedAt: number): string {
  // The Workout summary's rule: whole minutes, never negative.
  const minutes = Math.max(0, Math.floor((finishedAt - startedAt) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function exerciseCount(n: number): string {
  return `${n} ${n === 1 ? "exercise" : "exercises"}`;
}

/**
 * Every finished Workout across all Routines, newest first, under month sections, as finished display text.
 * The unit is taken now so the signature matches Past workout; the list itself shows no weights.
 */
export function workoutHistory(_unit: Unit): HistorySection[] {
  const rows = db
    .select({
      id: workouts.id,
      date: workouts.date,
      startedAt: workouts.startedAt,
      finishedAt: workouts.finishedAt,
      routineName: routines.name,
      exercises: count(workoutExercises.id),
    })
    .from(workouts)
    .leftJoin(routines, eq(routines.id, workouts.routineId))
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .where(eq(workouts.inProgress, false))
    .groupBy(workouts.id)
    .orderBy(desc(workouts.startedAt), desc(workouts.id))
    .all();

  const sections: HistorySection[] = [];
  for (const row of rows) {
    const title = monthTitle(row.date);
    let section = sections[sections.length - 1];
    if (section?.title !== title) {
      section = { title, data: [] };
      sections.push(section);
    }
    section.data.push({
      workoutId: row.id,
      dateLabel: dateLabel(row.date),
      routineLabel: row.routineName ?? "Workout",
      detail: `${exerciseCount(row.exercises)} · ${durationText(row.startedAt, row.finishedAt ?? row.startedAt)}`,
    });
  }
  return sections;
}
