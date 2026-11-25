import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, Pill, RoundButton, ScreenHeader, Text } from "@/components";
import { db } from "@/db/client";
import { ChoiceChips } from "@/library/ChoiceChips";
import { canSubmit, draftFromExercise, newExerciseRow, type ExerciseDraft } from "@/library/customExerciseDraft";
import { BODYWEIGHT_LOCKED_NOTE, EQUIPMENT_CHOICES, lockedEquipment } from "@/library/customExerciseEquipment";
import { exerciseNameMessage, validateExerciseName } from "@/library/customExerciseName";
import { exerciseNameRefs, isExerciseUsed, updateCustomExercise } from "@/library/customExerciseQueries";
import { DeleteExerciseSheet } from "@/library/DeleteExerciseSheet";
import { deleteCustomExercise, exerciseDeleteInfo, type ExerciseDeleteInfo } from "@/library/deleteCustomExercise";
import { useExercise, type Exercise } from "@/library/exerciseQueries";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/library/muscleGroups";
import { StepsField } from "@/library/StepsField";
import { useSaveButtonKind } from "@/library/useSaveButtonKind";
import { BOTTOM_ACTION_CLEARANCE, BottomAction } from "@/routines/BottomAction";
import { NameField } from "@/routines/NameField";
import { fontSize, spacing, useColors } from "@/theme";

const MUSCLE_CHOICES = MUSCLE_GROUPS.map((group) => ({ label: group, value: group }));

/** Edit exercise: a custom exercise's fields, filled in. Not found, or a library exercise, shows a plain message. */
export default function EditExerciseScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = useExercise(Number(id));

  if (exercise && exercise.isCustom) return <EditExerciseForm exercise={exercise} />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        left={<RoundButton icon="close" label="Cancel" onPress={() => router.back()} />}
        title="Edit exercise"
      />
      {exercise === undefined ? null : (
        <Text tone="muted" style={{ padding: spacing.xl }}>
          {exercise === null ? "Exercise not found." : "Only exercises you made can be edited."}
        </Text>
      )}
    </View>
  );
}

/**
 * Opens for everyone; for a free lifter the bottom button is Unlock Pro and opens the Paywall, saving nothing,
 * with every change kept in place. Delete exercise stays for everyone.
 */
function EditExerciseForm({ exercise }: { exercise: Exercise }) {
  const colors = useColors();
  const button = useSaveButtonKind();
  const [draft, setDraft] = useState<ExerciseDraft>(() => draftFromExercise(exercise));
  const [saving, setSaving] = useState(false);
  const deleting = useRef(false);

  // Read when the screen opens (it is a fresh screen on each visit).
  const existing = useMemo(() => exerciseNameRefs(db), []);
  const used = useMemo(() => isExerciseUsed(db, exercise.id), [exercise.id]);
  const locked = lockedEquipment(exercise.equipment, used);

  const nameResult = validateExerciseName(draft.name, existing, exercise.id);
  const nameError = exerciseNameMessage(nameResult, draft.name);
  const ready = canSubmit(draft, nameResult.ok);

  function save() {
    if (saving || !ready) return;
    setSaving(true);
    try {
      updateCustomExercise(db, exercise.id, newExerciseRow(draft));
      router.back();
    } finally {
      setSaving(false);
    }
  }

  // Read when the sheet opens, so the routines and the workout count are current.
  const [deleteInfo, setDeleteInfo] = useState<ExerciseDeleteInfo | null>(null);

  function openDeleteSheet() {
    setDeleteInfo(exerciseDeleteInfo(db, exercise.id));
  }

  function confirmDelete() {
    if (deleting.current) return;
    deleting.current = true;
    let deleted = false;
    try {
      const result = deleteCustomExercise(db, exercise.id);
      if (result === "in-progress") {
        setDeleteInfo(exerciseDeleteInfo(db, exercise.id));
        return;
      }
      deleted = result === "deleted";
    } finally {
      // Stay locked only after a successful delete (the screen is leaving); any other path re-arms Delete.
      if (!deleted) deleting.current = false;
    }
    setDeleteInfo(null);
    // Leave Edit and the Exercise detail under it: the exercise is gone.
    if (router.canDismiss()) router.dismiss(2);
    else router.back();
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader
          left={<RoundButton icon="close" label="Cancel" onPress={() => router.back()} />}
          title="Edit exercise"
          right={<Pill label="Custom" tone="plain" />}
        />
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: BOTTOM_ACTION_CLEARANCE + spacing.xl }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <NameField
            value={draft.name}
            onChangeText={(name) => setDraft({ ...draft, name })}
            placeholder="e.g. Landmine press"
            error={nameError}
            inputSize={fontSize.lead}
            accessibilityLabel="Exercise name"
          />
          <ChoiceChips
            label="Main muscle"
            options={MUSCLE_CHOICES}
            value={draft.group}
            onChange={(group: MuscleGroup) => setDraft({ ...draft, group })}
          />
          <ChoiceChips
            label="Equipment"
            options={EQUIPMENT_CHOICES}
            value={draft.equipment}
            onChange={(equipment) => setDraft({ ...draft, equipment })}
            disabledValues={locked}
            note={locked.length > 0 ? BODYWEIGHT_LOCKED_NOTE : undefined}
          />
          <StepsField steps={draft.steps} onChange={(steps) => setDraft({ ...draft, steps })} />
          <Button label="Delete exercise" icon="trash-outline" variant="dangerText" stretch onPress={openDeleteSheet} />
        </ScrollView>
        <BottomAction>
          {button === "save" ? (
            <Button label="Save changes" large disabled={!ready || saving} onPress={save} />
          ) : (
            <Button label="Unlock Pro" icon="lock-closed" large onPress={() => router.push("/paywall")} />
          )}
        </BottomAction>
      </View>
      <DeleteExerciseSheet
        visible={deleteInfo !== null}
        name={exercise.name}
        info={deleteInfo}
        onConfirm={confirmDelete}
        onDismiss={() => setDeleteInfo(null)}
      />
    </>
  );
}
