import { barText, elapsedText } from "./elapsedText";

describe("elapsedText", () => {
  it("shows minutes and zero-padded seconds", () => {
    expect(elapsedText(0, 24 * 60_000 + 10_000)).toBe("24:10");
  });

  it("starts at 0:00", () => {
    expect(elapsedText(5_000, 5_000)).toBe("0:00");
  });

  it("adds hours after the first hour", () => {
    expect(elapsedText(0, 3_600_000 + 5 * 60_000 + 3_000)).toBe("1:05:03");
  });

  it("never goes negative if the clock moved back", () => {
    expect(elapsedText(10_000, 4_000)).toBe("0:00");
  });
});

describe("barText", () => {
  it("joins routine name and elapsed time", () => {
    expect(barText("Push day A", 0, 24 * 60_000 + 10_000)).toBe("Push day A · 24:10");
  });
});
