import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { AppState, Pressable, ScrollView, View } from "react-native";

import { Input, RoundButton, Text } from "@/components";
import { ScreenHeader } from "@/routines/ScreenHeader";
import { borderWidth, fontFamily, fontSize, minTouch, opacity, radius, spacing, useColors } from "@/theme";
import { UnitSegmented, useJumps, useUnit } from "@/settings";
import { type SetEdit, finishCheck, lastColumn, lastSetText, parseReps, parseWeight, weightFromTyped, weightFieldText, typeDraft, clearDraft, EMPTY_DRAFTS, type WeightDrafts } from "@/workout";
import { bannerText } from "@/workout/bannerText";
import { toRestExercises } from "@/workout/restExercises";
import { RestPanel } from "@/workout/RestPanel";
import { useRestNow } from "@/workout/useRestNow";
import { scheduleRestNotification } from "@/workout/restNotification";
import { useRestStore } from "@/workout/restStore";
import { endedWhileAway, trackAway, type AwayTrace } from "@/workout/restAway";
import { nextUp, onSetToggled, resolveExpiry, restRemaining, workoutComplete } from "@/workout/restTimer";
import { currentSetIndex } from "@/workout/currentSet";
import { FinishWorkoutSheet } from "@/workout/FinishWorkoutSheet";
import { allDonePrompt, finishPrompt, type FinishPrompt } from "@/workout/workoutPromptText";
import { DiscardWorkoutSheet, type DiscardSheetStep } from "@/workout/DiscardWorkoutSheet";
import { elapsedText } from "@/workout/elapsedText";
import { findInProgressWorkout, useNow } from "@/workout/inProgressQueries";
import { canMarkDone } from "@/workout/markDone";
import { firstOpenExercise } from "@/workout/resume";
import { loadOffers } from "@/workout/summaryQueries";
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

