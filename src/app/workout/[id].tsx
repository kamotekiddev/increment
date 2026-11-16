import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Input, RoundButton, Text } from "@/components";
import { ScreenHeader } from "@/routines/ScreenHeader";
import { fontFamily, fontSize, minTouch, opacity, radius, size, spacing, useColors } from "@/theme";
import { formatWeight } from "@/units";
import type { SetEdit } from "@/workout";
import { editRowIndex, finishCheck, lastColumn, parseReps, parseWeight, stepWeight } from "@/workout";
import { bannerText } from "@/workout/bannerText";
import { FinishWorkoutSheet } from "@/workout/FinishWorkoutSheet";
import { finishPrompt, type FinishPrompt } from "@/workout/workoutPromptText";
import { DiscardWorkoutSheet, type DiscardSheetStep } from "@/workout/DiscardWorkoutSheet";
import { elapsedText } from "@/workout/elapsedText";
import { findInProgressWorkout, useNow } from "@/workout/inProgressQueries";
import { canMarkDone } from "@/workout/markDone";
import {
  discardWorkout,
  editSet,
  finishWorkout,
  markSetDone,
  useLastExercises,
  useWorkout,
} from "@/workout/workoutQueries";

/** Column widths of the one-line set row. On a 375 pt phone the Last column keeps about 80 pt. */
const col = { set: 30, weight: 72, reps: 52 } as const;

/** Small round chevron button for moving between exercises: a 44 pt touch target around a 32 pt circle. */
function ChevronButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: "chevron-back" | "chevron-forward";
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: minTouch,
        height: minTouch,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
      })}
    >
      <View
        style={{
          width: spacing.xxl,
          height: spacing.xxl,
          borderRadius: radius.pill,
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color={colors.ink} />
      </View>
    </Pressable>
  );
}

/** The − and + weight buttons: round, a full touch target wide and tall. */
function StepButton({ icon, label, onPress }: { icon: "remove" | "add"; label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: minTouch,
        height: minTouch,
        borderRadius: radius.pill,
        backgroundColor: colors.sunk,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={colors.ink} />
    </Pressable>
  );
}

/** A number field that saves as the lifter types. Shows the saved value again whenever it changes elsewhere (−/+, follow). */
function NumberField({
  value,
  label,
  keyboardType,
  parse,
  onText,
  onFocus,
  flat,
}: {
  value: string;
  label: string;
  keyboardType: "decimal-pad" | "number-pad";
  parse: (text: string) => number | null | undefined;
  onText: (text: string) => void;
  onFocus: () => void;
  /** Done rows show the numbers without a tile. */
  flat: boolean;
}) {
  const colors = useColors();
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
      onFocus={onFocus}
      onBlur={() => setDraft(null)}
      style={{
        flex: 1,
        textAlign: "center",
        fontFamily: fontFamily.semibold,
        fontSize: fontSize.input,
        letterSpacing: -0.4,
        borderRadius: radius.tile,
        paddingHorizontal: spacing.xs,
        backgroundColor: flat ? "transparent" : colors.sunk,
      }}
    />
  );
}

