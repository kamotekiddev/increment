import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, View } from "react-native";

import { Pill, Text } from "@/components";
import { fontFamily, fontSize, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import type { RecordName } from "@/records/recordsQueries";

import type { RecordRow } from "./progressQueries";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const ICONS: Record<RecordName, IconName> = {
  "Heaviest set": "trophy-outline",
  "1-rep max": "trending-up",
  "Most volume": "chart-bar",
  "Most reps in a set": "trophy-outline",
  "Most reps in a workout": "chart-bar",
};

/** The white Records card: one row per Record with its icon, date and value, and a "New" pill when the last workout set it. */
export function RecordsCard({ exerciseName, rows, onProPress }: { exerciseName: string; rows: RecordRow[]; onProPress: () => void }) {
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
      {rows.map((row, i) => (
        <View
          key={row.name}
          accessible
          accessibilityLabel={[row.label, row.value ?? "none yet", row.dateLabel, row.isNew ? "new" : null].filter(Boolean).join(", ")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            minHeight: 68,
            paddingVertical: spacing.sm,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: colors.line,
          }}
        >
          <View
            style={{
              width: size.tile,
              height: size.tile,
              borderRadius: radius.tile,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: row.isNew ? colors.accentTint : colors.sunk,
            }}
          >
            <MaterialCommunityIcons name={ICONS[row.name]} size={size.icon} color={row.isNew ? colors.accent : colors.ink} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.body, lineHeight: lineHeight.label }}>{row.label}</Text>
            {row.dateLabel ? (
              <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.detail }}>
                {row.dateLabel}
              </Text>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.action, letterSpacing: -0.35 }}>{row.value ?? "– – –"}</Text>
            {row.isNew ? <Pill label="New" /> : null}
          </View>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="See all records, Pro"
        onPress={onProPress}
        style={({ pressed }) => ({
          opacity: pressed ? opacity.pressed : 1,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          height: 52,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        })}
      >
        <Text tone="accent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.label }}>
          See all records
        </Text>
        <View style={{ marginLeft: "auto" }}>
          <Pill label="Pro" tone="neutral" />
        </View>
      </Pressable>
    </View>
  );
}
