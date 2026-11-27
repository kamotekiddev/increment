import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { Segmented } from "@/settings/Segmented";
import { fontFamily, fontSize, lineHeight, onboardingGutter, quickStart, radius, spacing, useColors } from "@/theme";
import type { Unit } from "@/units";

import { OnboardingFooter, OnboardingTitle } from "./OnboardingParts";
import { QUICK_START_DEFAULT_UNIT } from "./quickStartPlan";
import { quickStartDefaultRows, quickStartPlanRows } from "./quickStartText";
import { onboardingStore } from "./useOnboarded";

const UNIT_OPTIONS = [
  { value: "kg", label: "Kilograms" },
  { value: "lb", label: "Pounds" },
] as const;

/**
 * Quick start (`OnbQuick`): the four defaults, a kg / lb choice and the ready plan. The choice lives in screen state
 * only; Start training is the one write (plan, unit and the onboarded flag), and the root layout's gate then moves to
 * Today. Temporary (feature 1): the Default rows have no chevron and there is no "Answer the questions instead".
 */
export function QuickStartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [unit, setUnit] = useState<Unit>(QUICK_START_DEFAULT_UNIT);
  const [error, setError] = useState<string | null>(null);
  const defaults = quickStartDefaultRows();
  const plan = quickStartPlanRows();

  function start() {
    try {
      setError(null);
      onboardingStore.getState().finishQuickStart(unit);
    } catch {
      setError("Couldn't set up your plan. Try again.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, spacing.xl),
          paddingHorizontal: onboardingGutter,
          paddingBottom: quickStart.footerSpace + insets.bottom,
          gap: quickStart.contentGap,
        }}
      >
        <View style={{ gap: spacing.snug, paddingHorizontal: quickStart.headingInset }}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: quickStart.heroTile,
              height: quickStart.heroTile,
              borderRadius: radius.md,
              backgroundColor: colors.accentTint,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.snug,
            }}
          >
            <Ionicons name="sparkles" size={quickStart.heroGlyph} color={colors.accent} />
          </View>
          <OnboardingTitle look="quickStart">You’re all set</OnboardingTitle>
          <Text tone="muted" style={{ fontSize: fontSize.body, lineHeight: lineHeight.action }}>
            We filled in simple defaults.
          </Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, paddingLeft: spacing.lg, paddingRight: quickStart.defaultPadRight }}>
          {defaults.map((row, i) => (
            <View
              key={row.label}
              accessible
              accessibilityLabel={`${row.label}: ${row.value}, default`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: quickStart.defaultGap,
                minHeight: quickStart.defaultRow,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.line,
              }}
            >
              <Text tone="muted" style={{ width: quickStart.labelWidth, fontSize: fontSize.small }}>
                {row.label}
              </Text>
              <Text variant="label" style={{ flex: 1, fontSize: quickStart.valueText }}>
                {row.value}
              </Text>
              <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: colors.iconFaint, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: quickStart.tagPadV }}>
                <Text tone="muted" style={{ fontSize: quickStart.tag, fontFamily: fontFamily.medium }}>
                  Default
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.xs }}>
            Which weights does your gym use?
          </Text>
          <Segmented options={UNIT_OPTIONS} value={unit} onChange={setUnit} size="wide" track="sunk" accessibilityLabel="Weight unit" />
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: quickStart.planPadV, paddingHorizontal: spacing.lg }}>
          {plan.map((row, i) => (
            <View
              key={row.name}
              accessible
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                minHeight: quickStart.planRow,
                paddingVertical: spacing.sm,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.line,
              }}
            >
              <View style={{ minWidth: quickStart.badgeWidth, height: quickStart.badgeHeight, paddingHorizontal: spacing.xs, borderRadius: quickStart.badgeCorner, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
                <Text tone="accent" style={{ fontSize: quickStart.badgeText, fontFamily: fontFamily.bold }}>
                  {row.days}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" style={{ fontSize: fontSize.body, lineHeight: lineHeight.label }}>
                  {row.name}
                </Text>
                <Text tone="muted" style={{ fontSize: quickStart.subtitleText, lineHeight: lineHeight.detail }}>
                  {row.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <OnboardingFooter gap={spacing.sm}>
        {error ? (
          <Text tone="danger" accessibilityRole="alert" style={{ textAlign: "center", fontSize: fontSize.small }}>
            {error}
          </Text>
        ) : null}
        <Button label="Start training" large onPress={start} />
      </OnboardingFooter>
    </View>
  );
}
