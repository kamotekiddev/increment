import { lockedRoutineBanner } from "./lockedRoutineText";

describe("lockedRoutineBanner", () => {
  it("names the routine", () => {
    expect(lockedRoutineBanner("Leg day A")).toBe("Leg day A is locked. Unlock Pro to start or edit it.");
  });
});
