import { routineCounter, routineCounterParts, routinePreview, routineSubtitle } from "./routineListText";

describe("routineSubtitle", () => {
  it("joins days and the exercise count", () => {
    expect(routineSubtitle(0b0001001, 5)).toBe("Mon · Thu · 5 exercises");
  });

  it("uses the singular for one exercise", () => {
    expect(routineSubtitle(0b0000001, 1)).toBe("Mon · 1 exercise");
  });

  it("reads No days and No exercises yet when both are empty", () => {
    expect(routineSubtitle(0, 0)).toBe("No days · No exercises yet");
  });

  it("mixes days with no exercises, and no days with exercises", () => {
    expect(routineSubtitle(0b0000010, 0)).toBe("Tue · No exercises yet");
    expect(routineSubtitle(0, 3)).toBe("No days · 3 exercises");
  });
});

describe("routinePreview", () => {
  it("says there are no exercises yet", () => {
    expect(routinePreview([], 0)).toBe("No exercises yet");
  });

  it("lists up to three names, joining the last with and", () => {
    expect(routinePreview(["Bench"], 1)).toBe("Bench");
    expect(routinePreview(["Bench", "Row"], 2)).toBe("Bench and Row");
    expect(routinePreview(["Bench", "Row", "Curl"], 3)).toBe("Bench, Row and Curl");
  });

  it("counts the rest after three names", () => {
    expect(routinePreview(["Bench", "Row", "Curl"], 5)).toBe("Bench, Row, Curl and 2 more");
  });
});

describe("routineCounter", () => {
  it("shows used of the free limit", () => {
    expect(routineCounter(1, false)).toBe("1 of 2 free routines used");
    expect(routineCounter(2, false)).toBe("2 of 2 free routines used");
  });

  it("splits the bold number from the rest", () => {
    expect(routineCounterParts(2, false)).toEqual({ strong: "2 of 2", rest: "free routines used" });
    expect(routineCounterParts(3, true)).toEqual({ strong: "3", rest: "routines" });
  });

  it("shows only the count on Pro", () => {
    expect(routineCounter(1, true)).toBe("1 routine");
    expect(routineCounter(4, true)).toBe("4 routines");
  });
});
