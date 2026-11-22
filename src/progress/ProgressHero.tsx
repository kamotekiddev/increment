import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Text } from "@/components";
import { fontFamily, fontSize, lineHeight, radius, spacing, useColors } from "@/theme";

import type { Hero } from "./progressQueries";

/** The locked chart preview: a fixed picture, never drawn from the lifter's data. */
function ChartPreview() {
  const colors = useColors();
  const line = "M8 84 L48 72 L88 72 L128 58 L168 46 L208 46 L248 30 L288 18";
  return (
    <View style={{ borderRadius: radius.inset, overflow: "hidden", backgroundColor: colors.bg }}>
      {/* Soft and faded stands in for the board's blur, which react-native-svg cannot draw on Android. */}
      <View style={{ opacity: 0.55 }} accessible accessibilityRole="image" accessibilityLabel="Locked chart preview">
        <Svg viewBox="0 0 318 110" width="100%" height={undefined} style={{ aspectRatio: 318 / 110 }}>
          <Path d="M0 40H318M0 80H318" stroke={colors.line} />
          <Path d={`${line} V110 H8 Z`} fill={colors.accent} opacity={0.12} />
          <Path d={line} stroke={colors.accent} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            backgroundColor: colors.ink,
          }}
        >
          <Ionicons name="lock-closed-outline" size={fontSize.label} color={colors.onAccent} />
          <Text tone="onAccent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.small }}>
            Charts come with Pro
          </Text>
        </View>
      </View>
    </View>
  );
}

/** The white hero card: the last workout's top set, the "New record" pill, the comparison line and the chart preview. */
export function ProgressHero({ hero }: { hero: Hero }) {
  const colors = useColors();
  return (
    <View style={{ gap: spacing.md, padding: 20, borderRadius: radius.lg + 6, backgroundColor: colors.card }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flexShrink: 1, gap: 2 }}>
          <Text tone="muted" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.small }}>
            Top set, last workout
          </Text>
          <Text
            accessibilityLabel={`${hero.topSet.text}${hero.topSet.unit ? ` ${hero.topSet.unit}` : ""}`}
            style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.numeral, lineHeight: lineHeight.screen + 6, letterSpacing: -1.5 }}
          >
            {hero.topSet.text}
            {hero.topSet.unit ? (
              <Text tone="muted" style={{ fontFamily: fontFamily.medium, fontSize: fontSize.lead, letterSpacing: 0 }}>{` ${hero.topSet.unit}`}</Text>
            ) : null}
          </Text>
        </View>
        {hero.newRecord ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              paddingLeft: 7,
              paddingRight: 9,
              paddingVertical: 3,
              borderRadius: radius.pill,
              backgroundColor: colors.accentTint,
            }}
          >
            <Ionicons name="arrow-up-outline" size={fontSize.small} color={colors.accent} style={{ transform: [{ rotate: "45deg" }] }} />
            <Text tone="accent" style={{ fontFamily: fontFamily.semibold, fontSize: fontSize.caption }}>
              New record
            </Text>
          </View>
        ) : null}
      </View>
      <Text tone="muted" style={{ fontSize: fontSize.small, lineHeight: lineHeight.detail }}>
        {hero.line}
      </Text>
      <ChartPreview />
    </View>
  );
}
