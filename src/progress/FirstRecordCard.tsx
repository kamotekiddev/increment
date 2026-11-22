import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, letterSpacing, lineHeight, radius, size, spacing, useColors } from "@/theme";

import type { RecordRow } from "./progressQueries";
import { RecordsFrame, RecordsRowFrame } from "./RecordsFrame";

/** The empty state's white card: no finished workout yet with this exercise. */
export function FirstRecordCard({ exerciseName, bodyweight }: { exerciseName: string; bodyweight: boolean }) {
  const colors = useColors();
  const what = bodyweight
    ? "your most reps in a set and most reps in a workout"
    : "your heaviest set, estimated 1-rep max and most volume";
  return (
    <View style={{ alignItems: "flex-start", gap: 10, paddingVertical: 28, paddingHorizontal: spacing.xl, borderRadius: radius.hero, backgroundColor: colors.card }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
        <MaterialCommunityIcons name="trophy-outline" size={24} color={colors.accent} />
      </View>
      <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.lead, letterSpacing: letterSpacing.value }}>Your first record is one workout away</Text>
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
    <RecordsFrame exerciseName={exerciseName}>
      {rows.map((row, i) => (
        <RecordsRowFrame key={row.name} first={i === 0} minHeight={60} accessibilityLabel={`${row.label}, none yet`}>
          <View style={{ width: size.tile, height: size.tile, borderRadius: radius.tile, backgroundColor: colors.sunk, opacity: 0.7 }} />
          <Text tone="muted" style={{ flex: 1, fontFamily: fontFamily.semibold, fontSize: fontSize.label }}>
            {row.label}
          </Text>
          <Text tone="muted" style={{ fontSize: fontSize.body, letterSpacing: 1.5 }}>
            – – –
          </Text>
        </RecordsRowFrame>
      ))}
    </RecordsFrame>
  );
}
