import { PAYWALL_PATH } from "@/pro/proRoutes";

import { EXPORT_PATH, exportRow } from "./exportPro";

describe("exportRow", () => {
  it("opens Export progress for a Pro lifter, with no tag", () => {
    expect(exportRow(true)).toEqual({ showProTag: false, path: EXPORT_PATH });
  });
  it("shows the Pro tag and opens the Paywall for a free lifter, and again after a refund", () => {
    expect(exportRow(false)).toEqual({ showProTag: true, path: PAYWALL_PATH });
  });
});
