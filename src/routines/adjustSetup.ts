import { clampRepMax, clampRepMin, clampRest, clampSets, SETUP_LIMITS, type ExerciseSetup } from "./routineSetup";

export type SetupField = keyof ExerciseSetup;

/** Pure: one stepper tap (direction +1 or -1), clamped to the setup limits. */
export function adjustSetup(setup: ExerciseSetup, field: SetupField, direction: 1 | -1): ExerciseSetup {
  switch (field) {
    case "sets":
      return { ...setup, sets: clampSets(setup.sets + direction) };
    case "repMin":
      return { ...setup, repMin: clampRepMin(setup.repMin + direction, setup.repMax) };
    case "repMax":
      return { ...setup, repMax: clampRepMax(setup.repMax + direction, setup.repMin) };
    case "restS":
      return { ...setup, restS: clampRest(setup.restS + direction * SETUP_LIMITS.restStepS) };
  }
}

/** Pure: false when the stepper is already at its limit in that direction. */
export function canAdjust(setup: ExerciseSetup, field: SetupField, direction: 1 | -1): boolean {
  return adjustSetup(setup, field, direction)[field] !== setup[field];
}
