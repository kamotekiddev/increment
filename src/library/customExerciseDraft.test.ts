import { canSubmit, draftFromExercise, newExerciseRow, type ExerciseDraft } from "./customExerciseDraft";

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

describe("draftFromExercise", () => {
  it("fills the form from a stored custom exercise", () => {
    expect(
      draftFromExercise({ name: "Landmine press", muscles: ["shoulders"], equipment: "barbell", instructions: ["Press up"] }),
    ).toEqual({ name: "Landmine press", group: "Shoulders", equipment: "barbell", steps: ["Press up"] });
  });

  it("leaves the muscle empty when none is stored", () => {
    expect(draftFromExercise({ name: "X", muscles: [], equipment: "other", instructions: [] }).group).toBeNull();
  });

  it("round-trips through newExerciseRow", () => {
    const stored = { name: "Ring rows", muscles: ["back"], equipment: "bodyweight", instructions: ["Hang"] };
    const row = newExerciseRow(draftFromExercise(stored));
    expect(row).toMatchObject({ ...stored, loadType: "bodyweight" });
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
