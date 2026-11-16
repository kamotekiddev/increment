import { Pressable } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { minTouch, opacity, radius, spacing, useColors } from "@/theme";

import { deleteRoutineText } from "./deleteRoutineText";

export type DeleteSheetStep = "closed" | "menu" | "confirm";

export interface DeleteRoutineSheetProps {
  step: DeleteSheetStep;
  routineName: string;
  workoutCount: number;
  onChooseDelete: () => void;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** The ⋯ menu (one action, Delete routine) and its confirmation, in one sheet so two never stack. */
export function DeleteRoutineSheet({
  step,
  routineName,
  workoutCount,
  onChooseDelete,
  onConfirm,
  onDismiss,
}: DeleteRoutineSheetProps) {
  const colors = useColors();
  const text = deleteRoutineText(routineName, workoutCount);
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
              Delete routine
            </Text>
          </Pressable>
          <Button label="Cancel" variant="secondary" onPress={onDismiss} />
        </>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={onChooseDelete}
            style={{ minHeight: minTouch, justifyContent: "center", paddingVertical: spacing.sm }}
          >
            <Text variant="label" tone="danger">
              Delete routine
            </Text>
          </Pressable>
          <Button label="Cancel" variant="secondary" onPress={onDismiss} />
        </>
      )}
    </BottomSheet>
  );
}
