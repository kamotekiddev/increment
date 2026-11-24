import { remindersDaysNote } from "./remindersDaysNote";

const MON = 1, TUE = 2, THU = 8, FRI = 16, SUN = 64;
let nextId = 0;
const r = (days: number) => ({ id: ++nextId, days });

describe("remindersDaysNote", () => {
  it("lists the planned days Sunday first", () => {
    expect(remindersDaysNote([r(MON | THU), r(TUE | FRI)], true)).toBe("Mon, Tue, Thu, Fri");
    expect(remindersDaysNote([r(MON), r(SUN)], true)).toBe("Sun, Mon");
  });
  it("says Every day for all seven", () => {
    expect(remindersDaysNote([r(0b1111111)], true)).toBe("Every day");
    expect(remindersDaysNote([r(0b0001111), r(0b1110000)], true)).toBe("Every day");
  });
  it("is null when no Routine has days", () => {
    expect(remindersDaysNote([r(0)], true)).toBeNull();
    expect(remindersDaysNote([], true)).toBeNull();
  });
  it("leaves out Locked routines on free", () => {
    const list = [{ id: 1, days: MON }, { id: 2, days: TUE }, { id: 3, days: FRI }];
    expect(remindersDaysNote(list, false)).toBe("Mon, Tue");
    expect(remindersDaysNote(list, true)).toBe("Mon, Tue, Fri");
  });
  it("is null when only a Locked routine has days", () => {
    expect(remindersDaysNote([{ id: 1, days: 0 }, { id: 2, days: 0 }, { id: 3, days: FRI }], false)).toBeNull();
  });
});
