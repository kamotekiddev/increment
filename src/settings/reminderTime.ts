/** A local Date today at `minutes` after midnight, for the picker. */
export function dateAtMinutes(minutes: number, base: Date = new Date()): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), Math.floor(minutes / 60), minutes % 60);
}

/** Minutes after local midnight of a picked Date. */
export function minutesOfDate(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** The time in the phone's own 12- or 24-hour format ("6:00 PM" or "18:00"). */
export function formatReminderTime(minutes: number): string {
  return dateAtMinutes(minutes).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
