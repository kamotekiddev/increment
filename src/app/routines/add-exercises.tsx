import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { Button, RoundButton } from "@/components";
import { defaultRule } from "@/engine";
import { ExerciseBrowser } from "@/library/ExerciseBrowser";
import { exerciseMeta } from "@/library/exerciseMeta";
import { useExercises, type LibraryExercise } from "@/library/exerciseQueries";
import { BOTTOM_ACTION_CLEARANCE, BottomAction } from "@/routines/BottomAction";
import { ExerciseSetupSheet } from "@/routines/ExerciseSetupSheet";
import { addRoutineExercise, loadRoutineExercises } from "@/routines/routineQueries";
import { DEFAULT_SETUP, type ExerciseSetup } from "@/routines/routineSetup";
import { ScreenHeader } from "@/routines/ScreenHeader";
import { spacing, useColors } from "@/theme";

export default function AddExercisesScreen() {
  const colors = useColors();
  const { routineId: param } = useLocalSearchParams<{ routineId: string }>();
  const routineId = Number(param);
  const exercises = useExercises();
  const [addedIds, setAddedIds] = useState<ReadonlySet<number>>(new Set());
  const [picked, setPicked] = useState<LibraryExercise | null>(null);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);

  useEffect(() => {
    loadRoutineExercises(routineId).then((rows) => setAddedIds(new Set(rows.map((r) => r.exerciseId))));
  }, [routineId]);

  const rule = useMemo(() => defaultRule(picked?.loadType ?? "weighted"), [picked]);

  function onSubmit(setup: ExerciseSetup) {
    // The ref blocks a second tap before state has re-rendered.
    if (!picked || addingRef.current) return;
    addingRef.current = true;
    setAdding(true);
    try {
      // False means the exercise was already in the routine; it is marked added either way.
      addRoutineExercise(routineId, picked.id, picked.loadType, setup);
      setAddedIds((prev) => new Set(prev).add(picked.id));
      setOpen(false);
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader
          left={<RoundButton icon="chevron-back" label="Back" onPress={() => router.back()} />}
          title="Add exercises"
        />
        <View style={{ flex: 1, paddingTop: spacing.md }}>
          <ExerciseBrowser
            picker
            bottomInset={BOTTOM_ACTION_CLEARANCE}
            exercises={exercises}
            disabledIds={addedIds}
            onSelect={(exercise) => {
              setPicked(exercise);
              setOpen(true);
            }}
          />
        </View>
        <BottomAction>
          <Button label="Done" large onPress={() => router.back()} />
        </BottomAction>
      </View>
      <ExerciseSetupSheet
        visible={open}
        exerciseName={picked?.name ?? ""}
        subtitle={picked ? exerciseMeta(picked) : ""}
        initial={DEFAULT_SETUP}
        rule={rule}
        primaryLabel="Add to routine"
        busy={adding}
        onSubmit={onSubmit}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
}
