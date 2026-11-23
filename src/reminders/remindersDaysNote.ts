import { DAY_LABELS, DISPLAY_ORDER, isDaySet } from "../routines/routineDays";

/** Pure: the Reminder days for Settings, Sunday first ("Mon, Tue, Thu, Fri"), "Every day", or null when no Routine has days. */
export function remindersDaysNote(routines: readonly { days: number }[]): string | null {
  const mask = routines.reduce((all, r) => all | r.days, 0);
  const set = DISPLAY_ORDER.filter((i) => isDaySet(mask, i));
  if (set.length === 0) return null;
  if (set.length === 7) return "Every day";
  return set.map((i) => DAY_LABELS[i]).join(", ");
}
