import { View } from "react-native";

import { Text } from "@/components";
import { spacing, useColors } from "@/theme";

export default function RoutinesScreen() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl, paddingTop: spacing.xxl * 2, gap: spacing.md }}>
      <Text variant="heading">Routines</Text>
      <Text tone="muted">Your routines will appear here.</Text>
    </View>
  );
}
