import { notificationsOffNote, remindersSwitchDecision, shouldAskPermission } from "./permissionDecision";

describe("notificationsOffNote", () => {
  it("shows while reminders are on and notifications are blocked", () => {
    expect(notificationsOffNote({ remindersOn: true, granted: false, askedDenied: false })).toBe(true);
    expect(notificationsOffNote({ remindersOn: true, granted: true, askedDenied: false })).toBe(false);
  });
  it("shows while off only after a denied tap, and goes once allowed", () => {
    expect(notificationsOffNote({ remindersOn: false, granted: false, askedDenied: true })).toBe(true);
    expect(notificationsOffNote({ remindersOn: false, granted: false, askedDenied: false })).toBe(false);
    expect(notificationsOffNote({ remindersOn: false, granted: true, askedDenied: true })).toBe(false);
  });
  it("waits for the first read before showing anything", () => {
    expect(notificationsOffNote({ remindersOn: true, granted: null, askedDenied: false })).toBe(false);
  });
});

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
