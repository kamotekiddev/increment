import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { minTouch, radius, spacing, useColors } from "@/theme";

import type { RoutineListItem } from "./routineQueries";
import { routineSubtitle } from "./routineListText";

export interface RoutineRowProps {
  routine: RoutineListItem;
  onPress: () => void;
}

/** A routine card: name, then days and exercise count. At least 44 pt tall. */
export function RoutineRow({ routine, onPress }: RoutineRowProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: minTouch,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="label" numberOfLines={1}>
          {routine.name}
        </Text>
        <Text variant="caption" tone="muted">
          {routineSubtitle(routine.days, routine.exerciseCount)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.iconFaint} />
    </Pressable>
  );
}
