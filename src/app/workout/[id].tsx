import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button, Input, Text } from "@/components";
import { fontSize, minTouch, opacity, radius, spacing, useColors } from "@/theme";
import { formatWeight } from "@/units";
import type { SetEdit } from "@/workout";
import { lastColumn, parseReps, parseWeight, stepWeight } from "@/workout";
import { bannerText } from "@/workout/bannerText";
import { canMarkDone } from "@/workout/markDone";
import { addSet, editSet, markSetDone, useLastExercises, useWorkout } from "@/workout/workoutQueries";

const LAST_WIDTH = 52;
const stepStyle = { width: 32, height: minTouch, alignItems: "center", justifyContent: "center" } as const;

/** A number field that saves as the lifter types. Shows the saved value again whenever it changes elsewhere (−/+, follow). */
function NumberField({
  value,
  label,
  keyboardType,
  parse,
  onText,
}: {
  value: string;
  label: string;
  keyboardType: "decimal-pad" | "number-pad";
  parse: (text: string) => number | null | undefined;
  onText: (text: string) => void;
}) {
  // The draft is what is being typed ("62." stays "62."). It is dropped once the saved value no longer matches it.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft !== null && parse(draft) === parse(value) ? draft : value;
  return (
    <Input
      accessibilityLabel={label}
      value={text}
      keyboardType={keyboardType}
      selectTextOnFocus
      onChangeText={(t) => {
        setDraft(t);
        onText(t);
      }}
      onBlur={() => setDraft(null)}
      style={{ flex: 1, textAlign: "center", fontSize: fontSize.title, paddingHorizontal: spacing.xs }}
    />
  );
}

export default function LiveWorkoutScreen() {
  const colors = useColors();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useWorkout(Number(idParam));
  const lastExercises = useLastExercises(Number(idParam));
  const [current, setCurrent] = useState(0);

  const exercise = workout?.exercises[current];
  const total = workout?.exercises.length ?? 0;
  const last = exercise ? lastColumn(lastExercises[exercise.id] ?? null, exercise.rows.length) : [];

  function edit(index: number, change: SetEdit) {
    if (!workout || !exercise) return;
    const rows = editSet(exercise.rows, index, change);
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) => (e === exercise ? { ...e, rows } : e)),
    });
  }

  function add() {
    if (!workout || !exercise) return;
    const rows = addSet(exercise.id, exercise.rows);
    if (rows === exercise.rows) return;
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) => (e === exercise ? { ...e, rows } : e)),
    });
  }

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
              <Text variant="caption" tone="muted" style={{ width: spacing.xl }}>
                Set
              </Text>
              <Text variant="caption" tone="muted" style={{ width: LAST_WIDTH, textAlign: "center" }}>
                Last
              </Text>
              <Text variant="caption" tone="muted" style={{ flex: 2, textAlign: "center" }}>
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
                  <Text variant="label" tone="muted" style={{ width: spacing.xl }}>
                    {index + 1}
                  </Text>
                  <Text variant="caption" tone="muted" style={{ width: LAST_WIDTH, textAlign: "center" }}>
                    {last[index] ? `${formatWeight(last[index].weightKg, "kg")}×${last[index].reps}` : "–"}
                  </Text>
                  <View style={{ flex: 2, flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Set ${index + 1} weight down`}
                      onPress={() => edit(index, { weightKg: stepWeight(row.weightKg, -1) })}
                      style={stepStyle}
                    >
                      <Text variant="title" tone="muted">
                        −
                      </Text>
                    </Pressable>
                    <NumberField
                      label={`Set ${index + 1} weight`}
                      keyboardType="decimal-pad"
                      parse={parseWeight}
                      value={row.weightKg === null ? "" : formatWeight(row.weightKg, "kg")}
                      onText={(t) => {
                        const w = parseWeight(t);
                        if (w !== undefined) edit(index, { weightKg: w });
                      }}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Set ${index + 1} weight up`}
                      onPress={() => edit(index, { weightKg: stepWeight(row.weightKg, 1) })}
                      style={stepStyle}
                    >
                      <Text variant="title" tone="muted">
                        +
                      </Text>
                    </Pressable>
                  </View>
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    <NumberField
                      label={`Set ${index + 1} reps`}
                      keyboardType="number-pad"
                      parse={parseReps}
                      value={String(row.reps)}
                      onText={(t) => {
                        const r = parseReps(t);
                        if (r !== undefined) edit(index, { reps: r });
                      }}
                    />
                  </View>
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
          <Button label="Add set" variant="secondary" onPress={add} />
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
