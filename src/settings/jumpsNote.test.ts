import { jumpsNote } from "./jumpsNote";

describe("jumpsNote", () => {
  it("tells a kg lifter how their jumps show in lb", () => {
    expect(jumpsNote("kg")).toBe("In lb, each jump shows as the nearest plate step.");
  });

  it("tells an lb lifter how their jumps show in kg", () => {
    expect(jumpsNote("lb")).toBe("In kg, each jump shows as the nearest plate step.");
  });
});
