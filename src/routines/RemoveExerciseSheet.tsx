import { Pressable } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { minTouch, radius, useColors } from "@/theme";

import { removeExerciseText } from "./removeExerciseText";

export interface RemoveExerciseSheetProps {
  visible: boolean;
  exerciseName: string;
  routineName: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** Asks before taking an exercise out of a routine. Logged workouts keep it. */
export function RemoveExerciseSheet({
  visible,
  exerciseName,
  routineName,
  onConfirm,
  onDismiss,
}: RemoveExerciseSheetProps) {
  const colors = useColors();
  const text = removeExerciseText(exerciseName, routineName);
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <Text variant="title">{text.title}</Text>
      <Text tone="muted">{text.body}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onConfirm}
        style={({ pressed }) => ({
          minHeight: minTouch,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius.pill,
          backgroundColor: colors.danger,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text variant="label" tone="onAccent">
          Remove
        </Text>
      </Pressable>
      <Button label="Cancel" variant="secondary" onPress={onDismiss} />
    </BottomSheet>
  );
}
