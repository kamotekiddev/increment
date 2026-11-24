/** The Paywall and Pro unlocked, as route names in the root stack and as paths. */
export const PAYWALL_ROUTE = "paywall";
export const PRO_UNLOCKED_ROUTE = "pro-unlocked";
export const PAYWALL_PATH = "/paywall";
export const PRO_UNLOCKED_PATH = "/pro-unlocked";

/** The live workout (/workout/<id>), its Offer and its summary: Pro unlocked never shows over these. */
const WORKOUT_FLOW_PATH = /^\/workout\/(?:offer\/|summary\/)?[^/]+$/;

/** Whether the focused screen is the live workout or one of the screens that close it (Offer, summary). */
export function inWorkoutFlow(pathname: string): boolean {
  return WORKOUT_FLOW_PATH.test(pathname);
}

/** How many Pro screens (Paywall, Pro unlocked) sit at the top of the stack, so Start using Pro can dismiss them all. */
export function proScreensOnTop(routeNames: readonly string[]): number {
  let count = 0;
  for (let i = routeNames.length - 1; i >= 0; i--) {
    if (routeNames[i] !== PAYWALL_ROUTE && routeNames[i] !== PRO_UNLOCKED_ROUTE) break;
    count++;
  }
  return count;
}
