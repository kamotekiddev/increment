/** Pure decisions for the rest-over notification. No I/O. */

/** Title and body of the rest-over notification. `nextUp` is the panel's "Next up" line. */
export function restNotificationContent(nextUp: string | null): { title: string; body: string } {
  return { title: "Rest over", body: nextUp ?? "Time for your next set" };
}

/** Whole seconds from `now` to `endsAt`, rounded up, or null when it is not in the future. */
export function secondsUntil(endsAt: number, now: number): number | null {
  const ms = endsAt - now;
  return ms > 0 ? Math.ceil(ms / 1000) : null;
}
