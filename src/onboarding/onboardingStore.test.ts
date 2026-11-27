import { routines } from "@/db/schema";
import { seedLibrary } from "@/db/seed";
import { createUnitStore } from "@/settings/unitStore";
import { readUnit } from "@/settings/unitSetting";

import { createTestDb } from "../../test-support/testDb";
import { isOnboarded } from "./onboarding";
import { createOnboardingStore } from "./onboardingStore";

function build(db: ReturnType<typeof createTestDb>) {
  const unitStore = createUnitStore(db);
  const refreshReminders = jest.fn();
  const store = createOnboardingStore(db, { unitStore, refreshReminders });
  return { store, unitStore, refreshReminders };
}

describe("onboarding store", () => {
  it("is not onboarded until loaded, and loads a fresh database as not onboarded", () => {
    const store = build(createTestDb()).store;
    expect(store.getState().onboarded).toBe(false);
    store.getState().load();
    expect(store.getState().onboarded).toBe(false);
  });

  it("finish saves the flag, tells subscribers and survives a reload", () => {
    const db = createTestDb();
    const { store } = build(db);
    store.getState().load();
    const seen: boolean[] = [];
    store.subscribe((s) => seen.push(s.onboarded));
    store.getState().finish();
    expect(seen).toEqual([true]);
    expect(isOnboarded(db)).toBe(true);

    const reopened = build(db).store;
    reopened.getState().load();
    expect(reopened.getState().onboarded).toBe(true);
  });

  it("load alone writes nothing", () => {
    const db = createTestDb();
    build(db).store.getState().load();
    expect(isOnboarded(db)).toBe(false);
  });
});

describe("onboarding store finishQuickStart", () => {
  it("creates the plan, saves the unit, flips the flag for subscribers and writes it to the database", () => {
    const db = createTestDb();
    seedLibrary(db);
    const { store } = build(db);
    store.getState().load();
    const seen: boolean[] = [];
    store.subscribe((s) => seen.push(s.onboarded));
    store.getState().finishQuickStart("lb");
    expect(seen).toEqual([true]);
    expect(isOnboarded(db)).toBe(true);
    expect(readUnit(db)).toBe("lb");
    expect(db.select().from(routines).all()).toHaveLength(2);
  });

  it("stays not onboarded, saves nothing and rethrows when the library is missing", () => {
    const db = createTestDb();
    const { store } = build(db);
    store.getState().load();
    expect(() => store.getState().finishQuickStart("lb")).toThrow();
    expect(store.getState().onboarded).toBe(false);
    expect(isOnboarded(db)).toBe(false);
    expect(readUnit(db)).toBe("kg");
    expect(db.select().from(routines).all()).toHaveLength(0);
  });

  it("leaves the shared unit store at the picked unit and refreshes reminders once", () => {
    const db = createTestDb();
    seedLibrary(db);
    const { store, unitStore, refreshReminders } = build(db);
    unitStore.getState().load();
    expect(unitStore.getState().unit).toBe("kg");
    store.getState().finishQuickStart("lb");
    expect(unitStore.getState().unit).toBe("lb");
    expect(refreshReminders).toHaveBeenCalledTimes(1);
  });

  it("leaves the unit store and reminders alone when it fails", () => {
    const db = createTestDb();
    const { store, unitStore, refreshReminders } = build(db);
    unitStore.getState().load();
    expect(() => store.getState().finishQuickStart("lb")).toThrow();
    expect(unitStore.getState().unit).toBe("kg");
    expect(refreshReminders).not.toHaveBeenCalled();
  });
});
