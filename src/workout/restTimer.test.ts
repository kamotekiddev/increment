import {
  adjustRest,
  msUntilTextChanges,
  nextUp,
  onSetToggled,
  resolveExpiry,
  restRemaining,
  type RestExercise,
  type RestTimer,
} from "./restTimer";
import type { SetRow } from "./types";

const set = (weightKg: number | null, done = false, reps = 8): SetRow => ({ weightKg, reps, done, edited: false });
const ex = (name: string, restSeconds: number, rows: SetRow[], bodyweight = false): RestExercise => ({
  name,
  restSeconds,
  bodyweight,
  rows,
});
const NOW = 1_000_000;
const timer = (over: Partial<RestTimer> = {}): RestTimer => ({
  endsAt: NOW + 50_000,
  totalMs: 90_000,
  set: { exerciseIndex: 0, setIndex: 0 },
  ...over,
});

describe("onSetToggled", () => {
  it("starts a rest from the exercise's Rest length when set 1 is checked", () => {
    const exs = [ex("Bench", 90, [set(60, true), set(60), set(60)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 0, setIndex: 0 }, done: true, timer: null, now: NOW });
    expect(a).toEqual({
      kind: "start",
      timer: { endsAt: NOW + 90_000, totalMs: 90_000, set: { exerciseIndex: 0, setIndex: 0 } },
    });
  });
  it("replaces a running rest with the new exercise's Rest length", () => {
    const exs = [ex("Bench", 90, [set(60, true), set(60)]), ex("Row", 120, [set(50, true), set(50)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 1, setIndex: 0 }, done: true, timer: timer(), now: NOW });
    expect(a).toEqual({
      kind: "replace",
      timer: { endsAt: NOW + 120_000, totalMs: 120_000, set: { exerciseIndex: 1, setIndex: 0 } },
    });
  });
  it("starts nothing when no open set remains anywhere", () => {
    const exs = [ex("Bench", 90, [set(60, true), set(60, true)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 0, setIndex: 1 }, done: true, timer: null, now: NOW });
    expect(a).toEqual({ kind: "none" });
  });
  it("cancels a running rest when the last open set is done", () => {
    const exs = [ex("Bench", 90, [set(60, true), set(60, true)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 0, setIndex: 1 }, done: true, timer: timer(), now: NOW });
    expect(a).toEqual({ kind: "cancel" });
  });
  it("starts nothing for a Rest length of 0", () => {
    const exs = [ex("Bench", 0, [set(60, true), set(60)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 0, setIndex: 0 }, done: true, timer: null, now: NOW });
    expect(a).toEqual({ kind: "none" });
  });
  it("cancels a running rest when the exercise just done has a Rest length of 0", () => {
    const exs = [ex("Bench", 90, [set(60, true), set(60)]), ex("Curl", 0, [set(20, true), set(20)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 1, setIndex: 0 }, done: true, timer: timer(), now: NOW });
    expect(a).toEqual({ kind: "cancel" });
  });
  it("still starts a rest when the last exercise is finished first and other sets remain", () => {
    const exs = [ex("Bench", 90, [set(60), set(60)]), ex("Row", 60, [set(50, true)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 1, setIndex: 0 }, done: true, timer: null, now: NOW });
    expect(a.kind).toBe("start");
  });
  it("cancels when the set that started the timer is unchecked", () => {
    const exs = [ex("Bench", 90, [set(60), set(60, true)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 0, setIndex: 0 }, done: false, timer: timer(), now: NOW });
    expect(a).toEqual({ kind: "cancel" });
  });
  it("leaves the timer alone when another set is unchecked", () => {
    const exs = [ex("Bench", 90, [set(60, true), set(60)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 0, setIndex: 1 }, done: false, timer: timer(), now: NOW });
    expect(a).toEqual({ kind: "keep" });
  });
  it("leaves it alone when unchecking with no timer", () => {
    const exs = [ex("Bench", 90, [set(60)])];
    const a = onSetToggled({ exercises: exs, set: { exerciseIndex: 0, setIndex: 0 }, done: false, timer: null, now: NOW });
    expect(a).toEqual({ kind: "keep" });
  });
});

