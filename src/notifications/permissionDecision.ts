/** Pure decisions about the notification permission. No I/O. */

/** Ask only while the OS has never been asked; a denial is never asked again. */
export function shouldAskPermission(status: string): boolean {
  return status === "undetermined";
}

/** What turning Training day reminders on does, from the OS permission status. */
export function remindersSwitchDecision(status: string): "ask" | "on" | "stay-off" {
  if (shouldAskPermission(status)) return "ask";
  return status === "granted" ? "on" : "stay-off";
}
