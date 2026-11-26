export const FREQUENCY_OPTIONS = [
  { value: "afterEvery", label: "After every workout", caption: "When you finish a workout" },
  { value: "daily", label: "Every day", caption: "Once a day, if anything changed" },
  { value: "weekly", label: "Every week", caption: "Once a week, if anything changed" },
  { value: "monthly", label: "Every month", caption: "Once a month, if anything changed" },
] as const;
export type Frequency = (typeof FREQUENCY_OPTIONS)[number]["value"];
export const FREQUENCY_DEFAULT: Frequency = "afterEvery";

/** A stored frequency, or the default when it is missing or unknown. */
export function parseFrequency(value: unknown): Frequency {
  return FREQUENCY_OPTIONS.find((o) => o.value === value)?.value ?? FREQUENCY_DEFAULT;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const INTERVAL_DAYS = { daily: 1, weekly: 7, monthly: 30 } as const;

/**
 * Whether an automatic backup is due. Daily, weekly and monthly need a rolling 1 / 7 / 30 days since the last backup
 * (manual or automatic; never backed up counts as long ago) and changed data. After every workout has no interval:
 * the caller says whether the data changed (a finished workout always does).
 */
export function isBackupDue(frequency: Frequency, lastBackupAt: number | null, now: number, changed: boolean): boolean {
  if (!changed) return false;
  if (frequency === "afterEvery" || lastBackupAt === null) return true;
  return now - lastBackupAt >= INTERVAL_DAYS[frequency] * DAY_MS;
}
