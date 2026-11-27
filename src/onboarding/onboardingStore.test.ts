import { routines } from "@/db/schema";
import { seedLibrary } from "@/db/seed";
import { readUnit } from "@/settings/unitSetting";

import { createTestDb } from "../../test-support/testDb";
import { isOnboarded } from "./onboarding";
import { createOnboardingStore } from "./onboardingStore";

describe("onboarding store", () => {
  it("is not onboarded until loaded, and loads a fresh database as not onboarded", () => {
    const store = createOnboardingStore(createTestDb());
    expect(store.getState().onboarded).toBe(false);
    store.getState().load();
    expect(store.getState().onboarded).toBe(false);
  });

  it("finish saves the flag, tells subscribers and survives a reload", () => {
    const db = createTestDb();
    const store = createOnboardingStore(db);
    store.getState().load();
    const seen: boolean[] = [];
    store.subscribe((s) => seen.push(s.onboarded));
    store.getState().finish();
    expect(seen).toEqual([true]);
    expect(isOnboarded(db)).toBe(true);

    const reopened = createOnboardingStore(db);
    reopened.getState().load();
    expect(reopened.getState().onboarded).toBe(true);
  });

  it("load alone writes nothing", () => {
    const db = createTestDb();
    createOnboardingStore(db).getState().load();
    expect(isOnboarded(db)).toBe(false);
  });
});

describe("onboarding store finishQuickStart", () => {
  it("creates the plan, saves the unit, flips the flag for subscribers and writes it to the database", () => {
    const db = createTestDb();
    seedLibrary(db);
    const store = createOnboardingStore(db);
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
    const store = createOnboardingStore(db);
    store.getState().load();
    expect(() => store.getState().finishQuickStart("lb")).toThrow();
    expect(store.getState().onboarded).toBe(false);
    expect(isOnboarded(db)).toBe(false);
    expect(readUnit(db)).toBe("kg");
    expect(db.select().from(routines).all()).toHaveLength(0);
  });
});
