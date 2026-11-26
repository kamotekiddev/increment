import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert } from "react-native";

import { proStore } from "@/pro";

import { runAutoBackup } from "./autoBackupFolder";
import { readAutoBackupFailing, readAutoBackupSettings, readLastBackupHash, writeAutoBackupFailing } from "./autoBackupSettings";
import { checkAutoBackup, type Trigger, type TriggerEnv, type TriggerResult } from "./autoBackupTrigger";
import { FAILURE_ALERT_TITLE, failureAlertBody, nextStreak } from "./autoBackupStreak";
import { createBackup, latestFinishedAt, readLastBackup } from "./backupQueries";

const realEnv: TriggerEnv = {
  isPro: () => proStore.getState().isPro,
  settings: () => readAutoBackupSettings(),
  lastBackupAt: readLastBackup,
  lastHash: readLastBackupHash,
  latestFinishedAt,
  buildText: (now) => createBackup(now, Constants.expoConfig?.version ?? "1.0.0").text,
  run: runAutoBackup,
};

/**
 * Checks whether an automatic backup is due and writes it. The one call every trigger makes (workout summary closed,
 * app open, return to the app). Never throws and never waits on anything the lifter sees.
 */
export function triggerAutoBackup(trigger: Trigger): TriggerResult {
  const result = checkAutoBackup(trigger, Date.now(), realEnv);
  recordAutoBackupResult(result, true);
  return result;
}

/**
 * Updates the failure streak for a result. The first failure of a streak shows one alert when `alert` is true (the
 * screen passes false: the lifter already sees the status line). Never throws and never blocks anything.
 */
export function recordAutoBackupResult(result: TriggerResult, alert: boolean): void {
  try {
    const flag = readAutoBackupFailing();
    const next = nextStreak(flag, result, alert);
    if (next.flag !== flag) writeAutoBackupFailing(next.flag);
    if (next.alert) {
      Alert.alert(FAILURE_ALERT_TITLE, failureAlertBody(readLastBackup()), [
        { text: "Fix it", onPress: () => router.push("/automatic-backups") },
        { text: "Later", style: "cancel" },
      ]);
    }
  } catch {
    // Feedback is best effort.
  }
}

/** Runs the check after the current screen work, so Finish, Done and launch never wait on it. */
export function scheduleAutoBackup(trigger: Trigger): void {
  setTimeout(() => {
    triggerAutoBackup(trigger);
  }, 0);
}
