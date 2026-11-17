import { Link, router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { buildToday, useTodayData } from "@/today";
import { TodayRoutineCard } from "@/today/TodayRoutineCard";
import { useDayRollover } from "@/today/useDayRollover";
import { WeekStrip } from "@/today/WeekStrip";
import { fontSize, spacing, useColors } from "@/theme";
import { useStartWorkout } from "@/workout/useStartWorkout";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const data = useTodayData(useDayRollover());
  const { start, sheet } = useStartWorkout();
  const today = data ? buildToday(data) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xxl * 4,
          gap: spacing.lg,
        }}
      >
        <Text variant="heading" accessibilityRole="header" style={{ fontSize: fontSize.display, lineHeight: 38, letterSpacing: -1 }}>
          Today
        </Text>
        {today ? (
          <>
            <WeekStrip days={today.strip} />
            {today.state.kind === "cards" ? (
              today.state.cards.map((card) => (
                <TodayRoutineCard key={card.routineId} card={card} onStart={() => start(card.routineId, card.name)} />
              ))
            ) : today.state.kind === "rest" ? (
              <Text variant="title">{`Rest day. Next: ${today.state.next.routineName} on ${today.state.next.dayLabel}`}</Text>
            ) : today.state.kind === "noDays" ? (
              <Text tone="muted">No training days set. Pick days on a routine to plan your week.</Text>
            ) : (
              <View style={{ paddingVertical: spacing.md, gap: spacing.lg }}>
                <Text variant="title">No routines yet</Text>
                <Button label="Create routine" onPress={() => router.push("/routines/new")} />
              </View>
            )}
          </>
        ) : null}
        {__DEV__ ? (
          <Link href="/gallery">
            <Text tone="accent" variant="label">
              Open component gallery
            </Text>
          </Link>
        ) : null}
      </ScrollView>
      {sheet}
    </View>
  );
}
