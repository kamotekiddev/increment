# 03: Create the Pro product in both stores

**What to build:** Owner setup in the store consoles, so purchases can be tested on a phone.

**Blocked by:** 02 (the Android build on the internal track).

**Status:** ready-for-human

- [ ] The bundle ID and Android package from ticket 02 are registered in each console.
- [ ] App Store Connect: a **Non-Consumable** in-app purchase with Product ID `pro_lifetime`, reference name "Increment Pro", a price of ₱300 (the peso base price; the nearest price point if ₱300 isn't offered), a display name and a description. The Paid Apps agreement is signed. At least one sandbox tester exists.
- [ ] Play Console: a one-time product `pro_lifetime` with a ₱300 base price (other countries converted by Play). At least one license tester exists, with the "slow" test cards available for pending purchases.
- [ ] The product ID is identical on both stores. It can never be renamed or reused once created.
