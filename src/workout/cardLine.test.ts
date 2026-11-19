import { cardLine, loadText, offerHeading, targetText } from "./cardLine";

const t = (weightKg: number, reps: number) => ({ weightKg, reps });

describe("cardLine", () => {
  it("shows Streak progress on a Clean card", () => {
    expect(cardLine({ outcome: "clean", reason: "on-track", next: t(60, 10), stepped: t(62.5, 10), remaining: 2, unit: "kg" })).toBe(
      "2 more at 60 kg × 10 to earn 62.5 kg × 10.",
    );
  });

  it("drops the earn part when there is no step to reach", () => {
    expect(cardLine({ outcome: "clean", reason: "on-track", next: t(60, 10), stepped: null, remaining: 1, unit: "kg" })).toBe("1 more at 60 kg × 10.");
  });

  it("says a Hold restarts the Streak and keeps the Target", () => {
    expect(cardLine({ outcome: "hold", reason: "hold", next: t(60, 10), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Held: short of the Target but inside the rep range. Streak restarts, Target stays.",
    );
  });

  it("says a Miss keeps the Target", () => {
    expect(cardLine({ outcome: "miss", reason: "miss", next: t(60, 10), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Missed: below the rep range or short on sets. Streak restarts, Target stays.",
    );
  });

  it("says a repeated Miss keeps the Target when the rule keeps it", () => {
    expect(cardLine({ outcome: "miss", reason: "miss-keep", next: t(60, 10), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Missed again. Your rule keeps the Target.",
    );
  });

  it("names the drop after a repeated Miss", () => {
    expect(cardLine({ outcome: "miss", reason: "miss-drop", next: t(55, 10), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Missed again. Your rule drops the Target to 55 kg × 10.",
    );
  });

  it("says a baseline was set", () => {
    expect(cardLine({ outcome: "baseline", reason: "baseline", next: t(40, 8), stepped: null, remaining: null, unit: "kg" })).toBe(
      "First time: baseline set from what you logged.",
    );
  });

  it("says why nothing goes up at the top of the range", () => {
    expect(cardLine({ outcome: "clean", reason: "at-top-of-range", next: t(60, 12), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Earned, but you are at the top of your rep range, so there is no step up. Target stays.",
    );
  });

  it("says the lifter is staying when progression is Earned and not accepted", () => {
    expect(cardLine({ outcome: "clean", reason: "earned", next: t(60, 10), stepped: t(62.5, 10), remaining: null, unit: "kg" })).toBe(
      "Staying at 60 kg. The offer comes back after your next clean workout.",
    );
  });

  it("confirms an accepted step", () => {
    expect(cardLine({ outcome: "clean", reason: "progressed", next: t(62.5, 10), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Earned. Moving up to 62.5 kg × 10.",
    );
  });

  it("says a Deload workout does not count toward the Streak", () => {
    expect(cardLine({ outcome: "deload", reason: "on-track", next: t(60, 10), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Deload workout. It does not count toward your Streak.",
    );
  });

  it("announces a Deload coming next", () => {
    expect(cardLine({ outcome: "clean", reason: "deload", next: t(50, 10), stepped: null, remaining: null, unit: "kg" })).toBe(
      "Next workout is a Deload at a lighter weight. It does not count toward your Streak.",
    );
  });

  it("copes with no history", () => {
    expect(cardLine({ outcome: "deload", reason: "no-history", next: null, stepped: null, remaining: null, unit: "kg" })).toBe(
      "Deload workout. It does not count toward your Streak.",
    );
  });

  it("writes Targets in lb", () => {
    expect(cardLine({ outcome: "clean", reason: "on-track", next: t(60, 10), stepped: t(62.5, 10), remaining: 2, unit: "lb" })).toBe(
      "2 more at 132.28 lb × 10 to earn 137.79 lb × 10.",
    );
    expect(cardLine({ outcome: "clean", reason: "earned", next: t(61.2349, 10), stepped: null, remaining: null, unit: "lb" })).toBe(
      "Staying at 135 lb. The offer comes back after your next clean workout.",
    );
  });
});

describe("targetText", () => {
  it("writes weight, unit and reps", () => {
    expect(targetText(t(62.5, 10), "kg")).toBe("62.5 kg × 10");
    expect(targetText(t(62.5, 10), "lb")).toBe("137.79 lb × 10");
  });
  it("writes a bodyweight Target (no weight) as reps only", () => {
    expect(targetText(t(0, 9), "kg")).toBe("9 reps");
    expect(targetText(t(0, 1), "lb")).toBe("1 rep");
  });
});

describe("loadText", () => {
  it("writes the weight of a Target, or its reps when it has no weight", () => {
    expect(loadText(t(62.5, 10), "kg")).toBe("62.5 kg");
    expect(loadText(t(0, 9), "kg")).toBe("9 reps");
  });
});

describe("offerHeading", () => {
  it("names a heavier weight when the step adds weight", () => {
    expect(offerHeading(t(60, 8), t(62.5, 8))).toBe("You earned a heavier weight");
  });
  it("names more reps when the step adds reps only, as on a bodyweight exercise", () => {
    expect(offerHeading(t(0, 8), t(0, 9))).toBe("You earned more reps");
  });
});

describe("cardLine on a bodyweight exercise", () => {
  it("writes the Streak progress in reps", () => {
    expect(cardLine({ outcome: "clean", reason: "on-track", next: t(0, 8), stepped: t(0, 9), remaining: 2, unit: "kg" })).toBe(
      "2 more at 8 reps to earn 9 reps.",
    );
  });
  it("says where it stays in reps", () => {
    expect(cardLine({ outcome: "clean", reason: "earned", next: t(0, 8), stepped: null, remaining: null, unit: "lb" })).toBe(
      "Staying at 8 reps. The offer comes back after your next clean workout.",
    );
  });
});
