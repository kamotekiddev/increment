import type { LoadType } from "@/engine";

import { loadTypeForEquipment } from "./customExerciseEquipment";
import { cleanSteps } from "./exerciseSteps";
import { groupToMuscle, muscleGroupsOf, type MuscleGroup } from "./muscleGroups";

/** What the New exercise form holds. `group` and `equipment` are null until a chip is picked. */
export interface ExerciseDraft {
  name: string;
  group: MuscleGroup | null;
  equipment: string | null;
  steps: string[];
}

export interface CustomExerciseRow {
  slug: null;
  isCustom: true;
  name: string;
  muscles: string[];
  equipment: string;
  loadType: LoadType;
  instructions: string[];
}

/** Pure: the Edit form's starting values from a stored custom exercise. */
export function draftFromExercise(exercise: {
  name: string;
  muscles: readonly string[];
  equipment: string;
  instructions: readonly string[];
}): ExerciseDraft {
  return {
    name: exercise.name,
    group: muscleGroupsOf(exercise.muscles)[0] ?? null,
    equipment: exercise.equipment,
    steps: [...exercise.instructions],
  };
}

/** Pure: whether the form may be saved: a valid name, a muscle and equipment picked. */
export function canSubmit(draft: ExerciseDraft, nameOk: boolean): boolean {
  return nameOk && draft.group !== null && draft.equipment !== null;
}

/** Pure: the row to insert. Call only when `canSubmit` holds. */
export function newExerciseRow(draft: ExerciseDraft): CustomExerciseRow {
  if (draft.group === null || draft.equipment === null) throw new Error("Pick a muscle and equipment first.");
  return {
    slug: null,
    isCustom: true,
    name: draft.name.trim(),
    muscles: [groupToMuscle(draft.group)],
    equipment: draft.equipment,
    loadType: loadTypeForEquipment(draft.equipment),
    instructions: cleanSteps(draft.steps),
  };
}
