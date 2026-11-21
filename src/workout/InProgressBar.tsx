import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { minTouch, opacity, radius, spacing, useColors } from "@/theme";

import { barText } from "./elapsedText";
import type { InProgressWorkout } from "./inProgressQueries";
import { routineLabel } from "./routineLabel";

export interface InProgressBarProps {
  workout: InProgressWorkout;
  now: number;
  onPress: () => void;
}

/** The "Workout in progress" bar shown above the tab bar. Tapping it reopens the workout. */
export function InProgressBar({ workout, now, onPress }: InProgressBarProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Resume workout in progress"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: minTouch,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: colors.ink,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="onAccent" style={{ opacity: opacity.pressed }}>
          Workout in progress
        </Text>
        <Text variant="label" tone="onAccent" numberOfLines={1}>
          {barText(routineLabel(workout.routineName), workout.startedAt, now)}
        </Text>
      </View>
      <View
        style={{
          minHeight: minTouch,
          paddingHorizontal: spacing.xl,
          justifyContent: "center",
          borderRadius: radius.pill,
          backgroundColor: colors.accent,
        }}
      >
        <Text variant="label" tone="onAccent">
          Resume
        </Text>
      </View>
    </Pressable>
  );
}
