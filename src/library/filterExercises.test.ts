import { filterExercises, getFilterOptions, type ExerciseFilter } from "./filterExercises";

let nextId = 0;
const ex = (name: string, muscles: string[], equipment: string, instructions: string[] = ["Do it."]) => ({
  id: nextId++,
  name,
  muscles,
  equipment,
  instructions,
});

const LIST = [
  ex("Squat", ["Quads", "Glutes"], "barbell", ["Keep your chest up."]),
  ex("Dumbbell Bench Press", ["Chest", "Triceps"], "dumbbell"),
  ex("Barbell Bench Press", ["Chest", "Triceps", "Shoulders"], "barbell"),
  ex("Incline Dumbbell Bench Press", ["Chest", "Shoulders"], "dumbbell"),
  ex("Cable Curl", ["Biceps"], "cable", ["Squeeze the bench of your palm."]),
];

const filter = (set: Partial<ExerciseFilter>): ExerciseFilter => ({
  search: "",
  muscle: null,
  equipment: null,
  ...set,
});
const names = (r: { name: string }[]) => r.map((e) => e.name);

describe("filterExercises", () => {
  it("matches a word in the name", () => {
    expect(names(filterExercises(LIST, filter({ search: "squat" })))).toEqual(["Squat"]);
  });

  it("matches several words in any order, ignoring capitals", () => {
    expect(names(filterExercises(LIST, filter({ search: "BENCH dumbbell" })))).toEqual([
      "Dumbbell Bench Press",
      "Incline Dumbbell Bench Press",
    ]);
  });

  it("does not match words found only in the how-to text", () => {
    expect(filterExercises(LIST, filter({ search: "palm" }))).toEqual([]);
    expect(filterExercises(LIST, filter({ search: "chest" }))).toEqual([]);
  });

  it("matches a muscle listed anywhere", () => {
    expect(names(filterExercises(LIST, filter({ muscle: "Triceps" })))).toEqual([
      "Barbell Bench Press",
      "Dumbbell Bench Press",
    ]);
  });

  it("matches equipment on equal value", () => {
    expect(names(filterExercises(LIST, filter({ equipment: "cable" })))).toEqual(["Cable Curl"]);
  });

  it("combines search, muscle and equipment", () => {
    expect(
      names(filterExercises(LIST, filter({ search: "press", muscle: "Shoulders", equipment: "dumbbell" }))),
    ).toEqual(["Incline Dumbbell Bench Press"]);
  });

  it("returns everything in A-Z order when nothing is set", () => {
    expect(names(filterExercises(LIST, filter({})))).toEqual([
      "Barbell Bench Press",
      "Cable Curl",
      "Dumbbell Bench Press",
      "Incline Dumbbell Bench Press",
      "Squat",
    ]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterExercises(LIST, filter({ search: "zzz" }))).toEqual([]);
  });

  it("ignores extra spaces around and between words", () => {
    expect(names(filterExercises(LIST, filter({ search: "   cable   curl  " })))).toEqual(["Cable Curl"]);
  });

  it("does not change the input list", () => {
    const before = names(LIST);
    filterExercises(LIST, filter({}));
    expect(names(LIST)).toEqual(before);
  });
});

describe("getFilterOptions", () => {
  it("lists the distinct muscles and equipment found in the library, A-Z", () => {
    expect(getFilterOptions(LIST)).toEqual({
      muscles: ["Biceps", "Chest", "Glutes", "Quads", "Shoulders", "Triceps"],
      equipment: ["barbell", "cable", "dumbbell"],
    });
  });

  it("returns empty options for an empty library", () => {
    expect(getFilterOptions([])).toEqual({ muscles: [], equipment: [] });
  });
});
