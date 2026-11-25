import { canSubmit, newExerciseRow, type ExerciseDraft } from "./customExerciseDraft";

const draft: ExerciseDraft = {
  name: "  Landmine press ",
  group: "Shoulders",
  equipment: "barbell",
  steps: [" One end in a corner ", "", "Press up"],
};

describe("newExerciseRow", () => {
  it("builds a custom row: no slug, lowercase muscle group, weighted load type, clean steps", () => {
    expect(newExerciseRow(draft)).toEqual({
      slug: null,
      isCustom: true,
      name: "Landmine press",
      muscles: ["shoulders"],
      equipment: "barbell",
      loadType: "weighted",
      instructions: ["One end in a corner", "Press up"],
    });
  });

  it("gives Bodyweight equipment the bodyweight load type", () => {
    expect(newExerciseRow({ ...draft, equipment: "bodyweight" }).loadType).toBe("bodyweight");
  });
});

describe("canSubmit", () => {
  it("needs a valid name, a muscle and equipment", () => {
    expect(canSubmit({ ...draft, group: null }, true)).toBe(false);
    expect(canSubmit({ ...draft, equipment: null }, true)).toBe(false);
    expect(canSubmit(draft, false)).toBe(false);
    expect(canSubmit(draft, true)).toBe(true);
  });
});
