import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";

import { Pill, Text } from "@/components";
import { useExercise } from "@/library/exerciseQueries";
import { spacing, useColors } from "@/theme";

export default function ExerciseDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = useExercise(Number(id));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Library",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}
      >
        {exercise ? (
          <>
            <Text variant="heading">{exercise.name}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {exercise.muscles.map((muscle) => (
                <Pill key={muscle} label={muscle} />
              ))}
              <Pill label={exercise.equipment} tone="neutral" />
            </View>
            <Text variant="title" style={{ marginTop: spacing.md }}>
              How to
            </Text>
            {exercise.instructions.map((step, index) => (
              <View key={index} style={{ flexDirection: "row", gap: spacing.md }}>
                <Text tone="accent" variant="label" style={{ minWidth: spacing.xl }}>
                  {index + 1}.
                </Text>
                <Text style={{ flex: 1 }}>{step}</Text>
              </View>
            ))}
          </>
        ) : exercise === null ? (
          <Text tone="muted">Exercise not found.</Text>
        ) : null}
      </ScrollView>
    </>
  );
}
