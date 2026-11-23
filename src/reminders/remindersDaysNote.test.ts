import { remindersDaysNote } from "./remindersDaysNote";

const MON = 1, TUE = 2, THU = 8, FRI = 16, SUN = 64;
const r = (days: number) => ({ name: "X", days, exerciseCount: 1 });

describe("remindersDaysNote", () => {
  it("lists the planned days Sunday first", () => {
    expect(remindersDaysNote([r(MON | THU), r(TUE | FRI)])).toBe("Mon, Tue, Thu, Fri");
    expect(remindersDaysNote([r(MON), r(SUN)])).toBe("Sun, Mon");
  });
  it("says Every day for all seven", () => {
    expect(remindersDaysNote([r(0b1111111)])).toBe("Every day");
    expect(remindersDaysNote([r(0b0001111), r(0b1110000)])).toBe("Every day");
  });
  it("is null when no Routine has days", () => {
    expect(remindersDaysNote([r(0)])).toBeNull();
    expect(remindersDaysNote([])).toBeNull();
  });
});
