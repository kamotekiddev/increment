import { jumpsNote } from "./jumpsNote";

describe("jumpsNote", () => {
  it("tells a kg lifter their lb jumps are kept separately", () => {
    expect(jumpsNote("kg")).toBe("Each unit keeps its own jumps. A change here doesn’t touch your lb jumps.");
  });

  it("tells an lb lifter their kg jumps are kept separately", () => {
    expect(jumpsNote("lb")).toBe("Each unit keeps its own jumps. A change here doesn’t touch your kg jumps.");
  });
});
