import { defaultRule } from "../engine";
import { describeRule } from "./describeRule";

describe("describeRule", () => {
  it("says weight for a weighted exercise's default rule", () => {
    expect(describeRule(defaultRule("weighted"))).toBe("Adds weight after 3 clean workouts");
  });

  it("says reps for a bodyweight exercise's default rule", () => {
    expect(describeRule(defaultRule("bodyweight"))).toBe("Adds reps after 3 clean workouts");
  });

  it("follows the number of clean workouts", () => {
    expect(describeRule({ ...defaultRule("weighted"), sessionsToEarn: 1 })).toBe(
      "Adds weight after 1 clean workout",
    );
    expect(describeRule({ ...defaultRule("weighted"), sessionsToEarn: 5 })).toBe(
      "Adds weight after 5 clean workouts",
    );
  });
});
