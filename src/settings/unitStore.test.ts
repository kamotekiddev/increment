import { createTestDb } from "./testDb";
import { createUnitStore } from "./unitStore";
import { readUnit } from "./unitSetting";

describe("unit store", () => {
  it("is kg until loaded, then holds the saved unit", () => {
    const db = createTestDb();
    const store = createUnitStore(db);
    expect(store.getState().unit).toBe("kg");
    store.getState().setUnit("lb");

    const reopened = createUnitStore(db);
    reopened.getState().load();
    expect(reopened.getState().unit).toBe("lb");
  });

  it("saves a change and tells subscribers", () => {
    const db = createTestDb();
    const store = createUnitStore(db);
    store.getState().load();
    const seen: string[] = [];
    store.subscribe((s) => seen.push(s.unit));
    store.getState().setUnit("lb");
    store.getState().setUnit("kg");
    expect(seen).toEqual(["lb", "kg"]);
    expect(readUnit(db)).toBe("kg");
  });
});
