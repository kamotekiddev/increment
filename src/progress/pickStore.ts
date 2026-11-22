import { createStore } from "zustand/vanilla";

export interface PickState {
  /** The exercise the lifter picked on Progress; null while Progress shows the default exercise. */
  exerciseId: number | null;
  pick: (exerciseId: number) => void;
  /** Drops the pick so Progress opens on the default exercise again (a workout was finished). */
  clear: () => void;
}

/** The remembered Progress pick, in memory only: it survives tab switches and not an app restart. */
export const pickStore = createStore<PickState>((set) => ({
  exerciseId: null,
  pick: (exerciseId) => set({ exerciseId }),
  clear: () => set({ exerciseId: null }),
}));
