import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components";
import { fontFamily, radius, size, spacing, useColors, type Colors } from "@/theme";

import { routineCountLabel } from "./browseState";

/** One side of the loaded bar, inside out: width, height and colour of each plate, then the collar. */
const PLATES: { width: number; height: number; color: keyof Colors }[] = [
  { width: 17, height: 73, color: "accent" },
  { width: 13, height: 53, color: "accentLayer1" },
  { width: 8, height: 34, color: "accentLayer2" },
  { width: 14, height: 6, color: "lineStrong" },
];
const BAR = { width: 120, height: 6 };

export interface ExerciseHeroProps {
  /** Decides the art: a loaded bar for weighted exercises, a flexed arm for bodyweight. */
  equipment: string;
  /** How many routines the exercise is in; the pill is hidden at 0. */
  routines: number;
  /** The back button, top left. */
  back: ReactNode;
}

/** The white card at the top of Exercise detail: the art, the back button and the routine count. */
export function ExerciseHero({ equipment, routines, back }: ExerciseHeroProps) {
  const colors = useColors();
  return (
    <View
      style={{
        height: size.hero,
        borderRadius: radius.card,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {equipment === "bodyweight" ? (
        <MaterialCommunityIcons name="arm-flex-outline" size={88} color={colors.accent} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
      ) : (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
        >
          {[...PLATES].reverse().map((plate, i) => (
            <Plate key={`l${i}`} {...plate} />
          ))}
          <View style={{ ...BAR, backgroundColor: colors.iconFaint }} />
          {PLATES.map((plate, i) => (
            <Plate key={`r${i}`} {...plate} />
          ))}
        </View>
      )}
      <View style={{ position: "absolute", left: spacing.md, top: spacing.md }}>{back}</View>
      {routines > 0 ? (
        <View
          style={{
            position: "absolute",
            right: spacing.lg,
            top: spacing.xl - 2,
            paddingHorizontal: 9,
            paddingVertical: 3,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <Text variant="caption" tone="soft" style={{ fontFamily: fontFamily.medium }}>
            {routineCountLabel(routines)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Plate({ width, height, color }: (typeof PLATES)[number]) {
  const colors = useColors();
  return <View style={{ width, height, borderRadius: 3, backgroundColor: colors[color] }} />;
}
