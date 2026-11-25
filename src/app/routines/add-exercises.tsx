import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { Button, RoundButton, ScreenHeader } from "@/components";
import { db } from "@/db/client";
import { defaultRule, type OverloadRule } from "@/engine";
import { createdPick, newExerciseParams } from "@/library/createFlow";
import { ExerciseBrowser } from "@/library/ExerciseBrowser";
import { exerciseMeta } from "@/library/exerciseMeta";
import { useExercises, type LibraryExercise } from "@/library/exerciseQueries";
import { BOTTOM_ACTION_CLEARANCE, BottomAction } from "@/routines/BottomAction";
import { ExerciseSetupSheet } from "@/routines/ExerciseSetupSheet";
import { addRoutineExercise, loadRoutineExercises } from "@/routines/routineQueries";
import { newExerciseSetup, type ExerciseSetup } from "@/routines/routineSetup";
import { useDefaultRest } from "@/settings";
import { spacing, useColors } from "@/theme";
import type { Jumps } from "@/units";
import { pastExercises } from "@/workout/workoutQueries";

export default function AddExercisesScreen() {
  const colors = useColors();
  const { routineId: param, created } = useLocalSearchParams<{ routineId: string; created?: string }>();
  const routineId = Number(param);
  const exercises = useExercises();
  const { defaultRestS } = useDefaultRest();
  const [addedIds, setAddedIds] = useState<ReadonlySet<number>>(new Set());
  const [picked, setPicked] = useState<LibraryExercise | null>(null);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);

  useEffect(() => {
    loadRoutineExercises(routineId).then((rows) => setAddedIds(new Set(rows.map((r) => r.exerciseId))));
  }, [routineId]);

  // Back from New exercise with the saved exercise: pick it and open its setup, once its row has loaded.
  const createdExercise = useMemo(() => createdPick(exercises, created), [exercises, created]);
  const [handledCreated, setHandledCreated] = useState<string>();
  if (createdExercise && created !== handledCreated) {
    setHandledCreated(created);
    setPicked(createdExercise);
    setOpen(true);
  }
  useEffect(() => {
    if (created && created === handledCreated) router.setParams({ created: undefined });
  }, [created, handledCreated]);

  const rule = useMemo(() => defaultRule(picked?.loadType ?? "weighted"), [picked]);
  // Finished workouts of this exercise in this routine (one removed and added back), for the rule panel's preview.
  const past = useMemo(() => (picked ? pastExercises(db, routineId, picked.id) : []), [picked, routineId]);

  function onSubmit(setup: ExerciseSetup, jumps: Partial<Jumps>, saved?: OverloadRule) {
    // The ref blocks a second tap before state has re-rendered.
    if (!picked || addingRef.current) return;
    addingRef.current = true;
    setAdding(true);
    try {
      // False means the exercise was already in the routine; it is marked added either way.
      addRoutineExercise(routineId, picked.id, picked.loadType, setup, jumps, saved ?? rule);
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
            onCreate={(name) =>
              router.push({ pathname: "/exercise/new", params: newExerciseParams(name, routineId) })
            }
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
        initial={newExerciseSetup(defaultRestS)}
        rule={rule}
        loadType={picked?.loadType ?? "weighted"}
        past={past}
        primaryLabel="Add to routine"
        busy={adding}
        onSubmit={onSubmit}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
}
