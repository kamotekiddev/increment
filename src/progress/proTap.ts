import { PAYWALL_PATH } from "@/pro/proRoutes";

/** Where "See all records" goes: All records for a Pro lifter, the Paywall for a free one. */
export const ALL_RECORDS_PATH = "/records";

/**
 * Where a tap on a Pro-locked Progress control (the blurred chart, "See all records") goes: a free lifter
 * opens the Paywall; a Pro lifter opens nothing here (the live chart and All records are their own screens).
 * Also what the All records route checks, so a free lifter is sent to the Paywall.
 */
export function lockedTapDestination(isPro: boolean): typeof PAYWALL_PATH | null {
  return isPro ? null : PAYWALL_PATH;
}

/** What Progress shows and where its Pro controls go. The one place Progress turns the Pro answer into a destination. */
export interface ProgressPro {
  /** The chart slot: the live chart for a Pro lifter, the blurred preview for a free one. */
  chart: "live" | "preview";
  /** Where a tap on the blurred chart goes; null when the chart is live. */
  chartTap: typeof PAYWALL_PATH | null;
  /** Where "See all records" goes. */
  allRecords: typeof ALL_RECORDS_PATH | typeof PAYWALL_PATH;
}

export function progressPro(isPro: boolean): ProgressPro {
  return {
    chart: isPro ? "live" : "preview",
    chartTap: lockedTapDestination(isPro),
    allRecords: isPro ? ALL_RECORDS_PATH : PAYWALL_PATH,
  };
}
