import { DAY_LABELS, DISPLAY_ORDER, isDaySet } from "@/routines/routineDays";

import { weekdayName } from "./todayText";
import { weekEnd, weekStart } from "./week";

/** A Routine as Today reads it. Pass Routines in Routines-tab order. `days` is the bitmask (Monday = bit 0). */
export interface TodayRoutine {
  id: number;
  name: string;
  days: number;
  exerciseCount: number;
}

/** A finished Workout row as Today reads it. `routineId` is null when the Routine was deleted. */
export interface FinishedWorkout {
  routineId: number | null;
  startedAt: number;
}

export interface TodayInput {
  /** Epoch ms of the current moment. Days are read in local time. */
  now: number;
  routines: TodayRoutine[];
  /** A Locked routine (left out of `routines`) has training days. Only the nudge reads it: such a day is a rest day, not "no days set". */
  lockedHaveDays?: boolean;
  /** Finished Workouts only (discarded ones are not passed). `routineId` is null when the Routine was deleted. */
  finished: FinishedWorkout[];
  /** The Workout in progress, if any. */
  inProgress: { routineId: number | null } | null;
}

export interface StripDay {
  /** "Sun" to "Sat". */
  label: string;
  /** Local midnight of the day, epoch ms. */
  date: number;
  /** Day of the month, 1 to 31. */
  dayNumber: number;
  isToday: boolean;
  /** Some Routine is planned this weekday. */
  planned: boolean;
  /** A finished Workout started this day, planned or not. */
  done: boolean;
}

export interface TodayCard {
  routineId: number;
  name: string;
  exerciseCount: number;
  status: "start" | "done" | "inProgress";
}

export type TodayState =
  | { kind: "cards"; cards: TodayCard[] }
  | {
      kind: "rest";
      /** The next planned Routine, with the full weekday it falls on ("Thursday"). Null when only Locked routines have days. */
      next: { routineId: number; routineName: string; weekday: string } | null;
      /** Routine-days planned this week (a Routine on 3 days counts 3), and finished workouts started this week. */
      week: { planned: number; done: number };
    }
  | { kind: "noDays" }
  | { kind: "noRoutines" };

export interface TodayView {
  /** Seven days, Sunday first. */
  strip: StripDay[];
  state: TodayState;
}

/** Bit index (Monday = 0) of the weekday of a local date. */
function bitOf(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function date(from: Date, offset: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
}

function weekTotals(now: number, routines: TodayRoutine[], finished: FinishedWorkout[]): { planned: number; done: number } {
  const start = weekStart(now);
  const end = weekEnd(now);
  return {
    planned: routines.reduce((sum, r) => sum + DISPLAY_ORDER.filter((bit) => isDaySet(r.days, bit)).length, 0),
    done: finished.filter((w) => w.startedAt >= start && w.startedAt < end).length,
  };
}

/** Pure: the week strip and the screen state for Today, from plain inputs. */
export function buildToday({ now, routines, finished, inProgress, lockedHaveDays = false }: TodayInput): TodayView {
  const today = new Date(now);
  const sunday = new Date(weekStart(now));
  const todayKey = dayKey(today);
  const finishedKeys = new Set(finished.map((w) => dayKey(new Date(w.startedAt))));

  const strip: StripDay[] = DISPLAY_ORDER.map((bit, i) => {
    const day = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    return {
      label: DAY_LABELS[bit],
      date: day.getTime(),
      dayNumber: day.getDate(),
      isToday: dayKey(day) === todayKey,
      planned: routines.some((r) => isDaySet(r.days, bit)),
      done: finishedKeys.has(dayKey(day)),
    };
  });

  return { strip, state: stateFor(now, routines, finished, inProgress, lockedHaveDays) };
}

function stateFor(
  now: number,
  routines: TodayRoutine[],
  finished: TodayInput["finished"],
  inProgress: TodayInput["inProgress"],
  lockedHaveDays: boolean,
): TodayState {
  const today = new Date(now);
  if (routines.length === 0) return { kind: "noRoutines" };
  if (routines.every((r) => r.days === 0)) {
    // Days only on Locked routines: a normal rest day, never the "set training days" nudge.
    return lockedHaveDays ? { kind: "rest", next: null, week: weekTotals(now, routines, finished) } : { kind: "noDays" };
  }

  const todayBit = bitOf(today);
  const planned = routines.filter((r) => isDaySet(r.days, todayBit));
  if (planned.length > 0) {
    const todayKey = dayKey(today);
    const doneIds = new Set(
      finished.filter((w) => w.routineId !== null && dayKey(new Date(w.startedAt)) === todayKey).map((w) => w.routineId),
    );
    const cards: TodayCard[] = planned.map((r) => ({
      routineId: r.id,
      name: r.name,
      exerciseCount: r.exerciseCount,
      status: inProgress && inProgress.routineId === r.id ? "inProgress" : doneIds.has(r.id) ? "done" : "start",
    }));
    // Deck order: what still needs doing first (Routines-tab order), then the Done ones behind.
    return { kind: "cards", cards: [...cards.filter((c) => c.status !== "done"), ...cards.filter((c) => c.status === "done")] };
  }

  for (let offset = 1; offset <= 7; offset++) {
    const bit = (todayBit + offset) % 7;
    const next = routines.find((r) => isDaySet(r.days, bit));
    if (next) {
      const weekday = weekdayName(date(today, offset).getDay());
      return { kind: "rest", next: { routineId: next.id, routineName: next.name, weekday }, week: weekTotals(now, routines, finished) };
    }
  }
  return { kind: "noDays" };
}
