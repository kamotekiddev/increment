import { Redirect } from "expo-router";

import { useIsPro } from "@/pro";
import { lockedTapDestination } from "@/progress/proTap";
import { AllRecordsScreen } from "@/records/AllRecordsScreen";

/**
 * All records (Pro): reached from "See all records" on Progress. A free lifter (or one whose Pro lapses while it is
 * open) is sent to the Paywall instead.
 */
export default function RecordsRoute() {
  const destination = lockedTapDestination(useIsPro());
  return destination ? <Redirect href={destination} /> : <AllRecordsScreen />;
}
