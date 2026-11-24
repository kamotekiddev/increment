import type { AppStateStatus } from "react-native";

import { FakeProStoreAdapter, ownedAnswer } from "../../test-support/fakeProStoreAdapter";
import { createTestDb } from "../../test-support/testDb";
import { startProChecks } from "./proChecks";
import { createProStore } from "./proStore";

/** Lets every queued promise callback run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A stand-in for React Native's AppState that a test can drive. */
function fakeAppState() {
  const handlers = new Set<(state: AppStateStatus) => void>();
  return {
    addEventListener: (_type: "change", handler: (state: AppStateStatus) => void) => {
      handlers.add(handler);
      return { remove: () => handlers.delete(handler) };
    },
    emit: (state: AppStateStatus) => handlers.forEach((handler) => handler(state)),
  };
}

function setup() {
  const adapter = new FakeProStoreAdapter();
  const store = createProStore(createTestDb(), adapter);
  store.getState().load();
  const appState = fakeAppState();
  return { adapter, store, appState };
}

describe("Pro checks", () => {
  it("asks the store once on start", async () => {
    const { adapter, store, appState } = setup();
    startProChecks(store.getState(), adapter, appState);
    await flush();
    expect(adapter.calls).toBe(1);
  });

  it("asks again each time the app returns to the foreground, and not when it leaves", async () => {
    const { adapter, store, appState } = setup();
    startProChecks(store.getState(), adapter, appState);
    await flush();

    appState.emit("background");
    appState.emit("inactive");
    await flush();
    expect(adapter.calls).toBe(1);

    appState.emit("active");
    await flush();
    expect(adapter.calls).toBe(2);
  });

  it("turns Pro on when a pending purchase clears while the app is open", async () => {
    const { adapter, store, appState } = setup();
    adapter.answer = { kind: "owned", productId: "pro_lifetime", proof: "token-1", state: "pending" };
    startProChecks(store.getState(), adapter, appState);
    await flush();
    expect(store.getState().pending).toBe(true);
    expect(store.getState().isPro).toBe(false);

    adapter.answer = ownedAnswer();
    adapter.emitPurchaseUpdate(ownedAnswer());
    await flush();
    expect(adapter.calls).toBe(2);
    expect(store.getState().pending).toBe(false);
    expect(store.getState().isPro).toBe(true);
  });

  it("stops asking once stopped", async () => {
    const { adapter, store, appState } = setup();
    const stop = startProChecks(store.getState(), adapter, appState);
    await flush();
    stop();

    appState.emit("active");
    adapter.emitPurchaseUpdate(ownedAnswer());
    await flush();
    expect(adapter.calls).toBe(1);
  });
});
