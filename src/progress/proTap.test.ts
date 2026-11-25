import { PAYWALL_PATH } from "@/pro/proRoutes";

import { lockedTapDestination } from "./proTap";

describe("lockedTapDestination", () => {
  it("sends a free lifter to the Paywall", () => {
    expect(lockedTapDestination(false)).toBe(PAYWALL_PATH);
  });

  it("opens nothing for a Pro lifter (the Pro screens own that tap)", () => {
    expect(lockedTapDestination(true)).toBeNull();
  });
});
