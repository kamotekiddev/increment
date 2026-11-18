import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, radius, size as sizes, spacing, useColors } from "@/theme";
import type { Unit } from "@/units";

const UNITS: Unit[] = ["kg", "lb"];
const NAMES: Record<Unit, string> = { kg: "Kilograms", lb: "Pounds" };

/**
 * The kg / lb radio group, shared by the live workout pill and the Settings card.
 * `compact` is the small "kg | lb" pill; `wide` is the full-width Kilograms / Pounds control.
 * `track` is the colour behind the two options.
 */
export function UnitSegmented({
  unit,
  onChange,
  size,
  track,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
  size: "compact" | "wide";
  track: "card" | "sunk";
}) {
  const colors = useColors();
  const compact = size === "compact";
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Weight unit"
      style={{
        flexDirection: "row",
        backgroundColor: colors[track],
        borderRadius: compact ? radius.pill : radius.lg,
        padding: spacing.xs,
        gap: compact ? 0 : spacing.xs,
      }}
    >
      {UNITS.map((u) => {
        const selected = u === unit;
        return (
          <Pressable
            key={u}
            accessibilityRole="radio"
            accessibilityLabel={NAMES[u]}
            accessibilityState={{ selected }}
            hitSlop={compact ? spacing.xs : undefined}
            onPress={() => onChange(u)}
            style={{
              ...(compact ? { width: 46, height: 32 } : { flex: 1, height: sizes.round - spacing.xs }),
              borderRadius: compact ? radius.pill : radius.inset,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? colors.accent : "transparent",
            }}
          >
            <Text
              variant="label"
              tone={selected ? "onAccent" : "muted"}
              style={{ fontSize: compact ? fontSize.small : fontSize.body, fontFamily: selected ? fontFamily.semibold : fontFamily.medium }}
            >
              {compact ? u : NAMES[u]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
