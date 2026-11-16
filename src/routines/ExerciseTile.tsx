import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { equipmentIcon } from "@/library/exerciseMeta";
import { radius, size, useColors } from "@/theme";

/** The 40 pt rounded tile with the weighted or bodyweight icon, at the start of every exercise row. */
export function ExerciseTile({ equipment }: { equipment: string }) {
  const colors = useColors();
  return (
    <View
      style={{
        width: size.tile, height: size.tile,
        borderRadius: radius.tile,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.sunk,
      }}
    >
      <MaterialCommunityIcons name={equipmentIcon(equipment)} size={22} color={colors.ink} />
    </View>
  );
}
