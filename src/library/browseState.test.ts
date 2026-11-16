import { emptyMessage, toggleChip } from "./browseState";

describe("toggleChip", () => {
  it("selects a chip when none is active", () => {
    expect(toggleChip(null, "Triceps")).toBe("Triceps");
  });

  it("replaces the active chip when another is tapped", () => {
    expect(toggleChip("Triceps", "Chest")).toBe("Chest");
  });

  it("clears the chip when the active one is tapped again", () => {
    expect(toggleChip("Triceps", "Triceps")).toBeNull();
  });
});

describe("emptyMessage", () => {
  it("names the search text, trimmed", () => {
    expect(emptyMessage({ search: " benhc ", muscle: null, equipment: null })).toBe(
      'No exercises match "benhc".',
    );
  });

  it("names one chip on its own", () => {
    expect(emptyMessage({ search: "", muscle: "Triceps", equipment: null })).toBe(
      "No exercises match Triceps.",
    );
    expect(emptyMessage({ search: "", muscle: null, equipment: "Dumbbell" })).toBe(
      "No exercises match Dumbbell.",
    );
  });

  it("joins two chips with 'and'", () => {
    expect(emptyMessage({ search: "", muscle: "Triceps", equipment: "Dumbbell" })).toBe(
      "No exercises match Triceps and Dumbbell.",
    );
  });

  it("puts the chips after the search text with 'with'", () => {
    expect(emptyMessage({ search: "press", muscle: "Triceps", equipment: null })).toBe(
      'No exercises match "press" with Triceps.',
    );
    expect(emptyMessage({ search: "press", muscle: "Triceps", equipment: "Dumbbell" })).toBe(
      'No exercises match "press" with Triceps and Dumbbell.',
    );
  });
});
