import { REMINDER_ID_PREFIX } from "./reminderId";

const LIVE_WORKOUT_PATH = /^\/workout\/[^/]+$/;

/** Whether a tapped notification should bring the lifter to Today: a Reminder, and not while the live workout screen (/workout/<id>) is open. */
export function reminderTapRoutesToToday(notificationId: string, pathname: string): boolean {
  if (!notificationId.startsWith(REMINDER_ID_PREFIX)) return false;
  return !LIVE_WORKOUT_PATH.test(pathname);
}
