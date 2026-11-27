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

import { scheduleAutoBackup } from "@/backup/autoBackupRun";
import { Text } from "@/components";
import { loadOnboardedOnce, useOnboarded } from "@/onboarding";
import { refreshReminders } from "@/reminders";
import { useDatabase } from "@/db/useDatabase";
import { loadProOnce, proStore, startProStoreChecks, useProUnlockedScreen } from "@/pro";
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
  // Once the database is ready, read the saved unit, Workout settings and cached Pro state before any screen renders.
  const unitError = dbReady ? loadUnitOnce() : null;
  const workoutError = dbReady ? loadWorkoutSettingsOnce() : null;
  const reminderError = dbReady ? loadReminderSettingsOnce() : null;
  const proError = dbReady ? loadProOnce() : null;
  const onboardedError = dbReady ? loadOnboardedOnce() : null;
  const dbError = openError ?? unitError ?? workoutError ?? reminderError ?? proError ?? onboardedError;

  const fontsDone = fontsLoaded || fontError != null;
  const done = fontsDone && (dbReady || dbError != null);
  // Pro unlocked shows each time Pro switches on, never over a live workout.
  useProUnlockedScreen(done && !dbError);

  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);

  // Reminders are rescheduled at app start (once the database is ready) and each time the app returns to the foreground.
  // The store is asked about Pro at the same moments, and on each purchase update. Nothing here is awaited.
  useEffect(() => {
    if (!dbReady || dbError) return;
    void refreshReminders();
    scheduleAutoBackup("foreground");
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshReminders();
        scheduleAutoBackup("foreground");
      }
    });
    const stopProChecks = startProStoreChecks();
    // The lock follows Pro, so the schedule is rebuilt each time Pro switches on or off.
    const unsubPro = proStore.subscribe((s, prev) => {
      if (s.isPro !== prev.isPro) void refreshReminders();
    });
    return () => {
      unsubPro();
      sub.remove();
      stopProChecks();
    };
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

  return <RootStack />;
}

/**
 * Mounted only after the startup reads, so it never subscribes to the onboarding store while `loadOnboardedOnce` sets it
 * during RootLayout's render (a store update from inside a render of a subscribed component is a React error).
 */
function RootStack() {
  const onboarded = useOnboarded();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome until onboarding is done, then the tabs. Each guard removes the other side from the history, so the
          back button never reaches an empty app. The tabs come first, so a modal declared below never becomes the first screen. */}
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="quick-start" />
      </Stack.Protected>
      <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
      <Stack.Screen name="pro-unlocked" options={{ presentation: "modal" }} />
      <Stack.Screen name="backup-ready" options={{ presentation: "modal" }} />
    </Stack>
  );
}
