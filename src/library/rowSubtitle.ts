import { muscleGroupsOf } from "./muscleGroups";

/** The muted line under an exercise name: every muscle group it works, e.g. "Chest · Shoulders · Arms". */
export function rowSubtitle(exercise: { muscles: string[] }): string {
  return muscleGroupsOf(exercise.muscles).join(" · ");
}
