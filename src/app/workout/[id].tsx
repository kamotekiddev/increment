import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button, Text } from "@/components";
import { fontSize, minTouch, opacity, radius, spacing, useColors } from "@/theme";
import { formatWeight } from "@/units";
import { bannerText } from "@/workout/bannerText";
import { canMarkDone } from "@/workout/markDone";
import { markSetDone, useWorkout } from "@/workout/workoutQueries";

export default function LiveWorkoutScreen() {
  const colors = useColors();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useWorkout(Number(idParam));
  const [current, setCurrent] = useState(0);

  const exercise = workout?.exercises[current];
  const total = workout?.exercises.length ?? 0;

  function toggle(index: number) {
    if (!workout || !exercise) return;
    const row = exercise.rows[index];
    const rows = markSetDone(exercise.rows, index, !row.done);
    if (rows === exercise.rows) return;
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) => (e === exercise ? { ...e, rows } : e)),
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
        }}
      />
      {workout && exercise ? (
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.bg }}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        >
          <Text variant="caption" tone="muted">
            {`Exercise ${current + 1} of ${total}`}
          </Text>
          <Text variant="heading">{exercise.name}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }} accessibilityElementsHidden>
            {workout.exercises.map((e, i) => (
              <View
                key={e.id}
                style={{
                  flex: 1,
                  height: spacing.xs,
                  borderRadius: radius.pill,
                  backgroundColor: i === current ? colors.accent : colors.line,
                }}
              />
            ))}
          </View>
          <View
            style={{
              padding: spacing.lg,
              borderRadius: radius.md,
              backgroundColor: colors.accentTint,
            }}
          >
            <Text variant="label" tone={exercise.target ? "accent" : "soft"}>
              {bannerText(exercise.target, exercise.range)}
            </Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, gap: spacing.sm }}>
              <Text variant="caption" tone="muted" style={{ width: spacing.xxl }}>
                Set
              </Text>
              <Text variant="caption" tone="muted" style={{ flex: 1, textAlign: "center" }}>
                kg
              </Text>
              <Text variant="caption" tone="muted" style={{ flex: 1, textAlign: "center" }}>
                Reps
              </Text>
              <View style={{ width: minTouch }} />
            </View>
            {exercise.rows.map((row, index) => {
              const blocked = !row.done && !canMarkDone(row);
              return (
                <View
                  key={row.setId}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    paddingVertical: spacing.sm,
                    paddingLeft: spacing.lg,
                    paddingRight: spacing.sm,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                  }}
                >
                  <Text variant="label" tone="muted" style={{ width: spacing.xxl }}>
                    {index + 1}
                  </Text>
                  <Text variant="title" style={{ flex: 1, textAlign: "center" }}>
                    {row.weightKg === null ? "–" : formatWeight(row.weightKg, "kg")}
                  </Text>
                  <Text variant="title" style={{ flex: 1, textAlign: "center" }}>
                    {row.reps}
                  </Text>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Set ${index + 1} done`}
                    accessibilityState={{ checked: row.done, disabled: blocked }}
                    disabled={blocked}
                    onPress={() => toggle(index)}
                    style={{
                      width: minTouch,
                      height: minTouch,
                      borderRadius: radius.pill,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: row.done ? colors.accent : "transparent",
                      borderWidth: row.done ? 0 : 1,
                      borderColor: colors.line,
                      opacity: blocked ? opacity.disabled : 1,
                    }}
                  >
                    <Text
                      tone={row.done ? "onAccent" : "muted"}
                      style={{ fontSize: fontSize.title }}
                    >
                      ✓
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              label="Previous"
              variant="secondary"
              disabled={current === 0}
              onPress={() => setCurrent(current - 1)}
            />
            <Button
              label="Next"
              disabled={current >= total - 1}
              onPress={() => setCurrent(current + 1)}
            />
          </View>
        </ScrollView>
      ) : workout === null ? (
        <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl }}>
          <Text tone="muted">Workout not found.</Text>
        </View>
      ) : null}
    </>
  );
}
