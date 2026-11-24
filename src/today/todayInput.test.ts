import { lockedRoutineIds } from "@/routines/routineLimit";

import { buildToday } from "./todayState";
import { toTodayInput } from "./todayInput";
import { weekEnd, weekStart } from "./week";

const none: ReadonlySet<number> = new Set();
const freeLocks = (rows: readonly { id: number }[]) => new Set(lockedRoutineIds(rows.map((r) => r.id), false));
const at = (month: number, day: number, h = 0) => new Date(2026, month, day, h).getTime();

describe("weekStart / weekEnd", () => {
  it("starts on the Sunday at local midnight", () => {
    expect(weekStart(at(10, 18, 12))).toBe(at(10, 15)); // Wed 18 Nov -> Sun 15 Nov
    expect(weekEnd(at(10, 18, 12))).toBe(at(10, 22));
  });

  it("treats Sunday as the first day and Saturday night as the last", () => {
    expect(weekStart(at(10, 15, 0))).toBe(at(10, 15));
    expect(weekStart(at(10, 21, 23))).toBe(at(10, 15));
  });

  it("crosses month and year boundaries", () => {
    expect(weekStart(new Date(2026, 0, 1, 10).getTime())).toBe(new Date(2025, 11, 28).getTime());
    expect(weekEnd(new Date(2026, 0, 1, 10).getTime())).toBe(new Date(2026, 0, 4).getTime());
  });
});

describe("toTodayInput", () => {
  it("keeps only what the builder reads", () => {
    const input = toTodayInput(
      5,
      [{ id: 1, name: "Push", days: 3, exerciseCount: 4, position: 0 }],
      [{ routineId: 1, startedAt: 4 }],
      { routineId: null },
      none,
    );
    expect(input).toEqual({
      now: 5,
      routines: [{ id: 1, name: "Push", days: 3, exerciseCount: 4 }],
      lockedHaveDays: false,
      finished: [{ routineId: 1, startedAt: 4 }],
      inProgress: { routineId: null },
    });
  });

  it("preserves the Routines-tab order (input order is card order)", () => {
    const input = toTodayInput(
      5,
      [
        { id: 7, name: "Legs", days: 1, exerciseCount: 0, position: 0 },
        { id: 2, name: "Arms", days: 1, exerciseCount: 0, position: 1 },
        { id: 5, name: "Push", days: 1, exerciseCount: 0, position: 2 },
      ],
      [],
      null,
      none,
    );
    expect(input.routines.map((r) => r.id)).toEqual([7, 2, 5]);
    const { state } = buildToday({ ...input, now: new Date(2026, 10, 16, 9).getTime() }); // Monday
    expect(state).toMatchObject({ kind: "cards", cards: [{ routineId: 7 }, { routineId: 2 }, { routineId: 5 }] });
  });

  it("passes no in-progress workout through as null", () => {
    expect(toTodayInput(5, [], [], null, none).inProgress).toBeNull();
  });

  describe("Locked routines on free", () => {
    const MON = 1;
    const WED = 4;
    const monday = new Date(2026, 10, 16, 9).getTime();
    const row = (id: number, days: number) => ({ id, name: `R${id}`, days, exerciseCount: 1 });

    it("drops them from the input, keeping the 2 lowest ids", () => {
      const rows = [row(9, MON), row(1, MON), row(4, MON), row(2, MON)];
      const input = toTodayInput(5, rows, [], null, freeLocks(rows));
      expect(input.routines.map((r) => r.id)).toEqual([1, 2]);
    });

    it("keeps them all with Pro", () => {
      expect(toTodayInput(5, [row(1, MON), row(2, MON), row(3, MON)], [], null, none).routines).toHaveLength(3);
    });

    it("makes a day with only a Locked routine a rest day, next preview from open routines", () => {
      const rows = [row(1, WED), row(2, 0), row(3, MON)];
      const free = buildToday({ ...toTodayInput(monday, rows, [], null, freeLocks(rows)), now: monday });
      expect(free.state).toMatchObject({ kind: "rest", next: { routineId: 1, weekday: "Wednesday" } });
      const pro = buildToday({ ...toTodayInput(monday, rows, [], null, none), now: monday });
      expect(pro.state).toMatchObject({ kind: "cards", cards: [{ routineId: 3 }] });
    });

    it("reads as a rest day with no next, not noDays, when only a Locked routine has days", () => {
      const rows = [row(1, 0), row(2, 0), row(3, MON)];
      const { state, strip } = buildToday(toTodayInput(monday, rows, [], null, freeLocks(rows)));
      expect(state).toEqual({ kind: "rest", next: null, week: { planned: 0, done: 0 } });
      expect(strip.some((d) => d.planned)).toBe(false);
    });

    it("keeps the nudge when no routine at all has days", () => {
      const rows = [row(1, 0), row(2, 0), row(3, 0)];
      expect(buildToday(toTodayInput(monday, rows, [], null, freeLocks(rows))).state).toEqual({ kind: "noDays" });
    });

    it("shows the nudge with Pro when no routine has days, and cards when the third has today", () => {
      const rows = [row(1, 0), row(2, 0), row(3, MON)];
      expect(buildToday(toTodayInput(monday, rows, [], null, none)).state).toMatchObject({ kind: "cards", cards: [{ routineId: 3 }] });
    });
  });
});
