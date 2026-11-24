# Increment

**Increment tells you exactly when to add weight. Free, offline, and paid for once.**

Increment is an offline mobile workout tracker for iOS and Android, built around progressive overload. You pick exercises from a searchable library with how-to instructions, build your own routines, log every set, and the app tells you what to load next time.

> Status: **design complete, build not started.** This repo holds the product and technical documentation. App code will be added in Phase 0 (see [roadmap](docs/roadmap.md)).

## What it does

- **Exercise library**: search and filter by muscle and equipment, with step-by-step instructions for each exercise.
- **Custom routines**: name a routine, choose its days, and set sets, reps and rest for each exercise.
- **Live workout logging**: a set table showing your previous set, a rest timer, and a target banner.
- **Progressive overload**: each exercise has a rule ("add 2.5 kg once every set hits 8 reps"). Increment sets next session's target and rounds it to plates you can actually load.
- **kg / lb as a global preference**: each set is saved exactly as typed, with its unit, so switching gyms or units never changes your history.
- **Fully offline**: no account and no server; your data stays on the phone.
- **One-time Pro unlock**: no subscription.

## Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Exercise library | ✓ | ✓ |
| Log workouts | Unlimited | Unlimited |
| Routines | 2 | Unlimited |
| Charts and records | – | ✓ |
| Custom exercises | – | ✓ |
| Move to a new phone (backup and restore) | – | ✓ |
| Automatic backups (choose how often) | – | ✓ |
| Export to CSV or PDF | – | ✓ |
| Plate calculator and warm-ups | – | ✓ |

Pro is a one-time, non-consumable in-app purchase that works offline. The price is still to be decided.

## Documentation

| Doc | What's in it |
|---|---|
| [Product](docs/product.md) | Vision, who it's for, every feature in detail, the free/Pro split |
| [Screens](docs/screens.md) | Every designed screen, grouped by flow, and how they connect |
| [Design system](docs/design-system.md) | Colors, type, components, principles |
| [Architecture](docs/architecture.md) | Tech stack, data model, overload engine, units, offline purchases, backups |
| [Roadmap](docs/roadmap.md) | Six phases to launch in about 18 weeks, each with a gate |
| [Positioning](docs/positioning.md) | How Increment differs from Strong, Hevy, Alpha Progression and Fitbod |
| [Decisions](docs/decisions.md) | What's decided and what's still open |

## Design links

- Design canvas (all screens): https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e
- Design system: https://claude.ai/artifact/2eEe2GhySr9xx6LqTbmGhs
- Build plan: https://claude.ai/artifact/3kxR4KCu53v3WBdmfm99Gc

## Planned stack

Expo (React Native) + TypeScript · Expo Router · SQLite (expo-sqlite) + Drizzle ORM · Zustand · Victory Native · expo-iap · expo-notifications · EAS Build/Submit · Jest + Maestro. See [architecture](docs/architecture.md).
