import { removeExerciseText } from "./removeExerciseText";

describe("removeExerciseText", () => {
  it("names the exercise and the routine, and says logged workouts keep it", () => {
    expect(removeExerciseText("Barbell bench press", "Push day A")).toEqual({
      title: "Remove Barbell bench press?",
      body: "It is taken out of Push day A. Your logged workouts keep it.",
    });
  });
});
