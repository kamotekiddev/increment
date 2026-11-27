import { routineListState } from "./routineListState";

describe("routineListState", () => {
  it("shows the free counter when nothing is locked", () => {
    const s = routineListState([1, 2, 3], false);
    expect(s.card).toEqual({ kind: "free", strong: "3 of 3", rest: "free routines used" });
    expect(s.lockedIds.size).toBe(0);
  });

  it("shows the locked card, with the count, when 4 routines are free", () => {
    const s = routineListState([1, 2, 3, 4], false);
    expect(s.card).toEqual({ kind: "locked", strong: "1 routine locked.", rest: "Unlock Pro to use them again." });
    expect([...s.lockedIds]).toEqual([4]);
  });

  it("pluralises the locked count", () => {
    expect(routineListState([1, 2, 3, 4, 5], false).card).toMatchObject({ strong: "2 routines locked." });
  });

  it("locks by lowest id, not by list position", () => {
    expect([...routineListState([5, 1, 9, 2], false).lockedIds]).toEqual([9]);
  });

  it("shows only the plain count on Pro, with nothing locked", () => {
    const s = routineListState([1, 2, 3], true);
    expect(s.card).toEqual({ kind: "pro", strong: "3", rest: "routines" });
    expect(s.lockedIds.size).toBe(0);
  });
});
