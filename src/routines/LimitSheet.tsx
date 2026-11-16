import { BottomSheet, Button, Text } from "@/components";

import { FREE_ROUTINE_LIMIT } from "./routineLimit";

export interface LimitSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

/** The free routine limit pop-up. No upgrade button until the paywall exists (Phase 3). */
export function LimitSheet({ visible, onDismiss }: LimitSheetProps) {
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <Text variant="title">{FREE_ROUTINE_LIMIT} free routines used</Text>
      <Text tone="muted">
        The free plan includes {FREE_ROUTINE_LIMIT} routines. Delete one to make room for a new one.
      </Text>
      <Button label="Got it" onPress={onDismiss} />
    </BottomSheet>
  );
}
