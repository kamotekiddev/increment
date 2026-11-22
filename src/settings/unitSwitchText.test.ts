import { DEFAULT_JUMP, jumpKgFor, loadableIn } from "@/units";

import { unitSwitchText } from "./unitSwitchText";

describe("unitSwitchText", () => {
  it("kg to lb", () => {
    expect(unitSwitchText("kg", "lb", false)).toEqual({
      title: "Switch to pounds?",
      body: "Weights you're about to lift show in lb, rounded down to each exercise's lb step (62.5 kg becomes 135 lb). Sets you logged stay exactly as you typed them. You can switch back any time.",
      confirm: "Switch to pounds",
      cancel: "Cancel",
    });
  });
  it("lb to kg", () => {
    expect(unitSwitchText("lb", "kg", false)).toEqual({
      title: "Switch to kilograms?",
      body: "Weights you're about to lift show in kg, rounded down to each exercise's kg step (135 lb becomes 60 kg). Sets you logged stay exactly as you typed them. You can switch back any time.",
      confirm: "Switch to kilograms",
      cancel: "Cancel",
    });
  });
  it("adds the workout sentence last when a workout is in progress", () => {
    expect(unitSwitchText("kg", "lb", true).body.endsWith(" In your workout, sets you haven't typed or checked switch to lb too.")).toBe(true);
    expect(unitSwitchText("lb", "kg", true).body.endsWith(" In your workout, sets you haven't typed or checked switch to kg too.")).toBe(true);
  });
  it("uses example numbers that src/units really gives with the default steps", () => {
    expect(DEFAULT_JUMP).toEqual({ kg: 2.5, lb: 5 });
    expect(loadableIn({ value: 62.5, unit: "kg" }, "lb", jumpKgFor(null, "lb"))).toBe(135);
    expect(loadableIn({ value: 135, unit: "lb" }, "kg", jumpKgFor(null, "kg"))).toBe(60);
  });
});
