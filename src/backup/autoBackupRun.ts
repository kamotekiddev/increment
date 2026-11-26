import Constants from "expo-constants";

import { proStore } from "@/pro";

import { runAutoBackup } from "./autoBackupFolder";
import { readAutoBackupSettings, readLastBackupHash } from "./autoBackupSettings";
import { checkAutoBackup, type Trigger, type TriggerEnv, type TriggerResult } from "./autoBackupTrigger";
import { contentFingerprint } from "./autoBackupText";
import { createBackup, readLastBackup } from "./backupQueries";

const realEnv: TriggerEnv = {
  isPro: () => proStore.getState().isPro,
  settings: () => readAutoBackupSettings(),
  lastBackupAt: readLastBackup,
  lastHash: readLastBackupHash,
  fingerprint: (now) => contentFingerprint(createBackup(now, Constants.expoConfig?.version ?? "1.0.0").text),
  run: runAutoBackup,
};

/**
 * Checks whether an automatic backup is due and writes it. The one call every trigger makes (workout summary closed,
 * app open, return to the app). Never throws and never waits on anything the lifter sees.
 */
export function triggerAutoBackup(trigger: Trigger): TriggerResult {
  return checkAutoBackup(trigger, Date.now(), realEnv);
}

/** Runs the check after the current screen work, so Finish, Done and launch never wait on it. */
export function scheduleAutoBackup(trigger: Trigger): void {
  setTimeout(() => {
    triggerAutoBackup(trigger);
  }, 0);
}
