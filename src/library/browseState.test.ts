import { emptyMessage, hasActiveFilters, toggleChip } from "./browseState";

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

describe("hasActiveFilters", () => {
  it("is false with nothing set or only spaces typed", () => {
    expect(
      hasActiveFilters({ search: "  ", muscle: null, equipment: null }),
    ).toBe(false);
  });
  it("is true when any of search, muscle or equipment is set", () => {
    expect(
      hasActiveFilters({ search: "bench", muscle: null, equipment: null }),
    ).toBe(true);
    expect(
      hasActiveFilters({ search: "", muscle: "Chest", equipment: null }),
    ).toBe(true);
    expect(
      hasActiveFilters({ search: "", muscle: null, equipment: "Dumbbell" }),
    ).toBe(true);
  });
});

describe("emptyMessage", () => {
  it("names the search text, trimmed", () => {
    expect(
      emptyMessage({ search: " benhc ", muscle: null, equipment: null }),
    ).toBe('No exercises match "benhc".');
  });
  it("names the chips when there is no search text", () => {
    expect(
      emptyMessage({ search: "", muscle: "Triceps", equipment: "Dumbbell" }),
    ).toBe("No exercises match Triceps, Dumbbell.");
  });
  it("names search and chips together", () => {
    expect(
      emptyMessage({ search: "press", muscle: "Triceps", equipment: null }),
    ).toBe('No exercises match "press", Triceps.');
  });
});
