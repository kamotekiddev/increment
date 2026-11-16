import { View } from "react-native";

import { useColors } from "@/theme";

/** One bar per routine slot: filled for each used, empty for each free. Free plan only. */
export function LimitMeter({ used, total, height = 5, gap = 4 }: { used: number; total: number; height?: number; gap?: number }) {
  const colors = useColors();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", gap }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height,
            borderRadius: height / 2,
            backgroundColor: i < used ? colors.accent : colors.line,
          }}
        />
      ))}
    </View>
  );
}
