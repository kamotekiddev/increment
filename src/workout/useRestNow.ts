import { useEffect, useState } from "react";

import { msUntilTextChanges } from "./restTimer";

/**
 * The current time in ms, updated exactly when the rest's countdown text changes (and when it ends),
 * not on a free-running 1 s interval. Idle while there is no rest.
 */
export function useRestNow(endsAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endsAt === null) return;
    let id: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      const wait = msUntilTextChanges(endsAt - t);
      if (wait !== null) id = setTimeout(tick, wait);
    };
    tick();
    return () => clearTimeout(id);
  }, [endsAt]);
  return now;
}
