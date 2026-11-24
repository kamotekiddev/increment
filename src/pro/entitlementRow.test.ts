import { createTestDb } from "../../test-support/testDb";
import { readEntitlement, readUnlockScreenOwed, writeEntitlement, writeUnlockScreenOwed } from "./entitlementRow";

const pro = { isPro: true, productId: "pro_lifetime", proof: "token-1", verifiedAt: 1000 };

describe("the owed Pro unlocked screen", () => {
  it("is not owed before any row exists", () => {
    expect(readUnlockScreenOwed(createTestDb())).toBe(false);
  });

  it("is remembered once owed, and forgotten once cleared", () => {
    const db = createTestDb();
    writeEntitlement(db, pro);
    writeUnlockScreenOwed(db, true);
    expect(readUnlockScreenOwed(db)).toBe(true);
    writeUnlockScreenOwed(db, false);
    expect(readUnlockScreenOwed(db)).toBe(false);
  });

  it("survives a later store answer written to the row", () => {
    const db = createTestDb();
    writeEntitlement(db, pro);
    writeUnlockScreenOwed(db, true);
    writeEntitlement(db, { ...pro, verifiedAt: 2000 });
    expect(readUnlockScreenOwed(db)).toBe(true);
    expect(readEntitlement(db)).toEqual({ ...pro, verifiedAt: 2000 });
  });

  it("owing it never changes the cached Pro purchase", () => {
    const db = createTestDb();
    writeEntitlement(db, pro);
    writeUnlockScreenOwed(db, true);
    expect(readEntitlement(db)).toEqual(pro);
  });
});
