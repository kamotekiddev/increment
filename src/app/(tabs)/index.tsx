import { Link } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components";
import { spacing, useColors } from "@/theme";

export default function TodayScreen() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl, paddingTop: spacing.xxl * 2, gap: spacing.md }}>
      <Text variant="heading">Today</Text>
      <Text tone="muted">Your week and today&apos;s session will appear here.</Text>
      {__DEV__ ? (
        <Link href="/gallery">
          <Text tone="accent" variant="label">
            Open component gallery
          </Text>
        </Link>
      ) : null}
    </View>
  );
}
