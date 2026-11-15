import { View, type ViewProps } from "react-native";

import { radius, spacing, useColors } from "@/theme";

/** White card on the warm off-white background. */
export function Card({ style, ...rest }: ViewProps) {
  const colors = useColors();
  return (
    <View
      {...rest}
      style={[{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg }, style]}
    />
  );
}
