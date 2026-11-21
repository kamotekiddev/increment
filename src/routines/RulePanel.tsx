import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, type ComponentProps } from "react";
import { Pressable, ScrollView, Switch, useWindowDimensions, View } from "react-native";

import { Button, RoundButton, Text } from "@/components";
import type { HistorySession, LoadType, OverloadRule, Planned } from "@/engine";
import { borderWidth, fontFamily, fontSize, lineHeight, minTouch, radius, size, spacing, useColors } from "@/theme";
import { formatNumber, stepChoices, type Unit } from "@/units";

import { DELOAD, ruleChoices, withChoices, type RuleChoices, type RuleType } from "./ruleChoices";
import { rulePreviewParts } from "./rulePreview";

export interface RulePanelProps {
  /** The muted line under the title. */
  exerciseName: string;
  /** The rule the panel opens with: the saved (or staged) rule. */
  rule: OverloadRule;
  /** The sets and rep range on the Exercise setup sheet, as currently set. */
  planned: Planned;
  loadType: LoadType;
  /** This routine exercise's past workouts, newest first, for the preview. */
  history: HistorySession[];
  unit: Unit;
  /** The step selected when the panel opens, in `unit`: the saved (or staged) step, else 2.5 kg / 5 lb. */
  initialStep: number;
  /** Save rule: the chosen step, in `unit`, and the rule as set. */
  onSave: (step: number, rule: OverloadRule) => void;
  /** Close: back to the Exercise setup sheet without saving. */
  onClose: () => void;
}

type IconName = ComponentProps<typeof Ionicons>["name"];

const RULE_TYPES: { type: RuleType; title: string; detail: string; icon: IconName }[] = [
  { type: "weight-first", title: "Weight first", detail: "Add weight when every set hits the Target", icon: "arrow-up" },
  { type: "double", title: "Double progression", detail: "Add weight and a rep each step", icon: "stats-chart" },
  { type: "reps-only", title: "Reps only", detail: "Add a rep each step, keep the weight", icon: "body" },
];

/** Splits `items` into rows of `columns`. */
function rows<T>(items: T[], columns: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += columns) out.push(items.slice(i, i + columns));
  return out;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      variant="caption"
      tone="muted"
      style={{ fontSize: fontSize.small, lineHeight: lineHeight.subtitle, fontFamily: fontFamily.medium, paddingHorizontal: 2 }}
    >
      {children}
    </Text>
  );
}

