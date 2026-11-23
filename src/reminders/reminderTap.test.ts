import { reminderTapRoutesToToday } from "./reminderTap";

describe("reminderTapRoutesToToday", () => {
  it("routes a reminder tap to Today from a tab or a pushed screen", () => {
    expect(reminderTapRoutesToToday("reminder-2026-11-24", "/routines")).toBe(true);
    expect(reminderTapRoutesToToday("reminder-2026-11-24", "/settings")).toBe(true);
    expect(reminderTapRoutesToToday("reminder-2026-11-24", "/")).toBe(true);
  });

  it("does nothing on the live workout screen", () => {
    expect(reminderTapRoutesToToday("reminder-2026-11-24", "/workout/12")).toBe(false);
  });

  it("still routes from the offer and summary screens", () => {
    expect(reminderTapRoutesToToday("reminder-2026-11-24", "/workout/offer/12")).toBe(true);
    expect(reminderTapRoutesToToday("reminder-2026-11-24", "/workout/summary/12")).toBe(true);
  });

  it("ignores the rest-over alert and other ids", () => {
    expect(reminderTapRoutesToToday("rest-over", "/routines")).toBe(false);
    expect(reminderTapRoutesToToday("something", "/")).toBe(false);
  });
});
