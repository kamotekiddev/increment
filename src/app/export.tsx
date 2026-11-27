import { Redirect } from "expo-router";

import { ExportScreen } from "@/export/ExportScreen";
import { useIsPro } from "@/pro";
import { lockedTapDestination } from "@/progress/proTap";

/** Export progress (Pro), opened from Your data. A free lifter (or one whose Pro lapses while it is open) goes to the Paywall. */
export default function ExportRoute() {
  const destination = lockedTapDestination(useIsPro());
  return destination ? <Redirect href={destination} /> : <ExportScreen />;
}
