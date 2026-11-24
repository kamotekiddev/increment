import { withoutLocked } from "@/routines/openRoutines";
import { isDaySet } from "@/routines/routineDays";

import { REMINDER_ID_PREFIX } from "./reminderId";

/** How many days the planner looks ahead, today included. */
export const REMINDER_WINDOW_DAYS = 28;

/** A Routine as the planner sees it, in Routines-tab order. `days` is the bitmask with Monday = bit 0. */
export type PlannerRoutine = { id: number; name: string; days: number; exerciseCount: number };

export type PlannedReminder = { id: string; at: Date; title: string; body: string };

type PlannerInput = {
  routines: readonly PlannerRoutine[];
  /** Whether a Workout was started today. Only today can already have one. */
  workoutStartedToday: boolean;
  /** Reminder time as minutes after local midnight. */
  timeMinutes: number;
  now: Date;
  /** Locked routines get no reminder. */
  lockedIds: ReadonlySet<number>;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function joinNames(names: readonly string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function bodyFor(planned: readonly PlannerRoutine[]): string {
  if (planned.length > 1) return `${planned.length} workouts planned`;
  const n = planned[0].exerciseCount;
  if (n === 0) return "No exercises yet";
  return n === 1 ? "1 exercise planned" : `${n} exercises planned`;
}

/**
 * Pure: the reminders for today and the next 27 days. A day with no planned open Routine gets none (a Locked routine is never planned).
 * Today is skipped when its time has passed or a Workout was started today.
 */
export function planReminders({ routines, workoutStartedToday, timeMinutes, now, lockedIds }: PlannerInput): PlannedReminder[] {
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  const open = withoutLocked(routines, lockedIds);
  const out: PlannedReminder[] = [];
  for (let offset = 0; offset < REMINDER_WINDOW_DAYS; offset++) {
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate() + offset;
    const at = new Date(y, m, d, hours, minutes);
    if (offset === 0 && (workoutStartedToday || at.getTime() <= now.getTime())) continue;
    const bit = (at.getDay() + 6) % 7; // Date: Sunday = 0; the bitmask has Monday = bit 0
    const planned = open.filter((r) => isDaySet(r.days, bit));
    if (planned.length === 0) continue;
    out.push({
      id: `${REMINDER_ID_PREFIX}${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`,
      at,
      title: `${joinNames(planned.map((r) => r.name))} today`,
      body: bodyFor(planned),
    });
  }
  return out;
}
