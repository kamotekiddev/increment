import { routineNameMessage } from "./routineNameMessage";

describe("routineNameMessage", () => {
  it("has a message for each rejection", () => {
    expect(routineNameMessage("empty")).toBe("Give your routine a name.");
    expect(routineNameMessage("too-long")).toBe("Keep the name to 40 characters or fewer.");
    expect(routineNameMessage("duplicate")).toBe("You already have a routine with that name.");
  });
});
