import { Pressable } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { minTouch, opacity, radius, useColors } from "@/theme";

import type { FinishPrompt } from "./workoutPromptText";

export interface FinishWorkoutSheetProps {
  /** The prompt to show, or null when the sheet is closed. */
  prompt: FinishPrompt | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** The Finish prompt (unchecked sets, skipped exercises) or, with no sets done, the Discard offer. */
export function FinishWorkoutSheet({ prompt, onConfirm, onDismiss }: FinishWorkoutSheetProps) {
  const colors = useColors();
  return (
    <BottomSheet visible={prompt !== null} onDismiss={onDismiss}>
      {prompt ? (
        <>
          <Text variant="title">{prompt.title}</Text>
          <Text tone="muted">{prompt.body}</Text>
          {prompt.kind === "discard" ? (
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
                {prompt.confirm}
              </Text>
            </Pressable>
          ) : (
            <Button label={prompt.confirm} onPress={onConfirm} />
          )}
          <Button label={prompt.cancel} variant="secondary" onPress={onDismiss} />
        </>
      ) : null}
    </BottomSheet>
  );
}
