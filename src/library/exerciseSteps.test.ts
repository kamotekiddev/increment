import { addStep, cleanSteps, MAX_STEPS, MAX_STEP_LENGTH, removeStep, setStep } from "./exerciseSteps";

describe("step list", () => {
  it("adds an empty box and reports its index", () => {
    expect(addStep([])).toEqual({ steps: [""], index: 0 });
    expect(addStep(["a"])).toEqual({ steps: ["a", ""], index: 1 });
  });

  it("stops adding at 10 steps", () => {
    const full = Array.from({ length: MAX_STEPS }, (_, i) => `s${i}`);
    expect(addStep(full)).toEqual({ steps: full, index: null });
  });

  it("removes one box", () => {
    expect(removeStep(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });

  it("sets a step, cutting it to 200 characters", () => {
    expect(setStep(["a", "b"], 1, "x")).toEqual(["a", "x"]);
    expect(setStep(["a"], 0, "y".repeat(MAX_STEP_LENGTH + 5))[0]).toHaveLength(MAX_STEP_LENGTH);
  });

  it("on save trims steps and ignores empty ones", () => {
    expect(cleanSteps([" Press ", "", "   ", "Lock out"])).toEqual(["Press", "Lock out"]);
    expect(cleanSteps([])).toEqual([]);
  });
});
