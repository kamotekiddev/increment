import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components";
import { buildToday, dateLine, NoRoutineCard, RestDay, RoutineDeck, screenTitle, useDayRollover, useNextPreview, useTodayData, WeekStrip } from "@/today";
import { spacing, textStyle, useColors } from "@/theme";
import { useStartWorkout } from "@/workout/useStartWorkout";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const data = useTodayData(useDayRollover());
  const { start, sheet } = useStartWorkout();
  const today = data ? buildToday(data) : undefined;
  const preview = useNextPreview(today?.state.kind === "rest" ? today.state.next.routineId : undefined);

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
        <View>
          {data ? (
            <Text tone="muted" variant="label">
              {dateLine(data.now)}
            </Text>
          ) : null}
          <Text variant="heading" accessibilityRole="header" style={textStyle.screenTitle}>
            {screenTitle(today?.state.kind ?? "")}
          </Text>
        </View>
        {today ? (
          <>
            <WeekStrip days={today.strip} restDay={today.state.kind === "rest"} />
            {today.state.kind === "cards" ? (
              <RoutineDeck cards={today.state.cards} onStart={(card) => start(card.routineId, card.name)} />
            ) : today.state.kind === "rest" ? (
              <RestDay state={today.state} preview={preview} />
            ) : today.state.kind === "noDays" ? (
              <Text tone="muted">No training days set. Pick days on a routine to plan your week.</Text>
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
