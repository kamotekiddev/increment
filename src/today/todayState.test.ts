import { buildToday } from "./todayState";
import type { TodayInput } from "./todayState";

// Mon bit 0 ... Sun bit 6.
const MON = 1 << 0;
const TUE = 1 << 1;
const THU = 1 << 3;
const SUN = 1 << 6;

// Local-time dates so tests do not depend on the machine time zone. Wed 2026-11-18.
const at = (day: number, h = 9, m = 0) => new Date(2026, 10, day, h, m).getTime();
const WED_NOON = at(18, 12);

const push = { id: 1, name: "Push", days: MON | THU };
const pull = { id: 2, name: "Pull", days: MON | TUE };
const legs = { id: 3, name: "Legs", days: 1 << 2 }; // Wed
const arms = { id: 4, name: "Arms", days: 1 << 2 }; // Wed

function input(over: Partial<TodayInput>): TodayInput {
  return { now: WED_NOON, routines: [], finished: [], inProgress: null, ...over };
}

describe("buildToday cards", () => {
  it("shows one card per Routine planned today, in Routines-tab order", () => {
    const { state } = buildToday(input({ now: at(16, 8), routines: [pull, push] }));
    expect(state).toEqual({
      kind: "cards",
      cards: [
        { routineId: 2, name: "Pull", status: "start" },
        { routineId: 1, name: "Push", status: "start" },
      ],
    });
  });

  it("marks a Routine Done when a finished Workout of it started today", () => {
    const { state } = buildToday(input({ routines: [legs, arms], finished: [{ routineId: 3, startedAt: at(18, 7) }] }));
    expect(state).toEqual({
      kind: "cards",
      cards: [
        { routineId: 3, name: "Legs", status: "done" },
        { routineId: 4, name: "Arms", status: "start" },
      ],
    });
  });

  it("does not count a finished Workout from another day (discarded Workouts are deleted, so they never reach the builder)", () => {
    const { state } = buildToday(input({ routines: [legs], finished: [{ routineId: 3, startedAt: at(17, 9) }] }));
    expect(state).toMatchObject({ cards: [{ status: "start" }] });
  });

  it("marks the in-progress Routine and leaves other cards unchanged", () => {
    const { state } = buildToday(input({ routines: [legs, arms], inProgress: { routineId: 3 } }));
    expect(state).toEqual({
      kind: "cards",
      cards: [
        { routineId: 3, name: "Legs", status: "inProgress" },
        { routineId: 4, name: "Arms", status: "start" },
      ],
    });
  });

  it("in progress wins over Done for the same Routine", () => {
    const { state } = buildToday(
      input({ routines: [legs], finished: [{ routineId: 3, startedAt: at(18, 6) }], inProgress: { routineId: 3 } }),
    );
    expect(state).toMatchObject({ cards: [{ status: "inProgress" }] });
  });

  it("ignores an in-progress Workout whose Routine is not planned today", () => {
    const { state } = buildToday(input({ routines: [legs, push], inProgress: { routineId: 1 } }));
    expect(state).toEqual({ kind: "cards", cards: [{ routineId: 3, name: "Legs", status: "start" }] });
  });

  it("counts a Workout started at 11:50 pm for its start day", () => {
    const lateTuesday = at(17, 23, 50);
    const tue = { id: 5, name: "Tue", days: TUE };
    const sameDay = buildToday(
      input({ now: at(17, 23, 55), routines: [tue], finished: [{ routineId: 5, startedAt: lateTuesday }] }),
    );
    expect(sameDay.state).toMatchObject({ cards: [{ status: "done" }] });
    const nextDay = buildToday(input({ routines: [legs], finished: [{ routineId: 3, startedAt: lateTuesday }] }));
    expect(nextDay.state).toMatchObject({ cards: [{ status: "start" }] });
  });
});

describe("buildToday strip", () => {
  it("runs Sunday to Saturday for the current week with three-letter names", () => {
    const { strip } = buildToday(input({}));
    expect(strip.map((d) => d.label)).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(strip.map((d) => d.date)).toEqual([15, 16, 17, 18, 19, 20, 21].map((d) => new Date(2026, 10, d).getTime()));
  });

  it("starts the week on the Sunday that is today", () => {
    const { strip } = buildToday(input({ now: at(15, 10) }));
    expect(strip[0]).toMatchObject({ label: "Sun", isToday: true });
    expect(strip.filter((d) => d.isToday)).toHaveLength(1);
  });

  it("highlights today and marks planned days", () => {
    const { strip } = buildToday(input({ routines: [push, { id: 9, name: "Sun", days: SUN }] }));
    expect(strip.map((d) => d.isToday)).toEqual([false, false, false, true, false, false, false]);
    expect(strip.map((d) => d.planned)).toEqual([true, true, false, false, true, false, false]);
  });

  it("checks any day with a finished Workout, planned or not, and has no missed state", () => {
    const { strip } = buildToday(
      input({
        routines: [push],
        finished: [
          { routineId: 1, startedAt: at(16, 7) },
          { routineId: null, startedAt: at(20, 7) },
        ],
      }),
    );
    expect(strip.map((d) => d.done)).toEqual([false, true, false, false, false, true, false]);
    expect(Object.keys(strip[2]).sort()).toEqual(["date", "done", "isToday", "label", "planned"]);
  });

  it("ignores Workouts outside the displayed week", () => {
    const { strip } = buildToday(
      input({ finished: [{ routineId: null, startedAt: at(14, 9) }, { routineId: null, startedAt: at(22, 9) }] }),
    );
    expect(strip.every((d) => !d.done)).toBe(true);
  });
});

describe("buildToday other states", () => {
  it("says no routines when there are none", () => {
    expect(buildToday(input({})).state).toEqual({ kind: "noRoutines" });
  });

  it("says no days set when Routines exist but none has a day", () => {
    expect(buildToday(input({ routines: [{ id: 1, name: "Push", days: 0 }] })).state).toEqual({ kind: "noDays" });
  });

  it("names the next planned Routine and day on a rest day", () => {
    expect(buildToday(input({ routines: [push] })).state).toEqual({
      kind: "rest",
      next: { routineName: "Push", dayLabel: "Thu" },
    });
  });

  it("wraps to next week, Sunday included, when nothing is left this week", () => {
    expect(buildToday(input({ now: at(20, 9), routines: [pull] })).state).toEqual({
      kind: "rest",
      next: { routineName: "Pull", dayLabel: "Mon" },
    });
    expect(buildToday(input({ routines: [{ id: 8, name: "Long", days: SUN }] })).state).toEqual({
      kind: "rest",
      next: { routineName: "Long", dayLabel: "Sun" },
    });
  });

  it("names the first Routine in tab order when several share the next day", () => {
    expect(buildToday(input({ now: at(20, 9), routines: [pull, push] })).state).toEqual({
      kind: "rest",
      next: { routineName: "Pull", dayLabel: "Mon" },
    });
  });
});
