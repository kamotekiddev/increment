import { dateLine, exerciseCountText, previewTitle, restBannerText, screenTitle, stripLabel } from "./todayText";
import type { StripDay } from "./todayState";

const day = (over: Partial<StripDay>): StripDay => ({
  label: "Mon",
  date: 0,
  dayNumber: 9,
  isToday: false,
  planned: false,
  done: false,
  ...over,
});

describe("dateLine", () => {
  it("writes weekday, day and month in local time", () => {
    expect(dateLine(new Date(2026, 10, 12, 9).getTime())).toBe("Thursday, 12 Nov");
    expect(dateLine(new Date(2026, 10, 14, 23, 59).getTime())).toBe("Saturday, 14 Nov");
    expect(dateLine(new Date(2026, 0, 1, 0, 0).getTime())).toBe("Thursday, 1 Jan");
  });

  it("rolls over at local midnight", () => {
    expect(dateLine(new Date(2026, 10, 14, 24, 0).getTime())).toBe("Sunday, 15 Nov");
  });
});

describe("screenTitle", () => {
  it("is Rest day only on a rest day", () => {
    expect(screenTitle("rest")).toBe("Rest day");
    expect(screenTitle("cards")).toBe("Today");
    expect(screenTitle("noRoutines")).toBe("Today");
    expect(screenTitle("noDays")).toBe("Today");
  });
});

describe("restBannerText", () => {
  it("shows progress when done is within the plan", () => {
    expect(restBannerText(3, 1)).toBe("1 of 3 workouts done this week. Muscles grow while you rest.");
    expect(restBannerText(3, 3)).toBe("3 of 3 workouts done this week. Muscles grow while you rest.");
  });

  it("drops the plan when more was done than planned", () => {
    expect(restBannerText(2, 3)).toBe("3 workouts done this week.");
    expect(restBannerText(0, 2)).toBe("2 workouts done this week.");
    expect(restBannerText(0, 1)).toBe("1 workout done this week.");
  });

  it("only encourages rest when nothing is done", () => {
    expect(restBannerText(3, 0)).toBe("Muscles grow while you rest.");
    expect(restBannerText(0, 0)).toBe("Muscles grow while you rest.");
  });
});

describe("stripLabel", () => {
  it("names the day, number and state", () => {
    expect(stripLabel(day({ planned: true }))).toBe("Mon 9, planned");
    expect(stripLabel(day({ label: "Tue", dayNumber: 10, done: true }))).toBe("Tue 10, workout done");
    expect(stripLabel(day({ label: "Wed", dayNumber: 11 }))).toBe("Wed 11");
    expect(stripLabel(day({ isToday: true, planned: true }))).toBe("Mon 9, today, planned");
  });
});

describe("deck preview header", () => {
  it("names the routine", () => expect(previewTitle("Push")).toBe("Today: Push"));
  it("counts exercises", () => {
    expect(exerciseCountText(5)).toBe("5 exercises");
    expect(exerciseCountText(1)).toBe("1 exercise");
    expect(exerciseCountText(0)).toBe("0 exercises");
  });
});
