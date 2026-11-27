import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components";
import { Segmented } from "@/settings/Segmented";
import { fontFamily, fontSize, lineHeight, quickStart as q, radius, spacing, useColors } from "@/theme";
import type { Unit } from "@/units";

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
          paddingHorizontal: spacing.xl - spacing.xs,
          paddingBottom: q.footerSpace + insets.bottom,
          gap: spacing.md + 2,
        }}
      >
        <View style={{ gap: spacing.snug, paddingHorizontal: 2 }}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: q.heroTile,
              height: q.heroTile,
              borderRadius: radius.md,
              backgroundColor: colors.accentTint,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.snug,
            }}
          >
            <Ionicons name="sparkles" size={q.heroGlyph} color={colors.accent} />
          </View>
          <Text accessibilityRole="header" style={{ fontSize: q.title, lineHeight: q.titleLine, fontFamily: fontFamily.bold, letterSpacing: -0.9 }}>
            You’re all set
          </Text>
          <Text tone="muted" style={{ fontSize: fontSize.body, lineHeight: lineHeight.action }}>
            We filled in simple defaults.
          </Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, paddingLeft: spacing.lg, paddingRight: spacing.md + 2 }}>
          {defaults.map((row, i) => (
            <View
              key={row.label}
              accessible
              accessibilityLabel={`${row.label}: ${row.value}, default`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md - 2,
                minHeight: q.defaultRow,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.line,
              }}
            >
              <Text tone="muted" style={{ width: q.labelWidth, fontSize: fontSize.small }}>
                {row.label}
              </Text>
              <Text variant="label" style={{ flex: 1, fontSize: fontSize.label + 0.5 }}>
                {row.value}
              </Text>
              <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: colors.iconFaint, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 }}>
                <Text tone="muted" style={{ fontSize: q.tag, fontFamily: fontFamily.medium }}>
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

        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 2, paddingHorizontal: spacing.lg }}>
          {plan.map((row, i) => (
            <View
              key={row.name}
              accessible
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                minHeight: q.planRow,
                paddingVertical: spacing.sm,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.line,
              }}
            >
              <View style={{ minWidth: q.badgeWidth, height: q.badgeHeight, paddingHorizontal: spacing.xs, borderRadius: radius.tileLg - 3, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }}>
                <Text tone="accent" style={{ fontSize: q.badgeText, fontFamily: fontFamily.bold }}>
                  {row.days}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" style={{ fontSize: fontSize.body, lineHeight: lineHeight.label }}>
                  {row.name}
                </Text>
                <Text tone="muted" style={{ fontSize: fontSize.caption + 0.5, lineHeight: lineHeight.detail }}>
                  {row.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ position: "absolute", left: spacing.xl - spacing.xs, right: spacing.xl - spacing.xs, bottom: Math.max(insets.bottom, spacing.xl), gap: spacing.sm }}>
        {error ? (
          <Text tone="danger" accessibilityRole="alert" style={{ textAlign: "center", fontSize: fontSize.small }}>
            {error}
          </Text>
        ) : null}
        <Button label="Start training" large onPress={start} />
      </View>
    </View>
  );
}
