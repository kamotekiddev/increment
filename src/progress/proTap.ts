import { PAYWALL_PATH } from "@/pro/proRoutes";

/**
 * Where a tap on a Pro-locked Progress control (the blurred chart, "See all records") goes: a free lifter
 * opens the Paywall; a Pro lifter opens nothing here (the live chart and All records are their own screens).
 * The one place Progress turns the Pro answer into a destination.
 */
export function lockedTapDestination(isPro: boolean): typeof PAYWALL_PATH | null {
  return isPro ? null : PAYWALL_PATH;
}