/** A number field that saves as the lifter types. Shows the saved value again whenever it changes elsewhere. */
function NumberField({
  value,
  label,
  keyboardType,
  parse,
  onText,
  flat,
}: {
  value: string;
  label: string;
  keyboardType: "decimal-pad" | "number-pad";
  parse: (text: string) => number | null | undefined;
  onText: (text: string) => void;
  /** Only the Current set shows its numbers in a tile; every other row is flat. */
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
  const { unit, setUnit } = useUnit();
  const { jumps } = useJumps();
  // Weight text typed after an edit, per set; dropped on a unit switch, a check, or leaving the screen.
  const [drafts, setDrafts] = useState<WeightDrafts>(EMPTY_DRAFTS);
  const colors = useColors();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useWorkout(Number(idParam));
  const lastExercises = useLastExercises(Number(idParam));
  const [current, setCurrent] = useState(0);
  const [startedAt] = useState(() => findInProgressWorkout()?.startedAt ?? Date.now());
  const now = useNow(true);
  const [discardStep, setDiscardStep] = useState<DiscardSheetStep>("closed");
  const [routineName, setRoutineName] = useState<string | null>(null);
  const timer = useRestStore((s) => s.timer);
  const restClock = useRestNow(timer?.endsAt ?? null);
  // The clock is idle between rests, so on the first frame of a new rest it is stale. Never read it before the rest began.
  const restNow = timer ? Math.max(restClock, timer.endsAt - timer.totalMs) : restClock;
  const restStore = useRestStore;
  const [panelHeight, setPanelHeight] = useState(0);
  // False until this screen has seen the rest running: a rest already over on return ended while away.
  const sawRunning = useRef(false);
  // When the app last left the foreground, so a rest that ended while it was away gets no buzz.
  // Starts from the state at mount, so a screen opened while the app is in the background begins away.
  const away = useRef<AwayTrace | null>(trackAway(null, AppState.currentState ?? "active", Date.now()));
  const restExercises = useMemo(() => (workout ? toRestExercises(workout.exercises) : []), [workout]);
  // The latest exercises and viewed index, so a rest ending reads them at call time, not from a stale render.
  const latest = useRef({ restExercises, current, unit });
  useEffect(() => {
    latest.current = { restExercises, current, unit };
  });

  // The workout opens on the first exercise that still has an open set, once it has loaded.
  const placed = useRef(false);
  useEffect(() => {
    if (!workout || placed.current) return;
    placed.current = true;
    const start = firstOpenExercise(workout.exercises);
    // The rest-expiry effect below runs in this same commit and must see the exercise being shown.
    latest.current.current = start;
    setCurrent(start);
  }, [workout]);

  // A timer left over from another workout is dropped.
  useEffect(() => {
    const { workoutId, clear } = restStore.getState();
    if (workoutId !== null && workoutId !== Number(idParam)) clear();
  }, [idParam, restStore]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      away.current = trackAway(away.current, state, Date.now());
    });
    return () => sub.remove();
  }, []);

  /**
   * A rest reached zero (countdown, -15s to zero, or found over on return): clears the timer, buzzes
   * unless it ended while the app was away (Skip passes true: the lifter's own tap needs no buzz), and moves to the next exercise when the rules say so.
   */
  function endRest(unseen: boolean) {
    const running = restStore.getState().timer;
    if (!running) return;
    const expiry = resolveExpiry({
      exercises: latest.current.restExercises,
      timer: running,
      viewingIndex: latest.current.current,
      endedWhileAway: unseen || endedWhileAway(running.endsAt, away.current),
    });
    restStore.getState().clear();
    if (expiry.buzz) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (expiry.advanceTo !== null) setCurrent(expiry.advanceTo);
  }

  useEffect(() => {
    if (!timer || !workout) return;
    if (restRemaining(timer, restNow).ended) endRest(!sawRunning.current);
    else sawRunning.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restNow, timer, workout]);

  // Schedules or reschedules the rest-over notification when a rest starts, is replaced or is adjusted.
  // Cancelling is done by the store subscriber in restNotification.ts.
  // The unit is read from `latest` and is not a dependency: a notification keeps the unit it was
  // scheduled in, so switching unit never reschedules it. The next rest uses the current unit.
  const endsAt = timer?.endsAt;
  // Waits for the workout to load: before that the Next up line cannot be built.
  const loaded = !!workout;
  useEffect(() => {
    const running = restStore.getState().timer;
    if (!running || !loaded) return;
    const { restExercises: exercises, unit: scheduledUnit } = latest.current;
    void scheduleRestNotification(running.endsAt, nextUp(exercises, running.set.exerciseIndex, scheduledUnit));
  }, [endsAt, loaded, restStore]);

  function openMenu() {
    setRoutineName(findInProgressWorkout()?.routineName ?? null);
    setDiscardStep("menu");
  }

  /** Deletes the workout and returns to where it started (the root when there is nowhere to go back to). */
  function confirmDiscard() {
    restStore.getState().clear();
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
    setFinishing(null);
    restStore.getState().clear();
    if (prompt?.kind === "discard") {
      discardWorkout(Number(idParam));
      leave();
      return;
    }
    finishWorkout(Number(idParam));
    // Replaces the live screen, so the last screen's back lands where the workout started.
    // The first Offer opens when anything was Earned, otherwise the summary.
    if (loadOffers(Number(idParam), unit, jumps).length > 0) {
      router.replace({ pathname: "/workout/offer/[id]", params: { id: String(idParam), step: "0" } });
    } else {
      router.replace({ pathname: "/workout/summary/[id]", params: { id: String(idParam) } });
    }
  }

  const exercise = workout?.exercises[current];
  const total = workout?.exercises.length ?? 0;
  const currentSet = exercise ? currentSetIndex(exercise.rows) : null;
  const last = exercise ? lastColumn(lastExercises[exercise.id] ?? null, exercise.rows.length) : [];
  // A bodyweight exercise has no weight box: its sets are reps only and save weight 0.
  const bodyweight = exercise?.loadType === "bodyweight";

  function edit(index: number, change: SetEdit) {
    if (!workout || !exercise) return;
    const rows = editSet(exercise.rows, index, change, unit);
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) => (e === exercise ? { ...e, rows } : e)),
    });
  }

  function toggle(index: number) {
    if (!workout || !exercise) return;
    const row = exercise.rows[index];
    const rows = markSetDone(exercise.rows, index, !row.done, unit, exercise.loadType);
    if (rows === exercise.rows) return;
    setDrafts((d) => clearDraft(d, row.setId));
    const exercises = workout.exercises.map((e) => (e === exercise ? { ...e, rows } : e));
    setWorkout({ ...workout, exercises });
    const action = onSetToggled({
      exercises: toRestExercises(exercises),
      set: { exerciseIndex: current, setIndex: index },
      done: !row.done,
      timer: restStore.getState().timer,
      now: Date.now(),
    });
    if (action.kind === "start" || action.kind === "replace") sawRunning.current = true;
    restStore.getState().apply(action, Number(idParam));
    // The last open set of the Workout: no rest to run, so offer to finish.
    if (!row.done && workoutComplete(toRestExercises(exercises))) setFinishing(allDonePrompt());
  }

  function adjust(deltaSeconds: number) {
    if (restStore.getState().adjust(deltaSeconds, Date.now()).ended) endRest(false);
  }

  const rest = timer ? restRemaining(timer, restNow) : null;

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
              paddingBottom: spacing.xxl + (rest ? panelHeight : 0),
              gap: spacing.lg,
            }}
          >
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ChevronButton
                    icon="chevron-back"
                    label="Previous exercise"
                    disabled={current === 0}
                    onPress={() => setCurrent(current - 1)}
                  />
                  <Text variant="caption" tone="muted" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.small }}>
                    {`Exercise ${current + 1} of ${total}`}
                  </Text>
                  <ChevronButton
                    icon="chevron-forward"
                    label="Next exercise"
                    disabled={current >= total - 1}
                    onPress={() => setCurrent(current + 1)}
                  />
                </View>
                <UnitSegmented unit={unit} onChange={setUnit} size="compact" track="card" />
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
                {bannerText(exercise.target, exercise.range, unit, exercise.loadType)}
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
                {bodyweight ? null : (
                  <Text variant="caption" tone="muted" style={{ width: col.weight, textAlign: "center", fontFamily: fontFamily.medium }}>
                    {unit}
                  </Text>
                )}
                <Text variant="caption" tone="muted" style={{ width: col.reps, textAlign: "center", fontFamily: fontFamily.medium }}>
                  Reps
                </Text>
                <View style={{ width: minTouch }} />
              </View>
              {exercise.rows.map((row, index) => {
                const blocked = !row.done && !canMarkDone(row, exercise.loadType);
                return (
                  <View
                    key={row.setId}
                    style={{
                      paddingVertical: spacing.xs + 2,
                      paddingLeft: spacing.md,
                      paddingRight: spacing.sm,
                      borderRadius: radius.inset,
                      backgroundColor: colors.card,
                      // The ring is reserved on every row so the current one doesn't shift the layout.
                      borderWidth: borderWidth.outline,
                      borderColor: index === currentSet ? colors.accent : "transparent",
                    }}
                    accessibilityLabel={index === currentSet ? `Set ${index + 1}, current` : undefined}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                      <Text variant="label" tone={row.done ? "muted" : "ink"} style={{ width: col.set }}>
                        {index + 1}
                      </Text>
                      <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1, fontSize: fontSize.meta }}>
                        {lastSetText(last[index], unit, exercise.loadType)}
                      </Text>
                      {bodyweight ? null : (
                        <View style={{ width: col.weight, height: minTouch, flexDirection: "row" }}>
                          <NumberField
                            label={`Set ${index + 1} weight`}
                            keyboardType="decimal-pad"
                            parse={parseWeight}
                            value={weightFieldText(drafts, row, unit)}
                            flat={index !== currentSet}
                            onText={(t) => {
                              const w = weightFromTyped(t, unit);
                              if (w === undefined) return;
                              setDrafts((d) => typeDraft(d, row.setId, t, unit));
                              edit(index, { weightKg: w });
                            }}
                          />
                        </View>
                      )}
                      <View style={{ width: col.reps, height: minTouch, flexDirection: "row" }}>
                        <NumberField
                          label={`Set ${index + 1} reps`}
                          keyboardType="number-pad"
                          parse={parseReps}
                          value={String(row.reps)}
                          flat={index !== currentSet}
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
        {timer && rest ? (
          <RestPanel
            text={rest.text}
            fraction={rest.fraction}
            endsAt={timer.endsAt}
            totalMs={timer.totalMs}
            nextUp={nextUp(restExercises, timer.set.exerciseIndex, unit)}
            onAdjust={adjust}
            onSkip={() => endRest(true)}
            onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
          />
        ) : null}
      </View>
    </>
  );
}
