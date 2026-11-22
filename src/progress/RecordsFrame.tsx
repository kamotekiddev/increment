import { View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, radius, spacing, useColors } from "@/theme";

/** The white Records card shared by the filled and the empty state: the "Records" header and the exercise name. */
export function RecordsFrame({ exerciseName, children }: { exerciseName: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radius.card, backgroundColor: colors.card }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, paddingTop: 14, paddingBottom: 6 }}>
        <Text accessibilityRole="header" style={{ fontFamily: fontFamily.bold, fontSize: fontSize.body, letterSpacing: -0.15 }}>
          Records
        </Text>
        <Text tone="muted" numberOfLines={1} style={{ flexShrink: 1, fontSize: fontSize.small }}>
          {exerciseName}
        </Text>
      </View>
      {children}
    </View>
  );
}

/** One row of the Records card: a divider above every row but the first, one accessible element. */
export function RecordsRowFrame({
  first,
  minHeight,
  accessibilityLabel,
  children,
}: {
  first: boolean;
  minHeight: number;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        minHeight,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      {children}
    </View>
  );
}
