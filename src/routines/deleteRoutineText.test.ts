import { deleteRoutineText } from "./deleteRoutineText";

describe("deleteRoutineText", () => {
  it("names the workouts that go with the routine", () => {
    expect(deleteRoutineText("Push", 12)).toEqual({
      title: "Delete Push?",
      body: "Its 12 logged workouts will be deleted too. This can't be undone.",
    });
  });

  it("uses the singular for one workout", () => {
    expect(deleteRoutineText("Push", 1).body).toBe("Its 1 logged workout will be deleted too. This can't be undone.");
  });

  it("only warns it can't be undone when there are no workouts", () => {
    expect(deleteRoutineText("Pull", 0)).toEqual({ title: "Delete Pull?", body: "This can't be undone." });
  });
});
