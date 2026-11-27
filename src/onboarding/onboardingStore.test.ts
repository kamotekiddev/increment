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
