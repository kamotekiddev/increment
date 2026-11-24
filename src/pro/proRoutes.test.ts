import { inWorkoutFlow, proScreensOnTop } from "./proRoutes";

describe("the workout screens", () => {
  it("covers the live workout, its Offer and its summary", () => {
    expect(inWorkoutFlow("/workout/12")).toBe(true);
    expect(inWorkoutFlow("/workout/offer/12")).toBe(true);
    expect(inWorkoutFlow("/workout/summary/12")).toBe(true);
  });

  it("leaves out every other screen", () => {
    for (const path of ["/", "/routines", "/settings", "/paywall", "/pro-unlocked", "/history/3", "/workouts"]) {
      expect(inWorkoutFlow(path)).toBe(false);
    }
  });
});

describe("Pro screens on top of the stack", () => {
  it("counts Pro unlocked that replaced the Paywall as one", () => {
    expect(proScreensOnTop(["(tabs)", "settings", "pro-unlocked"])).toBe(1);
  });

  it("counts Pro unlocked over a Paywall as two", () => {
    expect(proScreensOnTop(["(tabs)", "settings", "paywall", "pro-unlocked"])).toBe(2);
  });

  it("stops at the first screen that isn't a Pro screen", () => {
    expect(proScreensOnTop(["paywall", "(tabs)", "pro-unlocked"])).toBe(1);
    expect(proScreensOnTop(["(tabs)", "settings"])).toBe(0);
  });
});
