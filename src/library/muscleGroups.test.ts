import exercises from "@/db/library/exercises.json";

import { capitalise, MUSCLE_GROUPS, muscleGroupsOf } from "./muscleGroups";

describe("MUSCLE_GROUPS", () => {
  it("lists the six groups A-Z", () => {
    expect(MUSCLE_GROUPS).toEqual(["Arms", "Back", "Chest", "Core", "Legs", "Shoulders"]);
  });
});

describe("muscleGroupsOf", () => {
  it("maps each library muscle to its broad group", () => {
    expect(muscleGroupsOf(["chest"])).toEqual(["Chest"]);
    expect(muscleGroupsOf(["lats"])).toEqual(["Back"]);
    expect(muscleGroupsOf(["middle back"])).toEqual(["Back"]);
    expect(muscleGroupsOf(["lower back"])).toEqual(["Back"]);
    expect(muscleGroupsOf(["traps"])).toEqual(["Back"]);
    expect(muscleGroupsOf(["shoulders"])).toEqual(["Shoulders"]);
    expect(muscleGroupsOf(["biceps"])).toEqual(["Arms"]);
    expect(muscleGroupsOf(["triceps"])).toEqual(["Arms"]);
    expect(muscleGroupsOf(["forearms"])).toEqual(["Arms"]);
    for (const m of ["quadriceps", "hamstrings", "glutes", "calves", "adductors", "abductors"]) {
      expect(muscleGroupsOf([m])).toEqual(["Legs"]);
    }
    expect(muscleGroupsOf(["abdominals"])).toEqual(["Core"]);
  });

  it("lists each group once, in the order its muscles appear", () => {
    expect(muscleGroupsOf(["chest", "shoulders", "triceps"])).toEqual(["Chest", "Shoulders", "Arms"]);
    expect(muscleGroupsOf(["biceps", "lats", "forearms"])).toEqual(["Arms", "Back"]);
  });

  it("returns nothing for no muscles", () => {
    expect(muscleGroupsOf([])).toEqual([]);
  });

  it("covers every muscle in the shipped library", () => {
    const muscles = new Set(exercises.flatMap((exercise) => exercise.muscles));
    const unmapped = [...muscles].filter((muscle) => muscleGroupsOf([muscle]).length === 0);
    expect(unmapped).toEqual([]);
  });
});

describe("capitalise", () => {
  it("upper-cases the first letter of each word", () => {
    expect(capitalise("ez bar")).toBe("Ez Bar");
    expect(capitalise("chest")).toBe("Chest");
  });
});
