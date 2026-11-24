import { lockedRoutineIds } from "@/routines/routineLimit";

import { remindersDaysNote } from "./remindersDaysNote";

const MON = 1, TUE = 2, THU = 8, FRI = 16, SUN = 64;
let nextId = 0;
const none: ReadonlySet<number> = new Set();
const free = (rs: readonly { id: number }[]) => new Set(lockedRoutineIds(rs.map((x) => x.id), false));
const r = (days: number) => ({ id: ++nextId, days });

describe("remindersDaysNote", () => {
  it("lists the planned days Sunday first", () => {
    expect(remindersDaysNote([r(MON | THU), r(TUE | FRI)], none)).toBe("Mon, Tue, Thu, Fri");
    expect(remindersDaysNote([r(MON), r(SUN)], none)).toBe("Sun, Mon");
  });
  it("says Every day for all seven", () => {
    expect(remindersDaysNote([r(0b1111111)], none)).toBe("Every day");
    expect(remindersDaysNote([r(0b0001111), r(0b1110000)], none)).toBe("Every day");
  });
  it("is null when no Routine has days", () => {
    expect(remindersDaysNote([r(0)], none)).toBeNull();
    expect(remindersDaysNote([], none)).toBeNull();
  });
  it("leaves out Locked routines on free", () => {
    const list = [{ id: 1, days: MON }, { id: 2, days: TUE }, { id: 3, days: FRI }];
    expect(remindersDaysNote(list, free(list))).toBe("Mon, Tue");
    expect(remindersDaysNote(list, none)).toBe("Mon, Tue, Fri");
  });
  it("is null when only a Locked routine has days", () => {
    const rows = [{ id: 1, days: 0 }, { id: 2, days: 0 }, { id: 3, days: FRI }];
    expect(remindersDaysNote(rows, free(rows))).toBeNull();
  });
});
