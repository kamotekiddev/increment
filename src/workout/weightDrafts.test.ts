import type { Unit } from "@/units";

import { clearDraft, EMPTY_DRAFTS, typeDraft, weightFieldText } from "./weightDrafts";

const row = (setId: number, weight: number | null, unit: Unit = "kg") => ({ setId, weight, unit });

describe("weight drafts", () => {
  it("shows an unedited weight exactly in its own unit, converted in the other", () => {
    expect(weightFieldText(EMPTY_DRAFTS, row(1, 62.5), "kg")).toBe("62.5");
    expect(weightFieldText(EMPTY_DRAFTS, row(1, 62.5), "lb")).toBe("137.79");
    expect(weightFieldText(EMPTY_DRAFTS, row(1, 135, "lb"), "lb")).toBe("135");
  });

  it("keeps typed text as typed after an edit, even when display rounding would change it", () => {
    const drafts = typeDraft(EMPTY_DRAFTS, 1, "135.005", "lb");
    expect(weightFieldText(drafts, row(1, 135.005, "lb"), "lb")).toBe("135.005");
    expect(weightFieldText(drafts, row(2, 50), "lb")).toBe("110.23");
  });

  it("keeps a half-typed number", () => {
    const drafts = typeDraft(EMPTY_DRAFTS, 1, "62.", "kg");
    expect(weightFieldText(drafts, row(1, 62), "kg")).toBe("62.");
  });

  it("drops every draft on a unit switch and shows the saved weight, back and forth", () => {
    const drafts = typeDraft(EMPTY_DRAFTS, 1, "135", "lb");
    expect(weightFieldText(drafts, row(1, 135, "lb"), "kg")).toBe("61.23");
    // Back in lb the draft is still gone: the field reads the saved 135 lb, which is exact.
    expect(weightFieldText(drafts, row(1, 135, "lb"), "lb")).toBe("135");
  });

  it("a weight edited after a switch is a new draft in the new unit", () => {
    const stale = typeDraft(EMPTY_DRAFTS, 1, "135", "lb");
    const drafts = typeDraft(stale, 1, "60", "kg");
    expect(weightFieldText(drafts, row(1, 60), "kg")).toBe("60");
    // Another row's older lb draft did not survive the switch.
    const other = typeDraft(stale, 2, "60", "kg");
    expect(weightFieldText(other, row(1, 135, "lb"), "kg")).toBe("61.23");
  });

  it("clears a draft when the set is checked", () => {
    const drafts = clearDraft(typeDraft(EMPTY_DRAFTS, 1, "135.005", "lb"), 1);
    expect(weightFieldText(drafts, row(1, 135.005, "lb"), "lb")).toBe("135.01");
  });

  it("shows blank for a blank draft", () => {
    expect(weightFieldText(typeDraft(EMPTY_DRAFTS, 1, "", "kg"), row(1, null), "kg")).toBe("");
  });
});
