import type { StripDay } from "./todayState";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Full weekday name for `Date.getDay()` (0 = Sunday). */
export function weekdayName(index: number): string {
  return WEEKDAYS[index];
}

/** The date line above the title, in local time: "Thursday, 12 Nov". */
export function dateLine(now: number): string {
  const d = new Date(now);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** The page title: "Rest day" on a rest day, otherwise "Today". */
export function screenTitle(stateKind: string): string {
  return stateKind === "rest" ? "Rest day" : "Today";
}

/** The rest-day banner body, from the Routine-days planned this week and the workouts done this week. */
export function restBannerText(planned: number, done: number): string {
  if (done === 0) return "Muscles grow while you rest.";
  if (done <= planned) return `${done} of ${planned} workouts done this week. Muscles grow while you rest.`;
  return `${done} ${done === 1 ? "workout" : "workouts"} done this week.`;
}

/** Screen-reader label of a strip cell: "Mon 9, planned", "Tue 10, workout done". */
export function stripLabel(day: StripDay): string {
  const parts = [`${day.label} ${day.dayNumber}`];
  if (day.isToday) parts.push("today");
  if (day.done) parts.push("workout done");
  else if (day.planned) parts.push("planned");
  return parts.join(", ");
}
