import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button, Input, Text } from "@/components";
import { DayPicker } from "@/routines/DayPicker";
import { DeleteRoutineSheet, type DeleteSheetStep } from "@/routines/DeleteRoutineSheet";
import { ExerciseSetupSheet } from "@/routines/ExerciseSetupSheet";
import { moveExercise } from "@/routines/moveExercise";
import { RemoveExerciseSheet } from "@/routines/RemoveExerciseSheet";
import { ReorderList } from "@/routines/ReorderList";
import { saveExerciseOrder } from "@/routines/reorderQueries";
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
  updateRoutineExercise,
  useRoutineExercises,
} from "@/routines/routineQueries";
import type { ExerciseSetup } from "@/routines/routineSetup";
import { setupSubtitle } from "@/routines/setupText";
import { fontSize, minTouch, radius, spacing, useColors } from "@/theme";

type Loaded = Awaited<ReturnType<typeof loadRoutine>>;

export default function EditRoutineScreen() {
  const colors = useColors();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Number(idParam);

  const [routine, setRoutine] = useState<Loaded | undefined>(undefined);
  const [name, setName] = useState("");
  const [days, setDays] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<DeleteSheetStep>("closed");
  const [workoutCount, setWorkoutCount] = useState(0);
  const [savedLabel, setSavedLabel] = useState("");
  const [exerciseVersion, setExerciseVersion] = useState(0);
  const [editing, setEditing] = useState<RoutineExerciseItem | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const loadedRows = useRoutineExercises(id, exerciseVersion);
  // Reorder mode: `order` is the in-memory draft (null when not reordering). After Done the saved
  // order shows at once until a fresh load from the hook replaces it.
  const [order, setOrder] = useState<RoutineExerciseItem[] | null>(null);
  const [saved, setSaved] = useState<{ base: unknown; rows: RoutineExerciseItem[] } | null>(null);
  const exerciseRows = saved && saved.base === loadedRows ? saved.rows : loadedRows;
  const reordering = order !== null;

  function doneReordering() {
    if (!order) return;
    saveExerciseOrder(order.map((row) => row.id));
    setSaved({ base: loadedRows, rows: order });
    setOrder(null);
  }

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
    if (gone.current || !savedName.current) return;
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
  }, [id]);

  // Leaving the screen: a valid name still being typed is saved; an invalid one is dropped,
  // which leaves the saved name in place.
  useEffect(() => {
    return () => {
      void commitName();
    };
  }, [commitName]);

  async function onToggleDay(index: number) {
    const next = toggleDay(days, index);
    setDays(next);
    await setRoutineDays(id, next);
  }

  async function saveExercise(setup: ExerciseSetup) {
    if (!editing) return;
    await updateRoutineExercise(editing.id, setup);
    setEditing(null);
    setExerciseVersion((v) => v + 1);
  }

  async function confirmRemove() {
    if (!editing) return;
    await removeRoutineExercise(editing.id);
    setConfirmingRemove(false);
    setEditing(null);
    setExerciseVersion((v) => v + 1);
  }

  async function openMenu() {
    setWorkoutCount(await countRoutineWorkouts(id));
    setStep("menu");
  }

  async function confirmDelete() {
    gone.current = true;
    await deleteRoutine(id);
    setStep("closed");
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Routines",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
          headerBackVisible: !reordering,
          headerLeft: reordering
            ? () => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel reordering"
                  onPress={() => setOrder(null)}
                  hitSlop={spacing.sm}
                  style={{
                    minWidth: minTouch,
                    minHeight: minTouch,
                    justifyContent: "center",
                  }}
                >
                  <Text tone="accent">Cancel</Text>
                </Pressable>
              )
            : undefined,
          headerRight: () =>
            reordering ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Done reordering"
                onPress={doneReordering}
                hitSlop={spacing.sm}
                style={{
                  minWidth: minTouch,
                  minHeight: minTouch,
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <Text variant="label" tone="accent">
                  Done
                </Text>
              </Pressable>
            ) : routine ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More"
                onPress={openMenu}
                hitSlop={spacing.sm}
                style={{
                  minWidth: minTouch,
                  minHeight: minTouch,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.title,
                    lineHeight: fontSize.title + spacing.xs,
                  }}
                >
                  ⋯
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      {routine ? (
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.bg }}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: spacing.sm }}>
            <Text variant="label">Name</Text>
            <Input
              value={name}
              onChangeText={(text) => {
                setName(text);
                draft.current = text;
                setError(null);
              }}
              onBlur={() => void commitName()}
              onSubmitEditing={() => void commitName()}
              placeholder="e.g. Push day"
              accessibilityLabel="Routine name"
              returnKeyType="done"
            />
            {error ? (
              <Text variant="caption" tone="danger">
                {error}
              </Text>
            ) : null}
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text variant="label">Days (optional)</Text>
            <DayPicker value={days} onToggle={onToggleDay} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant="label">Exercises</Text>
              {!reordering && exerciseRows && exerciseRows.length > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reorder exercises"
                  onPress={() => setOrder(exerciseRows)}
                  hitSlop={spacing.sm}
                  style={{ minHeight: minTouch, justifyContent: "center" }}
                >
                  <Text variant="label" tone="accent">
                    Reorder
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {order ? (
              <ReorderList
                rows={order}
                onMove={(index, direction) =>
                  setOrder(moveExercise(order, index, direction))
                }
              />
            ) : exerciseRows && exerciseRows.length > 0 ? (
              <View
                style={{
                  borderRadius: radius.md,
                  backgroundColor: colors.card,
                  overflow: "hidden",
                }}
              >
                {exerciseRows.map((row, index) => (
                  <Pressable
                    key={row.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${row.name}`}
                    onPress={() => setEditing(row)}
                    style={{
                      minHeight: minTouch,
                      justifyContent: "center",
                      gap: spacing.xs,
                      padding: spacing.lg,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: colors.line,
                    }}
                  >
                    <Text variant="label">{row.name}</Text>
                    <Text variant="caption" tone="muted">
                      {setupSubtitle(row)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View
                style={{
                  padding: spacing.xl,
                  borderRadius: radius.md,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.line,
                }}
              >
                <Text tone="muted">No exercises yet.</Text>
              </View>
            )}
            {reordering ? null : (
              <Button
                label="Add exercises"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/routines/add-exercises",
                    params: { routineId: String(id) },
                  })
                }
              />
            )}
          </View>
        </ScrollView>
      ) : routine === null ? (
        <View
          style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl }}
        >
          <Text tone="muted">Routine not found.</Text>
        </View>
      ) : null}
      {editing ? (
        <>
          <ExerciseSetupSheet
            visible={!confirmingRemove}
            exerciseName={editing.name}
            initial={editing}
            rule={editing.rule}
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
            onDismiss={() => {
              setConfirmingRemove(false);
              setEditing(null);
            }}
          />
        </>
      ) : null}
      <DeleteRoutineSheet
        step={step}
        routineName={savedLabel}
        workoutCount={workoutCount}
        onChooseDelete={() => setStep("confirm")}
        onConfirm={confirmDelete}
        onDismiss={() => setStep("closed")}
      />
    </>
  );
}
