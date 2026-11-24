import { decideEntitlement, type EntitlementRow } from "./entitlementDecision";
import { PRO_PRODUCT_ID } from "./product";

const NOW = 1_764_000_000_000;
const EARLIER = 1_763_000_000_000;

const freeRow: EntitlementRow = { isPro: false, productId: null, proof: null, verifiedAt: null };
const proRow: EntitlementRow = { isPro: true, productId: PRO_PRODUCT_ID, proof: "token-1", verifiedAt: EARLIER };

const purchased = { kind: "owned", productId: PRO_PRODUCT_ID, proof: "token-2", state: "purchased" } as const;

describe("entitlement decision", () => {
  it("turns Pro on when there is no row yet and the store says owned and purchased", () => {
    const result = decideEntitlement(null, purchased, NOW);
    expect(result.row).toEqual({ isPro: true, productId: "pro_lifetime", proof: "token-2", verifiedAt: NOW });
    expect(result.write).toBe(true);
    expect(result.pending).toBe(false);
    expect(result.switchedOn).toBe(true);
  });

  it("turns Pro on from a free row when the store says owned and purchased", () => {
    const result = decideEntitlement(freeRow, purchased, NOW);
    expect(result.row.isPro).toBe(true);
    expect(result.switchedOn).toBe(true);
  });

  it("keeps Pro and moves verified_at forward when an already-Pro lifter is still owned", () => {
    const result = decideEntitlement(proRow, purchased, NOW);
    expect(result.row).toEqual({ isPro: true, productId: "pro_lifetime", proof: "token-2", verifiedAt: NOW });
    expect(result.write).toBe(true);
    expect(result.switchedOn).toBe(false);
  });

  it("turns Pro off and clears the proof when the store says not owned (a refund)", () => {
    const result = decideEntitlement(proRow, { kind: "not-owned" }, NOW);
    expect(result.row).toEqual({ isPro: false, productId: null, proof: null, verifiedAt: NOW });
    expect(result.write).toBe(true);
    expect(result.pending).toBe(false);
    expect(result.switchedOn).toBe(false);
  });

  it("leaves a Pro row untouched when the store gives no answer", () => {
    const result = decideEntitlement(proRow, { kind: "no-answer" }, NOW);
    expect(result.row).toEqual(proRow);
    expect(result.write).toBe(false);
    expect(result.pending).toBe(false);
    expect(result.switchedOn).toBe(false);
  });

  it("stays free when the store gives no answer", () => {
    expect(decideEntitlement(freeRow, { kind: "no-answer" }, NOW)).toEqual({
      row: freeRow,
      write: false,
      pending: false,
      switchedOn: false,
    });
    const noRow = decideEntitlement(null, { kind: "no-answer" }, NOW);
    expect(noRow.row.isPro).toBe(false);
    expect(noRow.write).toBe(false);
  });

  it("reports pending and stays free while the payment hasn't cleared, then turns Pro on once it is purchased", () => {
    const pendingAnswer = { kind: "owned", productId: PRO_PRODUCT_ID, proof: "token-3", state: "pending" } as const;
    const waiting = decideEntitlement(freeRow, pendingAnswer, NOW);
    expect(waiting).toEqual({ row: freeRow, write: false, pending: true, switchedOn: false });

    const cleared = decideEntitlement(waiting.row, { ...pendingAnswer, state: "purchased" }, NOW + 60_000);
    expect(cleared.row).toEqual({ isPro: true, productId: "pro_lifetime", proof: "token-3", verifiedAt: NOW + 60_000 });
    expect(cleared.pending).toBe(false);
    expect(cleared.switchedOn).toBe(true);
  });

  it("turns off a hand-edited row (is_pro 1, no proof) when the store says not owned", () => {
    const handEdited: EntitlementRow = { isPro: true, productId: null, proof: null, verifiedAt: null };
    const result = decideEntitlement(handEdited, { kind: "not-owned" }, NOW);
    expect(result.row).toEqual({ isPro: false, productId: null, proof: null, verifiedAt: NOW });
    expect(result.write).toBe(true);
  });
});
