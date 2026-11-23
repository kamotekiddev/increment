import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

import { ensurePermission } from "@/notifications";

import { useRestStore } from "./restStore";
import { restNotificationContent, secondsUntil } from "./restNotificationText";

/** Thin wrapper over expo-notifications for the rest-over alert. Every call is guarded: a failure never breaks the timer. */

const CHANNEL_ID = "rest";
/** One fixed id, so scheduling replaces the alert queued before a kill instead of adding a second. */
const REST_NOTIFICATION_ID = "rest-over";

let scheduledId: string | null = null;
/** Bumped on every schedule or cancel, so a schedule that was waiting on the permission prompt can tell it was overtaken. */
let generation = 0;

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
    // The rest timer does not survive a kill, so an alert queued by the killed process is stale.
    void Notifications.cancelScheduledNotificationAsync(REST_NOTIFICATION_ID).catch(() => {});
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
  scheduledId = null;
  try {
    // By the fixed id, so it also cancels an alert queued by a process that was killed.
    await Notifications.cancelScheduledNotificationAsync(REST_NOTIFICATION_ID);
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
      identifier: REST_NOTIFICATION_ID,
      content: restNotificationContent(nextUp),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: CHANNEL_ID },
    });
    if (mine === generation) scheduledId = id;
    // Overtaken by a cancel: remove it. Overtaken by a newer schedule: the id is shared, so leave it.
    else if (scheduledId === null && generation !== mine && !useRestStore.getState().timer) await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}
