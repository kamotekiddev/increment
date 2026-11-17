import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { View } from "react-native";

import { fontSize, spacing, useColors } from "@/theme";
import { BottomSheet } from "./BottomSheet";
import { Text } from "./Text";

export interface PromptSheetProps {
  visible: boolean;
  onDismiss: () => void;
  /** The round icon at the top: a check, a trash can, a clock. */
  icon: ComponentProps<typeof Ionicons>["name"];
  /** Accent tints the icon purple; danger tints it red. */
  tone?: "accent" | "danger";
  title: string;
  body: string;
  /** The buttons, top to bottom. Give each `large` or `stretch` so it fills the width. */
  children: ReactNode;
}

/** The top of a prompt: a round tinted icon, then a centered title and text. Use inside a sheet you already have. */
export function PromptHeader({ icon, tone = "accent", title, body }: Pick<PromptSheetProps, "icon" | "tone" | "title" | "body">) {
  const colors = useColors();
  const iconColor = tone === "danger" ? colors.danger : colors.accent;
  return (
    <View style={{ alignItems: "center", gap: spacing.md, paddingTop: spacing.md }}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tone === "danger" ? colors.dangerTint : colors.accentTint,
        }}
      >
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <Text variant="title" style={{ fontSize: fontSize.titleLg, textAlign: "center" }}>
        {title}
      </Text>
      <Text tone="muted" style={{ textAlign: "center" }}>
        {body}
      </Text>
    </View>
  );
}

/**
 * The prompt layout from the design canvas (Finish, Discard, Start while one is in progress):
 * a round tinted icon, a centered title and text, then full-width buttons.
 */
export function PromptSheet({ visible, onDismiss, children, ...header }: PromptSheetProps) {
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <PromptHeader {...header} />
      {children}
    </BottomSheet>
  );
}
