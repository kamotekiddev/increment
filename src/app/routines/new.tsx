import { router, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, RoundButton, Text } from "@/components";
import { BOTTOM_ACTION_CLEARANCE, BottomAction } from "@/routines/BottomAction";
import { DayPicker } from "@/routines/DayPicker";
import { EmptyExercises } from "@/routines/EmptyExercises";
import { LimitSheet } from "@/routines/LimitSheet";
import { NameField } from "@/routines/NameField";
import { canCreateRoutine } from "@/routines/routineLimit";
import { validateRoutineName } from "@/routines/routineName";
import { routineNameMessage } from "@/routines/routineNameMessage";
import { toggleDay } from "@/routines/routineDays";
import { createRoutine, loadRoutines, useIsPro } from "@/routines/routineQueries";
import { ScreenHeader } from "@/routines/ScreenHeader";
import { fontFamily, fontSize, spacing, useColors } from "@/theme";

export default function NewRoutineScreen() {
  const colors = useColors();
  const isPro = useIsPro();
  const [name, setName] = useState("");
  const [days, setDays] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Saves the routine, then opens it; with `thenAdd` the exercise picker opens on top of it. */
  async function save(thenAdd: boolean) {
    if (saving) return;
    setSaving(true);
    try {
      // Read fresh, so the limit and the duplicate check use what is saved now.
      const existing = await loadRoutines();
      if (!canCreateRoutine(existing.length, isPro)) {
        setLimitOpen(true);
        return;
      }
      const result = validateRoutineName(name, existing);
      if (!result.ok) {
        setError(routineNameMessage(result.reason));
        return;
      }
      const id = createRoutine(result.name, days);
      router.replace({ pathname: "/routines/[id]", params: { id: String(id) } });
      if (thenAdd) router.push({ pathname: "/routines/add-exercises", params: { routineId: String(id) } });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader left={<RoundButton icon="close" label="Cancel" onPress={() => router.back()} />} title="New routine" />
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: BOTTOM_ACTION_CLEARANCE }}
          keyboardShouldPersistTaps="handled"
        >
          <NameField
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            placeholder="e.g. Upper body"
            error={error}
            inputSize={fontSize.input}
            autoFocus
          />
          <View style={{ gap: 6 }}>
            <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium }}>
              Repeat on (optional)
            </Text>
            <DayPicker value={days} onToggle={(i) => setDays(toggleDay(days, i))} />
          </View>
          <EmptyExercises onAdd={() => save(true)} disabled={saving || name.trim() === ""} />
        </ScrollView>
        <BottomAction>
          <Button label="Create routine" large disabled={saving || name.trim() === ""} onPress={() => save(false)} />
        </BottomAction>
      </View>
      <LimitSheet visible={limitOpen} onDismiss={() => setLimitOpen(false)} />
    </>
  );
}
