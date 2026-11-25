import { afterSaveTarget, createdPick, newExerciseParams } from "./createFlow";

describe("newExerciseParams", () => {
  it("pre-fills the trimmed search text", () => {
    expect(newExerciseParams("  landmine ")).toEqual({ name: "landmine" });
  });

  it("carries the routine id from the picker", () => {
    expect(newExerciseParams("landmine", 7)).toEqual({ name: "landmine", routineId: "7" });
  });
});

describe("afterSaveTarget", () => {
  it("goes back to the Library, which shows the new exercise on focus", () => {
    expect(afterSaveTarget(undefined, 12)).toEqual({ kind: "back" });
    expect(afterSaveTarget("", 12)).toEqual({ kind: "back" });
  });

  it("returns to the routine's picker with the new exercise to pick", () => {
    expect(afterSaveTarget("7", 12)).toEqual({
      kind: "picker",
      params: { routineId: "7", created: "12" },
    });
  });

  it("ignores a routine id that is not a number", () => {
    expect(afterSaveTarget("abc", 12)).toEqual({ kind: "back" });
  });
});

describe("createdPick", () => {
  const list = [{ id: 1 }, { id: 12 }];

  it("finds the created exercise in the loaded list", () => {
    expect(createdPick(list, "12")).toEqual({ id: 12 });
  });

  it("waits while the list has not loaded the new row yet", () => {
    expect(createdPick([{ id: 1 }], "12")).toBeNull();
  });

  it("does nothing without a created param or with a bad one", () => {
    expect(createdPick(list, undefined)).toBeNull();
    expect(createdPick(list, "")).toBeNull();
    expect(createdPick(list, "x")).toBeNull();
  });
});
