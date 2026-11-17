import { useRestStore } from "./restStore";
import type { RestTimer } from "./restTimer";

const timer = (endsAt: number): RestTimer => ({ endsAt, totalMs: 90000, set: { exerciseIndex: 0, setIndex: 0 } });

beforeEach(() => useRestStore.getState().clear());

describe("restStore", () => {
  it("starts empty", () => {
    expect(useRestStore.getState().timer).toBeNull();
  });
  it("applies start and replace, keeps on keep and none, clears on cancel", () => {
    const { apply } = useRestStore.getState();
    apply({ kind: "start", timer: timer(100) }, 7);
    expect(useRestStore.getState()).toMatchObject({ timer: timer(100), workoutId: 7 });
    apply({ kind: "replace", timer: timer(200) }, 7);
    expect(useRestStore.getState().timer).toEqual(timer(200));
    apply({ kind: "keep" }, 7);
    apply({ kind: "none" }, 7);
    expect(useRestStore.getState().timer).toEqual(timer(200));
    apply({ kind: "cancel" }, 7);
    expect(useRestStore.getState().timer).toBeNull();
  });
  it("adjusts the running rest and reports when it ended", () => {
    useRestStore.getState().apply({ kind: "start", timer: timer(10000) }, 1);
    expect(useRestStore.getState().adjust(15, 0)).toEqual({ ended: false });
    expect(useRestStore.getState().timer?.endsAt).toBe(25000);
    expect(useRestStore.getState().adjust(-15, 20000)).toEqual({ ended: true });
  });
  it("adjust with no timer does nothing", () => {
    expect(useRestStore.getState().adjust(15, 0)).toEqual({ ended: false });
  });
  it("drops another workout's timer when a keep or none arrives from a different workout", () => {
    useRestStore.getState().apply({ kind: "start", timer: timer(100) }, 1);
    useRestStore.getState().apply({ kind: "keep" }, 2);
    expect(useRestStore.getState()).toMatchObject({ timer: null, workoutId: null });
    useRestStore.getState().apply({ kind: "start", timer: timer(100) }, 1);
    useRestStore.getState().apply({ kind: "none" }, 2);
    expect(useRestStore.getState().timer).toBeNull();
  });
});
