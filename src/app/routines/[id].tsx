import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Pressable, ScrollView, View } from "react-native";

import { Button, RoundButton, ScreenHeader, Text } from "@/components";
import { db } from "@/db/client";
import { useIsPro } from "@/pro";
import { PAYWALL_PATH } from "@/pro/proRoutes";
import { exerciseMeta } from "@/library/exerciseMeta";
import { BOTTOM_ACTION_CLEARANCE, BottomAction } from "@/routines/BottomAction";
import { DayPicker } from "@/routines/DayPicker";
import { DeleteRoutineSheet } from "@/routines/DeleteRoutineSheet";
import { EmptyExercises } from "@/routines/EmptyExercises";
import { ExerciseSetupSheet } from "@/routines/ExerciseSetupSheet";
import { ExerciseTile } from "@/routines/ExerciseTile";
import { lockedRoutineBanner } from "@/routines/lockedRoutineText";
import { moveExercise } from "@/routines/moveExercise";
import { NameField } from "@/routines/NameField";
import { RemoveExerciseSheet } from "@/routines/RemoveExerciseSheet";
import { ReorderList } from "@/routines/ReorderList";
import { saveExerciseOrder } from "@/routines/reorderQueries";
import { isRoutineLocked } from "@/routines/routineLimit";
import { toggleDay } from "@/routines/routineDays";
import { validateRoutineName } from "@/routines/routineName";
import { routineNameMessage } from "@/routines/routineNameMessage";
import {
  countRoutineWorkouts,
  deleteRoutine,
  loadRoutine,
  loadRoutines,
  removeRoutineExercise,
  renameRoutine,
  type RoutineExerciseItem,
  setRoutineDays,
  useRoutines,
  updateRoutineExercise,
  useRoutineExercises,
} from "@/routines/routineQueries";
import type { ExerciseSetup } from "@/routines/routineSetup";
import { setupSubtitle } from "@/routines/setupText";
import {
  fontFamily,
  fontSize,
  minTouch,
  opacity,
  radius,
  size,
  spacing,
  useColors,
} from "@/theme";
import type { OverloadRule } from "@/engine";
import type { Jumps } from "@/units";
import { useInProgressOnFocus } from "@/workout/inProgressQueries";
import { isBlockedByWorkout, LOCK_MESSAGE } from "@/workout/routineLock";
import { openWorkout, useStartWorkout } from "@/workout/useStartWorkout";
import { pastExercises } from "@/workout/workoutQueries";

type Loaded = Awaited<ReturnType<typeof loadRoutine>>;

