import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

import { useRestStore } from "./restStore";
import { restNotificationContent, secondsUntil, shouldAskPermission } from "./restNotificationText";

/** Thin wrapper over expo-notifications for the rest-over alert. Every call is guarded: a failure never breaks the timer. */

const CHANNEL_ID = "rest";

let scheduledId: string | null = null;
/** Bumped on every schedule or cancel, so a schedule that was waiting on the permission prompt can tell it was overtaken. */
let generation = 0;

/** The permission check and request, made once per app session so rescheduling never repeats or doubles the prompt. */
let permission: Promise<boolean> | null = null;

function ensurePermission(): Promise<boolean> {
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

/** Call once at app start: no banner or sound while the app is open, the Android channel, and cancel when the rest clears. */
export function setupRestNotifications() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Rest timer",
        importance: AndroidImportance.HIGH,
      }).catch(() => {});
    }
  } catch {
    // Notifications are optional; the timer works without them.
  }
  // Every way a rest ends (Skip, zero, unmark, Finish, Discard) clears the timer: cancel then.
  useRestStore.subscribe((state, prev) => {
    if (prev.timer && !state.timer) void cancelRestNotification();
  });
}

export async function cancelRestNotification() {
  generation++;
  const id = scheduledId;
  scheduledId = null;
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}

/**
 * Schedules (or reschedules) the alert for when the rest ends. Asks for permission once, only
 * when the OS has never been asked. With permission denied this does nothing.
 */
export async function scheduleRestNotification(endsAt: number, nextUp: string | null) {
  const mine = ++generation;
  const previous = scheduledId;
  scheduledId = null;
  try {
    if (previous) await Notifications.cancelScheduledNotificationAsync(previous);
    if (!(await ensurePermission()) || mine !== generation) return;
    const seconds = secondsUntil(endsAt, Date.now());
    if (seconds === null) return;
    const id = await Notifications.scheduleNotificationAsync({
      content: restNotificationContent(nextUp),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL_ID },
    });
    if (mine === generation) scheduledId = id;
    else await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}
