import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from "@expo-google-fonts/sora";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState, View } from "react-native";

import { Text } from "@/components";
import { refreshReminders } from "@/reminders";
import { useDatabase } from "@/db/useDatabase";
import { loadReminderSettingsOnce, loadUnitOnce, loadWorkoutSettingsOnce } from "@/settings";
import { useReminderTap } from "@/reminders/useReminderTap";
import { spacing, useColors } from "@/theme";
import { setupRestNotifications } from "@/workout/restNotification";

SplashScreen.preventAutoHideAsync();
setupRestNotifications();

export default function RootLayout() {
  const colors = useColors();
  useReminderTap();
  // Loaded at runtime so it also works in Expo Go.
  const [fontsLoaded, fontError] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });
  const { ready: dbReady, error: openError } = useDatabase();
  // Once the database is ready, read the saved unit and Workout settings before any screen renders.
  const unitError = dbReady ? loadUnitOnce() : null;
  const workoutError = dbReady ? loadWorkoutSettingsOnce() : null;
  const reminderError = dbReady ? loadReminderSettingsOnce() : null;
  const dbError = openError ?? unitError ?? workoutError ?? reminderError;

  const fontsDone = fontsLoaded || fontError != null;
  const done = fontsDone && (dbReady || dbError != null);

  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);

  // Reminders are rescheduled at app start (once the database is ready) and each time the app returns to the foreground.
  useEffect(() => {
    if (!dbReady || dbError) return;
    void refreshReminders();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshReminders();
    });
    return () => sub.remove();
  }, [dbReady, dbError]);

  if (!done) return null;

  if (dbError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: spacing.xl, gap: spacing.md }}>
        <Text variant="title">Could not open your data</Text>
        <Text tone="muted">{dbError.message}</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
