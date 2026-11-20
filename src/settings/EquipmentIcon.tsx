import { View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { radius, size, useColors } from "@/theme";

import type { JumpKey } from "./jumps";

/** Line icons for the Weight jumps rows, drawn on a 24 grid as in the design canvas. */
function Glyph({ jump }: { jump: JumpKey }) {
  switch (jump) {
    case "barbell":
      return <Path d="M2 12h20M6 7v10M3.5 9.5v5M18 7v10M20.5 9.5v5" />;
    case "dumbbell":
      return <Path d="M8.5 12h7M7.5 8v8M5 9.5v5M16.5 8v8M19 9.5v5" />;
    case "machine":
      return (
        <>
          <Rect x={6} y={3.5} width={12} height={17} rx={2} />
          <Path d="M9.5 8h5M9.5 12h5M9.5 16h5" />
        </>
      );
    case "cable":
      return <Path d="M5 4h14M12 4v8M9 12h6l-1 7h-4z" />;
    case "bodyweight":
      // A plate hanging from a dip belt chain.
      return (
        <>
          <Path d="M7 3.5l5 5 5-5" />
          <Circle cx={12} cy={15} r={6} />
          <Circle cx={12} cy={15} r={1.5} />
        </>
      );
  }
}

/** The equipment icon in a sunk rounded tile. */
export function EquipmentIcon({ jump }: { jump: JumpKey }) {
  const colors = useColors();
  return (
    <View
      style={{
        width: size.tile,
        height: size.tile,
        borderRadius: radius.tile,
        backgroundColor: colors.sunk,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size.icon}
        height={size.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Glyph jump={jump} />
      </Svg>
    </View>
  );
}
