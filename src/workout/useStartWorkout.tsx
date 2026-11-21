import { router } from "expo-router";
import { useState } from "react";

import { useUnit } from "@/settings";

import { findInProgressWorkout } from "./inProgressQueries";
import { ResumeOrDiscardSheet } from "./ResumeOrDiscardSheet";
import { startDecision } from "./startDecision";
import { discardAndStartWorkout, startWorkout } from "./workoutQueries";

/** Opens the live workout screen for a Workout id (no-op when the id is null). */
export function openWorkout(workoutId: number | null) {
  if (workoutId !== null) router.push({ pathname: "/workout/[id]", params: { id: String(workoutId) } });
}

/**
 * The shared Start rule: starts the Routine and opens the live workout, or asks Resume or Discard
 * when a Workout is already in progress. Render `sheet` once in the screen.
 */
export function useStartWorkout() {
  const [prompt, setPrompt] = useState<{
    workoutId: number;
    runningName: string | null;
    routineId: number;
    startingName: string;
  } | null>(null);
  const { unit } = useUnit();

  function start(routineId: number, routineName: string) {
    const decision = startDecision(findInProgressWorkout());
    if (decision.kind === "start") openWorkout(startWorkout(routineId, unit));
    else setPrompt({ workoutId: decision.workoutId, runningName: decision.routineName, routineId, startingName: routineName });
  }

  const sheet = (
    <ResumeOrDiscardSheet
      visible={prompt !== null}
      runningName={prompt?.runningName ?? null}
      startingName={prompt?.startingName ?? ""}
      onResume={() => {
        if (!prompt) return;
        setPrompt(null);
        openWorkout(prompt.workoutId);
      }}
      onDiscardAndStart={() => {
        if (!prompt) return;
        setPrompt(null);
        openWorkout(discardAndStartWorkout(prompt.workoutId, prompt.routineId, unit));
      }}
      onDismiss={() => setPrompt(null)}
    />
  );

  return { start, sheet };
}
