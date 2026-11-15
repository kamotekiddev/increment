import { View } from "react-native";

import { radius, spacing, useColors } from "@/theme";
import { Text } from "./Text";

export interface PillProps {
  label: string;
  /** "progress" is the accent-tint pill used for records, targets and increases (alias: pr). */
  tone?: "progress" | "neutral";
}

export function Pill({ label, tone = "progress" }: PillProps) {
  const colors = useColors();
  const progress = tone === "progress";
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        backgroundColor: progress ? colors.accentTint : colors.sunk,
      }}
    >
      <Text variant="caption" tone={progress ? "accent" : "soft"} style={{ fontFamily: "Sora_600SemiBold" }}>
        {label}
      </Text>
    </View>
  );
}
