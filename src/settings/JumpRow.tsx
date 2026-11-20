import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, letterSpacing, minTouch, opacity, radius, size, spacing, useColors } from "@/theme";
import { formatWithUnit, type Unit } from "@/units";

import { EquipmentIcon } from "./EquipmentIcon";
import { canStepJump, stepJump, type JumpDirection } from "./jumpStep";
import type { JumpKey } from "./jumps";

/** The − / + buttons are drawn at `size.stepper`; hitSlop takes the touch target to `minTouch`. */
const STEPPER_SLOP = (minTouch - size.stepper) / 2;

const SIGNS: Record<JumpDirection, string> = { down: "−", up: "+" };
const WORDS: Record<JumpDirection, string> = { down: "Smaller", up: "Bigger" };

/** One equipment row of the Weight jumps screen: icon, name, example exercises and a − value + control. */
export function JumpRow({
  jump,
  name,
  example,
  kg,
  unit,
  onChange,
  first,
}: {
  jump: JumpKey;
  name: string;
  example: string;
  kg: number;
  unit: Unit;
  onChange: (kg: number) => void;
  first: boolean;
}) {
  const colors = useColors();
  const stepper = (direction: JumpDirection) => {
    const enabled = canStepJump(kg, unit, direction);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${WORDS[direction]} ${name.toLowerCase()} jump`}
        accessibilityState={{ disabled: !enabled }}
        disabled={!enabled}
        hitSlop={STEPPER_SLOP}
        onPress={() => onChange(stepJump(kg, unit, direction))}
        style={({ pressed }) => ({
          width: size.stepper,
          height: size.stepper,
          borderRadius: radius.pill,
          backgroundColor: colors.sunk,
          alignItems: "center",
          justifyContent: "center",
          opacity: !enabled ? opacity.disabled : pressed ? opacity.pressed : 1,
        })}
      >
        <Text variant="label" style={{ fontSize: fontSize.input, fontFamily: fontFamily.medium }}>
          {SIGNS[direction]}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md - 2,
        minHeight: size.pickerRow,
        paddingVertical: spacing.sm,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      <EquipmentIcon jump={jump} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="label" style={{ fontSize: fontSize.body }}>
          {name}
        </Text>
        <Text variant="caption" tone="muted">
          {example}
        </Text>
      </View>
      {stepper("down")}
      <Text
        variant="label"
        accessibilityLabel={`${name} jump ${formatWithUnit(kg, unit)}`}
        style={{ minWidth: size.jumpValue, textAlign: "center", fontSize: fontSize.body, letterSpacing: letterSpacing.value }}
      >
        {formatWithUnit(kg, unit)}
      </Text>
      {stepper("up")}
    </View>
  );
}
