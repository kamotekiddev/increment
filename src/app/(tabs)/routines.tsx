import { router } from "expo-router";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, RoundButton, Text } from "@/components";
import { LimitMeter } from "@/routines/LimitMeter";
import { LimitSheet } from "@/routines/LimitSheet";
import { RoutineRow } from "@/routines/RoutineRow";
import { canCreateRoutine, FREE_ROUTINE_LIMIT } from "@/routines/routineLimit";
import { routineListState } from "@/routines/routineListState";
import { useIsPro } from "@/pro";
import { useRoutines } from "@/routines/routineQueries";
import { PAYWALL_PATH } from "@/pro/proRoutes";
import { counterCard, fontSize, lineHeight, opacity, radius, size, spacing, textStyle, useColors } from "@/theme";

export default function RoutinesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const routines = useRoutines();
  const isPro = useIsPro();
  const [limitOpen, setLimitOpen] = useState(false);

  const count = routines?.length ?? 0;
  const { card, lockedIds } = routineListState(routines?.map((r) => r.id) ?? [], isPro);

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
            {card.kind === "pro" ? (
              <Text tone="muted">{`${card.strong} ${card.rest}`}</Text>
            ) : card.kind === "locked" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${card.strong} ${card.rest}`}
                onPress={() => router.push(PAYWALL_PATH)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  paddingVertical: spacing.md,
                  paddingHorizontal: counterCard.paddingX,
                  borderRadius: radius.inset,
                  backgroundColor: colors.accentTint,
                  opacity: pressed ? opacity.pressed : 1,
                })}
              >
                <Ionicons name="lock-closed-outline" size={size.counterGlyph} color={colors.accent} />
                <Text tone="soft" style={{ flex: 1, fontSize: fontSize.meta, lineHeight: lineHeight.subtitle }}>
                  <Text variant="label" style={{ fontSize: fontSize.meta }}>
                    {card.strong}
                  </Text>{" "}
                  {card.rest}
                </Text>
                <Ionicons name="chevron-forward" size={size.counterGlyph} color={colors.inkMuted} />
              </Pressable>
            ) : (
              <View
                style={{
                  gap: spacing.sm,
                  paddingVertical: spacing.md,
                  paddingHorizontal: counterCard.paddingX,
                  borderRadius: radius.inset,
                  backgroundColor: colors.accentTint,
                }}
              >
                <Text tone="soft" style={{ fontSize: fontSize.meta, lineHeight: lineHeight.subtitle }}>
                  <Text variant="label" style={{ fontSize: fontSize.meta }}>
                    {card.strong}
                  </Text>{" "}
                  {card.rest}
                </Text>
                <LimitMeter used={count} total={FREE_ROUTINE_LIMIT} />
              </View>
            )}
            {routines.map((routine) => (
              <RoutineRow
                key={routine.id}
                routine={routine}
                locked={lockedIds.has(routine.id)}
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
