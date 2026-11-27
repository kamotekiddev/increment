import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { useRestorePicker } from "@/backup/RestoreCard";
import { fontFamily, fontSize, lineHeight, radius, size, spacing, useColors, welcomeHero as hero } from "@/theme";

/**
 * Welcome (`OnbWelcome`): the first screen of a fresh install, outside the tabs. Get started is a placeholder until the
 * Quick start screen exists. "I already have Increment" runs the existing Restore from a backup flow (temporary, until
 * Welcome back); the preview marks onboarding done after a restore, and backing out lands here with nothing saved.
 */
export function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pick, sheet } = useRestorePicker();
  const shadow = { shadowColor: colors.ink, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: Math.max(insets.top, hero.topInset - spacing.xl), paddingHorizontal: spacing.xl - spacing.xs, gap: spacing.xl + spacing.xs }}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ height: hero.height, borderRadius: radius.hero + 6, backgroundColor: colors.accentTint, overflow: "hidden" }}
        >
          <View style={{ position: "absolute", left: hero.discLeft, top: hero.discTop, width: hero.disc, height: hero.disc, borderRadius: radius.pill, backgroundColor: colors.accent }} />
          <View
            style={{
              position: "absolute",
              left: hero.ringLeft,
              top: hero.ringTop,
              width: hero.ring,
              height: hero.ring,
              borderRadius: radius.pill,
              borderWidth: hero.ringWidth,
              borderColor: colors.onAccent,
              opacity: hero.ringOpacity,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: hero.targetCardLeft,
              top: hero.targetCardTop,
              width: hero.targetCardWidth,
              backgroundColor: colors.card,
              borderRadius: radius.row,
              paddingVertical: spacing.md + 2,
              paddingHorizontal: spacing.lg,
              gap: spacing.snug,
              ...shadow,
            }}
          >
            <Text tone="muted" style={{ fontSize: fontSize.caption, fontFamily: fontFamily.medium }}>
              Bench press · today
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: hero.numeral, lineHeight: hero.numeralLine, fontFamily: fontFamily.semibold, letterSpacing: -0.8 }}>
                62.5
                <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium }}>
                  {" "}kg
                </Text>
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: colors.accentTint, borderRadius: radius.pill, paddingVertical: 3, paddingLeft: spacing.xs + 3, paddingRight: spacing.sm + 1 }}>
                <Ionicons name="arrow-up" size={hero.badge} color={colors.accent} />
                <Text tone="accent" style={{ fontSize: hero.badge, lineHeight: lineHeight.caption, fontFamily: fontFamily.semibold }}>
                  2.5
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              right: hero.setCardRight,
              bottom: hero.setCardBottom,
              width: hero.setCardWidth,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md - 2,
              backgroundColor: colors.card,
              borderRadius: radius.row,
              paddingVertical: spacing.md - 2,
              paddingLeft: spacing.lg,
              paddingRight: spacing.md - 2,
              ...shadow,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text tone="muted" style={{ fontSize: fontSize.caption, fontFamily: fontFamily.medium }}>
                Set 3
              </Text>
              <Text style={{ fontSize: hero.setNumber, fontFamily: fontFamily.semibold, letterSpacing: -0.3 }}>62.5 × 8</Text>
            </View>
            <View style={{ width: hero.checkCircle, height: hero.checkCircle, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="checkmark" size={size.icon} color={colors.onAccent} />
            </View>
          </View>
        </View>
        <View style={{ gap: spacing.md - 2, paddingHorizontal: spacing.xs }}>
          <Text accessibilityRole="header" style={{ fontSize: hero.title, lineHeight: hero.titleLine, fontFamily: fontFamily.bold, letterSpacing: -1.1 }}>
            Lift a little more every week
          </Text>
          <Text tone="muted" style={{ fontSize: fontSize.lead, lineHeight: lineHeight.title - 1 }}>
            Log your sets and Increment tells you what to load next time.
          </Text>
        </View>
      </View>
      <View style={{ position: "absolute", left: spacing.xl - spacing.xs, right: spacing.xl - spacing.xs, bottom: Math.max(insets.bottom, spacing.xl), gap: spacing.snug }}>
        {/* Placeholder until the Quick start screen (ticket 03). */}
        <Button label="Get started" large onPress={() => {}} />
        <Button label="I already have Increment" variant="secondary" large onPress={pick} />
      </View>
      {sheet}
    </View>
  );
}
