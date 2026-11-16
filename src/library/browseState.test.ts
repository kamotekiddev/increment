import { emptyMessage, toggleChip } from "./browseState";

describe("toggleChip", () => {
  it("selects a chip when none is active", () => {
    expect(toggleChip(null, "Arms")).toBe("Arms");
  });

  it("replaces the active chip when another is tapped", () => {
    expect(toggleChip("Arms", "Chest")).toBe("Chest");
  });

  it("clears the chip when the active one is tapped again", () => {
    expect(toggleChip("Arms", "Arms")).toBeNull();
  });
});

describe("emptyMessage", () => {
  it("names the search text, trimmed", () => {
    expect(emptyMessage({ search: " benhc ", group: null })).toBe('No exercises match "benhc".');
  });

  it("names a group on its own", () => {
    expect(emptyMessage({ search: "", group: "Arms" })).toBe("No exercises match Arms.");
  });

  it("puts the group after the search text with 'with'", () => {
    expect(emptyMessage({ search: "press", group: "Arms" })).toBe('No exercises match "press" with Arms.');
  });
});
