import { remindersSwitchDecision, shouldAskPermission } from "./permissionDecision";

describe("shouldAskPermission", () => {
  it("asks only while the OS has never been asked", () => {
    expect(shouldAskPermission("undetermined")).toBe(true);
    expect(shouldAskPermission("granted")).toBe(false);
    expect(shouldAskPermission("denied")).toBe(false);
  });
});

describe("remindersSwitchDecision", () => {
  it("asks when undetermined, turns on when granted, stays off when denied", () => {
    expect(remindersSwitchDecision("undetermined")).toBe("ask");
    expect(remindersSwitchDecision("granted")).toBe("on");
    expect(remindersSwitchDecision("denied")).toBe("stay-off");
  });
});
