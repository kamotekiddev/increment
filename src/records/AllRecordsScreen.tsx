import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { Pill, RoundButton, ScreenHeader, Text } from "@/components";
import { shortDateLabel } from "@/history/historyQueries";
import { ChipRow } from "@/library/ChipRow";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/library/muscleGroups";
import { thousands } from "@/progress/progressQueries";
import { useUnit } from "@/settings/useUnit";
import { fontFamily, fontSize, letterSpacing, radius, size, spacing, useColors } from "@/theme";
import { repsText } from "@/workout/repsText";

import { allRecords, type AllRecords, type AllRecordsExercise } from "./allRecordsQueries";
import type { RecordName } from "./recordsQueries";

interface Line {
  name: RecordName;
  label: string;
  value: string;
  date: string;
}

/** The record lines of one exercise, in display order; a 1-rep max no counted set can give is left out. */
function linesOf(exercise: AllRecordsExercise, unit: string): Line[] {
  const { records } = exercise;
  if (records.loadType === "bodyweight") {
    return [
      { name: "Most reps in a set", label: "Most reps in a set", value: repsText(records.mostRepsInSet.value), date: records.mostRepsInSet.date },
      {
        name: "Most reps in a workout",
        label: "Most reps in a workout",
        value: repsText(records.mostRepsInWorkout.value),
        date: records.mostRepsInWorkout.date,
      },
    ];
  }
  const lines: Line[] = [{ name: "Heaviest set", label: "Heaviest set", value: records.heaviestSet.text, date: records.heaviestSet.date }];
  if (records.estimatedOneRepMax) {
    lines.push({
      name: "1-rep max",
      label: "Est. 1-rep max",
      value: `${thousands(records.estimatedOneRepMax.value)} ${unit}`,
      date: records.estimatedOneRepMax.date,
    });
  }
  lines.push({ name: "Most volume", label: "Most volume", value: `${thousands(records.mostVolume.value)} ${unit}`, date: records.mostVolume.date });
  return lines;
}

/** All records: every trained exercise's Records in one scroll, filterable by muscle group. Read-only. */
export function AllRecordsScreen() {
  const colors = useColors();
  const { unit } = useUnit();
  const [data, setData] = useState<AllRecords | undefined>(undefined);
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  useFocusEffect(useCallback(() => setData(allRecords(unit)), [unit]));

  const groups = useMemo(
    () => MUSCLE_GROUPS.filter((g) => data?.exercises.some((e) => e.muscleGroup === g)),
    [data],
  );
  // A group with nothing left (after a unit or data refresh) shows everything again.
  const active = group && groups.includes(group) ? group : null;
  const shown = data?.exercises.filter((e) => active === null || e.muscleGroup === active) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
        <ScreenHeader
          left={<RoundButton icon="chevron-back" label="Back to progress" onPress={() => router.back()} />}
          title="Personal records"
          right={<Pill label="Pro" tone="solid" />}
        />
        {data && data.exercises.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            <ChipRow options={groups} active={active} onToggle={setGroup} onClear={() => setGroup(null)} label="Muscle group" />
            <View
              accessible
              accessibilityLabel={`${data.recordCount} records, ${data.newCount} new`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                marginHorizontal: spacing.xl,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderRadius: radius.md,
                backgroundColor: colors.accentTint,
              }}
            >
              <MaterialCommunityIcons name="trophy-outline" size={size.icon} color={colors.accent} />
              <Text style={{ fontSize: fontSize.meta }} tone="soft">
                <Text style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.meta }}>{data.recordCount} records</Text>
                {` · ${data.newCount} new`}
              </Text>
            </View>
            {shown.map((exercise) => (
              <ExerciseCard key={exercise.exerciseId} exercise={exercise} unit={unit} />
            ))}
          </View>
        ) : data ? (
          <Text tone="muted" style={{ marginHorizontal: spacing.xl, marginTop: spacing.xl }}>
            No records yet. Finish a workout and they show up here.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ExerciseCard({ exercise, unit }: { exercise: AllRecordsExercise; unit: string }) {
  const colors = useColors();
  return (
    <View
      style={{
        marginHorizontal: spacing.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        borderRadius: radius.card,
        backgroundColor: colors.card,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: size.control }}>
        <View
          style={{ width: size.tile, height: size.tile, borderRadius: radius.tile, alignItems: "center", justifyContent: "center", backgroundColor: colors.sunk }}
        >
          <MaterialCommunityIcons name="dumbbell" size={size.icon} color={colors.ink} />
        </View>
        <Text accessibilityRole="header" numberOfLines={1} style={{ flex: 1, fontFamily: fontFamily.semibold, fontSize: fontSize.body }}>
          {exercise.name}
        </Text>
      </View>
      {linesOf(exercise, unit).map((line) => {
        const isNew = exercise.newRecords.includes(line.name);
        return (
          <View
            key={line.name}
            accessible
            accessibilityLabel={[line.label, line.value, shortDateLabel(line.date), isNew ? "new" : null].filter(Boolean).join(", ")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              minHeight: size.control - spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.line,
            }}
          >
            <Text tone="soft" style={{ flex: 1, fontSize: fontSize.meta }}>
              {line.label}
            </Text>
            {isNew ? <Pill label="New" /> : null}
            <Text tone="muted" style={{ fontSize: fontSize.caption }}>
              {shortDateLabel(line.date)}
            </Text>
            <Text style={{ minWidth: 74, textAlign: "right", fontFamily: fontFamily.semibold, fontSize: fontSize.body, letterSpacing: letterSpacing.value }}>
              {line.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
