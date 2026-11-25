import { deleteExerciseText } from "./deleteExerciseText";

describe("deleteExerciseText", () => {
  it("names the routines it leaves and warns about the history with the workout count", () => {
    expect(deleteExerciseText("Landmine press", { routineNames: ["Push day A", "Pull day B"], workoutCount: 6, inProgress: false })).toEqual({
      title: "Delete Landmine press?",
      body: "It will be removed from Push day A and Pull day B.",
      warning: "Its sets in 6 workouts are deleted for good. This can't be recovered.",
      blocked: false,
    });
  });

  it("joins three or more routines with commas and 'and'", () => {
    expect(deleteExerciseText("X", { routineNames: ["A", "B", "C"], workoutCount: 1, inProgress: false })).toMatchObject({
      body: "It will be removed from A, B and C.",
      warning: "Its sets in 1 workout are deleted for good. This can't be recovered.",
    });
  });

  it("says it isn't in any routine, and that there is no history when there are no workouts", () => {
    expect(deleteExerciseText("X", { routineNames: [], workoutCount: 0, inProgress: false })).toMatchObject({
      body: "It isn't in any routine.",
      warning: "It has no workout history. This can't be recovered.",
    });
  });

  it("is blocked while in the Workout in progress, with the block message as the body and no warning", () => {
    expect(deleteExerciseText("Landmine press", { routineNames: ["A"], workoutCount: 2, inProgress: true })).toEqual({
      title: "Delete Landmine press?",
      body: "Landmine press is in your workout in progress. Finish or discard it first.",
      warning: null,
      blocked: true,
    });
  });
});
