import type { ExerciseDeleteInfo } from "./deleteCustomExercise";

export interface DeleteExerciseText {
  title: string;
  /** Names the routines it leaves, or says it is in none; or, when blocked, why Delete is disabled. */
  body: string;
  /** The red box about the history; null when blocked. */
  warning: string | null;
  blocked: boolean;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Pure: the Delete exercise sheet's text (ADR 0005). */
export function deleteExerciseText(name: string, info: ExerciseDeleteInfo): DeleteExerciseText {
  const title = `Delete ${name}?`;
  if (info.inProgress) {
    return { title, body: `${name} is in your workout in progress. Finish or discard it first.`, warning: null, blocked: true };
  }
  const body = info.routineNames.length === 0 ? "It isn't in any routine." : `It will be removed from ${joinNames(info.routineNames)}.`;
  const noun = info.workoutCount === 1 ? "workout" : "workouts";
  const warning =
    info.workoutCount === 0
      ? "It has no workout history. This can't be recovered."
      : `Its history, ${info.workoutCount} ${noun}, is deleted for good. This can't be recovered.`;
  return { title, body, warning, blocked: false };
}
