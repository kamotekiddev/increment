import { untouchedJumpsNote } from "./jumpsNote";

describe("untouchedJumpsNote", () => {
  it("tells a kg lifter the lb defaults", () => {
    expect(untouchedJumpsNote("kg")).toBe("In lb, jumps you haven’t changed are 5, 5, 10, 5 and 5 lb.");
  });

  it("tells an lb lifter the kg defaults", () => {
    expect(untouchedJumpsNote("lb")).toBe("In kg, jumps you haven’t changed are 2.5, 2, 5, 2.5 and 2.5 kg.");
  });
});
