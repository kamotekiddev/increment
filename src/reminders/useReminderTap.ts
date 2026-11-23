import * as Notifications from "expo-notifications";
import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";

import { reminderTapRoutesToToday } from "./reminderTap";

/** A tap on a Reminder while the app is running or in the background opens Today. Mount once in the root layout. */
export function useReminderTap() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    try {
      // A cold start from the tap already lands on Today, and crash resume keeps priority: skip that response.
      const launch = Notifications.getLastNotificationResponse();
      const sub = Notifications.addNotificationResponseReceivedListener((response) => {
        if (response === launch) return;
        if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
        if (reminderTapRoutesToToday(response.notification.request.identifier, pathRef.current)) router.navigate("/");
      });
      return () => sub.remove();
    } catch {
      // Notifications are optional.
    }
  }, []);
}
