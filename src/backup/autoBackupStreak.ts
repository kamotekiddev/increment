import type { TriggerResult } from "./autoBackupTrigger";

export const FAILURE_ALERT_TITLE = "Automatic backup couldn't save";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The alert's body: when the last backup was, or that there is none. */
export function failureAlertBody(lastBackupAt: number | null): string {
  if (lastBackupAt === null) return "You have no backup yet.";
  const d = new Date(lastBackupAt);
  return `Your last backup was ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`;
}

/**
 * The failure streak after a result. A failure sets the flag and asks for the alert only when the flag was clear
 * (`visible` false when the lifter is already looking at the failure, so no alert); a success clears it; a skipped
 * result is not a failure and changes nothing.
 */
export function nextStreak(flag: boolean, result: TriggerResult, visible = true): { flag: boolean; alert: boolean } {
  if (result === "skipped") return { flag, alert: false };
  if (result === "saved") return { flag: false, alert: false };
  return { flag: true, alert: !flag && visible };
}
