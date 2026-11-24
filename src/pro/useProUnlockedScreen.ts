import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";

import { db } from "@/db/client";
import { findInProgressWorkout } from "@/workout/inProgressQueries";
import { lastActivity, shouldAutoOpen } from "@/workout/resume";

import { readUnlockScreenOwed, writeUnlockScreenOwed } from "./entitlementRow";
import { inWorkoutFlow, PAYWALL_PATH, PRO_UNLOCKED_PATH } from "./proRoutes";
import { unlockScreen, type UnlockScreenAction } from "./unlockScreen";
import { proStore } from "./usePro";

/** Opens Pro unlocked: in place of the Paywall when that is on top, otherwise over the current screen. */
function openProUnlocked(pathname: string): void {
  if (pathname === PRO_UNLOCKED_PATH) return;
  if (pathname === PAYWALL_PATH) router.replace(PRO_UNLOCKED_PATH);
  else router.push(PRO_UNLOCKED_PATH);
}

/** Stores the owed flag when it changed, then shows Pro unlocked if the action says so. */
function act(action: UnlockScreenAction, owedBefore: boolean, pathname: string): void {
  try {
    if (action.owed !== owedBefore) writeUnlockScreenOwed(db, action.owed);
  } catch {
    // A failed write only risks showing the screen again or not at all; never block on it.
  }
  if (action.show) openProUnlocked(pathname);
}

/**
 * Shows Pro unlocked each time Pro switches on, never over the live workout (nor its Offer or summary).
 * During one it is owed (`unlock_screen_owed`) and shows once the lifter leaves a workout that is over:
 * finished (after the summary) or discarded. A minimized workout keeps it owed. Mount once in the root
 * layout, which is never frozen, so the focused path is always current here.
 *
 * `ready` is whether the navigator is drawn. A switch before that (a launch check answering early) is
 * owed instead, and `useProUnlockedOnLaunch` shows it once the first screen mounts.
 */
export function useProUnlockedScreen(ready: boolean): void {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const readyRef = useRef(ready);
  const wasInWorkout = useRef(inWorkoutFlow(pathname));

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(
    () =>
      proStore.getState().onSwitchedOn(() => {
        let owed = false;
        try {
          owed = readUnlockScreenOwed(db);
        } catch {
          // Treat an unreadable flag as not owed.
        }
        // Before the navigator is drawn nothing can show yet, so it is held back the same way as by a workout.
        const workoutOpen = !readyRef.current || inWorkoutFlow(pathRef.current);
        act(unlockScreen({ kind: "switched-on", workoutOpen }), owed, pathRef.current);
      }),
    [],
  );

  useEffect(() => {
    pathRef.current = pathname;
    const inWorkout = inWorkoutFlow(pathname);
    const left = wasInWorkout.current && !inWorkout;
    wasInWorkout.current = inWorkout;
    if (!left) return;
    try {
      const owed = readUnlockScreenOwed(db);
      if (!owed) return;
      const action = unlockScreen({ kind: "workout-closed", owed, workoutInProgress: findInProgressWorkout() !== null });
      act(action, owed, pathname);
    } catch {
      // The flag stays owed and shows at the next launch.
    }
  }, [pathname]);
}

/** True once this app process has handled its launch. */
let launchHandled = false;

/**
 * On a cold launch only: shows a Pro unlocked still owed from a workout the app was killed during, unless
 * this launch resumes a workout (the same 12-hour test as crash resume), which then holds it until it is
 * over. Mount next to `useResumeOnLaunch`, inside the navigator, so the push lands.
 */
export function useProUnlockedOnLaunch(): void {
  useEffect(() => {
    if (launchHandled) return;
    launchHandled = true;
    try {
      const owed = readUnlockScreenOwed(db);
      if (!owed) return;
      const workout = findInProgressWorkout();
      const workoutResumed = workout !== null && shouldAutoOpen(lastActivity(workout), Date.now());
      act(unlockScreen({ kind: "launch", owed, workoutResumed }), owed, "/");
    } catch {
      // The flag stays owed for the next launch.
    }
  }, []);
}
