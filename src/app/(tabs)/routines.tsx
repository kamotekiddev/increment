import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, RoundButton, Text } from "@/components";
import { LimitMeter } from "@/routines/LimitMeter";
import { LimitSheet } from "@/routines/LimitSheet";
import { RoutineRow } from "@/routines/RoutineRow";
import { canCreateRoutine, FREE_ROUTINE_LIMIT } from "@/routines/routineLimit";
import { routineCounterParts } from "@/routines/routineListText";
import { useIsPro } from "@/pro";
import { useRoutines } from "@/routines/routineQueries";
import { fontSize, radius, spacing, textStyle, useColors } from "@/theme";

export default function RoutinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const routines = useRoutines();
  const isPro = useIsPro();
  const [limitOpen, setLimitOpen] = useState(false);

  const count = routines?.length ?? 0;
  const counter = routineCounterParts(count, isPro);

  function create() {
    if (canCreateRoutine(count, isPro)) router.push("/routines/new");
    else setLimitOpen(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xxl * 4,
          gap: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="heading" accessibilityRole="header" style={textStyle.screenTitle}>
            Routines
          </Text>
          <RoundButton icon="add" label="New routine" filled onPress={create} />
        </View>
        {routines === undefined ? null : routines.length === 0 ? (
          <View style={{ paddingVertical: spacing.xl, gap: spacing.lg }}>
            <Text variant="title">No routines yet</Text>
            <Text tone="muted">A routine is a workout you repeat. Make one to get started.</Text>
            <Button label="Create routine" onPress={create} />
          </View>
        ) : (
          <>
            {isPro ? (
              <Text tone="muted">{`${counter.strong} ${counter.rest}`}</Text>
            ) : (
              <View
                style={{
                  gap: spacing.sm,
                  paddingVertical: spacing.md,
                  paddingHorizontal: 14,
                  borderRadius: radius.inset,
                  backgroundColor: colors.accentTint,
                }}
              >
                <Text tone="soft" style={{ fontSize: fontSize.meta, lineHeight: 18 }}>
                  <Text variant="label" style={{ fontSize: fontSize.meta }}>
                    {counter.strong}
                  </Text>{" "}
                  {counter.rest}
                </Text>
                <LimitMeter used={count} total={FREE_ROUTINE_LIMIT} />
              </View>
            )}
            {routines.map((routine) => (
              <RoutineRow
                key={routine.id}
                routine={routine}
                onPress={() => router.push({ pathname: "/routines/[id]", params: { id: String(routine.id) } })}
              />
            ))}
            <Button label="New routine" variant="dashed" large onPress={create} />
          </>
        )}
      </ScrollView>
      <LimitSheet visible={limitOpen} onDismiss={() => setLimitOpen(false)} />
    </View>
  );
}
