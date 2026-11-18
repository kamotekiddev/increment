# 03: Buzz and auto-advance at zero

**What to build:** The nudge at zero: one haptic buzz, and when the exercise is finished and the lifter is still on it, the screen moves to the next exercise with an open set.

**Blocked by:** 02

**Status:** built

- [x] `expo-haptics` added with `npx expo install` after checking the SDK 58 docs
- [x] One buzz when the countdown reaches zero while the app is open
- [x] With an open set left in the exercise: buzz, panel hides, screen does not move
- [x] With the exercise finished and the lifter still on it: buzz, then the screen shows the next exercise with an open set, wrapping past the end
- [x] With the lifter on another exercise: buzz only, nothing moves
- [x] A rest that ended while the app was in the background resolves on return with no buzz, with the same hide or advance outcome
- [x] Type check, lint and tests pass
