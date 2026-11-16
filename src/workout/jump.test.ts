import { JUMP_KG } from "./jump";

describe("JUMP_KG", () => {
  it("is the fixed 2.5 kg Jump for every exercise", () => {
    expect(JUMP_KG).toBe(2.5);
  });
});
