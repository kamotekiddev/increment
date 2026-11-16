import { eq } from "drizzle-orm";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { Pill, Text } from "@/components";
import { db } from "@/db/client";
import { exercises } from "@/db/schema";
import { spacing, useColors } from "@/theme";

type Exercise = typeof exercises.$inferSelect;

export default function ExerciseDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    db.select()
      .from(exercises)
      .where(eq(exercises.id, Number(id)))
      .then((rows) => setExercise(rows[0] ?? null));
  }, [id]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "", headerBackTitle: "Library", headerShadowVisible: false, headerStyle: { backgroundColor: colors.bg } }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        {exercise ? (
          <>
            <Text variant="heading">{exercise.name}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {exercise.muscles.map((m) => (
                <Pill key={m} label={m} />
              ))}
              <Pill label={exercise.equipment} tone="neutral" />
            </View>
            <Text variant="title" style={{ marginTop: spacing.md }}>
              How to
            </Text>
            {exercise.instructions.map((step, i) => (
              <View key={i} style={{ flexDirection: "row", gap: spacing.md }}>
                <Text tone="accent" variant="label" style={{ minWidth: spacing.xl }}>
                  {i + 1}.
                </Text>
                <Text style={{ flex: 1 }}>{step}</Text>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </>
  );
}
