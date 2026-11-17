import { cardLine } from "./cardLine";

const t = (weightKg: number, reps: number) => ({ weightKg, reps });

describe("cardLine", () => {
  it("shows Streak progress on a Clean card", () => {
    expect(cardLine({ outcome: "clean", reason: "on-track", next: t(60, 10), stepped: t(62.5, 10), remaining: 2 })).toBe(
      "2 more at 60 kg × 10 to earn 62.5 kg × 10.",
    );
  });

  it("drops the earn part when there is no step to reach", () => {
    expect(cardLine({ outcome: "clean", reason: "on-track", next: t(60, 10), stepped: null, remaining: 1 })).toBe("1 more at 60 kg × 10.");
  });

  it("says a Hold restarts the Streak and keeps the Target", () => {
    expect(cardLine({ outcome: "hold", reason: "hold", next: t(60, 10), stepped: null, remaining: null })).toBe(
      "Held: short of the Target but inside the rep range. Streak restarts, Target stays.",
    );
  });

  it("says a Miss keeps the Target", () => {
    expect(cardLine({ outcome: "miss", reason: "miss", next: t(60, 10), stepped: null, remaining: null })).toBe(
      "Missed: below the rep range or short on sets. Streak restarts, Target stays.",
    );
  });

  it("says a repeated Miss keeps the Target when the rule keeps it", () => {
    expect(cardLine({ outcome: "miss", reason: "miss-keep", next: t(60, 10), stepped: null, remaining: null })).toBe(
      "Missed again. Your rule keeps the Target.",
    );
  });

  it("names the drop after a repeated Miss", () => {
    expect(cardLine({ outcome: "miss", reason: "miss-drop", next: t(55, 10), stepped: null, remaining: null })).toBe(
      "Missed again. Your rule drops the Target to 55 kg × 10.",
    );
  });

  it("says a baseline was set", () => {
    expect(cardLine({ outcome: "baseline", reason: "baseline", next: t(40, 8), stepped: null, remaining: null })).toBe(
      "First time: baseline set from what you logged.",
    );
  });

  it("says why nothing goes up at the top of the range", () => {
    expect(cardLine({ outcome: "clean", reason: "at-top-of-range", next: t(60, 12), stepped: null, remaining: null })).toBe(
      "Earned, but you are at the top of your rep range, so there is no step up. Target stays.",
    );
  });

  it("says the lifter is staying when progression is Earned and not accepted", () => {
    expect(cardLine({ outcome: "clean", reason: "earned", next: t(60, 10), stepped: t(62.5, 10), remaining: null })).toBe(
      "Staying at 60 kg. The offer comes back after your next clean workout.",
    );
  });

  it("confirms an accepted step", () => {
    expect(cardLine({ outcome: "clean", reason: "progressed", next: t(62.5, 10), stepped: null, remaining: null })).toBe(
      "Earned. Moving up to 62.5 kg × 10.",
    );
  });

  it("says a Deload workout does not count toward the Streak", () => {
    expect(cardLine({ outcome: "deload", reason: "on-track", next: t(60, 10), stepped: null, remaining: null })).toBe(
      "Deload workout. It does not count toward your Streak.",
    );
  });

  it("announces a Deload coming next", () => {
    expect(cardLine({ outcome: "clean", reason: "deload", next: t(50, 10), stepped: null, remaining: null })).toBe(
      "Next workout is a Deload at a lighter weight. It does not count toward your Streak.",
    );
  });

  it("copes with no history", () => {
    expect(cardLine({ outcome: "deload", reason: "no-history", next: null, stepped: null, remaining: null })).toBe(
      "Deload workout. It does not count toward your Streak.",
    );
  });
});
