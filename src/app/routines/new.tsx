import { router, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, Input, Text } from "@/components";
import { DayPicker } from "@/routines/DayPicker";
import { LimitSheet } from "@/routines/LimitSheet";
import { canCreateRoutine } from "@/routines/routineLimit";
import { validateRoutineName } from "@/routines/routineName";
import { routineNameMessage } from "@/routines/routineNameMessage";
import { toggleDay } from "@/routines/routineDays";
import { createRoutine, loadRoutines, useIsPro } from "@/routines/routineQueries";
import { spacing, useColors } from "@/theme";

export default function NewRoutineScreen() {
  const colors = useColors();
  const isPro = useIsPro();
  const [name, setName] = useState("");
  const [days, setDays] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
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
      const id = await createRoutine(result.name, days);
      router.replace({ pathname: "/routines/[id]", params: { id: String(id) } });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "New routine",
          headerBackTitle: "Routines",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
        }}
      />
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
              setError(null);
            }}
            placeholder="e.g. Push day"
            accessibilityLabel="Routine name"
            returnKeyType="done"
            autoFocus
          />
          {error ? (
            <Text variant="caption" tone="danger">
              {error}
            </Text>
          ) : null}
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text variant="label">Days (optional)</Text>
          <DayPicker value={days} onToggle={(i) => setDays(toggleDay(days, i))} />
        </View>
        <Button label="Create" onPress={save} disabled={saving} />
      </ScrollView>
      <LimitSheet visible={limitOpen} onDismiss={() => setLimitOpen(false)} />
    </>
  );
}
