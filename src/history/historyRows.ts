import { formatWeight, type Unit } from "../units";
import { repsText } from "../workout/repsText";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** One finished workout's record of one exercise, as read from the database. */
export interface PastWorkoutExercise {
  workoutExerciseId: number;
  startedAt: number;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** The routine's current name; null when the workout has no routine. */
  routineName: string | null;
  isDeload: boolean;
  sets: { idx: number; weightKg: number; reps: number; done: boolean; isWarmup: boolean }[];
}

export interface HistoryRow {
  key: string;
  dateLabel: string;
  routineName: string | null;
  isDeload: boolean;
  /** One per done working set, in set order: "62.5 × 8", or "9 reps" when no weight was logged. */
  chips: string[];
}

/**
 * "Thu, 12 Nov", with the year ("Sun, 28 Dec 2025") only when it is not the year of `todayIso`.
 * Both dates are YYYY-MM-DD and split by hand: `new Date("2026-11-12")` is UTC and can land a day early.
 */
export function historyDateLabel(dateIso: string, todayIso: string): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  const label = `${weekday}, ${day} ${MONTHS[month - 1]}`;
  return year === Number(todayIso.slice(0, 4)) ? label : `${label} ${year}`;
}

/**
 * One chip: "62.5 × 8" in the unit on screen. A set with no stored weight (a bodyweight exercise) is reps only;
 * a set logged with added weight before the bodyweight split keeps its weight.
 */
export function chipText(weightKg: number, reps: number, unit: Unit): string {
  return weightKg > 0 ? `${formatWeight(weightKg, unit)} × ${reps}` : repsText(reps);
}

/** The rows to show: newest first as given, each with its done working sets; a workout with none is left out. */
export function buildHistoryRows(past: PastWorkoutExercise[], unit: Unit, todayIso: string): HistoryRow[] {
  const rows: HistoryRow[] = [];
  for (const p of past) {
    const done = p.sets.filter((s) => s.done && !s.isWarmup).sort((a, b) => a.idx - b.idx);
    if (done.length === 0) continue;
    rows.push({
      key: String(p.workoutExerciseId),
      dateLabel: historyDateLabel(p.date, todayIso),
      routineName: p.routineName,
      isDeload: p.isDeload,
      chips: done.map((s) => chipText(s.weightKg, s.reps, unit)),
    });
  }
  return rows;
}
