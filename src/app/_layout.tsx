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
import { View } from "react-native";

import { Text } from "@/components";
import { useDatabase } from "@/db/useDatabase";
import { spacing, useColors } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useColors();
  // Loaded at runtime so it also works in Expo Go.
  const [fontsLoaded, fontError] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });
  const { ready: dbReady, error: dbError } = useDatabase();

  const fontsDone = fontsLoaded || fontError != null;
  const done = fontsDone && (dbReady || dbError != null);

  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);

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
