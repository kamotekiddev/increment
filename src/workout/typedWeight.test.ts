import type { Unit } from "@/units";

import { weightText } from "./typedWeight";

describe("weightText", () => {
  it("is blank for a blank weight", () => {
    expect(weightText({ weight: null, unit: "kg" }, "kg")).toBe("");
  });

  it("shows a weight saved in the unit on screen exactly", () => {
    expect(weightText({ weight: 62.5, unit: "kg" }, "kg")).toBe("62.5");
    expect(weightText({ weight: 135, unit: "lb" }, "lb")).toBe("135");
    expect(weightText({ weight: 61.25, unit: "kg" }, "kg")).toBe("61.25");
  });

  it("converts a weight saved in the other unit, to 0.01", () => {
    expect(weightText({ weight: 62.5, unit: "kg" }, "lb")).toBe("137.79");
    expect(weightText({ weight: 135, unit: "lb" }, "kg")).toBe("61.23");
  });

  it("a flip lb, kg, lb leaves the saved weight identical", () => {
    // Nothing is parsed back from the text, so the saved number never moves.
    const saved = { weight: 62.5, unit: "kg" as Unit };
    const shown = (["lb", "kg", "lb"] as Unit[]).map((u) => weightText(saved, u));
    expect(shown).toEqual(["137.79", "62.5", "137.79"]);
    expect(saved).toEqual({ weight: 62.5, unit: "kg" });
  });
});
