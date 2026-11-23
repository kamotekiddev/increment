import { restNotificationContent, secondsUntil } from "./restNotificationText";

describe("restNotificationContent", () => {
  it("uses the next-up line as the body", () => {
    expect(restNotificationContent("Set 3 · 62.5 kg × 8")).toEqual({ title: "Rest over", body: "Set 3 · 62.5 kg × 8" });
  });
  it("falls back when nothing is next", () => {
    expect(restNotificationContent(null)).toEqual({ title: "Rest over", body: "Time for your next set" });
  });
});

describe("secondsUntil", () => {
  it("rounds partial seconds up", () => {
    expect(secondsUntil(90_000, 0)).toBe(90);
    expect(secondsUntil(90_001, 0)).toBe(91);
  });
  it("is null when the end time has passed", () => {
    expect(secondsUntil(1000, 1000)).toBeNull();
    expect(secondsUntil(1000, 5000)).toBeNull();
  });
});
