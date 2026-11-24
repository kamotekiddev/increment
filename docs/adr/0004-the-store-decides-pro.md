# 0004: The store decides Pro; the entitlements row is only a fallback

**Status:** accepted (owner decision 2026-11-24, Phase 3 feature 1 grilling).

## Context

Pro is a one-time purchase that must work with no network, and the app has no backend (product rule 6). The Phase 3 map also asked that "editing the table alone cannot unlock it". Without a server, the phone itself has to decide at launch whether the lifter owns Pro. There were two ways to do that: ask the store's on-device purchase list, or check the signature of the stored proof (Apple's signed transaction, Google's signed purchase data) in our own code.

## Decision

- **Ask the store.** On a cold launch, on return to the foreground, after a purchase and after Restore purchase, the app asks the phone's store which purchases it owns. StoreKit 2 answers from its own signed cache in the operating system. Play Billing answers from the Play Store app's local cache. Neither needs a network.
- **The answer is written to `entitlements`:**
  - "Owned" sets `is_pro = 1` with `product_id`, `proof` (the iOS signed transaction or the Android purchase token) and `verified_at`.
  - A definite "not owned" sets `is_pro = 0`. That is how a refund, or a hand edit of the table, is undone.
  - No answer (an error, a timeout, no store app) leaves the row as it is.
- **Never block on the store.** At startup the cached row is read into memory first, so screens draw right away. The store's answer updates it when it arrives.
- **Acknowledge Google purchases** right after purchase, and again at launch for any purchase still unacknowledged, so Google never refunds one after 3 days.

## Alternatives considered

- **Verify the stored proof's signature on the phone.** That means checking Apple's JWS certificate chain up to Apple's root, and Google's RSA signature with the app's license key, in JS. It would close the gap below, but it needs a crypto/X.509 dependency and signature code for two stores. Anyone with a rooted phone can patch the JS anyway, so it only stops casual edits of the table.
- **Both, with the signature check only when the store can't answer.** Rejected for the same cost.

## Consequences

- A hand edit of `is_pro` holds only on launches where the store can't answer. The known case is an Android phone with the Play Store app disabled or signed out. This gap is accepted.
- A refund takes effect at the first launch or foreground after the store's own cache learns of it, which needs that phone to have been online.
- It's still unverified that the purchase library's restore call reads StoreKit 2's current entitlements and Play's cached purchase query while offline. It has to be checked on a device before anything is built on it.
