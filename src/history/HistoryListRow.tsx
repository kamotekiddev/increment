import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import type { HistoryRow } from "./historyQueries";

export interface HistoryListRowProps {
  row: HistoryRow;
  /** First and last row of its month round the card's top and bottom; the rest draw a divider above. */
  first: boolean;
  last: boolean;
  /** Opens Past workout for this Workout. */
  onPress: () => void;
}

/** One finished Workout on History: `Thu, 12 Nov` and the Routine, `5 exercises · 48 min` under it, a chevron. */
export function HistoryListRow({ row, first, last, onPress }: HistoryListRowProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${row.dateLabel}, ${row.routineLabel}, ${row.detail}`}
      onPress={onPress}
      style={({ pressed }) => ({
        marginHorizontal: spacing.xl,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.card,
        borderTopLeftRadius: first ? radius.card : 0,
        borderTopRightRadius: first ? radius.card : 0,
        borderBottomLeftRadius: last ? radius.card : 0,
        borderBottomRightRadius: last ? radius.card : 0,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <View
        style={{
          minHeight: size.historyRow,
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
            <Text variant="label" style={{ lineHeight: lineHeight.label }}>
              {row.dateLabel}
            </Text>
            <Text tone="muted" style={{ flexShrink: 1, fontSize: fontSize.caption }} numberOfLines={1}>
              {row.routineLabel}
            </Text>
          </View>
          <Text tone="muted" style={{ fontSize: fontSize.caption, lineHeight: lineHeight.detail }}>
            {row.detail}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.iconFaint} />
      </View>
    </Pressable>
  );
}
