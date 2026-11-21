import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { Text } from "@/components";
import { fontSize, lineHeight, radius, size, spacing, useColors } from "@/theme";

/** History with no finished Workout: an icon, "No workouts yet" and a hint. No button. */
export function HistoryEmpty() {
  const colors = useColors();
  return (
    <View
      style={{
        marginHorizontal: spacing.xl,
        marginTop: spacing.md,
        paddingVertical: 40,
        paddingHorizontal: 28,
        alignItems: "center",
        gap: spacing.md,
        borderRadius: radius.card,
        backgroundColor: colors.card,
      }}
    >
      <View
        style={{
          width: size.emptyIcon,
          height: size.emptyIcon,
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentTint,
        }}
      >
        <MaterialCommunityIcons name="history" size={26} color={colors.accent} />
      </View>
      <Text variant="label" accessibilityRole="header" style={{ marginTop: spacing.xs, fontSize: fontSize.action, lineHeight: lineHeight.action }}>
        No workouts yet
      </Text>
      <Text tone="muted" style={{ fontSize: fontSize.label, lineHeight: lineHeight.body, textAlign: "center" }}>
        Finish a workout and it shows up here.
      </Text>
    </View>
  );
}
