# 0001: Weights are stored in kg as full-precision numbers, with the entered unit

**Status:** accepted

## Context

Lifters train in kg or lb, and some switch between gyms that use different units. Progression, records and charts all need weights that compare and add up. Pounds converted to kg are rarely tidy numbers (135 lb is 61.2349… kg).

## Decision

Every weight is stored once, in kg, as a full-precision number. The unit the lifter typed is stored beside it (`entered_unit`). Conversion happens only for display, with the exact definition 1 lb = 0.45359237 kg. Display rounds to 0.01 and drops trailing zeros, so 135 lb is stored as 61.2349… and shown as 135. A converted value is never written back.

## Alternatives considered

- **Store the value in the unit it was entered in.** Records and charts across a unit switch would need conversion everywhere, and a lifter who changes unit would have mixed data.
- **Round the stored kg (for example to 0.01).** Pounds would drift: a 135 lb entry could come back as 135.01 lb, and repeated switching could change stored data.

## Consequences

- Switching kg and lb any number of times never changes stored data, which is a Phase 2 gate.
- The overload engine and records work in one unit.
- A lb lifter's Jump (for example 5 lb) is a kg value that is not tidy. Rounding to the Jump uses a small tolerance so it never lands one multiple off.
- This is hard to reverse once users have data, which is why it is recorded here.
