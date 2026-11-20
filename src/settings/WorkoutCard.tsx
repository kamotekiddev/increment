import { Pressable, Switch, View } from "react-native";

import { Card, Text } from "@/components";
import { restLabel, stepDefaultRest } from "@/routines";
import { fontFamily, fontSize, letterSpacing, minTouch, opacity, radius, size, spacing, useColors } from "@/theme";

import { useDefaultRest, useKeepScreenAwake } from "./useWorkoutSettings";

/** The − / + buttons are drawn at `size.stepper`; hitSlop takes the touch target to `minTouch`. */
const STEPPER_SLOP = (minTouch - size.stepper) / 2;

const SIGNS = { "-1": "−", "1": "+" } as const;
const WORDS = { "-1": "Decrease", "1": "Increase" } as const;

/**
 * The Workout card of Settings. For now one row, Default rest: an inline − / + stepper in 15 s steps from
 * 15 s to 10 min, shown as m:ss. A change saves at once.
 */
export function WorkoutCard() {
  const colors = useColors();
  const { defaultRestS, setDefaultRest } = useDefaultRest();
  const { keepScreenAwake, setKeepScreenAwake } = useKeepScreenAwake();

  const stepper = (direction: 1 | -1) => {
    const next = stepDefaultRest(defaultRestS, direction);
    const enabled = next !== defaultRestS;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${WORDS[`${direction}`]} default rest`}
        accessibilityState={{ disabled: !enabled }}
        disabled={!enabled}
        hitSlop={STEPPER_SLOP}
        onPress={() => setDefaultRest(next)}
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
          {SIGNS[`${direction}`]}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: 6 }}>
        Workout
      </Text>
      <Card style={{ borderRadius: radius.card, paddingVertical: 0 }}>
        <View style={{ height: size.settingsRow, flexDirection: "row", alignItems: "center", gap: spacing.md - 2 }}>
          <Text style={{ flex: 1, fontSize: fontSize.body, fontFamily: fontFamily.medium }}>Default rest</Text>
          {stepper(-1)}
          <Text
            variant="label"
            accessibilityLabel={`Default rest ${restLabel(defaultRestS)}`}
            style={{ minWidth: size.jumpValue, textAlign: "center", fontSize: fontSize.body, letterSpacing: letterSpacing.value }}
          >
            {restLabel(defaultRestS)}
          </Text>
          {stepper(1)}
        </View>
        <View style={{ height: size.settingsRow, flexDirection: "row", alignItems: "center", gap: spacing.md - 2 }}>
          <Text style={{ flex: 1, fontSize: fontSize.body, fontFamily: fontFamily.medium }}>Keep screen awake</Text>
          <Switch
            accessibilityLabel="Keep screen awake"
            value={keepScreenAwake}
            onValueChange={setKeepScreenAwake}
            trackColor={{ true: colors.accent }}
          />
        </View>
      </Card>
    </View>
  );
}
