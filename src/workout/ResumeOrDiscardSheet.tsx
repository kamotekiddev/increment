import { Pressable } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { minTouch, opacity, radius, useColors } from "@/theme";

import { resumePromptText } from "./workoutPromptText";

export interface ResumeOrDiscardSheetProps {
  visible: boolean;
  /** The routine of the workout in progress; null when it has none. */
  runningName: string | null;
  startingName: string;
  onResume: () => void;
  onDiscardAndStart: () => void;
  onDismiss: () => void;
}

/** Shown when Start finds a workout already in progress. */
export function ResumeOrDiscardSheet({
  visible,
  runningName,
  startingName,
  onResume,
  onDiscardAndStart,
  onDismiss,
}: ResumeOrDiscardSheetProps) {
  const colors = useColors();
  const text = resumePromptText(runningName, startingName);
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <Text variant="title">{text.title}</Text>
      <Text tone="muted">{text.body}</Text>
      <Button label={text.resume} onPress={onResume} />
      <Pressable
        accessibilityRole="button"
        onPress={onDiscardAndStart}
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
          {text.discard}
        </Text>
      </Pressable>
      <Button label="Cancel" variant="secondary" onPress={onDismiss} />
    </BottomSheet>
  );
}
