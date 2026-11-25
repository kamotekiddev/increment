import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pill, RoundButton, Text } from "@/components";
import { EditExerciseButton } from "@/library/EditExerciseButton";
import { ExerciseHero } from "@/library/ExerciseHero";
import { useExercise, useRoutineCounts } from "@/library/exerciseQueries";
import { capitalise } from "@/library/muscleGroups";
import { fontFamily, fontSize, size, spacing, textStyle, useColors } from "@/theme";

export default function ExerciseDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = useExercise(Number(id));
  const routineCounts = useRoutineCounts();

  const back = <RoundButton icon="chevron-back" label="Back to library" sunk onPress={() => router.back()} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + spacing.xxl,
          gap: spacing.lg,
        }}
      >
        {exercise ? (
          <>
            <ExerciseHero
              equipment={exercise.equipment}
              routines={routineCounts.get(exercise.id) ?? 0}
              back={back}
              action={
                exercise.isCustom ? (
                  <EditExerciseButton onPress={() => router.push(`/exercise/${exercise.id}/edit`)} />
                ) : undefined
              }
            />
            <View style={{ gap: 10 }}>
              <Text variant="heading" accessibilityRole="header" style={textStyle.screenTitle}>
                {exercise.name}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {exercise.muscles.map((muscle, index) => (
                  <Pill key={muscle} label={capitalise(muscle)} tone={index === 0 ? "progress" : "plain"} />
                ))}
                <Pill label={capitalise(exercise.equipment)} tone="plain" />
              </View>
            </View>
            {exercise.instructions.length > 0 ? (
              <Text variant="title" style={{ marginTop: spacing.sm }}>
                How to
              </Text>
            ) : null}
            <View style={{ gap: spacing.md, paddingHorizontal: spacing.xs }}>
              {exercise.instructions.map((step, index) => (
                <View key={index} style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
                  <View
                    style={{
                      width: size.stepNumber,
                      height: size.stepNumber,
                      borderRadius: size.stepNumber / 2,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.accentTint,
                    }}
                  >
                    <Text variant="caption" tone="accent" style={{ fontFamily: fontFamily.bold }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text tone="soft" style={{ flex: 1, fontSize: fontSize.label, lineHeight: 21 }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : exercise === null ? (
          <>
            {back}
            <Text tone="muted">Exercise not found.</Text>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}
