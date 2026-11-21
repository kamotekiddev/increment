import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "./Text";
import { fontSize, lineHeight, size, spacing } from "@/theme";

export interface ScreenHeaderProps {
  /** Usually a `RoundButton` (back or close), or a text action. */
  left?: ReactNode;
  title: string;
  /** "start" is the large title next to the button; "center" is the small title between two buttons. */
  align?: "start" | "center";
  /** A muted line under a "start" title (Past workout's `Thu, 12 Nov · 48 min`). */
  subtitle?: string;
  right?: ReactNode;
}

/** The in-page header that replaces the native one: 48 pt round buttons and a title, below the status bar. */
export function ScreenHeader({ left, title, align = "start", subtitle, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        minHeight: size.round,
        marginTop: insets.top + spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
      }}
    >
      {left}
      {align === "start" ? (
        <View style={{ flex: 1 }}>
          <Text variant="title" accessibilityRole="header" style={{ fontSize: fontSize.screen, lineHeight: lineHeight.screenHeader, letterSpacing: -0.7 }}>
            {title}
          </Text>
          {subtitle !== undefined && (
            <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.subtitle }}>
              {subtitle}
            </Text>
          )}
        </View>
      ) : (
        <Text variant="label" accessibilityRole="header" style={{ flex: 1, textAlign: "center", fontSize: fontSize.lead }}>
          {title}
        </Text>
      )}
      {right}
    </View>
  );
}
