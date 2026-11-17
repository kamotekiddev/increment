import { create } from "zustand";

import { adjustRest, type RestAction, type RestTimer } from "./restTimer";

interface RestState {
  /** The one running rest, or null. Lives outside the screen so minimizing the workout keeps it. */
  timer: RestTimer | null;
  /** The workout the timer belongs to, so a timer left from another workout can be dropped. */
  workoutId: number | null;
  /** Applies what `onSetToggled` decided. */
  apply: (action: RestAction, workoutId: number) => void;
  /** Adds or removes seconds on the running rest. `ended` when it reached zero (the timer stays for the caller to resolve). */
  adjust: (deltaSeconds: number, now: number) => { ended: boolean };
  clear: () => void;
}

export const useRestStore = create<RestState>((set, get) => ({
  timer: null,
  workoutId: null,
  apply: (action, workoutId) => {
    if (action.kind === "start" || action.kind === "replace") set({ timer: action.timer, workoutId });
    else if (action.kind === "cancel") set({ timer: null, workoutId: null });
  },
  adjust: (deltaSeconds, now) => {
    const { timer } = get();
    if (!timer) return { ended: false };
    const next = adjustRest(timer, deltaSeconds, now);
    set({ timer: next.timer });
    return { ended: next.ended };
  },
  clear: () => set({ timer: null, workoutId: null }),
}));