export default function LiveWorkoutScreen() {
  const colors = useColors();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useWorkout(Number(idParam));
  const lastExercises = useLastExercises(Number(idParam));
  const [current, setCurrent] = useState(0);
  const [startedAt] = useState(() => findInProgressWorkout()?.startedAt ?? Date.now());
  const now = useNow(true);
  /** The row last focused or marked, per exercise; it shows the weight stepper. */
  const [touched, setTouched] = useState<{ exerciseId: number; index: number } | null>(null);
  const [discardStep, setDiscardStep] = useState<DiscardSheetStep>("closed");
  const [routineName, setRoutineName] = useState<string | null>(null);

  function openMenu() {
    setRoutineName(findInProgressWorkout()?.routineName ?? null);
    setDiscardStep("menu");
  }

  /** Deletes the workout and returns to where it started (the root when there is nowhere to go back to). */
  function confirmDiscard() {
    discardWorkout(Number(idParam));
    setDiscardStep("closed");
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  const [finishing, setFinishing] = useState<FinishPrompt | null>(null);

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  /** Finish: confirms when sets are unchecked or an exercise is skipped, offers Discard when no set is done. */
  function onFinish() {
    if (!workout) return;
    const prompt = finishPrompt(
      finishCheck(workout.exercises.map((e) => e.rows)),
      workout.exercises.map((e) => e.name),
    );
    if (prompt) setFinishing(prompt);
    else confirmFinish(prompt);
  }

  function confirmFinish(prompt: FinishPrompt | null) {
    if (prompt?.kind === "discard") discardWorkout(Number(idParam));
    else finishWorkout(Number(idParam));
    setFinishing(null);
    leave();
  }

  const exercise = workout?.exercises[current];
  const total = workout?.exercises.length ?? 0;
  const last = exercise ? lastColumn(lastExercises[exercise.id] ?? null, exercise.rows.length) : [];
  const touchedIndex = exercise && touched?.exerciseId === exercise.id ? touched.index : null;
  const activeIndex = exercise ? editRowIndex(exercise.rows, touchedIndex) : null;

  function touch(index: number) {
    if (exercise) setTouched({ exerciseId: exercise.id, index });
  }

  function edit(index: number, change: SetEdit) {
    if (!workout || !exercise) return;
    const rows = editSet(exercise.rows, index, change);
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) => (e === exercise ? { ...e, rows } : e)),
    });
  }

  function toggle(index: number) {
    if (!workout || !exercise) return;
    touch(index);
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
      <Stack.Screen options={{ headerShown: false }} />
      <DiscardWorkoutSheet
        step={discardStep}
        routineName={routineName}
        onChooseDiscard={() => setDiscardStep("confirm")}
        onConfirm={confirmDiscard}
        onDismiss={() => setDiscardStep("closed")}
      />
      <FinishWorkoutSheet prompt={finishing} onConfirm={() => confirmFinish(finishing)} onDismiss={() => setFinishing(null)} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader
          align="center"
          title={workout ? elapsedText(startedAt, now) : ""}
          left={<RoundButton icon="chevron-down" label="Minimize workout" onPress={leave} />}
          right={
            workout ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Finish workout"
                  onPress={onFinish}
                  style={({ pressed }) => ({
                    height: minTouch,
                    paddingHorizontal: spacing.xl,
                    borderRadius: radius.pill,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.card,
                    opacity: pressed ? opacity.pressed : 1,
                  })}
                >
                  <Text variant="label">Finish</Text>
                </Pressable>
                <RoundButton icon="ellipsis-horizontal" label="More options" onPress={openMenu} />
              </View>
            ) : null
          }
        />
        {workout && exercise ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.md,
              paddingBottom: spacing.xxl,
              gap: spacing.lg,
            }}
          >
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text variant="caption" tone="muted" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.small }}>
                  {`Exercise ${current + 1} of ${total}`}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <ChevronButton
                    icon="chevron-back"
                    label="Previous exercise"
                    disabled={current === 0}
                    onPress={() => setCurrent(current - 1)}
                  />
                  <ChevronButton
                    icon="chevron-forward"
                    label="Next exercise"
                    disabled={current >= total - 1}
                    onPress={() => setCurrent(current + 1)}
                  />
                </View>
              </View>
              <Text
                accessibilityRole="header"
                style={{ fontFamily: fontFamily.bold, fontSize: fontSize.display, lineHeight: 38, letterSpacing: -0.9 }}
              >
                {exercise.name}
              </Text>
              <View style={{ flexDirection: "row", gap: spacing.xs }} accessibilityElementsHidden>
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
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.row,
                backgroundColor: colors.accentTint,
              }}
            >
              <View
                style={{
                  width: spacing.xxl,
                  height: spacing.xxl,
                  borderRadius: radius.pill,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="trending-up" size={16} color={colors.onAccent} />
              </View>
              <Text
                tone={exercise.target ? "accent" : "soft"}
                style={{
                  flex: 1,
                  fontFamily: exercise.target ? fontFamily.bold : fontFamily.medium,
                  fontSize: fontSize.meta,
                  lineHeight: 19,
                }}
              >
                {bannerText(exercise.target, exercise.range)}
              </Text>
            </View>
            <View style={{ gap: spacing.sm }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingLeft: spacing.md, paddingRight: spacing.sm }}
              >
                <Text variant="caption" tone="muted" style={{ width: col.set, fontFamily: fontFamily.medium }}>
                  Set
                </Text>
                <Text variant="caption" tone="muted" style={{ flex: 1, fontFamily: fontFamily.medium }}>
                  Last
                </Text>
                <Text variant="caption" tone="muted" style={{ width: col.weight, textAlign: "center", fontFamily: fontFamily.medium }}>
                  kg
                </Text>
                <Text variant="caption" tone="muted" style={{ width: col.reps, textAlign: "center", fontFamily: fontFamily.medium }}>
                  Reps
                </Text>
                <View style={{ width: minTouch }} />
              </View>
              {exercise.rows.map((row, index) => {
                const blocked = !row.done && !canMarkDone(row);
                const active = index === activeIndex;
                return (
                  <View
                    key={row.setId}
                    style={{
                      paddingVertical: spacing.xs + 2,
                      paddingLeft: spacing.md,
                      paddingRight: spacing.sm,
                      borderRadius: radius.inset,
                      backgroundColor: colors.card,
                      borderWidth: 2,
                      borderColor: active ? colors.accent : colors.card,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <Text variant="label" tone={row.done ? "muted" : "ink"} style={{ width: col.set }}>
                        {index + 1}
                      </Text>
                      <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1, fontSize: fontSize.meta }}>
                        {last[index] ? `${formatWeight(last[index].weightKg, "kg")} × ${last[index].reps}` : "–"}
                      </Text>
                      <View style={{ width: col.weight, height: minTouch, flexDirection: "row" }}>
                        <NumberField
                          label={`Set ${index + 1} weight`}
                          keyboardType="decimal-pad"
                          parse={parseWeight}
                          value={row.weightKg === null ? "" : formatWeight(row.weightKg, "kg")}
                          flat={row.done}
                          onFocus={() => touch(index)}
                          onText={(t) => {
                            const w = parseWeight(t);
                            if (w !== undefined) edit(index, { weightKg: w });
                          }}
                        />
                      </View>
                      <View style={{ width: col.reps, height: minTouch, flexDirection: "row" }}>
                        <NumberField
                          label={`Set ${index + 1} reps`}
                          keyboardType="number-pad"
                          parse={parseReps}
                          value={String(row.reps)}
                          flat={row.done}
                          onFocus={() => touch(index)}
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
                          backgroundColor: row.done ? colors.accentTint : "transparent",
                          borderWidth: row.done ? 0 : 1.5,
                          borderColor: colors.line,
                          opacity: blocked ? opacity.disabled : 1,
                        }}
                      >
                        <Ionicons name="checkmark" size={20} color={row.done ? colors.accent : colors.iconFaint} />
                      </Pressable>
                    </View>
                    {active ? (
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.lg }}>
                        <StepButton
                          icon="remove"
                          label={`Set ${index + 1} weight down`}
                          onPress={() => {
                            touch(index);
                            edit(index, { weightKg: stepWeight(row.weightKg, -1) });
                          }}
                        />
                        <Text variant="caption" tone="muted" style={{ minWidth: size.control, textAlign: "center" }}>
                          Weight
                        </Text>
                        <StepButton
                          icon="add"
                          label={`Set ${index + 1} weight up`}
                          onPress={() => {
                            touch(index);
                            edit(index, { weightKg: stepWeight(row.weightKg, 1) });
                          }}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : workout === null ? (
          <View style={{ padding: spacing.xl }}>
            <Text tone="muted">Workout not found.</Text>
          </View>
        ) : null}
      </View>
    </>
  );
}