/** Equal chips on a sunk track, one selected: "Add each time" and the miss rule. */
function ChipGroup<K extends string | number>({
  label,
  options,
  columns,
  selected,
  onSelect,
}: {
  label: string;
  options: { key: K; label: string }[];
  columns: number;
  selected: K;
  onSelect: (key: K) => void;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 6 }}>
      <SectionLabel>{label}</SectionLabel>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={{ backgroundColor: colors.sunk, borderRadius: radius.row, padding: spacing.xs, gap: spacing.xs }}
      >
        {rows(options, columns).map((row, r) => (
          <View key={r} style={{ flexDirection: "row", gap: spacing.xs }}>
            {Array.from({ length: columns }, (_, c) => {
              const option = row[c];
              if (option === undefined) return <View key={c} style={{ flex: 1 }} />;
              const isSelected = option.key === selected;
              return (
                <Pressable
                  key={c}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(option.key)}
                  style={{
                    flex: 1,
                    height: minTouch,
                    borderRadius: radius.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected ? colors.card : "transparent",
                  }}
                >
                  <Text
                    variant="label"
                    tone={isSelected ? "ink" : "muted"}
                    style={{ fontSize: fontSize.meta, fontFamily: isSelected ? fontFamily.semibold : fontFamily.medium }}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

/** How it progresses: one card per rule type, the chosen one outlined in the accent. */
function RuleTypePicker({ selected, onSelect }: { selected: RuleType; onSelect: (type: RuleType) => void }) {
  const colors = useColors();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="How it progresses" style={{ gap: spacing.sm }}>
      {RULE_TYPES.map(({ type, title, detail, icon }) => {
        const isSelected = type === selected;
        return (
          <Pressable
            key={type}
            accessibilityRole="radio"
            accessibilityLabel={`${title}. ${detail}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(type)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              minHeight: size.pickerRow - 2,
              paddingVertical: spacing.sm,
              paddingLeft: 10,
              paddingRight: 14,
              borderRadius: radius.inset,
              backgroundColor: colors.card,
              borderWidth: borderWidth.outline,
              borderColor: isSelected ? colors.accent : colors.card,
            }}
          >
            <View
              style={{
                width: size.tile,
                height: size.tile,
                borderRadius: radius.tile,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? colors.accentTint : colors.sunk,
              }}
            >
              <Ionicons
                name={icon}
                size={size.icon}
                color={isSelected ? colors.accent : colors.ink}
                style={icon === "arrow-up" ? { transform: [{ rotate: "45deg" }] } : undefined}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="label" style={{ lineHeight: lineHeight.label }}>
                {title}
              </Text>
              <Text variant="caption" tone="muted" style={{ lineHeight: lineHeight.caption }}>
                {detail}
              </Text>
            </View>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: radius.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? colors.accent : "transparent",
                borderWidth: isSelected ? 0 : borderWidth.outline,
                borderColor: colors.line,
              }}
            >
              {isSelected ? <View style={{ width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.onAccent }} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * The Overload rule panel, shown inside the Exercise setup sheet in place of the steppers: how it progresses
 * (Weight first, Double progression, Reps only), "Add each time" (this unit's plate steps), the miss rule, Deload
 * weeks, a live preview of the next Target and Save rule. Free for everyone. A bodyweight exercise steps by reps
 * only, so it shows only the preview.
 */
export function RulePanel({ exerciseName, rule, planned, loadType, history, unit, initialStep, onSave, onClose }: RulePanelProps) {
  const colors = useColors();
  const { height } = useWindowDimensions();
  const [step, setStep] = useState(initialStep);
  const [choices, setChoices] = useState<RuleChoices>(() => ruleChoices(rule));
  const weighted = loadType !== "bodyweight";
  // Bodyweight: the rule type, miss rule and Deload change only weight, so the rule is kept as it is.
  const draft = weighted ? withChoices(rule, choices) : rule;
  const stepOptions = stepChoices(unit, initialStep).map((value) => ({ key: value, label: `${formatNumber(value)} ${unit}` }));
  const preview = rulePreviewParts({ rule: draft, planned, loadType, history, unit, step });
  const set = (change: Partial<RuleChoices>) => setChoices((c) => ({ ...c, ...change }));
  const deload = draft.deload ?? DELOAD;

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
      {weighted ? (
        // The controls scroll when the sheet would be taller than the screen; the preview and Save rule stay in view.
        <ScrollView style={{ maxHeight: height * 0.55 }} contentContainerStyle={{ gap: spacing.md }} showsVerticalScrollIndicator={false}>
          <RuleTypePicker selected={choices.type} onSelect={(type) => set({ type })} />
          <ChipGroup
            label="Add each time"
            options={stepOptions}
            // Two rows of equal chips: kg 4 + 3, lb 3 + 3.
            columns={Math.ceil(stepOptions.length / 2)}
            selected={step}
            onSelect={setStep}
          />
          <ChipGroup
            label="If you miss twice in a row"
            options={[
              { key: "keep", label: "Keep the weight" },
              { key: "drop", label: "Drop 10%" },
            ]}
            columns={2}
            selected={choices.missDrop ? "drop" : "keep"}
            onSelect={(key) => set({ missDrop: key === "drop" })}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              minHeight: size.settingsRow,
              paddingLeft: spacing.lg,
              paddingRight: 14,
              borderRadius: radius.inset,
              backgroundColor: colors.card,
            }}
          >
            <Ionicons name="moon-outline" size={19} color={colors.inkSoft} />
            <View style={{ flex: 1 }}>
              <Text variant="label">Deload weeks</Text>
              <Text variant="caption" tone="muted">
                {`Every ${deload.everyWeeks} weeks, one workout at ${formatNumber(100 - deload.percent)}%`}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Deload weeks"
              value={choices.deload}
              onValueChange={(on) => set({ deload: on })}
              trackColor={{ false: colors.sunk, true: colors.accent }}
              thumbColor={colors.onAccent}
            />
          </View>
        </ScrollView>
      ) : null}
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
      <Button label="Save rule" large onPress={() => onSave(step, draft)} />
    </>
  );
}
