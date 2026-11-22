import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RoundButton, ScreenHeader } from "@/components";
import { PastExerciseRow } from "@/history/PastExerciseRow";
import { usePastWorkout } from "@/history/usePastWorkout";
import { workoutRecordTags } from "@/records/recordsQueries";
import { radius, spacing, useColors } from "@/theme";

/** One finished Workout, read-only: the Routine, date and duration, then each exercise with its Target and done Working sets. */
export default function PastWorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = usePastWorkout(Number(id));
  // Tags follow the Workout read (re-read on focus); they do not depend on the Unit.
  const tags = useMemo(() => (workout ? workoutRecordTags(Number(id)) : {}), [workout, id]);
  const back = <RoundButton icon="chevron-back" label="Back to history" onPress={() => router.back()} />;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ gap: spacing.md, paddingBottom: insets.bottom + spacing.xxl }}
    >
      {/* An unknown id or a Workout in progress shows nothing to read; Back still works. */}
      <ScreenHeader left={back} title={workout?.routineLabel ?? ""} subtitle={workout?.detail} />
      {workout && workout.cards.length > 0 && (
        <View style={{ marginHorizontal: spacing.xl, paddingHorizontal: spacing.lg, borderRadius: radius.card, backgroundColor: colors.card }}>
          {workout.cards.map((card, index) => (
            <PastExerciseRow key={card.workoutExerciseId} card={card} records={tags[card.workoutExerciseId] ?? []} first={index === 0} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
