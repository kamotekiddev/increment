import { gte } from "drizzle-orm";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

import { db } from "@/db/client";
import { workouts } from "@/db/schema";
import { isPermissionGranted } from "@/notifications";
import { lockedIdsNow } from "@/routines/lockedRoutines";
import { loadRoutines } from "@/routines/routineQueries";
import { readReminderSettings } from "@/settings/reminderSetting";

import { planReminders } from "./planReminders";
import { REMINDER_ID_PREFIX } from "./reminderId";

/** Thin wrapper over expo-notifications for Training day reminders. */

const CHANNEL_ID = "reminders";

async function cancelAllReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending.filter((n) => n.identifier.startsWith(REMINDER_ID_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

async function run(): Promise<void> {
  try {
    await cancelAllReminders();
    const { remindersOn, reminderTimeMin } = readReminderSettings(db);
    if (!remindersOn || !(await isPermissionGranted())) return;

    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startedToday = db.select({ id: workouts.id }).from(workouts).where(gte(workouts.startedAt, midnight)).limit(1).all().length > 0;
    const routines = await loadRoutines();
    const planned = planReminders({
      routines: routines.map((r) => ({ id: r.id, name: r.name, days: r.days, exerciseCount: r.exerciseCount })),
      workoutStartedToday: startedToday,
      timeMinutes: reminderTimeMin,
      now,
      lockedIds: lockedIdsNow(routines.map((r) => r.id)),
    });
    if (planned.length === 0) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Training reminders",
        importance: AndroidImportance.DEFAULT,
      });
    }
    for (const r of planned) {
      await Notifications.scheduleNotificationAsync({
        identifier: r.id,
        content: { title: r.title, body: r.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL_ID },
      });
    }
  } catch {
    // Reminders are optional; a failure never breaks the caller.
  }
}

/** Calls queue behind each other, so two refreshes never interleave. Each one reads the latest state when its turn comes. */
let queue: Promise<void> = Promise.resolve();

/**
 * Brings the scheduled reminders in line with the settings, the Routines and today's Workouts: cancels
 * every `reminder-` notification, then (when the setting is on and permission is granted) schedules the
 * next 4 weeks. Serialised and guarded: it never rejects, so a failure never breaks the caller.
 */
export function refreshReminders(): Promise<void> {
  queue = queue.then(run, run);
  return queue;
}
