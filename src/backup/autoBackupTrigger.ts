import { isBackupDue, type Frequency } from "./autoBackupDue";
import type { AutoBackupResult } from "./autoBackupWrite";

/** What starts a check: a workout finishing (its summary closed), or the app opening or returning to the foreground. */
export type Trigger = "workout-finished" | "foreground";
export type TriggerResult = AutoBackupResult | "skipped";

/** Everything the check reads or does. `autoBackupRun.ts` supplies the real one; tests supply fakes. */
export interface TriggerEnv {
  isPro(): boolean;
  settings(): { on: boolean; frequency: Frequency };
  lastBackupAt(): number | null;
  /** The content fingerprint of the backup as it is now. */
  fingerprint(now: number): string;
  /** The fingerprint stored when the last backup was written, or null. */
  lastHash(): string | null;
  /** Writes one automatic backup now. */
  run(now: number): AutoBackupResult;
}

let summariesOpen = 0;

/** A workout summary opened: no automatic backup runs until it closes. */
export const summaryOpened = (): void => {
  summariesOpen += 1;
};
/** A workout summary closed. */
export const summaryClosed = (): void => {
  summariesOpen = Math.max(0, summariesOpen - 1);
};

/**
 * The one function every trigger calls. Writes an automatic backup when one is due and says saved, failed or skipped.
 * Skipped for a free lifter, with the switch off, or while a workout summary is open. A finished workout writes only on
 * After every workout, and always counts as a change; app open and return to the app check every frequency (After
 * every workout catches up when the data changed since the last backup). Never throws.
 */
export function checkAutoBackup(trigger: Trigger, now: number, env: TriggerEnv): TriggerResult {
  try {
    if (summariesOpen > 0 || !env.isPro()) return "skipped";
    const { on, frequency } = env.settings();
    if (!on) return "skipped";
    if (trigger === "workout-finished") return frequency === "afterEvery" ? env.run(now) : "skipped";
    const last = env.lastBackupAt();
    // Only build the fingerprint (a full export) once the interval has passed.
    if (!isBackupDue(frequency, last, now, true)) return "skipped";
    const changed = env.fingerprint(now) !== env.lastHash();
    return isBackupDue(frequency, last, now, changed) ? env.run(now) : "skipped";
  } catch {
    return "failed";
  }
}
