import { routinesRowFree } from "@/pro/paywallState";

import { limitSheetTitle } from "./limitSheetText";
import { FREE_ROUTINE_LIMIT } from "./routineLimit";
import { routineCounter, routineCounterParts } from "./routineListText";

describe("every piece of free routine limit copy carries the constant", () => {
  it("has the limit in the pop-up title, the counter and the Paywall row", () => {
    const value = String(FREE_ROUTINE_LIMIT);
    expect(limitSheetTitle()).toContain(value);
    expect(routineCounter(0, false)).toContain(value);
    expect(routineCounterParts(0, false).strong).toContain(value);
    expect(routinesRowFree()).toContain(value);
  });
});
