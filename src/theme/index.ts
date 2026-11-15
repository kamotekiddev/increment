import { lightColors, type Colors } from "./tokens";

export * from "./tokens";

/** Light only for now; a dark set slots in here when the owner provides the tokens. */
export function useColors(): Colors {
  return lightColors;
}
