import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { defaultRule } from "@/engine";
import { ExerciseBrowser } from "@/library/ExerciseBrowser";
import { useExercises, type LibraryExercise } from "@/library/exerciseQueries";
import { ExerciseSetupSheet } from "@/routines/ExerciseSetupSheet";
import { addRoutineExercise, loadRoutineExercises } from "@/routines/routineQueries";
import { DEFAULT_SETUP, type ExerciseSetup } from "@/routines/routineSetup";
import { spacing, useColors } from "@/theme";

export default function AddExercisesScreen() {
  const colors = useColors();
  const { routineId: param } = useLocalSearchParams<{ routineId: string }>();
  const routineId = Number(param);
  const exercises = useExercises();
  const [addedIds, setAddedIds] = useState<ReadonlySet<number>>(new Set());
  const [picked, setPicked] = useState<LibraryExercise | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadRoutineExercises(routineId).then((rows) => setAddedIds(new Set(rows.map((r) => r.exerciseId))));
  }, [routineId]);

  const rule = useMemo(() => defaultRule(picked?.loadType ?? "weighted"), [picked]);

  async function onSubmit(setup: ExerciseSetup) {
    if (!picked) return;
    setOpen(false);
    await addRoutineExercise(routineId, picked.id, picked.loadType, setup);
    setAddedIds((prev) => new Set(prev).add(picked.id));
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Add exercises",
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: spacing.sm }}>
        <ExerciseBrowser
          exercises={exercises}
          disabledIds={addedIds}
          onSelect={(exercise) => {
            setPicked(exercise);
            setOpen(true);
          }}
        />
      </View>
      <ExerciseSetupSheet
        visible={open}
        exerciseName={picked?.name ?? ""}
        initial={DEFAULT_SETUP}
        rule={rule}
        primaryLabel="Add to routine"
        onSubmit={onSubmit}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
}
