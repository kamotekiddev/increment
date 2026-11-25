import {
  createRowLabel,
  createRowName,
  emptyMessage,
  isFiltering,
  NO_FILTERS,
  resultCount,
  routineCountLabel,
  toggleChip,
} from "./browseState";

describe("createRowName / createRowLabel", () => {
  it("offers the trimmed search text", () => {
    expect(createRowName({ search: "  landmine ", group: "Chest" })).toBe("landmine");
    expect(createRowLabel("landmine")).toBe("Create “landmine”");
  });

  it("offers nothing without search text", () => {
    expect(createRowName({ search: "   ", group: "Chest" })).toBeNull();
    expect(createRowName(NO_FILTERS)).toBeNull();
  });
});

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

describe("isFiltering", () => {
  it("is off with no search and no group", () => {
    expect(isFiltering({ search: "", group: null })).toBe(false);
  });

  it("ignores a search of only spaces", () => {
    expect(isFiltering({ search: "   ", group: null })).toBe(false);
  });

  it("is on with search text or a group", () => {
    expect(isFiltering({ search: "press", group: null })).toBe(true);
    expect(isFiltering({ search: "", group: "Legs" })).toBe(true);
  });
});

describe("resultCount", () => {
  it("uses the singular for one", () => {
    expect(resultCount(1)).toBe("1 result");
  });

  it("uses the plural otherwise", () => {
    expect(resultCount(6)).toBe("6 results");
    expect(resultCount(0)).toBe("0 results");
  });
});

describe("routineCountLabel", () => {
  it("uses the singular for one", () => {
    expect(routineCountLabel(1)).toBe("1 routine");
  });

  it("uses the plural otherwise", () => {
    expect(routineCountLabel(2)).toBe("2 routines");
  });
});

describe("emptyMessage", () => {
  it("names the search text, trimmed", () => {
    expect(emptyMessage({ search: " landmine ", group: null })).toBe("No match for “landmine”");
  });

  it("names a group on its own", () => {
    expect(emptyMessage({ search: "", group: "Arms" })).toBe("No match for Arms");
  });

  it("puts the group after the search text with 'with'", () => {
    expect(emptyMessage({ search: "press", group: "Arms" })).toBe("No match for “press” with Arms");
  });
});
