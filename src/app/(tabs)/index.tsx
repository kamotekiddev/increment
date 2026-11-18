import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RoundButton, Text } from "@/components";
import { buildToday, DeckPreview, dateLine, NoDaysCard, NoRoutineCard, RestDay, RoutineDeck, screenTitle, useDayRollover, useNextPreview, useTodayData, WeekStrip } from "@/today";
import { spacing, textStyle, useColors } from "@/theme";
import { useStartWorkout } from "@/workout/useStartWorkout";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const data = useTodayData(useDayRollover());
  const { start, sheet } = useStartWorkout();
  const today = data ? buildToday(data) : undefined;
  const [topId, setTopId] = useState<number>();
  const cards = today?.state.kind === "cards" ? today.state.cards : undefined;
  // The deck reports its top card; fall back to the first if that Routine is no longer on Today.
  const topCard = cards ? (cards.find((c) => c.routineId === topId) ?? cards[0]) : undefined;
  const previewId = today?.state.kind === "rest" ? today.state.next.routineId : topCard?.routineId;
  const preview = useNextPreview(previewId);

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
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            {data ? (
              <Text tone="muted" variant="label">
                {dateLine(data.now)}
              </Text>
            ) : null}
            <Text variant="heading" accessibilityRole="header" style={textStyle.screenTitle}>
              {screenTitle(today?.state.kind ?? "")}
            </Text>
          </View>
          <RoundButton icon="settings-outline" label="Settings" onPress={() => router.push("/settings")} />
        </View>
        {today ? (
          <>
            <WeekStrip days={today.strip} restDay={today.state.kind === "rest"} />
            {today.state.kind === "cards" ? (
              <>
                <RoutineDeck cards={today.state.cards} onStart={(card) => start(card.routineId, card.name)} onTopChange={(card) => setTopId(card.routineId)} />
                {topCard ? <DeckPreview card={topCard} preview={preview} /> : null}
              </>
            ) : today.state.kind === "rest" ? (
              <RestDay state={today.state} preview={preview} />
            ) : today.state.kind === "noDays" ? (
              <NoDaysCard onPlan={() => router.push("/routines")} />
            ) : (
              <NoRoutineCard onCreate={() => router.push("/routines/new")} />
            )}
          </>
        ) : null}
      </ScrollView>
      {sheet}
    </View>
  );
}
