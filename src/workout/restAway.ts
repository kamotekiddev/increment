/** When the app was last not in the foreground: `to` is null while it is still away. */
export interface AwayTrace {
  from: number;
  to: number | null;
}

/** Updates the away trace for an app state change (`AppState` values), at clock time `now`. Start it with the state at mount. */
export function trackAway(trace: AwayTrace | null, state: string, now: number): AwayTrace | null {
  // Only the background counts as away. Inactive (a sheet, the app switcher) still shows the screen.
  if (state === "background") return trace && trace.to === null ? trace : { from: now, to: null };
  if (state !== "active") return trace;
  return trace && trace.to === null ? { from: trace.from, to: now } : trace;
}

/** True when the app was away (or on its way out) at the moment a rest ended, so there is nothing to buzz at. */
export function endedWhileAway(endsAt: number, trace: AwayTrace | null): boolean {
  if (!trace || trace.from >= endsAt) return false;
  return trace.to === null || trace.to > endsAt;
}
