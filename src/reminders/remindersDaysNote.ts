import { openRoutines } from "@/routines/openRoutines";
import { DAY_LABELS, DISPLAY_ORDER, isDaySet } from "@/routines/routineDays";

/** Pure: the Reminder days for Settings, Sunday first ("Mon, Tue, Thu, Fri"), "Every day", or null when no open Routine has days (Locked routines are left out). */
export function remindersDaysNote(routines: readonly { id: number; days: number }[], isPro: boolean): string | null {
  const mask = openRoutines(routines, isPro).reduce((all, r) => all | r.days, 0);
  const set = DISPLAY_ORDER.filter((i) => isDaySet(mask, i));
  if (set.length === 0) return null;
  if (set.length === 7) return "Every day";
  return set.map((i) => DAY_LABELS[i]).join(", ");
}
