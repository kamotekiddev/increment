import { FREE_ROUTINE_LIMIT } from "./routineLimit";

/** Pop-up wording, from the `RoutineLimit` board. The benefits follow the Paywall table. */
export function limitSheetTitle(): string {
  return `You’ve used your ${FREE_ROUTINE_LIMIT} free routines`;
}

export const LIMIT_SHEET_BODY = "Get unlimited routines with Pro. One payment, yours forever.";

export const LIMIT_SHEET_BENEFITS = [
  "Unlimited routines",
  "Custom exercises and plate calculator",
  "Charts, records and automatic backups",
] as const;
