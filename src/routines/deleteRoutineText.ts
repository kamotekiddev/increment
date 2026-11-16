/** Pure: the Delete routine confirmation. Names how many workouts go with the routine (ADR 0002). */
export function deleteRoutineText(name: string, workoutCount: number): { title: string; body: string } {
  const title = `Delete ${name}?`;
  if (workoutCount <= 0) return { title, body: "This can't be undone." };
  const noun = workoutCount === 1 ? "workout" : "workouts";
  return { title, body: `Its ${workoutCount} logged ${noun} will be deleted too. This can't be undone.` };
}
