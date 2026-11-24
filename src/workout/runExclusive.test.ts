import { runExclusive } from "./runExclusive";

describe("runExclusive", () => {
  it("ignores a second call while the first is still running", async () => {
    const flag = { current: false };
    let release!: () => void;
    const task = jest.fn(() => new Promise<void>((resolve) => (release = resolve)));
    const first = runExclusive(flag, task, jest.fn());
    await runExclusive(flag, task, jest.fn());
    expect(task).toHaveBeenCalledTimes(1);
    release();
    await first;
    expect(flag.current).toBe(false);
  });

  it("reports a rejection instead of throwing, and lets the next call run", async () => {
    const flag = { current: false };
    const onError = jest.fn();
    await expect(runExclusive(flag, () => Promise.reject(new Error("db")), onError)).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(1);
    const next = jest.fn(async () => {});
    await runExclusive(flag, next, onError);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
