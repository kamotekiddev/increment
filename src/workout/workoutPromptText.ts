/** Pure: copy for the Resume or Discard prompt shown when Start finds a workout in progress. */
export function resumePromptText(
  runningName: string | null,
  startingName: string,
): { title: string; body: string; resume: string; discard: string } {
  return {
    title: runningName ? `${runningName} is still in progress` : "Your workout is still in progress",
    body: `Only one workout can run at a time. Resume it, or discard it to start ${startingName}.`,
    resume: runningName ? `Resume ${runningName}` : "Resume workout",
    discard: `Discard it and start ${startingName}`,
  };
}

/** Pure: copy for the Discard workout confirmation. */
export function discardWorkoutText(routineName: string | null): { title: string; body: string } {
  return {
    title: "Discard this workout?",
    body: `Everything you logged${routineName ? ` in ${routineName}` : ""} today will be deleted. This can't be undone.`,
  };
}
