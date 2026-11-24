import { FakeProStoreAdapter, ownedAnswer } from "../../test-support/fakeProStoreAdapter";
import { createTestDb } from "../../test-support/testDb";
import { createProStore } from "./proStore";

/** Lets every queued promise callback run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("Pro store", () => {
  it("is free until loaded, and free when no row exists yet", () => {
    const db = createTestDb();
    const store = createProStore(db, new FakeProStoreAdapter());
    expect(store.getState().isPro).toBe(false);
    store.getState().load();
    expect(store.getState().isPro).toBe(false);
    expect(store.getState().pending).toBe(false);
  });

  it("refresh writes the store's answer, so a later launch loads Pro without asking", async () => {
    const db = createTestDb();
    const adapter = new FakeProStoreAdapter();
    adapter.answer = ownedAnswer();
    const store = createProStore(db, adapter);
    store.getState().load();
    await store.getState().refresh();
    expect(store.getState().isPro).toBe(true);

    const nextLaunch = createProStore(db, new FakeProStoreAdapter());
    nextLaunch.getState().load();
    expect(nextLaunch.getState().isPro).toBe(true);
  });

  it("keeps the cached Pro when the store gives no answer, and drops it on a definite not owned", async () => {
    const db = createTestDb();
    const adapter = new FakeProStoreAdapter();
    adapter.answer = ownedAnswer();
    const store = createProStore(db, adapter);
    await store.getState().refresh();

    adapter.answer = { kind: "no-answer" };
    await store.getState().refresh();
    expect(store.getState().isPro).toBe(true);

    adapter.answer = { kind: "not-owned" };
    await store.getState().refresh();
    expect(store.getState().isPro).toBe(false);
    const nextLaunch = createProStore(db, new FakeProStoreAdapter());
    nextLaunch.getState().load();
    expect(nextLaunch.getState().isPro).toBe(false);
  });

  it("treats a store call that throws as no answer", async () => {
    const db = createTestDb();
    const adapter = new FakeProStoreAdapter();
    adapter.answer = ownedAnswer();
    const store = createProStore(db, adapter);
    await store.getState().refresh();

    const throwing = new FakeProStoreAdapter();
    throwing.checkOwned = () => Promise.reject(new Error("store unavailable"));
    const failing = createProStore(db, throwing);
    failing.getState().load();
    await expect(failing.getState().refresh()).resolves.toEqual({ kind: "no-answer" });
    expect(failing.getState().isPro).toBe(true);
  });

  it("reports a pending purchase without turning Pro on", async () => {
    const db = createTestDb();
    const adapter = new FakeProStoreAdapter();
    adapter.answer = { kind: "owned", productId: "pro_lifetime", proof: "token-1", state: "pending" };
    const store = createProStore(db, adapter);
    store.getState().load();
    await store.getState().refresh();
    expect(store.getState().pending).toBe(true);
    expect(store.getState().isPro).toBe(false);

    adapter.answer = ownedAnswer();
    await store.getState().refresh();
    expect(store.getState().pending).toBe(false);
    expect(store.getState().isPro).toBe(true);
  });

  it("keeps reporting a pending purchase when the next check gets no answer", async () => {
    const db = createTestDb();
    const adapter = new FakeProStoreAdapter();
    adapter.answer = { kind: "owned", productId: "pro_lifetime", proof: "token-1", state: "pending" };
    const store = createProStore(db, adapter);
    store.getState().load();
    await store.getState().refresh();

    adapter.answer = { kind: "no-answer" };
    await store.getState().refresh();
    expect(store.getState().pending).toBe(true);
    expect(store.getState().isPro).toBe(false);
  });

  it("never rejects, even when a switched-on listener throws", async () => {
    const db = createTestDb();
    const adapter = new FakeProStoreAdapter();
    adapter.answer = ownedAnswer();
    const store = createProStore(db, adapter);
    store.getState().load();
    store.getState().onSwitchedOn(() => {
      throw new Error("listener failed");
    });
    await expect(store.getState().refresh()).resolves.toEqual(ownedAnswer());
    expect(store.getState().isPro).toBe(true);
  });

  it("resolves with the store's answer it acted on, so Restore purchase can tell nothing found from no answer", async () => {
    const adapter = new FakeProStoreAdapter();
    const store = createProStore(createTestDb(), adapter);
    store.getState().load();

    adapter.answer = { kind: "not-owned" };
    await expect(store.getState().refresh()).resolves.toEqual({ kind: "not-owned" });
    adapter.answer = { kind: "no-answer" };
    await expect(store.getState().refresh()).resolves.toEqual({ kind: "no-answer" });
    adapter.answer = ownedAnswer();
    await expect(store.getState().refresh()).resolves.toEqual(ownedAnswer());
  });

  it("runs overlapping refreshes one after the other", async () => {
    const db = createTestDb();
    const adapter = new FakeProStoreAdapter();
    adapter.hold();
    const store = createProStore(db, adapter);
    store.getState().load();

    adapter.answer = ownedAnswer();
    const first = store.getState().refresh();
    const second = store.getState().refresh();
    await flush();
    expect(adapter.calls).toBe(1);

    adapter.release();
    await first;
    expect(store.getState().isPro).toBe(true);
    await flush();
    expect(adapter.calls).toBe(2);

    adapter.answer = { kind: "not-owned" };
    adapter.release();
    await second;
    expect(store.getState().isPro).toBe(false);
  });

  describe("a database error", () => {
    /** A database whose reads, writes or both throw. */
    function brokenDb(broken: ("select" | "insert")[]) {
      const db = createTestDb();
      return new Proxy(db, {
        get(target, prop, receiver) {
          if (broken.includes(prop as "select" | "insert")) throw new Error("disk I/O error");
          return Reflect.get(target, prop, receiver);
        },
      });
    }

    it.each([["write", ["insert"]], ["read", ["select"]], ["read and write", ["select", "insert"]]] as const)(
      "on the %s still returns what the store answered, and never rejects",
      async (_name, broken) => {
        const adapter = new FakeProStoreAdapter();
        const store = createProStore(brokenDb([...broken]), adapter);
        adapter.answer = ownedAnswer();
        await expect(store.getState().refresh()).resolves.toEqual(ownedAnswer());
        adapter.answer = { kind: "not-owned" };
        await expect(store.getState().refresh()).resolves.toEqual({ kind: "not-owned" });
        adapter.answer = { kind: "no-answer" };
        await expect(store.getState().refresh()).resolves.toEqual({ kind: "no-answer" });
      },
    );
  });

  describe("dev source", () => {
    it("starts on Store, overrides in memory, and never writes the row", async () => {
      const db = createTestDb();
      const adapter = new FakeProStoreAdapter();
      adapter.answer = ownedAnswer();
      const store = createProStore(db, adapter);
      await store.getState().refresh();
      expect(store.getState().source).toBe("store");

      store.getState().setSource("free");
      expect(store.getState().isPro).toBe(false);
      const afterFree = createProStore(db, new FakeProStoreAdapter());
      afterFree.getState().load();
      expect(afterFree.getState().isPro).toBe(true);

      store.getState().setSource("store");
      expect(store.getState().isPro).toBe(true);
    });

    it("Pro overrides a free lifter, and Free hides a pending purchase", async () => {
      const db = createTestDb();
      const adapter = new FakeProStoreAdapter();
      adapter.answer = { kind: "owned", productId: "pro_lifetime", proof: "token-1", state: "pending" };
      const store = createProStore(db, adapter);
      store.getState().load();
      await store.getState().refresh();

      store.getState().setSource("pro");
      expect(store.getState().isPro).toBe(true);

      store.getState().setSource("free");
      expect(store.getState().isPro).toBe(false);
      expect(store.getState().pending).toBe(false);

      const nextLaunch = createProStore(db, new FakeProStoreAdapter());
      nextLaunch.getState().load();
      expect(nextLaunch.getState().isPro).toBe(false);
    });
  });

  describe("switched on", () => {
    function setup() {
      const db = createTestDb();
      const adapter = new FakeProStoreAdapter();
      const store = createProStore(db, adapter);
      store.getState().load();
      let fired = 0;
      store.getState().onSwitchedOn(() => (fired += 1));
      return { db, adapter, store, fired: () => fired };
    }

    it("fires once when a purchase turns Pro on, and not when an already-Pro lifter is still owned", async () => {
      const { adapter, store, fired } = setup();
      adapter.answer = ownedAnswer();
      await store.getState().refresh();
      expect(fired()).toBe(1);
      await store.getState().refresh();
      expect(fired()).toBe(1);
    });

    it("fires when the dev source switches a free lifter to Pro, like a purchase", () => {
      const { store, fired } = setup();
      store.getState().setSource("pro");
      expect(fired()).toBe(1);
      store.getState().setSource("pro");
      expect(fired()).toBe(1);
    });

    it("tells a listener whether the switch came from the dev source", async () => {
      const { adapter, store } = setup();
      const seen: boolean[] = [];
      store.getState().onSwitchedOn((info) => seen.push(info.fromDevSource));
      adapter.answer = ownedAnswer();
      await store.getState().refresh();
      store.getState().setSource("free");
      store.getState().setSource("pro");
      expect(seen).toEqual([false, true]);
    });

    it("doesn't fire for a purchase while the dev source already forces Pro", async () => {
      const { adapter, store, fired } = setup();
      store.getState().setSource("pro");
      expect(fired()).toBe(1);
      adapter.answer = ownedAnswer();
      await store.getState().refresh();
      expect(fired()).toBe(1);
    });

    it("waits while the dev source forces Free, then fires on the switch back to Store", async () => {
      const { adapter, store, fired } = setup();
      store.getState().setSource("free");
      adapter.answer = ownedAnswer();
      await store.getState().refresh();
      expect(fired()).toBe(0);
      store.getState().setSource("store");
      expect(fired()).toBe(1);
    });

    it("doesn't fire when a launch loads a cached Pro row", async () => {
      const { db, adapter, store } = setup();
      adapter.answer = ownedAnswer();
      await store.getState().refresh();

      const nextLaunch = createProStore(db, new FakeProStoreAdapter());
      let fired = 0;
      nextLaunch.getState().onSwitchedOn(() => (fired += 1));
      nextLaunch.getState().load();
      expect(nextLaunch.getState().isPro).toBe(true);
      expect(fired).toBe(0);
    });

    it("stops calling a listener once it unsubscribes", () => {
      const { store } = setup();
      let fired = 0;
      const unsubscribe = store.getState().onSwitchedOn(() => (fired += 1));
      unsubscribe();
      store.getState().setSource("pro");
      expect(fired).toBe(0);
    });
  });
});
