/** Pure: the Remove from routine confirmation. Logged workouts are never touched. */
export function removeExerciseText(exerciseName: string, routineName: string): { title: string; body: string } {
  return {
    title: `Remove ${exerciseName}?`,
    body: `It is taken out of ${routineName}. Your logged workouts keep it.`,
  };
}
