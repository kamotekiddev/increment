import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { BottomSheet, RoundButton, Button, Text } from "@/components";
import type { LoadType, OverloadRule } from "@/engine";
import { useUnit } from "@/settings";
import { fontSize, minTouch, opacity, radius, useColors, spacing } from "@/theme";
import { stepIn, stepPatch, type Steps } from "@/units";
import { toHistory, type PastExercise } from "@/workout/historyInputs";

import { adjustSetup, canAdjust, type SetupField } from "./adjustSetup";
import { describeRule } from "./describeRule";
import { RulePanel } from "./RulePanel";
import type { ExerciseSetup } from "./routineSetup";
import { SetupStepper } from "./SetupStepper";
import { restLabel } from "./setupText";

const NO_STEPS: Steps = { stepKg: null, stepLb: null };

export interface ExerciseSetupSheetProps {
  visible: boolean;
  /** Shown as the sheet title. */
  exerciseName: string;
  /** The muted line under the title, for example "Chest · Barbell". */
  subtitle: string;
  /** The steppers start here each time the sheet opens. */
  initial: ExerciseSetup;
  /** Described on the Progression row and used by the rule panel's preview. */
  rule: OverloadRule;
  loadType: LoadType;
  /** The routine exercise's saved steps ("Add each time"); none when adding. */
  steps?: Steps;
  /** This routine exercise's finished workouts, newest first (`loadPastExercises`), for the rule panel's preview. */
  past?: PastExercise[];
  /** The primary button, for example "Add to routine" or "Save". */
  primaryLabel: string;
  /** Disables the primary button while a save is in flight. */
  busy?: boolean;
  /**
   * The setup, the step saved in the rule panel as only that unit's column (`stepPatch`; empty when the lifter did
   * not save a step, so an unset step stays null), and the rule saved there (undefined when the panel was not saved).
   */
  onSubmit: (setup: ExerciseSetup, steps: Partial<Steps>, rule?: OverloadRule) => void;
  onDismiss: () => void;
  /** Editing only: shows a red Remove from routine action that calls this. */
  onRemove?: () => void;
}

/**
 * Sets, reps (min and max) and rest steppers, the Progression row and one primary button. Tapping Progression
 * swaps the sheet's content for the Overload rule panel; Save rule there stages the step and the rule (the row then
 * describes the staged rule), and the primary button saves them with the rest.
 */
export function ExerciseSetupSheet({
  visible,
  exerciseName,
  subtitle,
  initial,
  rule,
  loadType,
  steps = NO_STEPS,
  past,
  primaryLabel,
  busy = false,
  onSubmit,
  onDismiss,
  onRemove,
}: ExerciseSetupSheetProps) {
  const colors = useColors();
  const { unit } = useUnit();
  const [setup, setSetup] = useState<ExerciseSetup>(initial);
  const [editingRule, setEditingRule] = useState(false);
  const [stepChange, setStepChange] = useState<Partial<Steps>>({});
  const [ruleChange, setRuleChange] = useState<OverloadRule | undefined>(undefined);
  const shownRule = ruleChange ?? rule;

  // Start from the given values every time the sheet opens (reset during render, not in an effect).
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setSetup(initial);
      setEditingRule(false);
      setStepChange({});
      setRuleChange(undefined);
    }
  }

  const history = useMemo(() => toHistory(past ?? [], setup.sets), [past, setup.sets]);

  const stepper = (field: SetupField, label: string, valueText: string) => (
    <SetupStepper
      label={label}
      valueText={valueText}
      canDecrease={canAdjust(setup, field, -1)}
      canIncrease={canAdjust(setup, field, 1)}
      onDecrease={() => setSetup((s) => adjustSetup(s, field, -1))}
      onIncrease={() => setSetup((s) => adjustSetup(s, field, 1))}
    />
  );

  if (editingRule) {
    return (
      <BottomSheet visible={visible} onDismiss={onDismiss}>
        <RulePanel
          exerciseName={exerciseName}
          rule={shownRule}
          planned={setup}
          loadType={loadType}
          history={history}
          unit={unit}
          initialStep={stepIn({ ...steps, ...stepChange }, unit)}
          onSave={(step, saved) => {
            setStepChange((change) => ({ ...change, ...stepPatch(unit, step) }));
            setRuleChange(saved);
            setEditingRule(false);
          }}
          onClose={() => setEditingRule(false)}
        />
      </BottomSheet>
    );
  }

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text variant="title" style={{ lineHeight: 26, letterSpacing: -0.4 }} numberOfLines={2}>
            {exerciseName}
          </Text>
          <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small }}>
            {subtitle}
          </Text>
        </View>
        <RoundButton icon="close" label="Close" onPress={onDismiss} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {stepper("sets", "Sets", String(setup.sets))}
          {stepper("restS", "Rest", restLabel(setup.restS))}
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {stepper("repMin", "Reps min", String(setup.repMin))}
          {stepper("repMax", "Reps max", String(setup.repMax))}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Progression: ${describeRule(shownRule)}`}
        accessibilityHint="Opens the overload rule"
        onPress={() => setEditingRule(true)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          minHeight: minTouch,
          paddingVertical: spacing.md,
          paddingHorizontal: 14,
          borderRadius: radius.inset,
          borderWidth: 1,
          borderColor: colors.line,
          opacity: pressed ? opacity.pressed : 1,
        })}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: radius.tile,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.sunk,
          }}
        >
          <Ionicons name="trending-up" size={15} color={colors.inkMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            Progression
          </Text>
          <Text variant="label" style={{ fontSize: fontSize.meta, lineHeight: 19 }}>
            {describeRule(shownRule)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.iconFaint} />
      </Pressable>
      <Button label={primaryLabel} large disabled={busy} onPress={() => onSubmit(setup, stepChange, ruleChange)} />
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRemove}
          style={{ minHeight: minTouch, alignItems: "center", justifyContent: "center", borderRadius: radius.pill }}
        >
          <Text variant="label" tone="danger" style={{ fontSize: fontSize.body }}>
            Remove from routine
          </Text>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}
