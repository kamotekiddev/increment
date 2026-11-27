import { PAYWALL_PATH } from "@/pro/proRoutes";

/** The Export progress screen. */
export const EXPORT_PATH = "/export";

/** The Export row on Your data: a free lifter gets a grey Pro tag and the Paywall, never the screen. */
export function exportRow(isPro: boolean): { showProTag: boolean; path: typeof EXPORT_PATH | typeof PAYWALL_PATH } {
  return isPro ? { showProTag: false, path: EXPORT_PATH } : { showProTag: true, path: PAYWALL_PATH };
}
