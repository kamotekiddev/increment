import { View } from "react-native";

import { fontFamily, radius, spacing, useColors } from "@/theme";
import { Text } from "./Text";

export interface PillProps {
  label: string;
  /** "progress" is the accent-tint pill used for records, targets and increases (alias: pr); "solid" is the filled Pro badge. */
  tone?: "progress" | "neutral" | "solid";
}

export function Pill({ label, tone = "progress" }: PillProps) {
  const colors = useColors();
  const progress = tone === "progress";
  const solid = tone === "solid";
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        backgroundColor: solid ? colors.accent : progress ? colors.accentTint : colors.sunk,
      }}
    >
      <Text variant="caption" tone={solid ? "onAccent" : progress ? "accent" : "soft"} style={{ fontFamily: fontFamily.semibold }}>
        {label}
      </Text>
    </View>
  );
}
