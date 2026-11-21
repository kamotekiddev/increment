import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button, RoundButton, Text } from "@/components";
import type { HistorySession, LoadType, OverloadRule, Planned } from "@/engine";
import { fontFamily, fontSize, lineHeight, minTouch, radius, spacing, useColors } from "@/theme";
import { formatNumber, stepChoices, type Unit } from "@/units";

import { rulePreviewParts } from "./rulePreview";

export interface RulePanelProps {
  /** The muted line under the title. */
  exerciseName: string;
  rule: OverloadRule;
  /** The sets and rep range on the Exercise setup sheet, as currently set. */
  planned: Planned;
  loadType: LoadType;
  /** This routine exercise's past workouts, newest first, for the preview. */
  history: HistorySession[];
  unit: Unit;
  /** The step selected when the panel opens, in `unit`: the saved (or staged) step, else 2.5 kg / 5 lb. */
  initialStep: number;
  /** Save rule: the chosen step, in `unit`. */
  onSave: (step: number) => void;
  /** Close: back to the Exercise setup sheet without saving. */
  onClose: () => void;
}

/** Splits `items` into rows of `columns`. */
function rows<T>(items: T[], columns: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += columns) out.push(items.slice(i, i + columns));
  return out;
}

/**
 * The Overload rule panel, shown inside the Exercise setup sheet in place of the steppers: "Add each time" (this
 * unit's plate steps), a live preview of the next Target and Save rule. Free for everyone.
 */
export function RulePanel({ exerciseName, rule, planned, loadType, history, unit, initialStep, onSave, onClose }: RulePanelProps) {
  const colors = useColors();
  const [step, setStep] = useState(initialStep);
  const choices = stepChoices(unit, initialStep);
  // Two rows of equal chips: kg 4 + 3, lb 3 + 3.
  const columns = Math.ceil(choices.length / 2);
  const preview = rulePreviewParts({ rule, planned, loadType, history, unit, step });

  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text variant="title" style={{ lineHeight: 26, letterSpacing: -0.4 }}>
            Overload rule
          </Text>
          <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small }} numberOfLines={1}>
            {exerciseName}
          </Text>
        </View>
        <RoundButton icon="close" label="Close" onPress={onClose} />
      </View>
      {loadType === "bodyweight" ? null : (
        <View style={{ gap: 6 }}>
          <Text
            variant="caption"
            tone="muted"
            style={{ fontSize: fontSize.small, lineHeight: lineHeight.subtitle, fontFamily: fontFamily.medium, paddingHorizontal: 2 }}
          >
            Add each time
          </Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Add each time"
            style={{ backgroundColor: colors.sunk, borderRadius: radius.row, padding: spacing.xs, gap: spacing.xs }}
          >
            {rows(choices, columns).map((row, r) => (
              <View key={r} style={{ flexDirection: "row", gap: spacing.xs }}>
                {Array.from({ length: columns }, (_, c) => {
                  const value = row[c];
                  if (value === undefined) return <View key={c} style={{ flex: 1 }} />;
                  const selected = value === step;
                  const label = `${formatNumber(value)} ${unit}`;
                  return (
                    <Pressable
                      key={c}
                      accessibilityRole="radio"
                      accessibilityLabel={label}
                      accessibilityState={{ selected }}
                      onPress={() => setStep(value)}
                      style={{
                        flex: 1,
                        height: minTouch,
                        borderRadius: radius.md,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected ? colors.card : "transparent",
                      }}
                    >
                      <Text
                        variant="label"
                        tone={selected ? "ink" : "muted"}
                        style={{ fontSize: fontSize.meta, fontFamily: selected ? fontFamily.semibold : fontFamily.medium }}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}
      <View
        accessibilityLiveRegion="polite"
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          backgroundColor: colors.accentTint,
          borderRadius: radius.md,
          paddingVertical: 11,
          paddingHorizontal: 14,
        }}
      >
        <Ionicons name="arrow-up" size={17} color={colors.accent} style={{ transform: [{ rotate: "45deg" }] }} />
        <Text tone="soft" style={{ flex: 1, fontSize: fontSize.small, lineHeight: lineHeight.subtitle }}>
          {preview.lead}
          {preview.strong ? <Text style={{ fontSize: fontSize.small, fontFamily: fontFamily.semibold }}>{preview.strong}</Text> : null}
          {preview.rest}
        </Text>
      </View>
      <Button label="Save rule" large onPress={() => onSave(step)} />
    </>
  );
}
