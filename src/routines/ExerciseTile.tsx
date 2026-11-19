import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { equipmentIcon } from "@/library/exerciseMeta";
import { radius, size, useColors } from "@/theme";

/**
 * The rounded tile with the weighted or bodyweight icon, at the start of every exercise row:
 * 40 pt in the routine screens, 46 pt (`large`) in the Library.
 */
export function ExerciseTile({ equipment, large = false }: { equipment: string; large?: boolean }) {
  const colors = useColors();
  const side = large ? size.tileLg : size.tile;
  return (
    <View
      style={{
        width: side, height: side,
        borderRadius: large ? radius.tileLg : radius.tile,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.sunk,
      }}
    >
      <MaterialCommunityIcons name={equipmentIcon(equipment)} size={large ? 24 : 22} color={colors.ink} />
    </View>
  );
}
