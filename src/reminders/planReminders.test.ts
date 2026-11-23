import { planReminders } from "./planReminders";
import type { PlannerRoutine } from "./planReminders";

// DST in America/New_York: clocks go forward on 2026-03-08 and back on 2026-11-01.
process.env.TZ = "America/New_York";

const MON = 1 << 0;
const TUE = 1 << 1;
const THU = 1 << 3;
const FRI = 1 << 4;
const SUN = 1 << 6;
const SIX_PM = 18 * 60;

const pushA: PlannerRoutine = { name: "Push day A", days: MON | THU, exerciseCount: 5 };
const pullB: PlannerRoutine = { name: "Pull day B", days: TUE | FRI, exerciseCount: 4 };

// Sunday 2026-11-22 at noon, local.
const sundayNoon = new Date(2026, 10, 22, 12, 0);

function plan(over: Partial<Parameters<typeof planReminders>[0]> = {}) {
  return planReminders({ routines: [pushA, pullB], workoutStartedToday: false, timeMinutes: SIX_PM, now: sundayNoon, ...over });
}

describe("planReminders", () => {
  it("plans 16 reminders over 28 days on Mon, Tue, Thu and Fri at 18:00 local", () => {
    const out = plan();
    expect(out).toHaveLength(16);
    expect(out.map((r) => r.at.getDay())).toEqual([1, 2, 4, 5, 1, 2, 4, 5, 1, 2, 4, 5, 1, 2, 4, 5]);
    expect(out.every((r) => r.at.getHours() === 18 && r.at.getMinutes() === 0)).toBe(true);
    expect(out[0].id).toBe("reminder-2026-11-23");
    expect(out[15].id).toBe("reminder-2026-12-18");
  });

  it("gives the same ids on every call", () => {
    expect(plan().map((r) => r.id)).toEqual(plan().map((r) => r.id));
  });

  it("includes today at 17:59 and skips it at 18:00 or later", () => {
    const today = { name: "Legs", days: SUN, exerciseCount: 3 };
    const at = (h: number, m: number) => plan({ routines: [today], now: new Date(2026, 10, 22, h, m) }).map((r) => r.id);
    expect(at(17, 59)[0]).toBe("reminder-2026-11-22");
    expect(at(18, 0)[0]).toBe("reminder-2026-11-29");
    expect(at(21, 30)[0]).toBe("reminder-2026-11-29");
  });

  it("skips today when a Workout was started, leaving the rest unchanged", () => {
    const today = { name: "Legs", days: SUN, exerciseCount: 3 };
    const now = new Date(2026, 10, 22, 9, 0);
    const all = plan({ routines: [today], now });
    const started = plan({ routines: [today], now, workoutStartedToday: true });
    expect(all).toHaveLength(4);
    expect(started.map((r) => r.id)).toEqual(all.slice(1).map((r) => r.id));
  });

  it("titles one, two and three Routines on one day in Routines-tab order", () => {
    const mk = (name: string): PlannerRoutine => ({ name, days: MON, exerciseCount: 2 });
    const first = (names: string[]) => plan({ routines: names.map(mk) })[0];
    expect(first(["Push day A"]).title).toBe("Push day A today");
    expect(first(["Push day A", "Legs"]).title).toBe("Push day A and Legs today");
    expect(first(["Push day A", "Legs"]).body).toBe("2 workouts planned");
    expect(first(["A", "B", "C"]).title).toBe("A, B and C today");
    expect(first(["A", "B", "C"]).body).toBe("3 workouts planned");
  });

  it("words the exercise count for one Routine", () => {
    const first = (n: number) => plan({ routines: [{ name: "X", days: MON, exerciseCount: n }] })[0].body;
    expect(first(5)).toBe("5 exercises planned");
    expect(first(1)).toBe("1 exercise planned");
    expect(first(0)).toBe("No exercises yet");
  });

  it("plans nothing when no Routine has days", () => {
    expect(plan({ routines: [{ name: "X", days: 0, exerciseCount: 3 }] })).toEqual([]);
    expect(plan({ routines: [] })).toEqual([]);
  });

  it("keeps 18:00 local across both DST changes", () => {
    const daily = { name: "X", days: 0b1111111, exerciseCount: 1 };
    const spring = plan({ routines: [daily], now: new Date(2026, 2, 5, 9, 0) });
    expect(spring.map((r) => r.id)).toContain("reminder-2026-03-08");
    expect(spring.every((r) => r.at.getHours() === 18)).toBe(true);
    const fall = plan({ routines: [daily], now: new Date(2026, 9, 30, 9, 0) });
    expect(fall.map((r) => r.id)).toContain("reminder-2026-11-01");
    expect(fall.every((r) => r.at.getHours() === 18)).toBe(true);
  });

  it("uses the reminder time", () => {
    const r = plan({ timeMinutes: 6 * 60 + 30 })[0];
    expect([r.at.getHours(), r.at.getMinutes()]).toEqual([6, 30]);
  });
});
