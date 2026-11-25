import { saveButtonKind } from "./customExerciseGate";

describe("saveButtonKind", () => {
  it("shows Save for Pro and Unlock Pro for everyone else", () => {
    expect(saveButtonKind(true)).toBe("save");
    expect(saveButtonKind(false)).toBe("unlock");
  });
});
