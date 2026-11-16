export const SETUP_LIMITS = {
  setsMin: 1,
  setsMax: 10,
  repsMin: 1,
  repsMax: 30,
  restMinS: 15,
  restMaxS: 600,
  restStepS: 15,
} as const;

/** What a Routine exercise gets when first added. */
export const DEFAULT_SETUP = { sets: 3, repMin: 8, repMax: 12, restS: 90 } as const;

/** The per-exercise numbers a lifter sets for a Routine exercise. */
export type ExerciseSetup = { sets: number; repMin: number; repMax: number; restS: number };

const clamp =(value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function clampSets(sets: number): number {
  return clamp(sets, SETUP_LIMITS.setsMin, SETUP_LIMITS.setsMax);
}

/** Rep min stays within 1 to 30 and never above the current rep max. */
export function clampRepMin(repMin: number, repMax: number): number {
  return clamp(repMin, SETUP_LIMITS.repsMin, Math.min(repMax, SETUP_LIMITS.repsMax));
}

/** Rep max stays at least the current rep min and at most 30. */
export function clampRepMax(repMax: number, repMin: number): number {
  return clamp(repMax, Math.max(repMin, SETUP_LIMITS.repsMin), SETUP_LIMITS.repsMax);
}

/** Rest snaps to the nearest 15 s step within 15 to 600 s. */
export function clampRest(restS: number): number {
  const snapped = Math.round(restS / SETUP_LIMITS.restStepS) * SETUP_LIMITS.restStepS;
  return clamp(snapped, SETUP_LIMITS.restMinS, SETUP_LIMITS.restMaxS);
}
