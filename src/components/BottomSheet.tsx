import { BottomSheet as NativeBottomSheet, RNHostView } from "@expo/ui";
import type { ReactNode } from "react";
import { View } from "react-native";

import { spacing, useColors } from "@/theme";

export interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

/**
 * A native bottom sheet over a dimmed backdrop, used for pop-ups, confirmations and pickers.
 *
 * The sheet renders its children inside a native tree (SwiftUI or Compose), so the React Native
 * content goes in an `RNHostView`. Do not use a `Host` here: nested inside the sheet it shows an
 * empty sheet on Android and breaks layout and presses on iOS.
 */
export function BottomSheet({ visible, onDismiss, children }: BottomSheetProps) {
  const colors = useColors();
  return (
    <NativeBottomSheet isPresented={visible} onDismiss={onDismiss} containerColor={colors.bg} contentPadding={0}>
      <RNHostView matchContents={{ vertical: true }}>
        <View style={{ padding: spacing.xl, gap: spacing.lg }}>{children}</View>
      </RNHostView>
    </NativeBottomSheet>
  );
}
