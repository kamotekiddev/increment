import { DAY_LABELS, DISPLAY_ORDER, isDaySet } from "../routines/routineDays";

/** A Routine as Today reads it. Pass Routines in Routines-tab order. `days` is the bitmask (Monday = bit 0). */
export interface TodayRoutine {
  id: number;
  name: string;
  days: number;
}

export interface TodayInput {
  /** Epoch ms of the current moment. Days are read in local time. */
  now: number;
  routines: TodayRoutine[];
  /** Finished Workouts only (discarded ones are not passed). `routineId` is null when the Routine was deleted. */
  finished: { routineId: number | null; startedAt: number }[];
  /** The Workout in progress, if any. */
  inProgress: { routineId: number | null } | null;
}

export interface StripDay {
  /** "Sun" to "Sat". */
  label: string;
  /** Local midnight of the day, epoch ms. */
  date: number;
  isToday: boolean;
  /** Some Routine is planned this weekday. */
  planned: boolean;
  /** A finished Workout started this day, planned or not. */
  done: boolean;
}

export interface TodayCard {
  routineId: number;
  name: string;
  status: "start" | "done" | "inProgress";
}

export type TodayState =
  | { kind: "cards"; cards: TodayCard[] }
  | { kind: "rest"; next: { routineName: string; dayLabel: string } }
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

/** Pure: the week strip and the screen state for Today, from plain inputs. */
export function buildToday({ now, routines, finished, inProgress }: TodayInput): TodayView {
  const today = new Date(now);
  const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const todayKey = dayKey(today);
  const finishedKeys = new Set(finished.map((w) => dayKey(new Date(w.startedAt))));

  const strip: StripDay[] = DISPLAY_ORDER.map((bit, i) => {
    const day = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    return {
      label: DAY_LABELS[bit],
      date: day.getTime(),
      isToday: dayKey(day) === todayKey,
      planned: routines.some((r) => isDaySet(r.days, bit)),
      done: finishedKeys.has(dayKey(day)),
    };
  });

  return { strip, state: stateFor(today, routines, finished, inProgress) };
}

function stateFor(
  today: Date,
  routines: TodayRoutine[],
  finished: TodayInput["finished"],
  inProgress: TodayInput["inProgress"],
): TodayState {
  if (routines.length === 0) return { kind: "noRoutines" };
  if (routines.every((r) => r.days === 0)) return { kind: "noDays" };

  const todayBit = bitOf(today);
  const planned = routines.filter((r) => isDaySet(r.days, todayBit));
  if (planned.length > 0) {
    const todayKey = dayKey(today);
    const doneIds = new Set(
      finished.filter((w) => w.routineId !== null && dayKey(new Date(w.startedAt)) === todayKey).map((w) => w.routineId),
    );
    return {
      kind: "cards",
      cards: planned.map((r) => ({
        routineId: r.id,
        name: r.name,
        status: inProgress && inProgress.routineId === r.id ? "inProgress" : doneIds.has(r.id) ? "done" : "start",
      })),
    };
  }

  for (let offset = 1; offset <= 7; offset++) {
    const bit = (todayBit + offset) % 7;
    const next = routines.find((r) => isDaySet(r.days, bit));
    if (next) return { kind: "rest", next: { routineName: next.name, dayLabel: DAY_LABELS[bit] } };
  }
  return { kind: "noDays" };
}
