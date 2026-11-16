import { DAY_LABELS, daysLabel, isDaySet, toggleDay } from "./routineDays";

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

  it("labels days in week order", () => {
    expect(daysLabel(0b0001001)).toBe("Mon · Thu");
    expect(daysLabel(0b1000000)).toBe("Sun");
    expect(daysLabel(0b1111111)).toBe("Mon · Tue · Wed · Thu · Fri · Sat · Sun");
  });

  it("reads No days when none is set", () => {
    expect(daysLabel(0)).toBe("No days");
  });
});
