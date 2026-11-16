/** The muted "Muscle · Equipment" line under an exercise name, using the first listed muscle. */
export function rowSubtitle(exercise: { muscles: string[]; equipment: string }): string {
  return [exercise.muscles[0], exercise.equipment].filter(Boolean).join(" · ");
}
