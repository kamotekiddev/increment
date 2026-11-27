import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { useRestorePicker } from "@/backup/RestoreCard";

import { OnboardingFooter, OnboardingTitle } from "./OnboardingParts";
import { fontFamily, fontSize, letterSpacing, lineHeight, onboardingGutter, radius, size, spacing, useColors, welcomeHero } from "@/theme";

/**
 * Welcome (`OnbWelcome`): the first screen of a fresh install, outside the tabs. Get started opens Quick start (temporary,
 * until the questions exist). "I already have Increment" runs the existing Restore from a backup flow (temporary, until
 * Welcome back); the preview marks onboarding done after a restore, and backing out lands here with nothing saved.
 */
export function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pick, sheet } = useRestorePicker();
  const shadow = { shadowColor: colors.ink, shadowOpacity: welcomeHero.shadowOpacity, shadowRadius: welcomeHero.shadowRadius, shadowOffset: { width: 0, height: welcomeHero.shadowOffsetY }, elevation: welcomeHero.shadowElevation } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: Math.max(insets.top, welcomeHero.topInset), paddingHorizontal: onboardingGutter, gap: welcomeHero.sectionGap }}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ height: welcomeHero.height, borderRadius: welcomeHero.corner, backgroundColor: colors.accentTint, overflow: "hidden" }}
        >
          <View style={{ position: "absolute", left: welcomeHero.discLeft, top: welcomeHero.discTop, width: welcomeHero.disc, height: welcomeHero.disc, borderRadius: radius.pill, backgroundColor: colors.accent }} />
          <View
            style={{
              position: "absolute",
              left: welcomeHero.ringLeft,
              top: welcomeHero.ringTop,
              width: welcomeHero.ring,
              height: welcomeHero.ring,
              borderRadius: radius.pill,
              borderWidth: welcomeHero.ringWidth,
              borderColor: colors.onAccent,
              opacity: welcomeHero.ringOpacity,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: welcomeHero.targetCardLeft,
              top: welcomeHero.targetCardTop,
              width: welcomeHero.targetCardWidth,
              backgroundColor: colors.card,
              borderRadius: radius.row,
              paddingVertical: welcomeHero.targetPadV,
              paddingHorizontal: spacing.lg,
              gap: spacing.snug,
              ...shadow,
            }}
          >
            <Text tone="muted" style={{ fontSize: fontSize.caption, fontFamily: fontFamily.medium }}>
              Bench press · today
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: welcomeHero.numeral, lineHeight: welcomeHero.numeralLine, fontFamily: fontFamily.semibold, letterSpacing: welcomeHero.numeralTracking }}>
                62.5
                <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium }}>
                  {" "}kg
                </Text>
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: welcomeHero.badgeGap, backgroundColor: colors.accentTint, borderRadius: radius.pill, paddingVertical: welcomeHero.badgePadV, paddingLeft: welcomeHero.badgePadLeft, paddingRight: welcomeHero.badgePadRight }}>
                <Ionicons name="arrow-up" size={welcomeHero.badge} color={colors.accent} />
                <Text tone="accent" style={{ fontSize: welcomeHero.badge, lineHeight: lineHeight.caption, fontFamily: fontFamily.semibold }}>
                  2.5
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              right: welcomeHero.setCardRight,
              bottom: welcomeHero.setCardBottom,
              width: welcomeHero.setCardWidth,
              flexDirection: "row",
              alignItems: "center",
              gap: welcomeHero.setGap,
              backgroundColor: colors.card,
              borderRadius: radius.row,
              paddingVertical: welcomeHero.setPadV,
              paddingLeft: spacing.lg,
              paddingRight: welcomeHero.setPadRight,
              ...shadow,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text tone="muted" style={{ fontSize: fontSize.caption, fontFamily: fontFamily.medium }}>
                Set 3
              </Text>
              <Text style={{ fontSize: welcomeHero.setNumber, fontFamily: fontFamily.semibold, letterSpacing: letterSpacing.value }}>62.5 × 8</Text>
            </View>
            <View style={{ width: welcomeHero.checkCircle, height: welcomeHero.checkCircle, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="checkmark" size={size.icon} color={colors.onAccent} />
            </View>
          </View>
        </View>
        <View style={{ gap: welcomeHero.textGap, paddingHorizontal: spacing.xs }}>
          <OnboardingTitle look="welcome">Lift a little more every week</OnboardingTitle>
          <Text tone="muted" style={{ fontSize: fontSize.lead, lineHeight: welcomeHero.leadLine }}>
            Log your sets and Increment tells you what to load next time.
          </Text>
        </View>
      </View>
      <OnboardingFooter gap={spacing.snug}>
        {/* Temporary: feature 2 points Get started at Goal. */}
        <Button label="Get started" large onPress={() => router.push("/quick-start")} />
        <Button label="I already have Increment" variant="secondary" large onPress={pick} />
      </OnboardingFooter>
      {sheet}
    </View>
  );
}
