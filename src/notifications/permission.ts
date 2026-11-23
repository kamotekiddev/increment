import * as Notifications from "expo-notifications";

import { remindersSwitchDecision, shouldAskPermission } from "./permissionDecision";

/**
 * The one notification permission shared by the rest timer and Reminders. Whoever asks first asks for
 * both, and a denial anywhere is never asked again.
 */

/** The permission check and request, made once per app session so rescheduling never repeats or doubles the prompt. */
let permission: Promise<boolean> | null = null;

/** The rest timer's one-time ask: asks only while the OS has never been asked. Resolves to whether notifications are allowed. */
export function ensurePermission(): Promise<boolean> {
  permission ??= (async () => {
    let result = await Notifications.getPermissionsAsync();
    if (shouldAskPermission(result.status)) result = await Notifications.requestPermissionsAsync();
    return result.granted;
  })().catch(() => {
    permission = null;
    return false;
  });
  return permission;
}

/** Whether notifications are allowed right now, read fresh and never asking. False on any failure. */
export async function isPermissionGranted(): Promise<boolean> {
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/**
 * Turning Training day reminders on: reads the status, asks only when the OS has never been asked,
 * and resolves to whether reminders may switch on (permission granted).
 */
export async function requestForReminders(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    const decision = remindersSwitchDecision(status);
    if (decision === "on") return true;
    if (decision === "stay-off") return false;
    const result = await Notifications.requestPermissionsAsync();
    permission = Promise.resolve(result.granted);
    return result.granted;
  } catch {
    return false;
  }
}
