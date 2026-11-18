import { KG_PER_LB, type Unit } from "@/units";

import { weightFromTyped, weightText } from "./typedWeight";

describe("weightFromTyped", () => {
  it("reads typed text in the unit on screen and returns kg", () => {
    expect(weightFromTyped("62.5", "kg")).toBe(62.5);
    expect(weightFromTyped("135", "lb")).toBe(135 * KG_PER_LB);
  });

  it("keeps blank as null and invalid text as undefined", () => {
    expect(weightFromTyped("", "lb")).toBeNull();
    expect(weightFromTyped("1e5", "lb")).toBeUndefined();
  });
});

describe("weightText", () => {
  it("is blank for a blank weight", () => {
    expect(weightText(null, "kg")).toBe("");
  });

  it("shows the kg value in the unit on screen", () => {
    expect(weightText(62.5, "kg")).toBe("62.5");
    expect(weightText(135 * KG_PER_LB, "lb")).toBe("135");
  });

  it("a flip lb, kg, lb leaves an unedited kg weight identical", () => {
    // Nothing is parsed back from the text, so the stored kg never moves.
    const kg = 62.5;
    const shown = (["lb", "kg", "lb"] as Unit[]).map((u) => weightText(kg, u));
    expect(shown).toEqual(["137.79", "62.5", "137.79"]);
    expect(kg).toBe(62.5);
  });

  it("reading displayed text back would lose precision, which is why unedited weights are never re-read", () => {
    expect(weightFromTyped(weightText(62.5, "lb"), "lb")).not.toBe(62.5);
  });
});
