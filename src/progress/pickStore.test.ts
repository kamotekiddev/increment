import { pickStore } from "./pickStore";

describe("remembered pick", () => {
  beforeEach(() => pickStore.getState().clear());

  it("starts with no pick, so Progress opens on the default exercise", () => {
    expect(pickStore.getState().exerciseId).toBeNull();
  });

  it("keeps the picked exercise", () => {
    pickStore.getState().pick(7);
    expect(pickStore.getState().exerciseId).toBe(7);
  });

  it("is dropped by clear", () => {
    pickStore.getState().pick(7);
    pickStore.getState().clear();
    expect(pickStore.getState().exerciseId).toBeNull();
  });
});
