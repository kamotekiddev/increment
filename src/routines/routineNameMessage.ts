import { ROUTINE_NAME_MAX, type RoutineNameResult } from "./routineName";

type Failure = Extract<RoutineNameResult, { ok: false }>;

/** Pure: the inline message shown under the name field for a rejected name. */
export function routineNameMessage(reason: Failure["reason"]): string {
  switch (reason) {
    case "empty":
      return "Give your routine a name.";
    case "too-long":
      return `Keep the name to ${ROUTINE_NAME_MAX} characters or fewer.`;
    case "duplicate":
      return "You already have a routine with that name.";
  }
}