describe("nextUp", () => {
  it("names the next open set with weight and reps", () => {
    const exs = [ex("Bench", 90, [set(62.5, true), set(62.5, true), set(62.5, false, 8)])];
    expect(nextUp(exs, 0, "kg")).toBe("Set 3 · 62.5 kg × 8");
  });
  it("names the load in lb", () => {
    const exs = [ex("Bench", 90, [set(62.5, true), set(62.5, false, 8)])];
    expect(nextUp(exs, 0, "lb")).toBe("Set 2 · 137.79 lb × 8");
    const next = [ex("Bench", 90, [set(60, true)]), ex("Overhead press", 90, [set(42.5)])];
    expect(nextUp(next, 0, "lb")).toBe("Overhead press · 93.7 lb");
  });
  it("shows reps only for a blank weight", () => {
    const exs = [ex("Bench", 90, [set(60, true), set(null, false, 10)])];
    expect(nextUp(exs, 0, "kg")).toBe("Set 2 · 10 reps");
  });
  it("shows reps only for a bodyweight exercise", () => {
    const exs = [ex("Pull-up", 90, [set(0, true), set(0, false, 1)], true)];
    expect(nextUp(exs, 0, "kg")).toBe("Set 2 · 1 rep");
  });
  it("names the next exercise with an open set when this one is finished", () => {
    const exs = [ex("Bench", 90, [set(60, true)]), ex("Overhead press", 90, [set(42.5), set(42.5)])];
    expect(nextUp(exs, 0, "kg")).toBe("Overhead press · 42.5 kg");
  });
  it("wraps past the end to an earlier exercise", () => {
    const exs = [ex("Squat", 90, [set(100)]), ex("Bench", 90, [set(60, true)])];
    expect(nextUp(exs, 1, "kg")).toBe("Squat · 100 kg");
  });
  it("gives only the name when the next exercise's weight is blank or bodyweight", () => {
    expect(nextUp([ex("A", 60, [set(1, true)]), ex("Curl", 60, [set(null)])], 0, "kg")).toBe("Curl");
    expect(nextUp([ex("A", 60, [set(1, true)]), ex("Dip", 60, [set(0)], true)], 0, "kg")).toBe("Dip");
  });
  it("is null when nothing is open", () => {
    expect(nextUp([ex("A", 60, [set(1, true)])], 0, "kg")).toBeNull();
  });
});

describe("nextUp defensive", () => {
  it("is null instead of crashing when an exercise has no open row", () => {
    const broken = { name: "X", restSeconds: 60, bodyweight: false, rows: [] } as RestExercise;
    const exs = [ex("Bench", 90, [set(60, true)]), broken];
    expect(nextUp(exs, 0, "kg")).toBeNull();
  });
});

describe("resolveExpiry", () => {
  const open = [ex("Bench", 90, [set(60, true), set(60)]), ex("Row", 60, [set(50)])];
  const finished = [ex("Bench", 90, [set(60, true)]), ex("Row", 60, [set(50)])];
  it("hides with a buzz when the exercise still has an open set", () => {
    expect(resolveExpiry({ exercises: open, timer: timer(), viewingIndex: 0, endedWhileAway: false })).toEqual({
      buzz: true,
      advanceTo: null,
    });
  });
  it("advances to the next exercise with an open set when finished and still viewing it", () => {
    expect(resolveExpiry({ exercises: finished, timer: timer(), viewingIndex: 0, endedWhileAway: false })).toEqual({
      buzz: true,
      advanceTo: 1,
    });
  });
  it("wraps around to an earlier exercise", () => {
    const exs = [ex("Squat", 90, [set(100)]), ex("Bench", 90, [set(60, true)])];
    const t = timer({ set: { exerciseIndex: 1, setIndex: 0 } });
    expect(resolveExpiry({ exercises: exs, timer: t, viewingIndex: 1, endedWhileAway: false }).advanceTo).toBe(0);
  });
  it("only buzzes when the lifter is viewing another exercise", () => {
    expect(resolveExpiry({ exercises: finished, timer: timer(), viewingIndex: 1, endedWhileAway: false })).toEqual({
      buzz: true,
      advanceTo: null,
    });
  });
  it("resolves a rest that ended while away without a buzz", () => {
    expect(resolveExpiry({ exercises: finished, timer: timer(), viewingIndex: 0, endedWhileAway: true })).toEqual({
      buzz: false,
      advanceTo: 1,
    });
    expect(resolveExpiry({ exercises: open, timer: timer(), viewingIndex: 0, endedWhileAway: true })).toEqual({
      buzz: false,
      advanceTo: null,
    });
  });
});

