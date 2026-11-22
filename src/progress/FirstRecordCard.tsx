import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, lineHeight, radius, spacing, useColors } from "@/theme";

import type { RecordRow } from "./progressQueries";

/** The empty state's white card: no finished workout yet with this exercise. */
export function FirstRecordCard({ exerciseName, bodyweight }: { exerciseName: string; bodyweight: boolean }) {
  const colors = useColors();
  const what = bodyweight
    ? "your most reps in a set and most reps in a workout"
    : "your heaviest set, estimated 1-rep max and most volume";
  return (
    <View style={{ alignItems: "flex-start", gap: 10, paddingVertical: 28, paddingHorizontal: 22, borderRadius: radius.lg + 6, backgroundColor: colors.card }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
        <MaterialCommunityIcons name="trophy-outline" size={24} color={colors.accent} />
      </View>
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.lead, letterSpacing: -0.35 }}>Your first record is one workout away</Text>
      <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.detail }}>
        {`Finish a workout with ${exerciseName} and ${what} show up here.`}
      </Text>
    </View>
  );
}

/** The Records card of an exercise with no workout: muted rows reading "– – –", no dates, no Pro row. */
export function EmptyRecordsCard({ exerciseName, rows }: { exerciseName: string; rows: RecordRow[] }) {
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
          accessibilityLabel={`${row.label}, none yet`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            minHeight: 60,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: colors.line,
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: radius.tile, backgroundColor: colors.sunk, opacity: 0.7 }} />
          <Text tone="muted" style={{ flex: 1, fontFamily: fontFamily.semibold, fontSize: fontSize.label }}>
            {row.label}
          </Text>
          <Text tone="muted" style={{ fontSize: fontSize.body, letterSpacing: 1.5 }}>
            – – –
          </Text>
        </View>
      ))}
    </View>
  );
}
