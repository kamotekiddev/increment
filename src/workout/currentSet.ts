import type { SetRow } from "./types";

/** The Current set: the first set of the exercise that is not done. Null when every set is done. */
export function currentSetIndex(rows: Pick<SetRow, "done">[]): number | null {
  const i = rows.findIndex((r) => !r.done);
  return i === -1 ? null : i;
}
