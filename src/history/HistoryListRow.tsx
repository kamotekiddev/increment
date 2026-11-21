import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { Text } from "@/components";
import { fontSize, radius, spacing, useColors } from "@/theme";

import type { HistoryRow } from "./historyQueries";

export interface HistoryListRowProps {
  row: HistoryRow;
  /** First and last row of its month round the card's top and bottom; the rest draw a divider above. */
  first: boolean;
  last: boolean;
}

/** One finished Workout on History: `Thu, 12 Nov` and the Routine, `5 exercises · 48 min` under it, a chevron. */
export function HistoryListRow({ row, first, last }: HistoryListRowProps) {
  const colors = useColors();
  return (
    <View
      style={{
        marginHorizontal: spacing.xl,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.card,
        borderTopLeftRadius: first ? radius.card : 0,
        borderTopRightRadius: first ? radius.card : 0,
        borderBottomLeftRadius: last ? radius.card : 0,
        borderBottomRightRadius: last ? radius.card : 0,
      }}
    >
      <View
        style={{
          minHeight: 64,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          borderTopWidth: first ? 0 : 1,
          borderTopColor: colors.line,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.sm }}>
            <Text variant="label" style={{ lineHeight: 20 }}>
              {row.dateLabel}
            </Text>
            <Text tone="muted" style={{ flexShrink: 1, fontSize: fontSize.caption }} numberOfLines={1}>
              {row.routineLabel}
            </Text>
          </View>
          <Text tone="muted" style={{ fontSize: fontSize.caption, lineHeight: 17 }}>
            {row.detail}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.iconFaint} />
      </View>
    </View>
  );
}
