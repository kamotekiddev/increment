import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, Text } from "@/components";
import { LimitSheet } from "@/routines/LimitSheet";
import { RoutineRow } from "@/routines/RoutineRow";
import { canCreateRoutine } from "@/routines/routineLimit";
import { useIsPro, useRoutines } from "@/routines/routineQueries";
import { routineCounter } from "@/routines/routineListText";
import { spacing, useColors } from "@/theme";

export default function RoutinesScreen() {
  const colors = useColors();
  const routines = useRoutines();
  const isPro = useIsPro();
  const [limitOpen, setLimitOpen] = useState(false);

  const count = routines?.length ?? 0;

  function create() {
    if (canCreateRoutine(count, isPro)) router.push("/routines/new");
    else setLimitOpen(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: spacing.xxl * 2 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xxl * 4,
          gap: spacing.md,
        }}
      >
        <Text variant="heading">Routines</Text>
        {routines === undefined ? null : routines.length === 0 ? (
          <View style={{ paddingVertical: spacing.xl, gap: spacing.lg }}>
            <Text variant="title">No routines yet</Text>
            <Text tone="muted">A routine is a workout you repeat. Make one to get started.</Text>
            <Button label="Create routine" onPress={create} />
          </View>
        ) : (
          <>
            <Text tone="muted">{routineCounter(count, isPro)}</Text>
            {routines.map((routine) => (
              <RoutineRow
                key={routine.id}
                routine={routine}
                onPress={() =>
                  router.push({ pathname: "/routines/[id]", params: { id: String(routine.id) } })
                }
              />
            ))}
            <View style={{ paddingTop: spacing.sm }}>
              <Button label="New routine" variant="secondary" onPress={create} />
            </View>
          </>
        )}
      </ScrollView>
      <LimitSheet visible={limitOpen} onDismiss={() => setLimitOpen(false)} />
    </View>
  );
}
