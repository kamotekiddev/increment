import { isBackupDue, type Frequency } from "./autoBackupDue";
import { contentFingerprint } from "./autoBackupText";
import type { AutoBackupResult } from "./autoBackupWrite";

/** What starts a check: a workout finishing (its summary closed), or the app opening or returning to the foreground. */
export type Trigger = "workout-finished" | "foreground";
export type TriggerResult = AutoBackupResult | "skipped";

/** Everything the check reads or does. `autoBackupRun.ts` supplies the real one; tests supply fakes. */
export interface TriggerEnv {
  isPro(): boolean;
  settings(): { on: boolean; frequency: Frequency };
  lastBackupAt(): number | null;
  /** When the newest finished workout finished (ms), or null: a cheap "data changed" signal, no export built. */
  latestFinishedAt(): number | null;
  /** Builds the backup text as it is now (a full export: ask only once the interval has passed). */
  buildText(now: number): string;
  /** The fingerprint stored when the last backup was written, or null. */
  lastHash(): string | null;
  /** Writes one automatic backup now, from `text` when the check already built it. */
  run(now: number, text?: string): AutoBackupResult;
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
 * Skipped for a free lifter, with the switch off, or while a workout summary is open. When a workout summary closes,
 * After every workout always writes; the other frequencies take the same due check as app open, so a backup that came
 * due while the summary was open is not lost. App open and return to the app check every frequency: After every
 * workout catches up when a workout finished since the last backup (no export is built for that); the others build the
 * export once, only after the interval has passed, and reuse its text for the write. Never throws.
 */
export function checkAutoBackup(trigger: Trigger, now: number, env: TriggerEnv): TriggerResult {
  try {
    if (summariesOpen > 0 || !env.isPro()) return "skipped";
    const { on, frequency } = env.settings();
    if (!on) return "skipped";
    if (trigger === "workout-finished" && frequency === "afterEvery") return env.run(now);
    const last = env.lastBackupAt();
    if (frequency === "afterEvery") {
      const latest = env.latestFinishedAt();
      return last === null || (latest !== null && latest > last) ? env.run(now) : "skipped";
    }
    if (!isBackupDue(frequency, last, now, true)) return "skipped";
    const text = env.buildText(now);
    const changed = contentFingerprint(text) !== env.lastHash();
    return isBackupDue(frequency, last, now, changed) ? env.run(now, text) : "skipped";
  } catch {
    return "failed";
  }
}
