import { Pressable } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { minTouch, opacity, radius, spacing, useColors } from "@/theme";

import { discardWorkoutText } from "./workoutPromptText";

export type DiscardSheetStep = "closed" | "menu" | "confirm";

export interface DiscardWorkoutSheetProps {
  step: DiscardSheetStep;
  routineName: string | null;
  onChooseDiscard: () => void;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** The ⋯ menu of the live workout (one action, Discard workout) and its confirmation, in one sheet so two never stack. */
export function DiscardWorkoutSheet({ step, routineName, onChooseDiscard, onConfirm, onDismiss }: DiscardWorkoutSheetProps) {
  const colors = useColors();
  const text = discardWorkoutText(routineName);
  return (
    <BottomSheet visible={step !== "closed"} onDismiss={onDismiss}>
      {step === "confirm" ? (
        <>
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
              opacity: pressed ? opacity.pressed : 1,
            })}
          >
            <Text variant="label" tone="onAccent">
              Discard workout
            </Text>
          </Pressable>
          <Button label="Keep training" variant="secondary" onPress={onDismiss} />
        </>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={onChooseDiscard}
            style={{ minHeight: minTouch, justifyContent: "center", paddingVertical: spacing.sm }}
          >
            <Text variant="label" tone="danger">
              Discard workout
            </Text>
          </Pressable>
          <Button label="Cancel" variant="secondary" onPress={onDismiss} />
        </>
      )}
    </BottomSheet>
  );
}
