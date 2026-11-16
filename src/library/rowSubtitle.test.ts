import { rowSubtitle } from "./rowSubtitle";

describe("rowSubtitle", () => {
  it("joins the first muscle and the equipment", () => {
    expect(rowSubtitle({ muscles: ["Chest", "Triceps"], equipment: "Barbell" })).toBe("Chest · Barbell");
  });

  it("shows only the equipment when no muscle is listed", () => {
    expect(rowSubtitle({ muscles: [], equipment: "Cable" })).toBe("Cable");
  });
});
