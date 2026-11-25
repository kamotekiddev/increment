import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, Pill, RoundButton, ScreenHeader } from "@/components";
import { db } from "@/db/client";
import { ChoiceChips } from "@/library/ChoiceChips";
import { canSubmit, newExerciseRow, type ExerciseDraft } from "@/library/customExerciseDraft";
import { EQUIPMENT_CHOICES } from "@/library/customExerciseEquipment";
import { exerciseNameMessage, validateExerciseName } from "@/library/customExerciseName";
import { exerciseNameRefs, insertCustomExercise } from "@/library/customExerciseQueries";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/library/muscleGroups";
import { StepsField } from "@/library/StepsField";
import { useSaveButtonKind } from "@/library/useSaveButtonKind";
import { BOTTOM_ACTION_CLEARANCE, BottomAction } from "@/routines/BottomAction";
import { NameField } from "@/routines/NameField";
import { fontSize, spacing, useColors } from "@/theme";

const MUSCLE_CHOICES = MUSCLE_GROUPS.map((group) => ({ label: group, value: group }));

/**
 * New exercise. Opens for everyone; for a free lifter the bottom button is Unlock Pro and opens the Paywall,
 * saving nothing, with everything typed kept in place. `name` pre-fills the Name field.
 */
export default function NewExerciseScreen() {
  const colors = useColors();
  const { name: initialName } = useLocalSearchParams<{ name?: string }>();
  const button = useSaveButtonKind();
  const [draft, setDraft] = useState<ExerciseDraft>({
    name: initialName ?? "",
    group: null,
    equipment: null,
    steps: [],
  });
  const [saving, setSaving] = useState(false);

  // Every library and custom name, read when the screen opens (it is a fresh screen on each visit).
  const existing = useMemo(() => exerciseNameRefs(db), []);
  const nameResult = validateExerciseName(draft.name, existing);
  const nameError = exerciseNameMessage(nameResult, draft.name);
  const ready = canSubmit(draft, nameResult.ok);

  function save() {
    if (saving || !ready) return;
    setSaving(true);
    try {
      insertCustomExercise(db, newExerciseRow(draft));
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader
          left={<RoundButton icon="close" label="Cancel" onPress={() => router.back()} />}
          title="New exercise"
          right={<Pill label="Pro" tone="solid" />}
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
            autoFocus={!initialName}
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
          />
          <StepsField steps={draft.steps} onChange={(steps) => setDraft({ ...draft, steps })} />
        </ScrollView>
        <BottomAction>
          {button === "save" ? (
            <Button label="Save exercise" large disabled={!ready || saving} onPress={save} />
          ) : (
            <Button label="Unlock Pro" icon="lock-closed" large onPress={() => router.push("/paywall")} />
          )}
        </BottomAction>
      </View>
    </>
  );
}
