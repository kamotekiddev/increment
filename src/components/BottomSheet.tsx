import { BottomSheet as NativeBottomSheet, Host } from "@expo/ui";
import type { ReactNode } from "react";
import { View } from "react-native";

import { spacing, useColors } from "@/theme";

export interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

/** A native bottom sheet over a dimmed backdrop, used for pop-ups, confirmations and pickers. */
export function BottomSheet({ visible, onDismiss, children }: BottomSheetProps) {
  const colors = useColors();
  return (
    <NativeBottomSheet isPresented={visible} onDismiss={onDismiss} containerColor={colors.card} contentPadding={0}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <View style={{ padding: spacing.xl, gap: spacing.lg }}>{children}</View>
      </Host>
    </NativeBottomSheet>
  );
}
