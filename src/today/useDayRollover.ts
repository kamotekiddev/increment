import { useEffect, useState } from "react";
import { AppState } from "react-native";

/** Local midnight that ends the day containing `now`, epoch ms. */
export function nextMidnight(now: number): number {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}

/**
 * A counter that goes up whenever the local date changes while the app is open: a timer fires at
 * the next local midnight, and the date is re-checked when the app returns to the foreground
 * (timers do not run reliably while backgrounded). Feed it to `useTodayData`.
 */
export function useDayRollover(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let day = new Date().toDateString();
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const now = new Date();
      if (now.toDateString() !== day) {
        day = now.toDateString();
        setCount((c) => c + 1);
      }
      clearTimeout(timer);
      // A little past midnight so the clock has surely rolled over.
      timer = setTimeout(check, nextMidnight(now.getTime()) - now.getTime() + 1000);
    };
    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);
  return count;
}
