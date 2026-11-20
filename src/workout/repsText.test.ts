import { repsText } from "./repsText";

describe("repsText", () => {
  it("says rep for one and reps otherwise", () => {
    expect(repsText(1)).toBe("1 rep");
    expect(repsText(8)).toBe("8 reps");
    expect(repsText(0)).toBe("0 reps");
  });
});
