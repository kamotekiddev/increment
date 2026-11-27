import { DAY_LABELS, isDaySet } from "@/routines/routineDays";

import { QUICK_START_PLAN } from "./quickStartPlan";

export interface QuickStartDefaultRow {
  label: string;
  value: string;
}

export interface QuickStartPlanRow {
  /** The day badge, e.g. "Mon, Fri". */
  days: string;
  name: string;
  /** The real exercise names and the count, e.g. "Barbell Squat, Leg Press · 4 exercises". */
  subtitle: string;
}

/** Pure: the four Quick start defaults as Quick start lists them (the Glossary's Quick start defaults). */
export function quickStartDefaultRows(): QuickStartDefaultRow[] {
  return [
    { label: "Goal", value: "Stay fit and healthy" },
    { label: "Experience", value: "Just starting" },
    { label: "Schedule", value: "3 days · Mon, Wed, Fri" },
    { label: "Equipment", value: "Full gym" },
  ];
}

/** Pure: "Mon, Fri", in week order starting Monday. */
function badge(mask: number): string {
  return DAY_LABELS.filter((_, i) => isDaySet(mask, i)).join(", ");
}

/** Pure: one row per routine of the hard-coded Starter plan, so the screen never repeats the plan's text. */
export function quickStartPlanRows(): QuickStartPlanRow[] {
  return QUICK_START_PLAN.map((r) => ({
    days: badge(r.days),
    name: r.name,
    subtitle: `${r.exercises.join(", ")} · ${r.exercises.length} exercises`,
  }));
}
