import { unlockScreen } from "./unlockScreen";

describe("when Pro unlocked shows", () => {
  it("Pro switches on with no workout open: show now", () => {
    expect(unlockScreen({ kind: "switched-on", workoutOpen: false })).toEqual({ show: true, owed: false });
  });

  it("Pro switches on while the live workout screen is open: owe it", () => {
    expect(unlockScreen({ kind: "switched-on", workoutOpen: true })).toEqual({ show: false, owed: true });
  });

  it("the workout ends (finished after the summary, or discarded) while owed: show now and clear the flag", () => {
    expect(unlockScreen({ kind: "workout-closed", owed: true, workoutInProgress: false })).toEqual({ show: true, owed: false });
  });

  it("the workout is minimized while owed: it is still in progress, so keep owing", () => {
    expect(unlockScreen({ kind: "workout-closed", owed: true, workoutInProgress: true })).toEqual({ show: false, owed: true });
  });

  it("leaving a workout with nothing owed shows nothing", () => {
    expect(unlockScreen({ kind: "workout-closed", owed: false, workoutInProgress: false })).toEqual({ show: false, owed: false });
  });

  it("a launch with the flag owed and no workout to resume: show now and clear the flag", () => {
    expect(unlockScreen({ kind: "launch", owed: true, workoutResumed: false })).toEqual({ show: true, owed: false });
  });

  it("a launch with the flag owed that resumes a workout: keep owing", () => {
    expect(unlockScreen({ kind: "launch", owed: true, workoutResumed: true })).toEqual({ show: false, owed: true });
  });

  it("a launch with nothing owed shows nothing", () => {
    expect(unlockScreen({ kind: "launch", owed: false, workoutResumed: false })).toEqual({ show: false, owed: false });
  });
});
