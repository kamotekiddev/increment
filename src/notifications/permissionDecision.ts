/** Pure decisions about the notification permission. No I/O. */

/** Ask only while the OS has never been asked; a denial is never asked again. */
export function shouldAskPermission(status: string): boolean {
  return status === "undetermined";
}

/**
 * Whether the Reminders card shows "Notifications are off". `granted` is the last read of the OS
 * permission (null before the first read); `askedDenied` is set when the switch was tapped on and refused.
 */
export function notificationsOffNote(state: { remindersOn: boolean; granted: boolean | null; askedDenied: boolean }): boolean {
  if (state.granted !== false) return false;
  return state.remindersOn || state.askedDenied;
}

/** What turning Training day reminders on does, from the OS permission status. */
export function remindersSwitchDecision(status: string): "ask" | "on" | "stay-off" {
  if (shouldAskPermission(status)) return "ask";
  return status === "granted" ? "on" : "stay-off";
}
