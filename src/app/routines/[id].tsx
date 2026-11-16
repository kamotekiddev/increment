import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Text } from "@/components";
import { daysLabel } from "@/routines/routineDays";
import { loadRoutine } from "@/routines/routineQueries";
import { spacing, useColors } from "@/theme";

type Loaded = Awaited<ReturnType<typeof loadRoutine>>;

/** Stub: ticket 03 builds the real Edit routine screen here. */
export default function EditRoutineScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [routine, setRoutine] = useState<Loaded | undefined>(undefined);

  useEffect(() => {
    loadRoutine(Number(id)).then(setRoutine);
  }, [id]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Routines",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.md }}>
        {routine ? (
          <>
            <Text variant="heading">{routine.name}</Text>
            <Text tone="muted">{daysLabel(routine.days)}</Text>
          </>
        ) : routine === null ? (
          <Text tone="muted">Routine not found.</Text>
        ) : null}
      </View>
    </>
  );
}
