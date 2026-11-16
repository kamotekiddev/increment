export interface InProgressWorkout {
  id: number;
  routineName: string | null;
}

export type StartDecision = { kind: "start" } | { kind: "prompt"; workoutId: number; routineName: string | null };

/** Pure: what Start does. Only one workout can be in progress, so an existing one always prompts. */
export function startDecision(inProgress: InProgressWorkout | null): StartDecision {
  if (!inProgress) return { kind: "start" };
  return { kind: "prompt", workoutId: inProgress.id, routineName: inProgress.routineName };
}