export default function EditRoutineScreen() {
  const colors = useColors();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Number(idParam);

  const [routine, setRoutine] = useState<Loaded | undefined>(undefined);
  const [name, setName] = useState("");
  const [days, setDays] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [savedLabel, setSavedLabel] = useState("");
  const [exerciseVersion, setExerciseVersion] = useState(0);
  const [editing, setEditing] = useState<RoutineExerciseItem | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const inProgress = useInProgressOnFocus();
  const blockedByWorkout = isBlockedByWorkout(inProgress, id);
  const isPro = useIsPro();
  const allRoutines = useRoutines();
  const locked =
    !!allRoutines && isRoutineLocked(id, allRoutines.map((r) => r.id), isPro);
  // Read-only for either reason: a workout in progress, or the Pro lock.
  const readOnly = blockedByWorkout || locked;
  const dim = blockedByWorkout ? opacity.disabled : opacity.locked;
  const { start, sheet: startSheet } = useStartWorkout();
  const loadedRows = useRoutineExercises(id, exerciseVersion);
  // Reorder mode: `order` is the in-memory draft (null when not reordering). After Done the saved
  // order shows at once until a fresh load from the hook replaces it.
  const [order, setOrder] = useState<RoutineExerciseItem[] | null>(null);
  const [saved, setSaved] = useState<{
    base: unknown;
    rows: RoutineExerciseItem[];
  } | null>(null);
  const exerciseRows =
    saved && saved.base === loadedRows ? saved.rows : loadedRows;
  const reordering = order !== null;

  function doneReordering() {
    if (!order) return;
    saveExerciseOrder(order.map((row) => row.id));
    setSaved({ base: loadedRows, rows: order });
    setOrder(null);
  }

  // Android hardware back during reorder mode cancels the reorder (drops the draft) instead of
  // leaving the screen.
  useEffect(() => {
    if (!reordering) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setOrder(null);
      return true;
    });
    return () => sub.remove();
  }, [reordering]);

  // Latest values for the commit that runs when the screen is left.
  const savedName = useRef("");
  const draft = useRef("");
  const gone = useRef(false);

  useEffect(() => {
    loadRoutine(id).then((row) => {
      setRoutine(row);
      if (row) {
        savedName.current = row.name;
        draft.current = row.name;
        setName(row.name);
        setSavedLabel(row.name);
        setDays(row.days);
      }
    });
  }, [id]);

  /** Checks the name and saves it. An invalid name is not saved, so the saved one stays. */
  const commitName = useCallback(async (): Promise<void> => {
    if (gone.current || readOnly || !savedName.current) return;
    const existing = await loadRoutines();
    const result = validateRoutineName(draft.current, existing, id);
    if (!result.ok) {
      setError(routineNameMessage(result.reason));
      return;
    }
    setError(null);
    setName(result.name);
    draft.current = result.name;
    if (result.name !== savedName.current) {
      savedName.current = result.name;
      setSavedLabel(result.name);
      await renameRoutine(id, result.name);
    }
  }, [id, readOnly]);

  // Leaving the screen: a valid name still being typed is saved; an invalid one is dropped,
  // which leaves the saved name in place.
  useEffect(() => {
    return () => {
      void commitName();
    };
  }, [commitName]);

  async function onToggleDay(index: number) {
    if (readOnly) return;
    const next = toggleDay(days, index);
    setDays(next);
    await setRoutineDays(id, next);
  }

  // The edited exercise's finished workouts in this routine, for the rule panel's preview.
  const editingPast = useMemo(
    () => (editing ? pastExercises(db, id, editing.exerciseId) : []),
    [editing, id],
  );

  async function saveExercise(
    setup: ExerciseSetup,
    jumps: Partial<Jumps>,
    rule?: OverloadRule,
  ) {
    if (!editing) return;
    await updateRoutineExercise(editing.id, setup, jumps, rule);
    setEditing(null);
    setExerciseVersion((v) => v + 1);
  }

  async function confirmRemove() {
    if (!editing) return;
    removeRoutineExercise(editing.id);
    setConfirmingRemove(false);
    setEditing(null);
    setExerciseVersion((v) => v + 1);
  }

  /** Starts the routine, or asks Resume or Discard when a workout is already in progress. */
  function onStartWorkout() {
    start(id, savedLabel);
  }

  async function openDelete() {
    if (blockedByWorkout) return;
    setWorkoutCount(await countRoutineWorkouts(id));
    setDeleting(true);
  }

  async function confirmDelete() {
    gone.current = true;
    deleteRoutine(id);
    setDeleting(false);
    router.back();
  }

  function addExercises() {
    router.push({
      pathname: "/routines/add-exercises",
      params: { routineId: String(id) },
    });
  }

  const textAction = (
    label: string,
    onPress: () => void,
    tone: "muted" | "accent",
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={{
        minWidth: minTouch,
        minHeight: minTouch,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text variant="label" tone={tone} style={{ fontSize: fontSize.body }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {reordering ? (
          <ScreenHeader
            align="center"
            title="Reorder"
            left={textAction("Cancel", () => setOrder(null), "muted")}
            right={textAction("Done", doneReordering, "accent")}
          />
        ) : (
          <ScreenHeader
            align="center"
            title="Edit routine"
            left={
              <RoundButton
                icon="chevron-back"
                label="Back"
                onPress={() => router.back()}
              />
            }
            right={
              routine ? (
                <RoundButton
                  icon="ellipsis-horizontal"
                  label="More options"
                  onPress={openDelete}
                  disabled={blockedByWorkout}
                />
              ) : (
                <View style={{ width: 48 }} />
              )
            }
          />
        )}
        {routine ? (
          <ScrollView
            contentContainerStyle={{
              padding: spacing.xl,
              gap: spacing.lg,
              paddingBottom: reordering ? spacing.xxl : BOTTOM_ACTION_CLEARANCE,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {order ? (
              <>
                <Text
                  tone="muted"
                  style={{
                    fontSize: fontSize.meta,
                    lineHeight: 19,
                    paddingHorizontal: 2,
                  }}
                >
                  Move exercises with the arrows. The new order is saved when
                  you tap Done.
                </Text>
                <ReorderList
                  rows={order}
                  onMove={(index, direction) =>
                    setOrder(moveExercise(order, index, direction))
                  }
                />
              </>
            ) : (
              <>
                {blockedByWorkout && inProgress ? (
                  <View style={{ gap: spacing.md }}>
                    <View
                      style={{
                        padding: spacing.lg,
                        borderRadius: radius.lg,
                        backgroundColor: colors.accentTint,
                        gap: spacing.xs,
                      }}
                    >
                      <Text variant="label">Workout in progress</Text>
                      <Text variant="caption" tone="soft">
                        {LOCK_MESSAGE}. Then you can edit or delete this
                        routine.
                      </Text>
                    </View>
                    <Button
                      label="Resume workout"
                      large
                      onPress={() => openWorkout(inProgress.id)}
                    />
                  </View>
                ) : locked ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      padding: spacing.lg,
                      borderRadius: radius.lg,
                      backgroundColor: colors.accentTint,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: radius.pill,
                        backgroundColor: colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="lock-closed" size={16} color={colors.onAccent} />
                    </View>
                    <Text variant="caption" tone="soft" style={{ flex: 1 }}>
                      {lockedRoutineBanner(savedLabel)}
                    </Text>
                  </View>
                ) : (
                  <Button
                    label="Start workout"
                    large
                    disabled={!exerciseRows || exerciseRows.length === 0}
                    onPress={onStartWorkout}
                  />
                )}
                <View
                  pointerEvents={readOnly ? "none" : "auto"}
                  style={{ opacity: readOnly ? dim : 1 }}
                >
                  <NameField
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      draft.current = text;
                      setError(null);
                    }}
                    onBlur={() => void commitName()}
                    onSubmitEditing={() => void commitName()}
                    placeholder="e.g. Push day"
                    error={error}
                    inputSize={fontSize.titleLg}
                  />
                </View>
                <View style={{ gap: 6 }}>
                  <Text
                    variant="caption"
                    tone="muted"
                    style={{
                      fontSize: fontSize.small,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    Repeat on (optional)
                  </Text>
                  <DayPicker
                    value={days}
                    onToggle={onToggleDay}
                    disabled={readOnly}
                  />
                </View>
                {exerciseRows && exerciseRows.length > 0 ? (
                  <>
                    <View style={{ gap: spacing.sm }}>
                      {exerciseRows.map((row) => (
                        <Pressable
                          key={row.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Edit ${row.name}`}
                          accessibilityState={{ disabled: readOnly }}
                          disabled={readOnly}
                          onPress={() => setEditing(row)}
                          style={({ pressed }) => ({
                            height: size.row,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.md,
                            paddingLeft: spacing.md,
                            paddingRight: spacing.lg,
                            borderRadius: radius.row,
                            backgroundColor: colors.card,
                            opacity: readOnly
                              ? dim
                              : pressed
                                ? opacity.pressed
                                : 1,
                          })}
                        >
                          <ExerciseTile equipment={row.equipment} />
                          <View style={{ flex: 1 }}>
                            <Text
                              variant="label"
                              style={{ fontSize: fontSize.body }}
                              numberOfLines={1}
                            >
                              {row.name}
                            </Text>
                            <Text variant="caption" tone="muted">
                              {setupSubtitle(row)}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.iconFaint}
                          />
                        </Pressable>
                      ))}
                    </View>
                    {exerciseRows.length > 1 ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Reorder exercises"
                        accessibilityState={{ disabled: readOnly }}
                        disabled={readOnly}
                        onPress={() => setOrder(exerciseRows)}
                        style={{
                          opacity: readOnly ? opacity.disabled : 1,
                          alignSelf: "flex-end",
                          height: minTouch,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing.sm,
                          paddingHorizontal: spacing.lg,
                          borderRadius: radius.pill,
                          backgroundColor: colors.card,
                        }}
                      >
                        <Ionicons
                          name="swap-vertical-outline"
                          size={16}
                          color={colors.ink}
                        />
                        <Text variant="label">Reorder</Text>
                      </Pressable>
                    ) : null}
                    <Button
                      label="Add exercise"
                      variant="dashed"
                      large
                      disabled={readOnly}
                      onPress={addExercises}
                    />
                  </>
                ) : exerciseRows ? (
                  <View
                    pointerEvents={readOnly ? "none" : "auto"}
                    style={{ opacity: readOnly ? dim : 1 }}
                  >
                    <EmptyExercises onAdd={addExercises} />
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>
        ) : routine === null ? (
          <View style={{ flex: 1, padding: spacing.xl }}>
            <Text tone="muted">Routine not found.</Text>
          </View>
        ) : null}
        {routine && !reordering ? (
          <BottomAction>
            {locked ? (
              <Button
                label="Unlock Pro"
                icon="lock-closed"
                large
                onPress={() => router.push(PAYWALL_PATH)}
              />
            ) : (
              <Button label="Done" large onPress={() => router.back()} />
            )}
          </BottomAction>
        ) : null}
      </View>
      {editing ? (
        <>
          <ExerciseSetupSheet
            visible={!confirmingRemove}
            exerciseName={editing.name}
            subtitle={exerciseMeta(editing)}
            initial={editing}
            rule={editing.rule}
            loadType={editing.loadType}
            jumps={editing}
            past={editingPast}
            primaryLabel="Save"
            onSubmit={saveExercise}
            onDismiss={() => setEditing(null)}
            onRemove={() => setConfirmingRemove(true)}
          />
          <RemoveExerciseSheet
            visible={confirmingRemove}
            exerciseName={editing.name}
            routineName={savedLabel}
            onConfirm={confirmRemove}
            onDismiss={() => setConfirmingRemove(false)}
          />
        </>
      ) : null}
      {startSheet}
      <DeleteRoutineSheet
        visible={deleting}
        routineName={savedLabel}
        workoutCount={workoutCount}
        onConfirm={confirmDelete}
        onDismiss={() => setDeleting(false)}
      />
    </>
  );
}
