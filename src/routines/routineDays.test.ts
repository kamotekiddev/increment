import { DAY_LABELS, DISPLAY_ORDER, daysLabel, isDaySet, toggleDay } from "./routineDays";

describe("routineDays", () => {
  it("has Monday as bit 0 through Sunday as bit 6", () => {
    expect(DAY_LABELS).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(isDaySet(0b0000001, 0)).toBe(true);
    expect(isDaySet(0b1000000, 6)).toBe(true);
    expect(isDaySet(0b0000001, 1)).toBe(false);
  });

  it("toggles a day on and off without touching the others", () => {
    expect(toggleDay(0, 3)).toBe(0b0001000);
    expect(toggleDay(0b0001001, 3)).toBe(0b0000001);
    expect(toggleDay(0b0001001, 6)).toBe(0b1001001);
  });

  it("shows the week starting on Sunday without changing the stored bits", () => {
    expect(DISPLAY_ORDER.map((i) => DAY_LABELS[i])).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(DISPLAY_ORDER).toHaveLength(7);
  });

  it("labels days with Sunday first", () => {
    expect(daysLabel(0b0001001)).toBe("Mon · Thu");
    expect(daysLabel(0b1000000)).toBe("Sun");
    expect(daysLabel(0b1000001)).toBe("Sun · Mon");
    expect(daysLabel(0b1111111)).toBe("Sun · Mon · Tue · Wed · Thu · Fri · Sat");
  });

  it("reads No days when none is set", () => {
    expect(daysLabel(0)).toBe("No days");
  });
});
