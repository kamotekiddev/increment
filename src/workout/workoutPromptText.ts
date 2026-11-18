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

export interface FinishPrompt {
  /** "finish" saves the workout; "discard" is offered instead when no set is done. */
  kind: "finish" | "discard";
  title: string;
  body: string;
  confirm: string;
  cancel: string;
}

function joinNames(names: string[]): string {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Pure: copy for the Finish prompt, from the finish check. Null when nothing needs confirming. `names` is in workout order. */
export function finishPrompt(
  check: { uncheckedSets: number; skippedExercises: number[]; noSetsDone: boolean },
  names: string[],
): FinishPrompt | null {
  if (check.noSetsDone) {
    return {
      kind: "discard",
      title: "No sets done. Discard this workout?",
      body: "Nothing is saved when no set is done.",
      confirm: "Discard workout",
      cancel: "Keep training",
    };
  }
  const lines: string[] = [];
  const n = check.uncheckedSets;
  if (n > 0) lines.push(n === 1 ? "1 set isn't done. It will be dropped." : `${n} sets aren't done. They will be dropped.`);
  const skipped = check.skippedExercises.map((i) => names[i]);
  if (skipped.length > 0) {
    lines.push(
      skipped.length === 1
        ? `${skipped[0]} has no sets done. It will be left out, and it is not a miss.`
        : `${joinNames(skipped)} have no sets done. They will be left out, and it is not a miss.`,
    );
  }
  if (lines.length === 0) return null;
  return { kind: "finish", title: "Finish this workout?", body: lines.join("\n"), confirm: "Finish workout", cancel: "Keep training" };
}

/** Pure: copy for the sheet offered when the last open set of the Workout is checked. */
export function allDonePrompt(): FinishPrompt {
  return {
    kind: "finish",
    title: "All sets done",
    body: "Finish this workout and see how it went?",
    confirm: "Finish workout",
    cancel: "Not yet",
  };
}

/** Pure: copy for the Discard workout confirmation. */
export function discardWorkoutText(routineName: string | null): { title: string; body: string } {
  return {
    title: "Discard this workout?",
    body: `Everything you logged${routineName ? ` in ${routineName}` : ""} today will be deleted. This can't be undone.`,
  };
}
