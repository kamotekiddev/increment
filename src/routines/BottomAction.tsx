import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, useColors } from "@/theme";

/** A main action fixed to the bottom of the screen, on the page background so the list scrolls under it. */
export function BottomAction({ children }: { children: ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: Math.max(insets.bottom, spacing.lg),
        backgroundColor: colors.bg,
      }}
    >
      {children}
    </View>
  );
}

/** Bottom padding for a scroll view so its last row clears a `BottomAction`. */
export const BOTTOM_ACTION_CLEARANCE = 56 + spacing.md + spacing.lg + spacing.xxl;
