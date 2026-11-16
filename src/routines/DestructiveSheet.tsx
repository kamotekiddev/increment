import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { BottomSheet, Button, Text } from "@/components";
import { fontSize, spacing, useColors } from "@/theme";

export interface DestructiveSheetProps {
  visible: boolean;
  title: string;
  body: string;
  /** The red button, e.g. "Delete routine" or "Remove". */
  confirmLabel: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** The confirmation used before deleting a routine or removing an exercise: trash icon, text, red action, Cancel. */
export function DestructiveSheet({ visible, title, body, confirmLabel, onConfirm, onDismiss }: DestructiveSheetProps) {
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
      <Button label={confirmLabel} variant="danger" large onPress={onConfirm} />
      <Button label="Cancel" variant="secondary" large onPress={onDismiss} />
    </BottomSheet>
  );
}
