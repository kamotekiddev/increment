import { PAYWALL_PATH } from "@/pro/proRoutes";

import { ALL_RECORDS_PATH, lockedTapDestination, progressPro } from "./proTap";

describe("lockedTapDestination", () => {
  it("sends a free lifter to the Paywall", () => {
    expect(lockedTapDestination(false)).toBe(PAYWALL_PATH);
  });

  it("opens nothing for a Pro lifter (the Pro screens own that tap)", () => {
    expect(lockedTapDestination(true)).toBeNull();
  });
});

describe("progressPro", () => {
  it("gives a free lifter the preview, the Paywall on both taps", () => {
    expect(progressPro(false)).toEqual({ chart: "preview", chartTap: PAYWALL_PATH, allRecords: PAYWALL_PATH });
  });

  it("gives a Pro lifter the live chart and All records", () => {
    expect(progressPro(true)).toEqual({ chart: "live", chartTap: null, allRecords: ALL_RECORDS_PATH });
  });
});
