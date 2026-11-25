import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";

import { Text } from "@/components";
import { minTouch, opacity, radius, size, spacing, useColors } from "@/theme";

/** The "Edit" pill in the top right of a custom exercise's detail hero (the design's `ExerciseCustom` board). */
export function EditExerciseButton({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Edit exercise"
      onPress={onPress}
      style={({ pressed }) => ({
        height: minTouch,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs + 2,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        backgroundColor: colors.sunk,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <Ionicons name="create-outline" size={size.icon - 2} color={colors.ink} />
      <Text variant="label" tone="ink">
        Edit
      </Text>
    </Pressable>
  );
}
