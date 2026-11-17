import { discardWorkoutText, finishPrompt, resumePromptText } from "./workoutPromptText";

describe("finishPrompt", () => {
  const names = ["Bench press", "Row", "Curl"];
  it("needs no prompt when everything is done", () => {
    expect(finishPrompt({ uncheckedSets: 0, skippedExercises: [], noSetsDone: false }, names)).toBeNull();
  });
  it("counts unchecked sets", () => {
    expect(finishPrompt({ uncheckedSets: 3, skippedExercises: [], noSetsDone: false }, names)).toEqual({
      kind: "finish",
      title: "Finish workout?",
      body: "3 sets aren't done. They will be dropped.",
      confirm: "Finish workout",
      cancel: "Keep training",
    });
  });
  it("uses the singular for one set", () => {
    expect(finishPrompt({ uncheckedSets: 1, skippedExercises: [], noSetsDone: false }, names)?.body).toBe(
      "1 set isn't done. It will be dropped.",
    );
  });
  it("names skipped exercises and says they are not a miss", () => {
    expect(finishPrompt({ uncheckedSets: 0, skippedExercises: [1, 2], noSetsDone: false }, names)?.body).toBe(
      "Row and Curl have no sets done. They will be left out, and it is not a miss.",
    );
    expect(finishPrompt({ uncheckedSets: 0, skippedExercises: [1], noSetsDone: false }, names)?.body).toBe(
      "Row has no sets done. It will be left out, and it is not a miss.",
    );
  });
  it("joins three or more names with commas", () => {
    expect(finishPrompt({ uncheckedSets: 0, skippedExercises: [0, 1, 2], noSetsDone: false }, names)?.body).toBe(
      "Bench press, Row and Curl have no sets done. They will be left out, and it is not a miss.",
    );
  });
  it("combines both lines", () => {
    expect(finishPrompt({ uncheckedSets: 2, skippedExercises: [2], noSetsDone: false }, names)?.body).toBe(
      "2 sets aren't done. They will be dropped.\nCurl has no sets done. It will be left out, and it is not a miss.",
    );
  });
  it("offers Discard when no set is done", () => {
    expect(finishPrompt({ uncheckedSets: 0, skippedExercises: [0, 1, 2], noSetsDone: true }, names)).toEqual({
      kind: "discard",
      title: "No sets done. Discard this workout?",
      body: "Nothing is saved when no set is done.",
      confirm: "Discard workout",
      cancel: "Keep training",
    });
  });
});

describe("resumePromptText", () => {
  it("names both routines", () => {
    expect(resumePromptText("Push day A", "Pull day A")).toEqual({
      title: "Push day A is still in progress",
      body: "Only one workout can run at a time. Resume it, or discard it to start Pull day A.",
      resume: "Resume Push day A",
      discard: "Discard it and start Pull day A",
    });
  });
  it("falls back to a generic name when the routine is unknown", () => {
    expect(resumePromptText(null, "Pull day A").title).toBe("Your workout is still in progress");
  });
});

describe("discardWorkoutText", () => {
  it("names the routine", () => {
    expect(discardWorkoutText("Push day A")).toEqual({
      title: "Discard this workout?",
      body: "Everything you logged in Push day A today will be deleted. This can't be undone.",
    });
  });
  it("works without a routine name", () => {
    expect(discardWorkoutText(null).body).toBe("Everything you logged today will be deleted. This can't be undone.");
  });
});
