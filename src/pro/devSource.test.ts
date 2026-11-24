import { applyDevSource } from "./devSource";

describe("dev source", () => {
  it("Store passes the stored value through", () => {
    expect(applyDevSource({ isPro: true, pending: false }, "store")).toEqual({ isPro: true, pending: false });
    expect(applyDevSource({ isPro: false, pending: true }, "store")).toEqual({ isPro: false, pending: true });
  });

  it("Pro overrides a free stored value", () => {
    expect(applyDevSource({ isPro: false, pending: false }, "pro").isPro).toBe(true);
  });

  it("Free overrides a Pro stored value and ignores pending", () => {
    expect(applyDevSource({ isPro: true, pending: false }, "free")).toEqual({ isPro: false, pending: false });
    expect(applyDevSource({ isPro: false, pending: true }, "free")).toEqual({ isPro: false, pending: false });
  });
});
