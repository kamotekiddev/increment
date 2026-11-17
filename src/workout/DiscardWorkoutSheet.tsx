import { Pressable } from "react-native";

import { BottomSheet, Button, PromptHeader, Text } from "@/components";
import { minTouch, spacing } from "@/theme";

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
  const text = discardWorkoutText(routineName);
  return (
    <BottomSheet visible={step !== "closed"} onDismiss={onDismiss}>
      {step === "confirm" ? (
        <>
          <PromptHeader icon="trash-outline" tone="danger" title={text.title} body={text.body} />
          <Button label="Discard workout" variant="danger" large onPress={onConfirm} />
          <Button label="Keep training" variant="secondary" stretch onPress={onDismiss} />
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
          <Button label="Cancel" variant="secondary" stretch onPress={onDismiss} />
        </>
      )}
    </BottomSheet>
  );
}
