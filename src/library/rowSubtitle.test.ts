import { rowSubtitle } from "./rowSubtitle";

describe("rowSubtitle", () => {
  it("lists each group once in muscle order", () => {
    expect(rowSubtitle({ muscles: ["chest", "shoulders", "triceps"] })).toBe("Chest · Shoulders · Arms");
    expect(rowSubtitle({ muscles: ["biceps", "forearms"] })).toBe("Arms");
  });

  it("reads a single group for a squat", () => {
    expect(rowSubtitle({ muscles: ["quadriceps", "glutes", "hamstrings"] })).toBe("Legs");
  });

  it("is empty when no muscle is listed", () => {
    expect(rowSubtitle({ muscles: [] })).toBe("");
  });
});
