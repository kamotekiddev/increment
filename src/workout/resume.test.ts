import { firstOpenExercise, lastActivity, RESUME_WINDOW_MS, shouldAutoOpen } from "./resume";

const H = 60 * 60 * 1000;

describe("shouldAutoOpen", () => {
  it("reopens a workout edited an hour ago", () => expect(shouldAutoOpen(1000, 1000 + H)).toBe(true));
  it("reopens at exactly the window", () => expect(shouldAutoOpen(0, RESUME_WINDOW_MS)).toBe(true));
  it("does not reopen a workout edited days ago", () => expect(shouldAutoOpen(0, 72 * H)).toBe(false));
});

describe("lastActivity", () => {
  it("uses the last edit when there is one", () => expect(lastActivity({ lastEditedAt: 500, startedAt: 100 })).toBe(500));
  it("falls back to the start", () => expect(lastActivity({ lastEditedAt: null, startedAt: 100 })).toBe(100));
});

describe("firstOpenExercise", () => {
  const ex = (...done: boolean[]) => ({ rows: done.map((d) => ({ done: d })) });
  it("skips finished exercises", () => expect(firstOpenExercise([ex(true, true), ex(true, false), ex(false)])).toBe(1));
  it("starts at the first when nothing is done", () => expect(firstOpenExercise([ex(false), ex(false)])).toBe(0));
  it("falls back to the first when everything is done", () => expect(firstOpenExercise([ex(true), ex(true)])).toBe(0));
  it("handles no exercises", () => expect(firstOpenExercise([])).toBe(0));
});
