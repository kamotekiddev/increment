import { and, asc, countDistinct, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { exerciseCountText } from "@/today/todayText";
import { formatWeight, type Unit } from "@/units";
import { durationMinutes } from "@/workout/durationMinutes";
import { repsText } from "@/workout/repsText";
import { routineLabel } from "@/workout/routineLabel";

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

/** `48 min`, `1 h`, `1 h 12 min`: the Workout summary's minutes. A finished Workout always has a finish time. */
function durationText({ startedAt, finishedAt }: { startedAt: number; finishedAt: number | null }): string {
  const minutes = durationMinutes(startedAt, finishedAt ?? startedAt);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Every finished Workout across all Routines, newest first, under month sections, as finished display text. */
export function workoutHistory(): HistorySection[] {
  const rows = db
    .select({
      id: workouts.id,
      date: workouts.date,
      startedAt: workouts.startedAt,
      finishedAt: workouts.finishedAt,
      routineName: routines.name,
      // Only Workout exercises with a done Working set count; a warm-up-only exercise was not trained.
      exercises: countDistinct(sets.workoutExerciseId),
    })
    .from(workouts)
    .leftJoin(routines, eq(routines.id, workouts.routineId))
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(sets, and(eq(sets.workoutExerciseId, workoutExercises.id), eq(sets.done, true), eq(sets.isWarmup, false)))
    .where(eq(workouts.inProgress, false))
    .groupBy(workouts.id)
    .orderBy(desc(workouts.startedAt), desc(workouts.id))
    .all();

  // Keyed by title, so a month shows once even if a row's date and start time disagree on the order.
  const sections = new Map<string, HistorySection>();
  for (const row of rows) {
    const title = monthTitle(row.date);
    let section = sections.get(title);
    if (!section) {
      section = { title, data: [] };
      sections.set(title, section);
    }
    section.data.push({
      workoutId: row.id,
      dateLabel: dateLabel(row.date),
      routineLabel: routineLabel(row.routineName),
      detail: `${exerciseCountText(row.exercises)} · ${durationText(row)}`,
    });
  }
  return [...sections.values()];
}

/** One finished Workout on Past workout, as display text. */
export interface PastWorkout {
  /** The Routine's current name, or `Workout`. */
  routineLabel: string;
  /** `Thu, 12 Nov · 48 min` */
  detail: string;
  /** One per Workout exercise with a done Working set, in the Workout's order. */
  cards: PastExerciseCard[];
}

/** One exercise of a Past workout, as display text. */
export interface PastExerciseCard {
  workoutExerciseId: number;
  name: string;
  /** `Target 62.5 × 8`, `Target 10 reps`, or null when the Workout had no Target for it. */
  target: string | null;
  /** Done as a Deload: the screen shows the grey Deload pill. */
  deload: boolean;
  /** One per done Working set, in set order: `62.5 × 8`. */
  chips: string[];
}

/** The stored Target as text, by Load type; converted for display, never snapped to the Jump grid. */
function targetText(loadType: "weighted" | "bodyweight", weightKg: number | null, reps: number | null, unit: Unit): string | null {
  if (reps === null) return null;
  if (loadType === "bodyweight") return `Target ${repsText(reps)}`;
  if (weightKg === null) return null;
  return `Target ${formatWeight(weightKg, unit)} × ${reps}`;
}

/** One finished Workout as display text: its header and exercise cards. */
export function pastWorkout(id: number, unit: Unit): PastWorkout | null {
  const workout = db
    .select({ date: workouts.date, startedAt: workouts.startedAt, finishedAt: workouts.finishedAt, routineName: routines.name })
    .from(workouts)
    .leftJoin(routines, eq(routines.id, workouts.routineId))
    .where(and(eq(workouts.id, id), eq(workouts.inProgress, false)))
    .get();
  if (!workout) return null;

  const rows = db
    .select({
      workoutExerciseId: workoutExercises.id,
      name: exercises.name,
      loadType: exercises.loadType,
      targetWeightKg: workoutExercises.targetWeightKg,
      targetReps: workoutExercises.targetReps,
      deload: workoutExercises.isDeload,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(eq(workoutExercises.workoutId, id))
    .orderBy(asc(workoutExercises.position), asc(workoutExercises.id))
    .all();

  // Working sets only: done and not a warm-up, in set order.
  const workingSets = db
    .select({ workoutExerciseId: sets.workoutExerciseId, weightKg: sets.weightKg, reps: sets.reps })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .where(and(eq(workoutExercises.workoutId, id), eq(sets.done, true), eq(sets.isWarmup, false)))
    .orderBy(asc(sets.idx), asc(sets.id))
    .all();
  const chips = new Map<number, string[]>();
  for (const set of workingSets) {
    const list = chips.get(set.workoutExerciseId) ?? [];
    // Any weight above 0 shows, so added weight logged on a bodyweight exercise stays visible.
    list.push(set.weightKg > 0 ? `${formatWeight(set.weightKg, unit)} × ${set.reps}` : repsText(set.reps));
    chips.set(set.workoutExerciseId, list);
  }

  return {
    routineLabel: routineLabel(workout.routineName),
    detail: `${dateLabel(workout.date)} · ${durationText(workout)}`,
    // Only exercises with a done Working set get a card; a warm-up-only exercise was not trained.
    cards: rows.flatMap((row) => {
      const done = chips.get(row.workoutExerciseId);
      if (!done) return [];
      return [
        {
          workoutExerciseId: row.workoutExerciseId,
          name: row.name,
          target: targetText(row.loadType, row.targetWeightKg, row.targetReps, unit),
          deload: row.deload,
          chips: done,
        },
      ];
    }),
  };
}
