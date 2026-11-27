import { openRoutines } from "./openRoutines";

const r = (id: number) => ({ id, name: `R${id}` });

describe("openRoutines", () => {
  it("keeps the 3 lowest ids on free, whatever the list order", () => {
    expect(openRoutines([r(9), r(3), r(5), r(1), r(7)], false).map((x) => x.id)).toEqual([3, 5, 1]);
  });
  it("keeps all with Pro", () => {
    expect(openRoutines([r(1), r(2), r(3)], true)).toHaveLength(3);
  });
  it("keeps all on free when at the limit", () => {
    expect(openRoutines([r(4), r(7), r(8)], false)).toHaveLength(3);
  });
});
