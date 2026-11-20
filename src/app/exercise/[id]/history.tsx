import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { FlatList, View } from "react-native";

import { Card, Pill, RoundButton, Text } from "@/components";
import { buildHistoryRows, useExerciseHistory, type HistoryRow } from "@/history";
import { useExercise } from "@/library/exerciseQueries";
import { ExerciseTabs } from "@/library/ExerciseTabs";
import { ScreenHeader } from "@/routines/ScreenHeader";
import { useUnit } from "@/settings";
import { fontSize, lineHeight, radius, size, spacing, useColors } from "@/theme";

/** Local calendar date as YYYY-MM-DD. */
function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Exercise history: every finished workout of one exercise, newest first, with its done working sets. */
export default function ExerciseHistoryScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = Number(id);
  const exercise = useExercise(exerciseId);
  const past = useExerciseHistory(exerciseId);
  const { unit } = useUnit();
  const rows = useMemo(() => (past ? buildHistoryRows(past, unit, todayIso()) : []), [past, unit]);

  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
      <View style={{ marginHorizontal: -spacing.xl }}>
        <ScreenHeader
          left={<RoundButton icon="chevron-back" label="Back to library" onPress={() => router.back()} />}
          title={exercise?.name ?? ""}
        />
      </View>
      <ExerciseTabs active="history" exerciseId={exerciseId} />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        data={rows}
        keyExtractor={(row) => row.key}
        ListHeaderComponent={header}
        ListEmptyComponent={past ? <EmptyHistory /> : undefined}
        renderItem={({ item, index }) => <HistoryRowView row={item} first={index === 0} last={index === rows.length - 1} />}
      />
    </>
  );
}

function HistoryRowView({ row, first, last }: { row: HistoryRow; first: boolean; last: boolean }) {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.line,
        borderTopLeftRadius: first ? radius.card : 0,
        borderTopRightRadius: first ? radius.card : 0,
        borderBottomLeftRadius: last ? radius.card : 0,
        borderBottomRightRadius: last ? radius.card : 0,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Text variant="label" style={{ fontSize: fontSize.meta }}>
          {row.dateLabel}
        </Text>
        {row.routineName ? (
          <Text tone="muted" numberOfLines={1} style={{ flexShrink: 1, fontSize: fontSize.small }}>
            {row.routineName}
          </Text>
        ) : null}
        <View style={{ flex: 1 }} />
        {row.isDeload ? <Pill label="Deload" tone="neutral" /> : null}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {row.chips.map((chip, i) => (
          <Pill key={i} label={chip} tone="neutral" />
        ))}
      </View>
    </View>
  );
}

function EmptyHistory() {
  const colors = useColors();
  return (
    <Card style={{ borderRadius: radius.card, alignItems: "center", gap: spacing.md, paddingVertical: 40, paddingHorizontal: 28 }}>
      <View
        style={{
          width: size.emptyIcon - 4,
          height: size.emptyIcon - 4,
          borderRadius: radius.pill,
          backgroundColor: colors.accentTint,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="time-outline" size={26} color={colors.accent} />
      </View>
      <Text variant="title" accessibilityRole="header" style={{ fontSize: fontSize.action, lineHeight: 22, marginTop: spacing.xs }}>
        No workouts yet
      </Text>
      <Text tone="muted" style={{ textAlign: "center", fontSize: fontSize.label, lineHeight: lineHeight.body }}>
        Finish a workout with this exercise and it shows up here.
      </Text>
    </Card>
  );
}
