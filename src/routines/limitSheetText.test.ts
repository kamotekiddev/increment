import { FREE_ROUTINE_LIMIT } from "./routineLimit";
import { LIMIT_SHEET_BENEFITS, LIMIT_SHEET_BODY, limitSheetTitle } from "./limitSheetText";

describe("limit pop-up text", () => {
  it("titles the pop-up with the free limit", () => {
    expect(limitSheetTitle()).toBe("You’ve used your 3 free routines");
    expect(limitSheetTitle()).toContain(String(FREE_ROUTINE_LIMIT));
  });

  it("pitches Pro and does not tell the lifter to delete", () => {
    expect(LIMIT_SHEET_BODY).toBe("Get unlimited routines with Pro. One payment, yours forever.");
    expect(LIMIT_SHEET_BODY.toLowerCase()).not.toContain("delete");
  });

  it("lists the three benefits from the board", () => {
    expect(LIMIT_SHEET_BENEFITS).toEqual([
      "Unlimited routines",
      "Custom exercises and export",
      "Charts, records and automatic backups",
    ]);
  });
});