describe("adjustRest", () => {
  it("adds 15 seconds to the running rest", () => {
    const r = adjustRest(timer(), 15, NOW);
    expect(r.timer.endsAt).toBe(NOW + 65_000);
    expect(r.ended).toBe(false);
  });
  it("grows the total when the rest exceeds it, so the ring never passes full", () => {
    const r = adjustRest(timer({ endsAt: NOW + 85_000 }), 15, NOW);
    expect(r.timer.totalMs).toBe(100_000);
  });
  it("subtracts 15 seconds and keeps the total", () => {
    const r = adjustRest(timer(), -15, NOW);
    expect(r.timer.endsAt).toBe(NOW + 35_000);
    expect(r.timer.totalMs).toBe(90_000);
  });
  it("floors at zero and reports the rest as ended", () => {
    const r = adjustRest(timer({ endsAt: NOW + 10_000 }), -15, NOW);
    expect(r.timer.endsAt).toBe(NOW);
    expect(r.ended).toBe(true);
  });
  it("never changes which set started it", () => {
    expect(adjustRest(timer(), 15, NOW).timer.set).toEqual({ exerciseIndex: 0, setIndex: 0 });
  });
});

describe("restRemaining", () => {
  it("reads m:ss and the ring fraction", () => {
    const r = restRemaining(timer({ endsAt: NOW + 45_000 }), NOW);
    expect(r).toEqual({ remainingMs: 45_000, fraction: 0.5, text: "0:45", ended: false });
  });
  it("rounds partial seconds up so a fresh 90 s rest reads 1:30", () => {
    expect(restRemaining(timer({ endsAt: NOW + 90_000 }), NOW + 400).text).toBe("1:30");
  });
  it("reads 1:42 for 102 seconds", () => {
    expect(restRemaining(timer({ endsAt: NOW + 102_000, totalMs: 120_000 }), NOW).text).toBe("1:42");
  });
  it("is ended with zero left at or past the end time", () => {
    expect(restRemaining(timer(), NOW + 50_000)).toEqual({ remainingMs: 0, fraction: 0, ended: true, text: "0:00" });
    expect(restRemaining(timer(), NOW + 80_000).remainingMs).toBe(0);
  });
  it("clamps the fraction to 1 if the clock moved back", () => {
    expect(restRemaining(timer(), NOW - 100_000).fraction).toBe(1);
  });
});

describe("msUntilTextChanges", () => {
  it("waits a full second just after the text changed", () => {
    // remaining 90 s shows 1:30 and next shows 1:29 after a full second
    expect(msUntilTextChanges(90_000)).toBe(1000 + 5);
  });

  it("waits only until the next whole second mid-second", () => {
    // 89.4 s shows 1:30 (rounded up); it shows 1:29 once 89 s are left
    expect(msUntilTextChanges(89_400)).toBe(400 + 5);
  });

  it("waits out the last second at 0:01 so the rest ends on time", () => {
    expect(msUntilTextChanges(700)).toBe(700 + 5);
  });

  it("returns null once the rest is over", () => {
    expect(msUntilTextChanges(0)).toBeNull();
    expect(msUntilTextChanges(-30)).toBeNull();
  });
});
