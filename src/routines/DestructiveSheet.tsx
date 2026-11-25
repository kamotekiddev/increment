import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { fontSize, radius, spacing, useColors } from "@/theme";

export interface DestructiveSheetProps {
  visible: boolean;
  title: string;
  body: string;
  /** The red button, e.g. "Delete routine" or "Remove". */
  confirmLabel: string;
  /** A red box under the text, for what is lost for good (Delete exercise). */
  warning?: string | null;
  /** Greys out the red button, e.g. while a Workout in progress blocks the action. */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** The confirmation used before deleting a routine or removing an exercise: trash icon, text, red action, Cancel. */
export function DestructiveSheet({ visible, title, body, confirmLabel, warning, confirmDisabled, onConfirm, onDismiss }: DestructiveSheetProps) {
  const colors = useColors();
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={{ alignItems: "center", gap: spacing.md, paddingTop: spacing.md }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.dangerTint,
          }}
        >
          <Ionicons name="trash-outline" size={28} color={colors.danger} />
        </View>
        <Text variant="title" style={{ fontSize: fontSize.titleLg, textAlign: "center" }}>
          {title}
        </Text>
        <Text tone="muted" style={{ textAlign: "center" }}>
          {body}
        </Text>
      </View>
      {warning ? (
        <View style={{ backgroundColor: colors.dangerTint, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
          <Text variant="label" style={{ color: colors.danger, fontSize: fontSize.small }}>
            {warning}
          </Text>
        </View>
      ) : null}
      <Button label={confirmLabel} variant="danger" large disabled={confirmDisabled} onPress={onConfirm} />
      <Button label="Cancel" variant="secondary" large onPress={onDismiss} />
    </BottomSheet>
  );
}
