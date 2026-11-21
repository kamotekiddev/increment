/** What a Workout is called: its Routine's current name, or `Workout` when it has no Routine. */
export function routineLabel(routineName: string | null | undefined): string {
  return routineName ?? "Workout";
}
