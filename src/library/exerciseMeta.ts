import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

import { capitalise, muscleGroupsOf } from "./muscleGroups";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Pure: the muted line in the routine screens, the main muscle group then the equipment, e.g. "Chest · Barbell". */
export function exerciseMeta({ muscles, equipment }: { muscles: readonly string[]; equipment: string }): string {
  const group = muscleGroupsOf(muscles)[0];
  return [group, capitalise(equipment)].filter(Boolean).join(" · ");
}

/** Pure: one of two icons, a flexed arm for bodyweight exercises and a dumbbell for everything weighted. */
export function equipmentIcon(equipment: string): IconName {
  return equipment === "bodyweight" ? "arm-flex-outline" : "dumbbell";
}
