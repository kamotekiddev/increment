import { discardWorkoutText, resumePromptText } from "./workoutPromptText";

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
