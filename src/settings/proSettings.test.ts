import { PRO_SOURCE_OPTIONS, proCardState } from "./proSettings";

describe("proCardState", () => {
  it("offers Unlock with a chevron to a free lifter, and opens the Paywall", () => {
    expect(proCardState(false)).toEqual({ label: "Unlock", tappable: true, trailing: "chevron" });
  });

  it("shows Unlocked with a check to a Pro lifter, and can't be tapped", () => {
    expect(proCardState(true)).toEqual({ label: "Unlocked", tappable: false, trailing: "check" });
  });
});

describe("PRO_SOURCE_OPTIONS", () => {
  it("reads Store / Pro / Free, in that order", () => {
    expect(PRO_SOURCE_OPTIONS).toEqual([
      { value: "store", label: "Store" },
      { value: "pro", label: "Pro" },
      { value: "free", label: "Free" },
    ]);
  });
});
