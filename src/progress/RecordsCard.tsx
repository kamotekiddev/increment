import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, View } from "react-native";

import { Pill, Text } from "@/components";
import { fontFamily, fontSize, letterSpacing, lineHeight, opacity, radius, size, spacing, useColors } from "@/theme";

import type { RecordName } from "@/records/recordsQueries";

import type { RecordRow } from "./progressQueries";
import { RecordsFrame, RecordsRowFrame } from "./RecordsFrame";

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
    <RecordsFrame exerciseName={exerciseName}>
      {rows.map((row, i) => (
        <RecordsRowFrame
          key={row.name}
          first={i === 0}
          minHeight={size.row}
          accessibilityLabel={[row.label, row.value ?? "none yet", row.dateLabel, row.isNew ? "new" : null].filter(Boolean).join(", ")}
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
            <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.action, letterSpacing: letterSpacing.value }}>{row.value ?? "– – –"}</Text>
            {row.isNew ? <Pill label="New" /> : null}
          </View>
        </RecordsRowFrame>
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
    </RecordsFrame>
  );
}
